"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, signOut, getSession, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Factory, Loader2, Eye, EyeOff, LogIn, Mail, Lock, UserCheck, RefreshCw } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { loginSchema, type LoginFormValues } from "@/lib/validations";

function SuperAdminLoginForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleSignOutCurrent = async () => {
    await signOut({ redirect: false });
    window.location.reload();
  };

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    if (data.email.toLowerCase() !== "admin@santechs.com") {
      setError("This login portal is reserved for administrators only.");
      return;
    }

    // Purge active non-admin session cookie before logging in as Super Admin
    if (session && session.user?.role !== "SUPER_ADMIN" && session.user?.role !== "ADMIN") {
      await signOut({ redirect: false });
    }

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      role: "SUPER_ADMIN",
      redirect: false,
    });

    if (result?.error) {
      if (result.error === "Configuration" || result.error.includes("CredentialsSignin")) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(result.error);
      }
    } else {
      const newSession = await getSession();
      const role = newSession?.user?.role;

      if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
        setError("This login portal is reserved for administrators only.");
        return;
      }

      await fetch("/api/auth/role-session", { method: "POST" });
      window.location.href = "/admin/sellers";
    }
  };

  return (
    <div suppressHydrationWarning className="min-h-screen w-full flex flex-col justify-between items-center relative overflow-hidden bg-sky-100 py-10 px-4">
      
      {/* ── BACKGROUND IMAGE & LAYERS ───────────────────────── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1509803874385-db7c23652552?q=80&w=1600&auto=format&fit=crop"
          alt="Sky Background"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Soft white lighting overlay */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />
      </div>

      {/* Glowing Concentric Rings Behind Card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full border border-white/40 pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full border border-white/20 pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[950px] rounded-full border border-white/10 pointer-events-none z-0" />

      {/* ── TOP BAR BRANDING ────────────────────────────────── */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between relative z-10 px-4 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shadow-md">
            <Factory className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-extrabold text-slate-900 tracking-tight font-sans">
            Santechs
          </span>
        </Link>
        <span className="text-[10px] font-mono text-slate-500 font-bold tracking-widest uppercase bg-white/40 backdrop-blur-xs px-3 py-1 rounded-full border border-white/30">
          Admin Portal
        </span>
      </div>

      {/* ── CENTRAL GLASSMORPHIC LOGIN CARD ──────────────────── */}
      <div suppressHydrationWarning className="w-full max-w-[420px] bg-white/60 border border-white/40 backdrop-blur-md rounded-[32px] p-8 sm:p-10 shadow-[0_16px_50px_rgba(0,0,0,0.06)] relative z-10 space-y-6">
        
        {/* Floating icon box */}
        <div className="w-12 h-12 rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex items-center justify-center text-slate-800 mx-auto">
          <LogIn className="w-5 h-5 stroke-[2]" />
        </div>

        {/* Title Block */}
        <div className="text-center space-y-1.5">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
            Sign in with email
          </h1>
          <p className="text-xs text-slate-500 font-sans max-w-[280px] mx-auto leading-relaxed">
            Enter your secure administrator credentials to access the platform console.
          </p>
        </div>

        {/* Active Non-Admin Session Notice */}
        {mounted && session?.user && session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN" && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-amber-600" /> Currently Logged In:
              </span>
              <span className="text-[10px] font-bold uppercase bg-amber-200/60 px-2 py-0.5 rounded text-amber-900 font-mono">
                {session.user.role}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-normal">
              Account: <strong>{session.user.email}</strong>. Logging in below will switch your session to Super Admin.
            </p>
            <button
              type="button"
              onClick={handleSignOutCurrent}
              className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline flex items-center gap-1 cursor-pointer pt-0.5"
            >
              <RefreshCw className="w-3 h-3" /> Log Out Current Account First
            </button>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs font-semibold text-center leading-normal">
            {error}
          </div>
        )}

        {/* Input Fields */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem id="super-admin-email-field">
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        {...field}
                        id="super-admin-email"
                        type="email"
                        placeholder="Email"
                        className="w-full h-11 pl-11 pr-4 rounded-xl border-0 bg-slate-100/70 text-slate-800 text-sm placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all font-sans"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px] pl-3 text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem id="super-admin-password-field">
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        {...field}
                        id="super-admin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="w-full h-11 pl-11 pr-10 rounded-xl border-0 bg-slate-100/70 text-slate-800 text-sm placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px] pl-3 text-red-500" />
                </FormItem>
              )}
            />

            {/* Forgot password */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="super-admin-submit"
              disabled={form.formState.isSubmitting}
              className="w-full h-11 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer mt-5"
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Login"
              )}
            </button>

          </form>
        </Form>



      </div>

      {/* ── FOOTER COPYRIGHT ────────────────────────────────── */}
      <div className="w-full text-center text-[10px] text-slate-400 font-sans relative z-10 pt-6">
        © {new Date().getFullYear()} Santechs Inc. All rights reserved.
      </div>

    </div>
  );
}

export default function SuperAdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-sky-100">
        <Loader2 className="w-8 h-8 animate-spin text-slate-800" />
      </div>
    }>
      <SuperAdminLoginForm />
    </Suspense>
  );
}
