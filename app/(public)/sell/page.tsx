"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Building2,
  Phone,
  Mail,
  User,
  Factory
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: User,
    title: "Register Account",
    description: "Sign up on Santechs as a Seller. It takes less than 30 seconds and is completely free.",
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  {
    icon: Building2,
    title: "Add Company Details",
    description: "Fill in your address and business registration information (GST/PAN) to build buyer credibility.",
    color: "text-purple-600",
    bg: "bg-purple-50"
  },
  {
    icon: Zap,
    title: "List Your Inventory",
    description: "Upload specifications, conditions, and photographs of your machinery or spare parts catalog.",
    color: "text-orange-600",
    bg: "bg-orange-50"
  },
  {
    icon: ShieldCheck,
    title: "Receive Verified Leads",
    description: "Our platform team moderates and forwards pre-screened buyer inquiries directly to your console.",
    color: "text-emerald-600",
    bg: "bg-emerald-50"
  }
];

export default function SellLandingPage() {
  return (
    <div className="bg-white min-h-screen pb-24 overflow-x-hidden font-sans">
      
      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[70vh] flex items-center bg-white overflow-hidden py-16 lg:py-24 border-b border-[#e5e7eb]">
        {/* Editorial Grid overlay matching home page */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            
            {/* Taxonomy label matching home page */}
            <div className="flex justify-center">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#ff7759] font-bold bg-[#ff7759]/10 px-3.5 py-1 rounded-full">
                Sellers Program
              </span>
            </div>

            {/* Monumental Display Headline matching home page */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-normal tracking-[-0.04em] leading-[0.95] text-black font-sans">
              Sell Industrial Machinery & Parts.
            </h1>

            <p className="text-base sm:text-lg text-[#75758a] max-w-xl mx-auto leading-relaxed">
              No registration charges, no listing fees, and no monthly plans. List your machinery, spare parts, and recycling plants to connect directly with global buyer leads.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-2">
              <Link href="/seller/register">
                <Button className="bg-black text-white hover:bg-neutral-800 rounded-full px-8 h-12 font-medium text-xs tracking-wider uppercase transition-colors group">
                  Start Selling Free
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button className="rounded-full border border-[#e5e7eb] hover:bg-slate-50 text-slate-600 font-semibold px-8 h-12 text-xs uppercase tracking-wider bg-white">
                  Talk to a Coordinator
                </Button>
              </Link>
            </div>

            {/* Free Account Badge */}
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600 font-mono uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" /> 100% Free Account & Unlimited Free Listings
            </div>

          </div>
        </div>
      </section>

      {/* ── STEPS TO GET STARTED (Process layout matching HowItWorks) ── */}
      <section className="py-24 bg-white border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center mb-16 space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#75758a] font-bold">
              Easy Onboarding
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-black font-sans mt-2 mb-4">
              How to Get Started as a Seller
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
              Setting up your storefront is quick, direct, and completely free. Follow these four steps.
            </p>
          </div>

          {/* Steps Grid matching HowItWorks connector line and node styles */}
          <div className="relative">
            {/* Dashed connector line */}
            <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-[1px] border-t border-dashed border-slate-300 z-0" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex flex-col items-center text-center relative"
                >
                  {/* Step node wrapper */}
                  <div className="relative mb-6 z-10">
                    
                    {/* Solid circular node */}
                    <div
                      className="w-20 h-20 rounded-full bg-white border border-[#e5e7eb] flex items-center justify-center shadow-xs transition-colors hover:border-[#ff7759] duration-300 relative z-10"
                    >
                      {/* Inner colored container */}
                      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", step.bg)}>
                        <step.icon className={cn("w-5.5 h-5.5", step.color)} />
                      </div>
                    </div>

                    {/* Step Count Badge */}
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#ff7759] text-white text-xs font-bold flex items-center justify-center shadow-sm z-20">
                      {i + 1}
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mb-2 font-sans tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-[220px]">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── FINAL CALL TO ACTION (Matching dark green Seller CTA style) ── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-3xl bg-[#003c33] p-8 md:p-14 flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl"
          >
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff7759]/5 rounded-full blur-3xl" />
            
            <div className="space-y-4 relative z-10 max-w-xl">
              <div className="font-mono text-[10px] uppercase tracking-widest text-[#ffad9b] font-bold">
                Free Listing Policy
              </div>
              <h3 className="text-3xl font-normal tracking-tight text-white font-sans">
                Zero Listing Charges, Ever
              </h3>
              <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                Create your seller account in under two minutes and list your equipment catalog with zero upfront or recurring monthly fees.
              </p>
            </div>
            
            <div className="relative z-10 shrink-0 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link href="/seller/register" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto rounded-full bg-white text-black hover:bg-slate-100 font-semibold px-8 h-11 text-xs uppercase tracking-wider">
                  Get Started (Free)
                </Button>
              </Link>
              <Link href="/contact" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto rounded-full border border-white/20 text-white hover:bg-white/10 font-bold px-8 h-11 text-xs uppercase tracking-wider bg-transparent">
                  Talk to Sales
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
