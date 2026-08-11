"use client";

import { motion } from "framer-motion";
import { Factory, ShieldCheck, Handshake, Users, Phone, Mail, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen pb-24 font-sans text-slate-800">
      
      {/* ── HERO SECTION ── */}
      <section className="relative py-20 bg-slate-50 border-b border-slate-100 overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6 relative z-10">
          <Badge className="bg-[#ff7759]/10 text-[#ff7759] border-[#ff7759]/20 rounded-full px-4 py-1 text-xs font-semibold">
            About Santechs
          </Badge>
          <h1 className="text-4xl md:text-6xl font-normal tracking-[-0.04em] leading-[0.95] text-black font-sans">
            Bringing Trust to Industrial Sourcing.
          </h1>
          <p className="text-base sm:text-lg text-[#75758a] max-w-2xl mx-auto leading-relaxed">
            We are India&apos;s premier managed B2B platform for textile machinery, recycling plants, raw materials, and spare parts.
          </p>
        </div>
      </section>

      {/* ── OUR STORY ── */}
      <section className="py-20 max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-black font-sans">Our Mission</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Heavy industrial machinery procurement has historically been plagued by information asymmetry, untrusted intermediaries, and lack of transparency. Santechs was founded to bridge this gap. We operate as a neutral, managed platform that vets sellers, coordinates machine audits, and facilitates secure contract handshakes.
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            By acting as a neutral platform coordinator, we protect both parties: sellers get verified buyer leads without public exposure, and buyers get access to audited machinery with clear condition reports.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-black">Vetted Listings</h3>
            <p className="text-slate-500 text-[11px] leading-relaxed">Every machine post is audited for specification and photo accuracy by our admin team before publication.</p>
          </div>
          <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Handshake className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-black">Santechs Security</h3>
            <p className="text-slate-500 text-[11px] leading-relaxed">We hold buyer and seller contact details confidentially, ensuring negotiations are coordinated neutrally.</p>
          </div>
          <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-black">Transaction Support</h3>
            <p className="text-slate-500 text-[11px] leading-relaxed">From scheduling physical site audits to payment logistics, our coordinators assist throughout the lifecycle.</p>
          </div>
        </div>
      </section>

      {/* ── CORPORATE INFO ── */}
      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-black font-sans">Contact Details</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Reach out to our platform coordinators for support, listing uploads, or transaction mediation.</p>
            <div className="space-y-3 pt-2">
              <a href="tel:+919167655133" className="flex items-center gap-3 text-sm text-slate-600 hover:text-primary transition-colors">
                <Phone className="w-4 h-4 text-primary" />
                +91 91676 55133
              </a>
              <a href="mailto:Sales@santechs.net" className="flex items-center gap-3 text-sm text-slate-600 hover:text-primary transition-colors">
                <Mail className="w-4 h-4 text-primary" />
                Sales@santechs.net
              </a>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-black font-sans">Registered Office</h3>
            <div className="flex items-start gap-3 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-primary mt-1 shrink-0" />
              <p className="leading-relaxed text-xs">
                Office No A 154, Balaji Bhavan,<br />
                Sector 11, Plot no.42A,<br />
                Cbd Belapur, Navi Mumbai,<br />
                Maharashtra, India - 400614
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
