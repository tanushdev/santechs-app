"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Users, Package, MessageSquare, Loader2, ArrowUpRight, Award, Flame, Percent } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminAnalyticsPage() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff7759]" />
      </div>
    );
  }

  const pStats = statsData?.products ?? { total: 0, pending: 0, approved: 0 };
  const uStats = statsData?.users ?? { total: 0, sellers: 0, pendingSellers: 0 };
  const eStats = statsData?.enquiries ?? { total: 0, new: 0, closed: 0, conversionRate: "0" };
  const topProducts = statsData?.topProducts ?? [];

  // Derived metrics
  const activeSellersCount = uStats.sellers - uStats.pendingSellers;
  const approvedPercentage = pStats.total > 0 ? Math.round((pStats.approved / pStats.total) * 100) : 0;
  const activeBuyersCount = Math.max(0, uStats.total - uStats.sellers);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border-b border-[#e5e7eb] pb-6 space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#75758a]">
          <BarChart3 className="w-4 h-4 text-[#ff7759]" />
          <span>Intelligence Dashboard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-black font-sans">
          Platform Analytics & Insights
        </h1>
        <p className="text-slate-500 text-xs max-w-xl">
          Real-time metrics tracking machinery listings, registered buyers/sellers, inquiry conversions, and overall platform volume.
        </p>
      </div>

      {/* Grid: 4 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Active Listings */}
        <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Active Listings</span>
              <p className="text-3xl font-normal text-black font-sans leading-tight">{pStats.approved}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ff7759]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Approval Rate</span>
              <span className="font-bold text-slate-800">{approvedPercentage}%</span>
            </div>
            <Progress value={approvedPercentage} className="h-1 bg-slate-100" />
            <p className="text-[10px] text-slate-400 font-medium">
              {pStats.pending} listings currently pending admin moderation review.
            </p>
          </div>
        </div>

        {/* Card 2: Deal Conversion */}
        <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Deal Conversion</span>
              <p className="text-3xl font-normal text-black font-sans leading-tight">{eStats.conversionRate}%</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Closed Deals</span>
              <span className="font-bold text-slate-800">{eStats.closed} of {eStats.total}</span>
            </div>
            <Progress value={Number(eStats.conversionRate)} className="h-1 bg-slate-100" />
            <p className="text-[10px] text-slate-400 font-medium">
              {eStats.new} new quote enquiries awaiting broker assignment.
            </p>
          </div>
        </div>

        {/* Card 3: Active Buyers */}
        <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Registered Buyers</span>
              <p className="text-3xl font-normal text-black font-sans leading-tight">{activeBuyersCount}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-650">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1.5 pt-3">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Total User Base</span>
              <span className="font-bold text-slate-800">{uStats.total}</span>
            </div>
            <div className="flex justify-between text-[11px] pt-1">
              <span className="text-slate-500">Avg. Enquiries / Buyer</span>
              <span className="font-bold text-slate-800">
                {activeBuyersCount > 0 ? (eStats.total / activeBuyersCount).toFixed(1) : 0}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Verified Sellers */}
        <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Verified Sellers</span>
              <p className="text-3xl font-normal text-black font-sans leading-tight">{activeSellersCount}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1.5 pt-3">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Pending Review</span>
              <span className="font-bold text-[#ff7759]">{uStats.pendingSellers}</span>
            </div>
            <div className="flex justify-between text-[11px] pt-1">
              <span className="text-slate-500">Seller Approval Rate</span>
              <span className="font-bold text-slate-800">
                {uStats.sellers > 0 ? Math.round((activeSellersCount / uStats.sellers) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row: Funnel representation & Popular Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Popular listings list */}
        <div className="lg:col-span-2 border border-[#e5e7eb] rounded-2xl p-6 bg-white space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-bold text-base text-black font-sans">Most Visited Machinery</h3>
              <p className="text-[11px] text-slate-400 font-medium">Top performing approved listings by user views and details clicks.</p>
            </div>
            <Flame className="w-5 h-5 text-red-500" />
          </div>

          <div className="space-y-4">
            {topProducts.map((product: any, idx: number) => (
              <div
                key={product._id}
                className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 hover:bg-[#eeece7]/20 border border-slate-100 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="font-mono text-xs font-bold text-slate-300 w-4">#{idx + 1}</span>
                  <div className="relative w-12 h-12 bg-white border border-[#e5e7eb] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
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
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono text-slate-400 block">{product.referenceNumber}</span>
                    <Link
                      href={`/products/${product.slug}`}
                      target="_blank"
                      className="font-bold text-sm text-black hover:underline truncate block"
                    >
                      {product.name}
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-right shrink-0">
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 block">Views</span>
                    <span className="text-xs font-bold text-slate-800">{product.views ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 block">Quotes</span>
                    <span className="text-xs font-bold text-slate-800">{product.enquiryCount ?? 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Deal Funnel */}
        <div className="border border-[#e5e7eb] rounded-2xl p-6 bg-white flex flex-col justify-between gap-6">
          <div className="space-y-0.5">
            <h3 className="font-bold text-base text-black font-sans">Deal Pipeline</h3>
            <p className="text-[11px] text-slate-400 font-medium">Conversion progression of platform quote enquiries.</p>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {/* Step 1 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600 font-bold">1. Enquiries Received</span>
                <span className="text-slate-800 font-bold">{eStats.total}</span>
              </div>
              <Progress value={100} className="h-2 bg-slate-100" />
            </div>

            {/* Step 2 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600 font-bold">2. Under Active Review</span>
                <span className="text-slate-800 font-bold">{Math.max(0, eStats.total - eStats.new)}</span>
              </div>
              <Progress
                value={eStats.total > 0 ? ((eStats.total - eStats.new) / eStats.total) * 100 : 0}
                className="h-2 bg-slate-100 [&>[data-slot=progress-value]]:bg-amber-500"
              />
            </div>

            {/* Step 3 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600 font-bold">3. Deal Completed</span>
                <span className="text-slate-800 font-bold">{eStats.closed}</span>
              </div>
              <Progress
                value={Number(eStats.conversionRate)}
                className="h-2 bg-slate-100 [&>[data-slot=progress-value]]:bg-emerald-500"
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Average Closing Success</span>
            <p className="text-2xl font-bold text-emerald-700 font-sans">{eStats.conversionRate}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
