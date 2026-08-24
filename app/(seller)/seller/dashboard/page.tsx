import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db/connection";
import Product from "@/lib/db/models/Product.model";
import Enquiry from "@/lib/db/models/Enquiry.model";
import Company from "@/lib/db/models/Company.model";
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
  LayoutDashboard,
  Building2,
  ShieldCheck,
  Sparkles,
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
    totalProducts,
    draftProducts,
    pendingProducts,
    approvedProducts,
    totalViews,
    totalEnquiries,
    recentProducts,
    company,
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
    Company.findOne({ owner: session.user.id }).lean(),
  ]);

  const hasCompanyProfile = Boolean(
    company && company.name && company.address?.city
  );
  const isCompanyApproved = company?.isApproved === true;
  const hasProducts = totalProducts > 0;

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
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 sm:p-8 space-y-3 relative overflow-hidden shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
          <LayoutDashboard className="w-4 h-4 text-primary" />
          <span>Console Overview</span>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
              Seller Dashboard
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Welcome back, <strong className="text-slate-900 font-semibold">{session.user.name}</strong>. Monitor machinery views, incoming buyer enquiries, and complete your storefront verification.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link href="/seller/company">
              <Button variant="outline" className="rounded-xl border-slate-200 text-slate-800 font-bold text-xs h-9">
                <Building2 className="w-4 h-4 mr-1.5 text-primary" />
                {hasCompanyProfile ? "Company Profile" : "+ Add Company Details"}
              </Button>
            </Link>
            <Link href="/seller/products/new">
              <Button className="rounded-xl bg-[#ff7759] hover:bg-[#ff7759]/90 text-white font-bold px-4 py-2 text-xs shadow-xs h-9">
                <PlusCircle className="w-4 h-4 mr-1.5" />
                Add Machine
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive 3-Step Seller Onboarding Journey */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#ff7759]" />
              <span>Seller Storefront Onboarding Progress</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Follow these simple steps to activate your storefront and list machinery for verified buyers.
            </p>
          </div>
          <Badge
            variant="outline"
            className={`self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full ${
              isCompanyApproved
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : hasCompanyProfile
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            {isCompanyApproved
              ? "✓ Storefront Verified"
              : hasCompanyProfile
              ? "⏳ Profile Under Review"
              : "⚠️ Action Required: Add Company Details"}
          </Badge>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Step 1: Add Company Details */}
          <div
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
              hasCompanyProfile
                ? "bg-emerald-50/50 border-emerald-200 text-emerald-950"
                : "bg-amber-50/60 border-amber-200 text-amber-950 shadow-sm"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded bg-white/80 border border-slate-200">
                  Step 1
                </span>
                {hasCompanyProfile ? (
                  <Badge className="bg-emerald-600 text-white text-[10px] border-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Complete
                  </Badge>
                ) : (
                  <Badge className="bg-amber-500 text-white text-[10px] border-0">
                    Required
                  </Badge>
                )}
              </div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-primary" /> Add Company Details
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {hasCompanyProfile
                  ? `Company profile for "${company?.name}" is saved. GST/PAN & details uploaded.`
                  : "Enter your legal business name, GST/PAN number, address, and upload verification docs."}
              </p>
            </div>

            <Link href="/seller/company" className="pt-2">
              <Button
                size="sm"
                className={`w-full text-xs font-bold rounded-xl ${
                  hasCompanyProfile
                    ? "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200"
                    : "bg-[#ff7759] hover:bg-[#ff7759]/90 text-white shadow-xs"
                }`}
              >
                <span>{hasCompanyProfile ? "Edit Company Details" : "+ Add Company Details"}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Step 2: Add Machinery & Products */}
          <div
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
              hasProducts
                ? "bg-emerald-50/50 border-emerald-200 text-emerald-950"
                : hasCompanyProfile
                ? "bg-white border-slate-200 text-slate-900 shadow-sm"
                : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-700">
                  Step 2
                </span>
                {hasProducts ? (
                  <Badge className="bg-emerald-600 text-white text-[10px] border-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> {totalProducts} Listed
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">
                    Next Step
                  </Badge>
                )}
              </div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-primary" /> List Machinery & Products
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add machine specifications, technical photos, price, and operating condition for buyers.
              </p>
            </div>

            <Link href="/seller/products/new" className="pt-2">
              <Button
                size="sm"
                className="w-full text-xs font-bold bg-slate-900 hover:bg-black text-white rounded-xl shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1" />
                <span>Add New Machine</span>
              </Button>
            </Link>
          </div>

          {/* Step 3: Admin Review & Verification */}
          <div
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
              isCompanyApproved
                ? "bg-emerald-50/50 border-emerald-200 text-emerald-950"
                : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded bg-white/80 border border-slate-200">
                  Step 3
                </span>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold ${
                    isCompanyApproved
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-amber-100 text-amber-800 border-amber-300"
                  }`}
                >
                  {isCompanyApproved ? "Verified" : "Under Review"}
                </Badge>
              </div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" /> Admin Verification
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isCompanyApproved
                  ? "Your company profile is verified. All published machinery is live for verified buyers."
                  : "Santechs team reviews your submitted company details and product specifications."}
              </p>
            </div>

            <div className="pt-2 text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{isCompanyApproved ? "Live & Active" : "Fast Track Approval in ~24h"}</span>
            </div>
          </div>

        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white border border-[#e5e7eb] rounded-2xl p-6 flex flex-col justify-between hover:border-slate-350 hover:shadow-xs transition-all"
          >
            <div className="flex justify-between items-start">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                {kpi.label}
              </span>
              <kpi.icon className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-3xl font-bold text-slate-900 font-heading mt-4">
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 font-heading">
            Recent Product Listings
          </h2>
          <Link href="/seller/products" className="inline-flex items-center text-xs font-mono uppercase tracking-wider text-[#ff7759] hover:underline font-bold">
            All Products <ArrowRight className="ml-1 w-3.5 h-3.5" />
          </Link>
        </div>

        {recentProducts.length === 0 ? (
          <div className="text-center py-16 border border-slate-200 rounded-2xl bg-white space-y-3">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <div>
              <p className="text-sm font-bold text-slate-900">No active product listings yet.</p>
              <p className="text-xs text-slate-500">Complete your company profile and list your first machinery item.</p>
            </div>
            <Link href="/seller/products/new" className="inline-block pt-1">
              <Button className="rounded-xl bg-[#ff7759] hover:bg-[#ff7759]/90 text-white font-bold px-5 py-2 text-xs shadow-xs">
                List Your First Machine
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentProducts.map((product: any) => (
              <div
                key={String(product._id)}
                className="bg-white border border-[#e5e7eb] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-all shadow-xs"
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
                    <h4 className="font-bold text-sm text-slate-900 truncate tracking-tight">{product.name}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono">
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
                      "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {product.status}
                  </Badge>
                  <Link href={`/seller/products/${product._id}`}>
                    <Button variant="outline" className="h-8 rounded-xl text-xs font-semibold px-3 border-slate-200">
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
