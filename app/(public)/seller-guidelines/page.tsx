"use client";

import { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const guidelinesList = [
  {
    icon: Building2,
    title: "1. Seller Onboarding & Company Verification",
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
    icon: PackageCheck,
    title: "2. Product Listing Standards & Accuracy",
    badge: "Listing Quality",
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
    icon: MessageSquare,
    title: "3. Enquiry Handling & Managed Communication",
    badge: "Deal Flow",
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
    icon: AlertTriangle,
    title: "4. Prohibited Content & Listing Violations",
    badge: "Policy Enforcement",
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
    icon: FileText,
    title: "5. Documentation & Dispatch Compliance",
    badge: "Order Fulfillment",
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
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Hero Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs space-y-6 text-center sm:text-left relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-3 max-w-3xl">
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-semibold text-xs inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> Platform Quality Standards
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-slate-900 tracking-tight leading-tight">
              Seller Guidelines & Listing Standards
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Welcome to the Santechs B2B Industrial Marketplace. These guidelines establish the rules, verification standards, and quality criteria required for listing textile machinery, recycling plants, raw materials, and spare parts on our platform.
            </p>
          </div>

          {/* Key Highlights Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-primary" /> Verified Profile
              </div>
              <p className="text-[11px] text-slate-500">GST/Tax ID mandatory for all seller accounts</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <PackageCheck className="w-4 h-4 text-primary" /> Admin Approval
              </div>
              <p className="text-[11px] text-slate-500">Every product verified before publication</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Clock className="w-4 h-4 text-primary" /> Fast Onboarding
              </div>
              <p className="text-[11px] text-slate-500">Approvals processed in 24–48 hours</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Search className="w-4 h-4 text-primary" /> Global Reach
              </div>
              <p className="text-[11px] text-slate-500">Connect with qualified domestic & international buyers</p>
            </div>
          </div>
        </div>

        {/* Guidelines Sections */}
        <div className="space-y-6">
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-2xl font-bold font-heading text-slate-900">
              Seller Code of Conduct & Requirements
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Please review the following policy guidelines carefully to ensure your listings remain compliant and active.
            </p>
          </div>

          <div className="space-y-4">
            {guidelinesList.map((g, idx) => (
              <Card
                key={idx}
                className="bg-white border-slate-200 shadow-xs hover:border-slate-300 transition-all"
              >
                <CardContent className="p-6 sm:p-8 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl orange-gradient flex items-center justify-center text-white shrink-0 shadow-xs">
                        <g.icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold font-heading text-lg sm:text-xl text-slate-900">
                        {g.title}
                      </h3>
                    </div>
                    <Badge variant="outline" className={`text-xs font-semibold px-3 py-1 shrink-0 ${g.badgeColor}`}>
                      {g.badge}
                    </Badge>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    {g.description}
                  </p>

                  <ul className="space-y-2.5 pt-2">
                    {g.points.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-heading text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-primary" /> Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Got questions about selling on Santechs? Find quick answers below.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-slate-50/50"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-primary transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200",
                        isOpen ? "rotate-180 text-primary" : ""
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/50 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Call to Action Card */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading">
              Ready to Sell Your Machinery or Materials?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Register your company profile on Santechs today and showcase your inventory to thousands of verified industrial buyers across India and globally.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 pt-2">
            <Link href="/seller/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-8 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/30">
                <span>Create Seller Account</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-slate-700 text-white hover:bg-slate-800 rounded-xl px-6">
                Contact Seller Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
