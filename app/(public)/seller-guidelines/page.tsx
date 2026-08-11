"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  PackageCheck,
  MessageSquare,
  FileText,
  ArrowRight,
  HelpCircle,
  Clock,
  Sparkles,
  Search,
  ChevronDown,
  Factory,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const trustBadges = [
  { icon: ShieldCheck, title: "Verified Profiles", desc: "GST & Tax ID verification mandatory" },
  { icon: PackageCheck, title: "Admin Quality Audit", desc: "Every listing reviewed before publication" },
  { icon: Clock, title: "24–48h Onboarding", desc: "Fast application review turnarounds" },
  { icon: Search, title: "Global Marketplace", desc: "Connect with verified domestic & global buyers" },
];

const guidelinesList = [
  {
    step: "01",
    icon: Building2,
    title: "Seller Onboarding & Verification",
    badge: "Mandatory Requirement",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    description:
      "All sellers must complete official company verification before their product listings are published on the Santechs marketplace.",
    points: [
      "Submit valid corporate information including Company Name, Registered Business Address, and Business Type (Manufacturer, Trader, Dealer).",
      "Provide official GST Number, PAN, or Tax Registration Document for verification by the Santechs admin team.",
      "Ensure business contact details (Email, Phone) belong to an authorized company representative.",
      "Accounts remain in 'Pending Admin Review' status until verified by our compliance team.",
    ],
  },
  {
    step: "02",
    icon: PackageCheck,
    title: "Product Listing Standards & Accuracy",
    badge: "Quality Criteria",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description:
      "Every machine, spare part, or raw material listing must accurately represent the actual physical equipment available for sale.",
    points: [
      "Provide precise Technical Specifications: Brand, Model Number, Year of Manufacture, Capacity, and Operating Condition (New, Refurbished, Used).",
      "Upload authentic, high-resolution original photographs of the actual machine or inventory. Stock or watermarked images from third-party sites are prohibited.",
      "Specify accurate machine location (City, State, Country) to allow buyers to calculate logistics and inspection costs.",
      "State clear pricing (or select 'Price on Request') with currency (INR, USD, EUR) and applicable tax details.",
    ],
  },
  {
    step: "03",
    icon: MessageSquare,
    title: "Enquiry Handling & Managed Communication",
    badge: "Deal Pipeline",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    description:
      "Santechs acts as a managed B2B platform coordinator to streamline negotiations, verify buyer intent, and assist in deal execution.",
    points: [
      "Respond promptly to quote enquiries and requests assigned to your Seller Command Center.",
      "Provide honest machinery condition reports and grant site inspection access when requested by qualified buyers.",
      "Maintain professional communication with assigned Santechs platform coordinators throughout the deal pipeline.",
      "Contact details are securely managed and exchanged between transacting parties upon mutual agreement.",
    ],
  },
  {
    step: "04",
    icon: AlertTriangle,
    title: "Prohibited Content & Listing Violations",
    badge: "Strict Policy",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    description:
      "To maintain platform integrity and buyer trust, strict penalties apply to fraudulent or inaccurate listings.",
    points: [
      "Prohibited: Counterfeit parts, mislabeled raw materials, stolen equipment, or phantom inventory not owned/authorized for sale.",
      "Misrepresentation of machine age, operating hours, defects, or refurbishment history is strictly forbidden.",
      "Creating duplicate listings for the same machine to manipulate search results is not permitted.",
      "Violations may result in immediate listing removal, seller account suspension, or permanent blacklisting.",
    ],
  },
  {
    step: "05",
    icon: FileText,
    title: "Documentation & Order Fulfillment",
    badge: "Compliance",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    description:
      "Sellers must ensure seamless documentation and logistical coordination once a deal is closed.",
    points: [
      "Provide necessary commercial documentation including Tax Invoice, Packing List, Certificate of Origin, and Operation Manuals.",
      "Adhere strictly to agreed dismantling, loading, and dispatch schedules post deal closure.",
      "Ensure proper protective packaging and rust-proofing for international or long-distance freight transit.",
    ],
  },
];

const faqs = [
  {
    q: "How long does seller company approval take?",
    a: "Our admin compliance team typically reviews and verifies new seller company profiles within 24 to 48 business hours after registration and document submission.",
  },
  {
    q: "Can I list machines located outside of India?",
    a: "Yes! Santechs supports global machinery trade. You can list equipment located anywhere in the world by specifying the exact country and port/location details during product creation.",
  },
  {
    q: "Are there any listing fees to post equipment?",
    a: "Basic product listings on Santechs are free for verified sellers. Featured placement options and commission structures apply upon deal execution as outlined in your seller agreement.",
  },
  {
    q: "What happens if a buyer requests a physical machine inspection?",
    a: "Our platform coordinator will contact you to schedule a convenient inspection date. You will be expected to allow the buyer or certified engineer access to inspect the machine at its current site.",
  },
  {
    q: "How do I update machine status once sold?",
    a: "You can update listing status anytime from your Seller Dashboard under 'My Products' to mark an item as Sold, Reserved, or Inactive.",
  },
];

