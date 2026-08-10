import Link from "next/link";
import { ShieldX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Unauthorized" };

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold font-heading text-white mb-3">
          Access Denied
        </h1>
        <p className="text-white/50 max-w-sm mx-auto mb-8">
          You don&apos;t have permission to access this page. Please sign in
          with the appropriate account.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Go Home
            </Button>
          </Link>
          <Link href="/login">
            <Button className="orange-gradient text-white border-0">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
