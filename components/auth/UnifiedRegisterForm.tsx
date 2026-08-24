"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Factory,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Package,
  Zap,
  CheckCircle2,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { registerSchema, type RegisterFormValues } from "@/lib/validations";
import { registerUser } from "@/lib/actions/auth.actions";
import { UserRole } from "@/types";

interface UnifiedRegisterFormProps {
  initialRole?: "BUYER" | "SELLER";
  portalTitle?: string;
}

export function UnifiedRegisterForm({
  initialRole = "BUYER",
  portalTitle,
}: UnifiedRegisterFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryRole = searchParams.get("role")?.toUpperCase();
  const effectiveRole = queryRole === "SELLER" || queryRole === "BUYER" ? queryRole : initialRole;
  const [selectedRole, setSelectedRole] = useState<"BUYER" | "SELLER">(effectiveRole);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: effectiveRole === "SELLER" ? UserRole.SELLER : UserRole.BUYER,
    },
  });

  const handleRoleChange = (role: "BUYER" | "SELLER") => {
    setSelectedRole(role);
    form.setValue("role", role === "SELLER" ? UserRole.SELLER : UserRole.BUYER);
    setError(null);
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    setSuccess(null);

    const payload = {
      ...data,
      role: selectedRole === "SELLER" ? UserRole.SELLER : UserRole.BUYER,
    };

    const result = await registerUser(payload);
    if (result.success) {
      setSuccess(result.message ?? "Account created successfully!");
      const targetLogin = selectedRole === "SELLER" ? "/login?role=seller" : "/login";
      setTimeout(() => router.push(targetLogin), 2200);
    } else {
      setError(result.error ?? "Registration failed. Please try again.");
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
              Join the Global<br />Textile Network.
            </h2>

            {/* Trust chips */}
            <div className="flex flex-col gap-3">
              {[
                { icon: ShieldCheck, text: "Verified Buyer & Seller Profiles" },
                { icon: Package, text: "Access Complete Plants, Lines & Spare Parts" },
                { icon: Zap, text: "Direct RFQs, Deals & In-Platform Negotiation" },
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
        <div className="flex items-center justify-between px-8 pt-8 xl:px-16 xl:pt-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl orange-gradient flex items-center justify-center shadow-sm group-hover:opacity-95 transition-opacity">
              <Factory className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-black font-sans">
              San<span className="text-[#ff7759]">techs</span>
            </span>
          </Link>
          <Link
            href={selectedRole === "SELLER" ? "/login?role=seller" : "/login"}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-black transition-colors font-semibold"
          >
            Sign In
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-8 xl:px-16 py-8 overflow-y-auto">
          <div className="w-full max-w-sm space-y-5">

            {/* Header & Role Switcher */}
            <div className="space-y-3">
              <div>
                <h1 className="text-3xl font-bold text-black tracking-tight font-sans">
                  Create Account
                </h1>
                <p className="text-xs text-slate-500 mt-1 font-sans">
                  {portalTitle || "Join verified machinery buyers and sellers worldwide"}
                </p>
              </div>

              {/* Account Type Toggle */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-full border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleRoleChange("BUYER")}
                  className={`py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                    selectedRole === "BUYER"
                      ? "bg-white text-black shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Buyer / Sourcing
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange("SELLER")}
                  className={`py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                    selectedRole === "SELLER"
                      ? "bg-[#ff7759] text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Seller / Machinery Lister
                </button>
              </div>
            </div>

            {/* Status Banners */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center"
                >
                  <CheckCircle2 className="inline w-4 h-4 mr-1.5 text-emerald-600" />
                  {success} Redirecting to login...
                </motion.div>
              )}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <input
                          {...field}
                          id="register-name"
                          type="text"
                          placeholder="Full Name / Representative"
                          className="w-full h-[46px] px-5 rounded-full border border-[#e5e7eb] bg-white text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all font-sans"
                        />
                      </FormControl>
                      <FormMessage className="text-[11px] pl-4 text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Work Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <input
                          {...field}
                          id="register-email"
                          type="email"
                          placeholder="Work Email Address"
                          className="w-full h-[46px] px-5 rounded-full border border-[#e5e7eb] bg-white text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all font-sans"
                        />
                      </FormControl>
                      <FormMessage className="text-[11px] pl-4 text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <input
                          {...field}
                          id="register-phone"
                          type="tel"
                          placeholder="Mobile / WhatsApp Number"
                          className="w-full h-[46px] px-5 rounded-full border border-[#e5e7eb] bg-white text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all font-sans"
                        />
                      </FormControl>
                      <FormMessage className="text-[11px] pl-4 text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <input
                            {...field}
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create Password (min 8 chars, 1 uppercase, 1 num)"
                            className="w-full h-[46px] px-5 pr-11 rounded-full border border-[#e5e7eb] bg-white text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all font-sans"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-[11px] pl-4 text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Confirm Password */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <input
                            {...field}
                            id="register-confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            className="w-full h-[46px] px-5 pr-11 rounded-full border border-[#e5e7eb] bg-white text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all font-sans"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                          >
                            {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-[11px] pl-4 text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <button
                  type="submit"
                  id="register-submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full h-[48px] rounded-full bg-black text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-xs mt-3 cursor-pointer"
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Create {selectedRole === "SELLER" ? "Seller" : "Buyer"} Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </Form>

            {/* Bottom Login Switcher */}
            <div className="pt-1 text-center text-xs text-slate-500">
              Already have an account?{" "}
              <Link
                href={selectedRole === "SELLER" ? "/login?role=seller" : "/login"}
                className="font-bold text-[#ff7759] hover:underline"
              >
                Sign In as {selectedRole === "SELLER" ? "Seller" : "Buyer"}
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 pb-6 xl:px-16 xl:pb-8 text-xs text-slate-400 font-sans">
          <span>&copy; {new Date().getFullYear()} Santechs Inc.</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-slate-800 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-800 transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
