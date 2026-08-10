"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, signOut, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Factory, Loader2, Eye, EyeOff, ArrowRight, ShieldCheck, Package } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { loginSchema, type LoginFormValues } from "@/lib/validations";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      role: "BUYER",
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

      if (role === "SELLER") {
        setError("Sellers must log in via the dedicated Seller Portal.");
        await signOut({ redirect: false });
        return;
      }

      if (callbackUrl === "/" || callbackUrl === "") {
        if (role === "SUPER_ADMIN" || role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
      } else {
        router.push(callbackUrl);
      }
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">

      {/* ── LEFT: Dark Brand Panel ────────────────────────── */}
      <div className="hidden lg:flex flex-col bg-[#111111] text-white relative overflow-hidden min-h-screen">

        {/* Full bleed machinery image */}
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

        {/* Content */}
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
            href="/register"
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-black transition-colors font-semibold"
          >
            Sign Up
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Form body */}
        <div className="flex-1 flex items-center justify-center px-8 xl:px-16 py-12">
          <div className="w-full max-w-sm space-y-8">

            <div>
              <h1 className="text-4xl font-bold text-black tracking-tight font-sans">
                Sign In
              </h1>
              <p className="text-sm text-slate-500 mt-2 font-sans">
                Access your Santechs B2B account
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                {error}
              </div>
            )}

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
                          placeholder="Email or Username"
                          className="w-full h-[52px] px-5 rounded-full border border-[#e5e7eb] bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all font-sans"
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
                            className="w-full h-[52px] px-5 pr-12 rounded-full border border-[#e5e7eb] bg-white text-slate-900 text-sm placeholder:text-slate-400 outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all font-sans"
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

                <div className="pl-1">
                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-[#ff7759] hover:text-black transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  id="login-submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full h-[52px] rounded-full bg-black text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm mt-2"
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginForm />
    </Suspense>
  );
}
