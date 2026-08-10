import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db/connection";
import Product from "@/lib/db/models/Product.model";
import Enquiry from "@/lib/db/models/Enquiry.model";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Eye,
  MessageSquare,
  PlusCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductStatus, UserRole } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Seller Console — Santechs" };

export default async function SellerDashboard() {
  const session = await auth();
  if (!session || session.user.role !== UserRole.SELLER) {
    redirect("/login");
  }

  await connectToDatabase();

  const [
    totalProducts, draftProducts, pendingProducts, approvedProducts,
    totalViews, totalEnquiries, recentProducts,
  ] = await Promise.all([
    Product.countDocuments({ seller: session.user.id }),
    Product.countDocuments({ seller: session.user.id, status: ProductStatus.DRAFT }),
    Product.countDocuments({ seller: session.user.id, status: ProductStatus.PENDING }),
    Product.countDocuments({ seller: session.user.id, status: ProductStatus.APPROVED }),
    Product.aggregate([
      { $match: { seller: session.user.id } },
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]).then((r) => r[0]?.total ?? 0),
    Enquiry.countDocuments({ seller: session.user.id }),
    Product.find({ seller: session.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const kpis = [
    { label: "Total Listings", value: totalProducts, icon: Package },
    { label: "Live Listings", value: approvedProducts, icon: CheckCircle2 },
    { label: "Under Review", value: pendingProducts, icon: Clock },
    { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye },
    { label: "Enquiries Received", value: totalEnquiries, icon: MessageSquare },
    { label: "Draft Listings", value: draftProducts, icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 sm:p-8 space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#75758a]">
          <LayoutDashboard className="w-4 h-4 text-black" />
          <span>Console Overview</span>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-black">
              Seller Dashboard
            </h1>
            <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
              Welcome back, <strong className="text-black font-semibold">{session.user.name}</strong>. Monitor listing views, active enquiries, and manage your inventory state.
            </p>
          </div>
          <Link href="/seller/products/new" className="shrink-0">
            <Button className="rounded-full bg-black text-white hover:bg-neutral-800 font-semibold px-6 py-2.5 text-xs uppercase tracking-wider">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white border border-[#e5e7eb] rounded-2xl p-6 flex flex-col justify-between hover:border-slate-350 hover:shadow-sm transition-all"
          >
            <div className="flex justify-between items-start">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                {kpi.label}
              </span>
              <kpi.icon className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-3xl font-normal text-black font-sans mt-4">
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-black font-sans">
            Recent Product Listings
          </h2>
          <Link href="/seller/products" className="inline-flex items-center text-xs font-mono uppercase tracking-wider text-[#1863dc] hover:underline font-bold">
            All Products <ArrowRight className="ml-1 w-3.5 h-3.5" />
          </Link>
        </div>

        {recentProducts.length === 0 ? (
          <div className="text-center py-20 border border-[#e5e7eb] rounded-2xl bg-[#eeece7]/20">
            <Package className="w-8 h-8 text-slate-400 mx-auto mb-3 stroke-[1.5]" />
            <p className="text-sm text-slate-500 mb-4 font-sans">No active product listings discovered.</p>
            <Link href="/seller/products/new">
              <Button className="rounded-full bg-black text-white hover:bg-neutral-800 font-semibold px-6 py-2 text-xs uppercase tracking-wider">
                List Your First Machine
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentProducts.map((product) => (
              <div
                key={product._id?.toString()}
                className="bg-white border border-[#e5e7eb] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-all shadow-xs"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="relative w-12 h-12 rounded-xl bg-slate-50 overflow-hidden flex-shrink-0 border border-[#e5e7eb] flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Package className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-bold text-sm text-black truncate tracking-tight">{product.name}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                      <span>Ref: {product.referenceNumber}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {product.views} views</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full ${
                      product.status === "APPROVED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      product.status === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-200" :
                      "bg-slate-100 text-slate-750 border-slate-200"
                    }`}
                  >
                    {product.status}
                  </Badge>
                  <Link href={`/seller/products/${product._id}`}>
                    <Button variant="outline" className="h-9 rounded-full text-xs hover:bg-[#eeece7]/60 font-semibold px-4">
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
