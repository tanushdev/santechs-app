"use client";

import { Badge } from "@/components/ui/badge";

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-xs text-[#75758a]">Last updated: August 10, 2026</p>
        </div>
      </section>

      {/* ── POLICY TEXT ── */}
      <section className="py-16 max-w-3xl mx-auto px-4 sm:px-6 space-y-8 text-sm leading-relaxed text-slate-600">
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-black font-sans">1. Overview</h2>
          <p>
            Santechs (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates a managed B2B industrial machinery platform. We are committed to protecting the privacy and corporate data of our buyers and sellers. This Privacy Policy describes how we collect, store, share, and protect your business details.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-black font-sans">2. Information We Collect</h2>
          <p>
            To facilitate secure B2B transaction coordination, we collect the following types of information:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>User Profile Info</strong>: Name, work email, phone number, and password.</li>
            <li><strong>Company Profiles</strong>: Business name, corporate address, GSTIN, PAN, tax records, and website link.</li>
            <li><strong>Listing Data</strong>: Machinery specifications, photographs, condition metrics, and pricing.</li>
            <li><strong>Quote Inquiries</strong>: Transaction requirements, targets, and coordinator communications.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-black font-sans">3. How We Use and Protect Data</h2>
          <p>
            Unlike open directory boards, Santechs does not publicly expose your phone numbers, work emails, or tax documents. Buyer and seller information is kept confidential and is accessed exclusively by our admin coordination panel. Contact details are only shared between the transacting parties once negotiations are finalized and both parties agree to execute the deal.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-black font-sans">4. Security Standards</h2>
          <p>
            We implement strict technical and organizational safeguards to protect your files and tax registries. All verification documents (GST, PAN, machinery certifications) are stored in secure cloud systems accessible only by verified administrators.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-black font-sans">5. Contact Legal Desk</h2>
          <p>
            If you have questions regarding this Privacy Policy or wish to request data deletion, please contact us at <a href="mailto:Sales@santechs.net" className="text-primary hover:underline font-semibold">Sales@santechs.net</a>.
          </p>
        </div>
      </section>

    </div>
  );
}
