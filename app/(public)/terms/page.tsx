"use client";

import { Badge } from "@/components/ui/badge";

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen pb-24 font-sans text-slate-700">
      
      {/* ── HERO SECTION ── */}
      <section className="relative py-16 bg-slate-50 border-b border-slate-100 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4 relative z-10">
          <Badge className="bg-slate-900/10 text-slate-800 border-slate-900/20 rounded-full px-4 py-1 text-xs font-semibold">
            Legal
          </Badge>
          <h1 className="text-4xl font-normal tracking-[-0.04em] leading-[0.95] text-black font-sans">
            Terms of Service
          </h1>
          <p className="text-xs text-[#75758a]">Last updated: August 10, 2026</p>
        </div>
      </section>

      {/* ── TERMS TEXT ── */}
      <section className="py-16 max-w-3xl mx-auto px-4 sm:px-6 space-y-8 text-sm leading-relaxed text-slate-600">
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-black font-sans">1. Acceptance of Terms</h2>
          <p>
            By creating a Santechs seller or buyer account, listing machinery, or submitting quote enquiries, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-black font-sans">2. Platform Operation & Neutral Mediation</h2>
          <p>
            Santechs is a managed B2B marketplace. All listing assets must be approved by Santechs administrators before publishing. Buyers must submit quote requests through the platform. Contact information is confidential and is only released to transacting parties once both parties are qualified and ready to negotiate directly.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-black font-sans">3. Seller Account Responsibilities</h2>
          <p>
            Sellers represent that all details uploaded (machinery year, specifications, operational status, photographs) are accurate and not misleading. Sellers agree to keep corporate verification credentials (GST/PAN) up-to-date.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-black font-sans">4. Prohibited Activities</h2>
          <p>
            Users agree not to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Post counterfeit or misleading industrial equipment specs.</li>
            <li>Bypass platform coordination tracking once quote requests have been initiated.</li>
            <li>Upload malware, lock codes, or spam verification file attachments.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-black font-sans">5. Limitation of Liability</h2>
          <p>
            While Santechs coordinators facilitate site audits and neutral negotiations, the ultimate sale contract is signed between the Buyer and Seller directly. Santechs is not liable for machinery mechanical failures, transport logistics delay, or payment defaults arising after the deal handshake.
          </p>
        </div>
      </section>

    </div>
  );
}
