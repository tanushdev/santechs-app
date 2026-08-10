"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ArrowRight, ShieldCheck, Zap, TrendingUp, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const trustBadges = [
  { icon: ShieldCheck, label: "Verified Sellers Only" },
  { icon: Zap, label: "Instant Digital Quotes" },
  { icon: TrendingUp, label: "Factory-Direct Pricing" },
  { icon: CheckSquare, label: "Inspected & Audited" },
];

const hotSearches = [
  "DTY Machine",
  "PET Flakes",
  "Recycling Plant",
  "FDY Machine",
  "Godet Roll",
  "Spinning Machine",
];

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/products");
    }
  };

  return (
    <section className="relative min-h-[85vh] flex items-center bg-white overflow-hidden py-16 lg:py-24 border-b border-[#e5e7eb]">
      {/* Editorial Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          
          {/* Taxonomy label */}
          <div className="flex justify-center">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#ff7759] font-bold bg-[#ff7759]/10 px-3.5 py-1 rounded-full">
              Global B2B Industrial Infrastructure
            </span>
          </div>

          {/* Monumental Display Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-normal tracking-[-0.04em] leading-[0.95] text-black font-sans">
            Find Textile Machinery & Recycling Plants.
          </h1>

          <p className="text-base sm:text-lg text-[#75758a] max-w-2xl mx-auto leading-relaxed">
            Connect directly with audited sellers globally. Search and filter verified DTY, FDY, POY texturizing machinery, recycling plants, raw materials, and spare parts.
          </p>

          {/* Cohere Style Compact Search Console */}
          <form
            onSubmit={handleSearch}
            className="relative max-w-xl mx-auto p-1 bg-white border border-[#e5e7eb] rounded-full shadow-md flex items-center gap-1.5 focus-within:ring-2 focus-within:ring-[#4c6ee6]/20 transition-all"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="hero-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search models, brands, or materials..."
                className="pl-10 pr-4 bg-transparent border-0 text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 text-sm h-11 shadow-none w-full"
              />
            </div>
            <Button
              type="submit"
              className="bg-black text-white hover:bg-neutral-800 rounded-full px-6 h-10 font-medium text-xs tracking-wider uppercase transition-colors"
            >
              Search
            </Button>
          </form>

          {/* Hot Searches */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Popular:</span>
            {hotSearches.map((term) => (
              <Link
                key={term}
                href={`/products?search=${encodeURIComponent(term)}`}
                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#eeece7] hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200/40"
              >
                {term}
              </Link>
            ))}
          </div>

          {/* Trust Logo Strip style customer stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 max-w-3xl mx-auto border-t border-[#e5e7eb] mt-12">
            {[
              { value: "10,000+", label: "Listed Machinery" },
              { value: "2,500+", label: "Verified Sellers" },
              { value: "50,000+", label: "Active Buyers" },
              { value: "₹500Cr+", label: "Deals Closed" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 text-center bg-[#eeece7]/40 rounded-2xl border border-[#e5e7eb]/60"
              >
                <div className="text-2xl font-bold font-sans text-black tracking-tight mb-1">
                  {stat.value}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
