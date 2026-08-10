"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Factory, User, Mail, Lock, Phone, Loader2, Eye, EyeOff,
  CheckCircle2, Building2, ShoppingCart, ArrowRight, ShieldCheck, Package,
} from "lucide-react";
import {
  Form, FormControl, FormField, FormItem, FormMessage,
} from "@/components/ui/form";
import { registerSchema, type RegisterFormValues } from "@/lib/validations";
import { registerUser } from "@/lib/actions/auth.actions";
import { UserRole } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "", role: UserRole.BUYER },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null); setSuccess(null);
    const result = await registerUser(data);
    if (result.success) {
      setSuccess(result.message ?? "Account created!");
      setTimeout(() => router.push("/login"), 2500);
    } else {
      setError(result.error ?? "Registration failed");
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
        
        {/* Decorative circle rings — like Payoneer */}
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
        <div className="flex items-center justify-between px-8 pt-8 xl:px-16 xl:pt-12">
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
            Sign In
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-8 xl:px-16 overflow-y-auto">
          <div className="w-full max-w-sm space-y-6 py-8">

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-black font-sans">Create Account</h1>
              <p className="text-xs text-slate-500 mt-1 font-sans">Join thousands of textile industry professionals</p>
            </div>

            {/* Status Banners */}
            <AnimatePresence>
              {success && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center">
                  <CheckCircle2 className="inline w-3.5 h-3.5 mr-1.5 text-emerald-600" />{success} Redirecting...
                </motion.div>
              )}
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center">
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5">

                {/* Name + Email row */}
                <div className="grid grid-cols-2 gap-2.5">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input {...field} id="register-name" placeholder="Full Name"
                            className="w-full h-11 pl-10 pr-4 rounded-full border border-[#e5e7eb] bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all font-sans" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] pl-4 text-red-500" />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input {...field} id="register-phone" placeholder="Phone Number"
                            className="w-full h-11 pl-10 pr-4 rounded-full border border-[#e5e7eb] bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all font-sans" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] pl-4 text-red-500" />
                    </FormItem>
                  )} />
                </div>

                {/* Email full width */}
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input {...field} id="register-email" type="email" placeholder="Work Email"
                          className="w-full h-11 pl-10 pr-4 rounded-full border border-[#e5e7eb] bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all font-sans" />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] pl-4 text-red-500" />
                  </FormItem>
                )} />

                {/* Password row */}
                <div className="grid grid-cols-2 gap-2.5">
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input {...field} id="register-password" type={showPassword ? "text" : "password"} placeholder="Password"
                            className="w-full h-11 pl-10 pr-9 rounded-full border border-[#e5e7eb] bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all font-sans" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] pl-4 text-red-500" />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input {...field} id="register-confirm-password" type="password" placeholder="Confirm"
                            className="w-full h-11 pl-10 pr-4 rounded-full border border-[#e5e7eb] bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all font-sans" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] pl-4 text-red-500" />
                    </FormItem>
                  )} />
                </div>

                {/* Submit */}
                <button type="submit" id="register-submit" disabled={form.formState.isSubmitting || !!success}
                  className="w-full h-11 rounded-full bg-black text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm">
                  {form.formState.isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>Create Account <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>

                <p className="text-center text-[10px] text-slate-400 font-sans">
                  By registering you agree to{" "}
                  <Link href="/terms" className="text-slate-600 font-semibold hover:underline">Terms</Link>
                  {" & "}
                  <Link href="/privacy" className="text-slate-600 font-semibold hover:underline">Privacy Policy</Link>
                </p>
              </form>
            </Form>

          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 pb-8 xl:px-16 xl:pb-10 text-xs text-slate-400 font-sans">
          <span>© {new Date().getFullYear()} Santechs Inc.</span>
          <div className="flex items-center gap-4">
            <Link href="/contact" className="hover:text-slate-800 transition-colors font-medium">Contact Us</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
