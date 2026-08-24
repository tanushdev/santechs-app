import { Suspense } from "react";
import { UnifiedLoginForm } from "@/components/auth/UnifiedLoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Santechs Marketplace",
  description: "Sign in to your Santechs account to browse machinery or manage your storefront.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <UnifiedLoginForm initialRole="BUYER" />
    </Suspense>
  );
}
