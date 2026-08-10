"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Lock, ShieldAlert, ArrowRight, FileText, CheckCircle2, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SellerApprovalGuardProps {
  children: React.ReactNode;
  isApproved: boolean;
  hasCompany: boolean;
}

export default function SellerApprovalGuard({
  children,
  isApproved,
  hasCompany,
}: SellerApprovalGuardProps) {
  const pathname = usePathname();

  // Always allow the company profile setup page
  if (pathname === "/seller/company" || isApproved) {
    return <>{children}</>;
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-lg bg-white border border-slate-200/80 rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden">
        
        {/* Top subtle decorative pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/60 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />

        <div className="flex flex-col items-center text-center space-y-6">
          {/* Animated Lock Icon */}
          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center relative">
            <Lock className="w-8 h-8 text-primary animate-pulse" />
            <ShieldAlert className="w-4 h-4 text-red-500 absolute -top-1 -right-1 bg-white rounded-full" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
              Console Pending Approval
            </h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Your Santechs seller dashboard and RFQ access are currently locked until your storefront registration is verified and approved.
            </p>
          </div>

          {/* Stepper / Progress status */}
          <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left space-y-3.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Activation Progress</h4>
            
            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Account Registered</p>
                  <p className="text-[10px] text-slate-400">Authentic seller account created.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                {hasCompany ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-200 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-xs font-bold text-slate-800">Submit Company Details</p>
                  <p className="text-[10px] text-slate-400">Provide registration certificate, PAN, and business address.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-200 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Super Admin Verification</p>
                  <p className="text-[10px] text-slate-400">Our administrators will crosscheck PAN/GST records for compliance.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="w-full pt-2">
            {hasCompany ? (
              <div className="space-y-4">
                <Link href="/seller/company" className="w-full">
                  <Button className="w-full h-11 rounded-full bg-black text-white hover:bg-neutral-800 font-bold text-xs uppercase tracking-wider transition-all shadow-sm border-0">
                    Review Company Profile
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
                <p className="text-[10px] text-slate-400 font-medium">
                  Status: Under Review. We will email you once verification completes.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Link href="/seller/company" className="w-full">
                  <Button className="w-full h-11 rounded-full bg-[#ff7759] hover:bg-[#ff7759]/90 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm border-0">
                    Complete Storefront Setup
                    <FileText className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
                <p className="text-[10px] text-red-500 font-medium">
                  * Complete your profile details to submit for verification.
                </p>
              </div>
            )}
          </div>

          {/* Bottom contact info */}
          <div className="border-t border-slate-100 w-full pt-4 flex flex-col sm:flex-row justify-center items-center gap-4 text-[10px] text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Sales@santechs.net
            </span>
            <span className="hidden sm:inline text-slate-200">|</span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              +91 91676 55133
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
