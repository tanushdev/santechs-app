import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db/connection";
import Product from "@/lib/db/models/Product.model";
import User from "@/lib/db/models/User.model";
import Enquiry from "@/lib/db/models/Enquiry.model";
import Link from "next/link";
import {
  Package,
  Users,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Star,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EnquiryStatus, ProductStatus, UserRole, UserStatus } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Dashboard" };

async function getDashboardData() {
  await connectToDatabase();
  const [
    totalProducts, pendingProducts, approvedProducts, rejectedProducts,
    totalUsers, pendingSellers, newEnquiries, totalEnquiries, closedDeals,
    recentProducts, recentEnquiries,
  ] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ status: ProductStatus.PENDING }),
    Product.countDocuments({ status: ProductStatus.APPROVED }),
    Product.countDocuments({ status: ProductStatus.REJECTED }),
    User.countDocuments({ role: { $ne: UserRole.SUPER_ADMIN } }),
    User.countDocuments({ role: UserRole.SELLER, status: UserStatus.PENDING }),
    Enquiry.countDocuments({ status: EnquiryStatus.NEW }),
    Enquiry.countDocuments(),
    Enquiry.countDocuments({ status: EnquiryStatus.DEAL_CLOSED }),
    Product.find({ status: ProductStatus.PENDING })
      .populate("seller", "name email")
      .populate("company", "name")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Enquiry.find()
      .populate("product", "name slug")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  return {
    stats: {
      totalProducts, pendingProducts, approvedProducts, rejectedProducts,
      totalUsers, pendingSellers, newEnquiries, totalEnquiries, closedDeals,
      conversionRate: totalEnquiries > 0
        ? ((closedDeals / totalEnquiries) * 100).toFixed(1)
        : "0",
    },
    recentProducts,
    recentEnquiries,
  };
}

const statusColor: Record<string, string> = {
  NEW: "status-pending",
  CONTACTED_BUYER: "status-approved",
  NEGOTIATION: "status-approved",
  DEAL_CLOSED: "status-approved",
  REJECTED: "status-rejected",
  CANCELLED: "status-rejected",
};

export default async function AdminDashboard() {
  const session = await auth();
  if (!session || ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(session.user.role)) {
    redirect("/login");
  }

  const { stats, recentProducts, recentEnquiries } = await getDashboardData();

  const kpis = [
    {
      title: "Pending Products",
      value: stats.pendingProducts,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      href: "/admin/products",
      badge: stats.pendingProducts > 0 ? "Needs Review" : null,
    },
    {
      title: "Pending Sellers",
      value: stats.pendingSellers,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      href: "/admin/sellers",
      badge: stats.pendingSellers > 0 ? "Needs Review" : null,
    },
    {
      title: "New Enquiries",
      value: stats.newEnquiries,
      icon: MessageSquare,
      color: "text-primary",
      bg: "bg-primary/10",
      href: "/admin/enquiries",
      badge: stats.newEnquiries > 0 ? "Action Required" : null,
    },
    {
      title: "Deals Closed",
      value: stats.closedDeals,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      href: "/admin/enquiries?status=DEAL_CLOSED",
      badge: null,
    },
    {
      title: "Live Products",
      value: stats.approvedProducts,
      icon: Star,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      href: "/admin/all-products",
      badge: null,
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
      href: "/admin/all-users",
      badge: null,
    },
    {
      title: "Total Enquiries",
      value: stats.totalEnquiries,
      icon: Activity,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      href: "/admin/enquiries",
      badge: null,
    },
    {
      title: "Conversion Rate",
      value: `${stats.conversionRate}%`,
      icon: TrendingUp,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      href: "/admin/analytics",
      badge: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-slate-900">
          Welcome back, {session.user.name || "Administrator"}!
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Here&apos;s an overview of marketplace activity, pending sellers, and machinery verification logs.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((kpi) => (
          <Link key={kpi.title} href={kpi.href}>
            <Card className="hover:border-border/80 transition-all card-hover cursor-pointer h-full">
              <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${kpi.bg} flex items-center justify-center shrink-0`}>
                    <kpi.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${kpi.color}`} />
                  </div>
                  {kpi.badge && (
                    <Badge variant="outline" className="text-[10px] font-semibold status-pending shrink-0">
                      {kpi.badge}
                    </Badge>
                  )}
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-heading mb-0.5">
                    {kpi.value}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">{kpi.title}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Pending Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Pending Products</CardTitle>
            <Link href="/admin/products">
              <Button variant="ghost" size="sm" className="text-xs">
                View All <ArrowRight className="ml-1 w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No pending products! 🎉
              </p>
            ) : (
              recentProducts.map((product) => {
                const seller = (product.seller as unknown) as Record<string, string>;
                const company = (product.company as unknown) as Record<string, string>;
                return (
                  <div
                    key={product._id?.toString()}
                    className="flex items-start justify-between gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {company?.name ?? seller?.name}
                      </p>
                    </div>
                    <Link href={`/admin/products/${product._id}`}>
                      <Button size="sm" variant="outline" className="text-xs h-7">
                        Review
                      </Button>
                    </Link>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Enquiries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Enquiries</CardTitle>
            <Link href="/admin/enquiries">
              <Button variant="ghost" size="sm" className="text-xs">
                View All <ArrowRight className="ml-1 w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentEnquiries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No enquiries yet.
              </p>
            ) : (
              recentEnquiries.map((enquiry) => {
                const product = (enquiry.product as unknown) as Record<string, string>;
                return (
                  <div
                    key={enquiry._id?.toString()}
                    className="flex items-start justify-between gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {enquiry.buyerName} — {product?.name ?? "Product"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            statusColor[enquiry.status] ?? "status-draft"
                          }`}
                        >
                          {(enquiry.status as string).replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {enquiry.referenceNumber}
                        </span>
                      </div>
                    </div>
                    <Link href={`/admin/enquiries/${enquiry._id}`}>
                      <Button size="sm" variant="outline" className="text-xs h-7">
                        Manage
                      </Button>
                    </Link>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
