"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { Factory, Loader2, ArrowRight, ShieldCheck, Package } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const json = await res.json();
        setError(json.message ?? "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">

      {/* ── LEFT: Dark Brand Panel ────────────────────────── */}
      <div className="hidden lg:flex flex-col bg-[#111111] text-white relative overflow-hidden min-h-screen">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=90&w=1400&auto=format&fit=crop"
            alt="Industrial Textile Machinery"
            fill
            className="object-cover opacity-30"
            priority
            sizes="50vw"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#111111]/80 via-[#111111]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
        </div>
        
        {/* Decorative circle rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full border border-white/[0.05] z-10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full border border-white/[0.03] z-10 pointer-events-none" />

        <div className="relative z-20 flex flex-col justify-between h-full p-12 xl:p-16">
          {/* Top tagline */}
          <p className="text-sm font-medium text-[#ff7759] tracking-wide">
            Global textile machinery sourcing — industrial B2B solutions for you.
          </p>

          {/* Center headline + trust badges */}
          <div className="space-y-8">
            <h2 className="text-[3.5rem] xl:text-[4.5rem] font-extrabold leading-[1.04] tracking-[-0.02em] text-white font-sans">
              Source Your<br />Equipment
            </h2>

            {/* Trust chips */}
            <div className="flex flex-col gap-3">
              {[
                { icon: ShieldCheck, text: "Verified Seller Listings" },
                { icon: Package, text: "10,000+ Listed Machinery Assets" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="inline-flex items-center gap-2.5 bg-white/[0.06] border border-white/[0.08] rounded-full px-4 py-2 w-fit backdrop-blur">
                  <Icon className="w-3.5 h-3.5 text-[#ff7759] flex-shrink-0" />
                  <span className="text-xs font-medium text-white/80">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Santechs branding */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
              <Factory className="w-4 h-4 text-white/70" />
            </div>
            <div>
              <p className="text-xs font-bold text-white/60 font-sans">Santechs</p>
              <p className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Managed B2B Platform</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Clean White Form Panel ────────────────── */}
      <div className="flex flex-col min-h-screen bg-white">

        {/* Top bar */}
        <div className="flex items-center justify-between px-8 pt-8 xl:px-16 xl:pt-12 shrink-0">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center">
              <Factory className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-black font-sans">
              Santechs
            </span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-black transition-colors font-semibold"
          >
            Back to Sign In
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-8 xl:px-16 overflow-y-auto">
          <div className="w-full max-w-sm space-y-6 py-8">
            <div className="space-y-1.5">
              <h1 className="text-3xl font-bold tracking-tight text-black font-sans">
                Reset Password
              </h1>
              <p className="text-xs text-slate-500">
                Enter your email address and we will send you a link to reset your password.
              </p>
            </div>

            {success ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl text-center leading-normal">
                If your email is registered in our system, we have sent a password reset link to your inbox.
              </div>
            ) : (
              <>
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl text-center leading-normal">
                    {error}
                  </div>
                )}

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <input
                              {...field}
                              id="forgot-password-email"
                              type="email"
                              placeholder="Your Account Email"
                              className="w-full h-12 px-5 rounded-full border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:bg-white focus:border-black focus:ring-2 focus:ring-black/5 transition-all font-sans"
                            />
                          </FormControl>
                          <FormMessage className="text-[11px] pl-4 text-red-500" />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      className="w-full h-12 rounded-full bg-black text-white hover:bg-neutral-800 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2 shadow-sm border-0"
                    >
                      {form.formState.isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Send Reset Link
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 pb-8 xl:px-16 xl:pb-10 text-xs text-slate-400 font-sans">
          <span>© 2026 Santechs Inc.</span>
          <div className="flex items-center gap-4">
            <Link href="/contact" className="hover:text-slate-800 transition-colors font-medium">Contact Us</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