export default function SellerGuidelinesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section with Grid Overlay */}
      <section className="relative bg-white overflow-hidden py-16 lg:py-24 border-b border-[#e5e7eb]">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Taxonomy Tag */}
            <div className="flex justify-center">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#ff7759] font-bold bg-[#ff7759]/10 px-3.5 py-1 rounded-full">
                Santechs Quality Standards & Compliance
              </span>
            </div>

            {/* Monumental Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-normal tracking-[-0.04em] leading-[0.98] text-black font-sans">
              Seller Guidelines & Listing Standards.
            </h1>

            <p className="text-base sm:text-lg text-[#75758a] max-w-2xl mx-auto leading-relaxed">
              Essential rules, company verification criteria, listing quality standards, and code of conduct for listing textile machinery, recycling plants, raw materials, and spare parts on Santechs.
            </p>

            {/* Trust Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 text-left">
              {trustBadges.map((badge, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-[#e5e7eb] space-y-2 hover:border-black/20 transition-all shadow-xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#ff7759]/10 flex items-center justify-center text-[#ff7759]">
                    <badge.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-black">{badge.title}</h4>
                    <p className="text-[11px] text-[#75758a] leading-tight mt-0.5">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Guidelines Section */}
      <section className="py-20 bg-[#faf9f6] border-b border-[#e5e7eb]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#75758a] font-bold">
              Policy Framework
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-black font-sans">
              Seller Code of Conduct & Guidelines
            </h2>
            <p className="text-sm text-[#75758a]">
              Review the guidelines below to ensure your company account and listings remain compliant and eligible for platform distribution.
            </p>
          </div>

          <div className="space-y-6">
            {guidelinesList.map((g, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-3xl p-6 sm:p-10 border border-[#e5e7eb] space-y-6 shadow-xs hover:border-black/20 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e7eb] pb-5">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm font-bold text-[#ff7759] bg-[#ff7759]/10 px-3 py-1 rounded-xl">
                      {g.step}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-normal tracking-tight text-black font-sans">
                      {g.title}
                    </h3>
                  </div>
                  <Badge variant="outline" className={cn("text-xs font-semibold px-3 py-1 self-start sm:self-auto shrink-0", g.badgeColor)}>
                    {g.badge}
                  </Badge>
                </div>

                <p className="text-xs sm:text-sm text-[#75758a] font-medium leading-relaxed">
                  {g.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {g.points.map((point, pIdx) => (
                    <div
                      key={pIdx}
                      className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100/80 text-xs sm:text-sm text-slate-800 leading-relaxed"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#ff7759] shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white border-b border-[#e5e7eb]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#75758a] font-bold">
              Help Center
            </span>
            <h2 className="text-3xl font-normal tracking-tight text-black font-sans flex items-center justify-center gap-2">
              <HelpCircle className="w-7 h-7 text-[#ff7759]" /> Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#75758a]">
              Everything you need to know about seller onboarding, inspection access, and fees.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="border border-[#e5e7eb] rounded-2xl overflow-hidden transition-all bg-white hover:border-black/20"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-black hover:text-[#ff7759] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-[#75758a] shrink-0 transition-transform duration-200",
                        isOpen ? "rotate-180 text-[#ff7759]" : ""
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#75758a] leading-relaxed border-t border-[#e5e7eb]/60 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Matching Enterprise Dark CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-[#003c33] p-8 lg:p-14 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="space-y-4 max-w-xl text-center md:text-left">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto md:mx-0">
                <Factory className="w-6 h-6 text-[#ff7759]" />
              </div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-[#ffad9b] font-bold">
                Seller Registration Program
              </div>
              <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-white font-sans">
                Ready to List Your Equipment?
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Register your company profile on Santechs today and reach thousands of verified industrial buyers across India and worldwide.
              </p>
              <ul className="space-y-2 pt-1 text-left inline-block">
                {[
                  "Official Verified Seller badge",
                  "Direct quote enquiry management",
                  "Dedicated platform deal coordinator",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-xs font-semibold text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff7759] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full sm:w-auto">
              <Link href="/seller/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-[#ff7759] hover:bg-[#ff7759]/90 text-white font-bold px-8 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#ff7759]/30 h-12">
                  <span>Register as Seller</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/contact" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 rounded-xl px-6 h-12">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
