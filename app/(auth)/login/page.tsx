import { Suspense } from "react";
import { UnifiedLoginForm } from "@/components/auth/UnifiedLoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Santechs Marketplace",
  description: "Sign in to your Santechs account to browse machinery or manage your storefront.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; callbackUrl?: string }>;
}) {
  const resolvedParams = await searchParams;
  const initialRole = resolvedParams?.role?.toUpperCase() === "SELLER" ? "SELLER" : "BUYER";

  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <UnifiedLoginForm initialRole={initialRole} />
    </Suspense>
  );
}
