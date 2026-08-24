import { Suspense } from "react";
import { UnifiedRegisterForm } from "@/components/auth/UnifiedRegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account — Santechs Marketplace",
  description: "Join Santechs to source or list industrial textile machinery globally.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const resolvedParams = await searchParams;
  const initialRole = resolvedParams?.role?.toUpperCase() === "SELLER" ? "SELLER" : "BUYER";

  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <UnifiedRegisterForm initialRole={initialRole} />
    </Suspense>
  );
}
