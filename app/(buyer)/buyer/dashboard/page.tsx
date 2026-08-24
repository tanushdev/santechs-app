import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db/connection";
import Enquiry from "@/lib/db/models/Enquiry.model";
import Wishlist from "@/lib/db/models/Wishlist.model";
import Product from "@/lib/db/models/Product.model";
import Link from "next/link";
import { Heart, MessageSquare, Bell, User, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserRole, ProductStatus } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Buyer Dashboard" };

export default async function BuyerDashboard() {
  const session = await auth();
  if (!session || session.user.role !== UserRole.BUYER) {
    redirect("/login");
  }

  await connectToDatabase();

  const [totalEnquiries, wishlistCount, totalProducts, recentEnquiries] = await Promise.all([
    Enquiry.countDocuments({ buyer: session.user.id }),
    Wishlist.countDocuments({ user: session.user.id }),
    Product.countDocuments({ status: ProductStatus.APPROVED }),
    Enquiry.find({ buyer: session.user.id })
      .populate("product", "name slug images referenceNumber")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const statusColor: Record<string, string> = {
    NEW: "status-pending",
    CONTACTED_BUYER: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    SELLER_ASSIGNED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    NEGOTIATION: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    DEAL_CLOSED: "status-approved",
    REJECTED: "status-rejected",
    CANCELLED: "status-rejected",
  };

  return (
    <div className="space-y-8">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-100/40 via-[#ff7759]/5 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#ff7759] font-bold">
              Buyer Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
              Hello, {session.user.name || "Customer"}!
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl">
              Track your machine RFQ quotations, saved machinery wishlist, and supplier negotiations.
            </p>
          </div>
          <Link href="/products">
            <Button className="rounded-xl bg-black text-white hover:bg-slate-800 font-bold px-5 h-10 text-xs shadow-xs cursor-pointer">
              <Package className="w-4 h-4 mr-1.5" />
              Browse Machinery
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Quote Requests", value: totalEnquiries, icon: MessageSquare, href: "/buyer/quotes" },
          { label: "Wishlist", value: wishlistCount, icon: Heart, href: "/buyer/wishlist" },
          { label: "Browse Products", value: totalProducts, icon: Package, href: "/products" },
        ].map((item) => (
          <Link key={item.label} href={item.href}>
            <Card className="card-hover cursor-pointer">
              <CardContent className="p-5">
                <item.icon className="w-5 h-5 text-primary mb-3" />
                <div className="text-2xl font-bold font-heading">{item.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Enquiries */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold font-heading">Recent Quote Requests</h2>
          <Link href="/buyer/quotes">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>

        {recentEnquiries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No quote requests yet</p>
              <Link href="/products">
                <Button>Browse Products</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentEnquiries.map((enquiry) => {
              const product = (enquiry.product as unknown) as Record<string, string> | null;
              return (
                <Card key={enquiry._id?.toString()}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {product?.name ?? "Product"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Ref: {enquiry.referenceNumber}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ml-3 ${statusColor[enquiry.status] ?? "status-draft"}`}
                    >
                      {(enquiry.status as string).replace(/_/g, " ")}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
