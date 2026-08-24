"use client";

import React from "react";
import Link from "next/link";
import { Clock, FileText, ArrowRight } from "lucide-react";
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
  return (
    <div className="space-y-6">
      {!isApproved && (
        <div className="p-4 bg-amber-50/90 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <div className="space-y-0.5">
              <p className="font-bold text-sm text-slate-900">
                Storefront Verification Pending
              </p>
              <p className="text-slate-600 text-xs leading-relaxed">
                Your seller storefront profile is currently under review by Santechs Admin. You can <strong className="text-slate-900">directly start adding your machinery & material listings now</strong>, and they will go live once verified!
              </p>
            </div>
          </div>
          {!hasCompany ? (
            <Link href="/seller/company" className="shrink-0 w-full sm:w-auto">
              <Button size="sm" className="w-full sm:w-auto h-8 text-xs font-bold bg-[#ff7759] hover:bg-[#ff7759]/90 text-white rounded-xl flex items-center gap-1">
                <span>Complete Storefront Info</span>
                <FileText className="w-3.5 h-3.5" />
              </Button>
            </Link>
          ) : (
            <Link href="/seller/company" className="shrink-0 w-full sm:w-auto">
              <Button size="sm" variant="outline" className="w-full sm:w-auto h-8 text-xs font-semibold bg-white border-amber-200 hover:bg-amber-100/50 text-slate-800 rounded-xl flex items-center gap-1">
                <span>Review Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
