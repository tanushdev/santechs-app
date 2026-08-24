"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, getSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Factory, Loader2, Eye, EyeOff, ArrowRight, ShieldCheck, Package, Zap } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { loginSchema, type LoginFormValues } from "@/lib/validations";

interface UnifiedLoginFormProps {
  initialRole?: "BUYER" | "SELLER";
  portalTitle?: string;
}

export function UnifiedLoginForm({
  initialRole = "BUYER",
  portalTitle,
}: UnifiedLoginFormProps) {
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get("callbackUrl");
  const [selectedRole, setSelectedRole] = useState<"BUYER" | "SELLER">(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
    }
  }, [initialRole]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);

    if (data.email.toLowerCase() === "admin@santechs.com") {
      setError("Super Admin accounts must log in via the dedicated administrator portal.");
      return;
    }

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      role: selectedRole,
      redirect: false,
    });

    if (result?.error) {
      if (result.error === "Configuration" || result.error.includes("CredentialsSignin")) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(result.error);
      }
    } else {
      const session = await getSession();
      const role = session?.user?.role;

      await fetch("/api/auth/role-session", { method: "POST" });

      if (rawCallbackUrl && rawCallbackUrl !== "/" && rawCallbackUrl !== "") {
        window.location.href = rawCallbackUrl;
      } else if (role === "SELLER") {
        window.location.href = "/seller/dashboard";
      } else if (role === "SUPER_ADMIN" || role === "ADMIN") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/";
      }
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white">

      {/* ── LEFT: Premium Dark Brand Panel ────────────────────────── */}
      <div className="hidden lg:flex flex-col bg-[#111111] text-white relative overflow-hidden min-h-screen">
        {/* Machinery background overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=90&w=1400&auto=format&fit=crop"
            alt="Industrial Textile Machinery"
            fill
            className="object-cover opacity-25"
            priority
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#111111]/90 via-[#111111]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
        </div>

        {/* Decorative circle rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full border border-white/[0.05] z-10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full border border-white/[0.03] z-10 pointer-events-none" />

        {/* Content */}
        <div className="relative z-20 flex flex-col justify-between h-full p-12 xl:p-16">
          {/* Top tagline */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#ff7759] font-bold bg-[#ff7759]/10 px-3 py-1 rounded-full border border-[#ff7759]/20">
              Global B2B Industrial Infrastructure
            </span>
          </div>

          {/* Center headline + trust badges */}
          <div className="space-y-8">
            <h2 className="text-[3.2rem] xl:text-[4.2rem] font-bold leading-[1.05] tracking-[-0.03em] text-white font-sans">
              Find, Trade &amp;<br />Source Machinery.
            </h2>

            {/* Trust chips */}
            <div className="flex flex-col gap-3">
              {[
                { icon: ShieldCheck, text: "Verified Sellers & Audited Listings" },
                { icon: Package, text: "Complete Plants, Extruders & Spare Parts" },
                { icon: Zap, text: "Direct Digital Quotes & Protected Deal Room" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="inline-flex items-center gap-2.5 bg-white/[0.06] border border-white/[0.08] rounded-full px-4 py-2 w-fit backdrop-blur"
                >
                  <Icon className="w-3.5 h-3.5 text-[#ff7759] flex-shrink-0" />
                  <span className="text-xs font-medium text-white/80">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Santechs branding */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
              <Factory className="w-4 h-4 text-white/80" />
            </div>
            <div>
              <p className="text-xs font-bold text-white/70 font-sans">Santechs Marketplace</p>
              <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">
                Industrial Sourcing &amp; Trading Desk
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Form Panel ────────────────────────── */}
      <div className="flex flex-col min-h-screen bg-white">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between px-8 pt-8 xl:px-16 xl:pt-12">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl orange-gradient flex items-center justify-center shadow-sm group-hover:opacity-95 transition-opacity">
              <Factory className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-black font-sans">
              San<span className="text-[#ff7759]">techs</span>
            </span>
          </Link>
          <Link
            href={selectedRole === "SELLER" ? "/register?role=seller" : "/register"}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-black transition-colors font-semibold"
          >
            Create Account
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-8 xl:px-16 py-10">
          <div className="w-full max-w-sm space-y-6">

            {/* Header & Role Switcher */}
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-black tracking-tight font-sans">
                  Sign In
                </h1>
                <p className="text-sm text-slate-500 mt-1 font-sans">
                  {portalTitle || "Access your Santechs B2B account"}
                </p>
              </div>

              {/* Account Type Toggle */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-full border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole("BUYER");
                    setError(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-full transition-all ${
                    selectedRole === "BUYER"
                      ? "bg-white text-black shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Buyer Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole("SELLER");
                    setError(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-full transition-all ${
                    selectedRole === "SELLER"
                      ? "bg-[#ff7759] text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Seller Account
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Login Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <input
                          {...field}
                          id="login-email"
                          type="email"
                          placeholder="Work Email address"
                          className="w-full h-[50px] px-5 rounded-full border border-[#e5e7eb] bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all font-sans"
                        />
                      </FormControl>
                      <FormMessage className="text-xs pl-5 text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <input
                            {...field}
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="w-full h-[50px] px-5 pr-12 rounded-full border border-[#e5e7eb] bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all font-sans"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs pl-5 text-red-500" />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between pl-1 pt-1 text-xs">
                  <span className="text-slate-400">
                    Signing in as <strong className="text-slate-700 font-semibold">{selectedRole}</strong>
                  </span>
                  <Link
                    href="/forgot-password"
                    className="font-semibold text-[#ff7759] hover:text-black transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  id="login-submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full h-[50px] rounded-full bg-black text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-xs mt-2 cursor-pointer"
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Sign In as {selectedRole === "SELLER" ? "Seller" : "Buyer"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </Form>

            {/* Bottom Register Switcher */}
            <div className="pt-2 text-center text-xs text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                href={selectedRole === "SELLER" ? "/register?role=seller" : "/register"}
                className="font-bold text-[#ff7759] hover:underline"
              >
                Register as {selectedRole === "SELLER" ? "Seller" : "Buyer"}
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 pb-8 xl:px-16 xl:pb-10 text-xs text-slate-400 font-sans">
          <span>&copy; {new Date().getFullYear()} Santechs Inc.</span>
          <div className="flex items-center gap-4">
            <Link href="/contact" className="hover:text-slate-800 transition-colors font-medium">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
