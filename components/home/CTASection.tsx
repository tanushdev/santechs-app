"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Factory, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="py-24 bg-white border-t border-[#e5e7eb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Seller CTA - Dark Enterprise Green */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-3xl bg-[#003c33] p-8 lg:p-12 flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <Factory className="w-6 h-6 text-[#ff7759]" />
              </div>
              <div className="space-y-2">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#ffad9b] font-bold">
                  Sellers Program
                </div>
                <h3 className="text-3xl font-normal tracking-tight text-white font-sans">
                  List Your Machinery
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed max-w-md">
                  List your industrial textile machinery, recycling plants, or spare parts. Reach verified buyers worldwide through our managed platform.
                </p>
              </div>
              <ul className="space-y-2.5 pt-2">
                {[
                  "Free listing for your first 10 products",
                  "Verified Seller profile verification",
                  "Detailed listing analytics",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-xs font-semibold text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff7759] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-8">
              <Link href="/sell">
                <Button className="rounded-full bg-white text-black hover:bg-slate-100 font-semibold px-6 py-2.5 text-xs uppercase tracking-wider">
                  Start Selling Free
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Buyer CTA - Warm Soft Stone */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-3xl bg-[#eeece7]/50 border border-[#e5e7eb] p-8 lg:p-12 flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center">
                <Search className="w-6 h-6 text-black" />
              </div>
              <div className="space-y-2">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#1863dc] font-bold">
                  Buyer Services
                </div>
                <h3 className="text-3xl font-normal tracking-tight text-black font-sans">
                  Procure Machinery
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed max-w-md">
                  Submit quote requests, browse certified listings, and let our team coordinate negotiations, inspection verification, and transaction support.
                </p>
              </div>
              <ul className="space-y-2.5 pt-2">
                {[
                  "Access to 10,000+ verified listings",
                  "Intermediary escrow protection",
                  "Relocation & on-site inspection support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-black flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-8 flex flex-wrap gap-3">
              <Link href="/products">
                <Button className="rounded-full bg-black text-white hover:bg-neutral-800 font-semibold px-6 py-2.5 text-xs uppercase tracking-wider">
                  Browse Catalog
                </Button>
              </Link>
              <Link href="/register?role=BUYER">
                <Button variant="outline" className="rounded-full border-[#e5e7eb] hover:bg-slate-100 font-semibold px-6 py-2.5 text-xs uppercase tracking-wider">
                  Join Free
                </Button>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
