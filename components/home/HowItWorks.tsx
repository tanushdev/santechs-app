"use client";

import { motion } from "framer-motion";
import { UserPlus, Package, Eye, MessageSquare, Handshake, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: UserPlus,
    title: "Register as Seller",
    description:
      "Create your company profile and submit for Super Admin verification.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Package,
    title: "List Your Products",
    description:
      "Upload machinery, raw materials, or services with full specifications and media.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: Eye,
    title: "Admin Review",
    description:
      "Our Super Admin reviews every listing to ensure quality and accuracy before publishing.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: MessageSquare,
    title: "Buyer Enquiry",
    description:
      "Interested buyers submit enquiries. Only the Super Admin receives buyer contact details.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Handshake,
    title: "Santechs Facilitates Deal",
    description:
      "Our team connects buyer and seller, negotiates, and shares contacts when both parties are ready.",
    color: "text-[#ff7759]",
    bg: "bg-[#ff7759]/10",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-white border-b border-[#e5e7eb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#75758a] font-bold">
            Our Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-black font-sans mt-2 mb-4">
            How Santechs Works
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
            A transparent, secure platform model where every transaction is verified by
            our expert team — protecting both buyers and sellers.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="relative">
          
          {/* Dashed connector line positioned exactly behind the middle of the 80px (h-20) step node circles */}
          <div className="hidden lg:block absolute top-10 left-[8%] right-[8%] h-[1px] border-t border-dashed border-slate-300 z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
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
                  
                  {/* Solid white circular node (blocks the dashed line running behind it) */}
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

                <h3 className="font-bold text-sm text-slate-900 mb-2 font-sans tracking-tight">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
                  {step.description}
                </p>

                {/* Arrow between steps (displayed only on mobile/tablet viewports) */}
                {i < steps.length - 1 && (
                  <div className="lg:hidden flex items-center justify-center mt-6 text-slate-300">
                    <ArrowRight className="w-5 h-5 rotate-90 sm:rotate-0" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
