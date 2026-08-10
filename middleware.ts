import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@/types";

const PUBLIC_PATTERNS = [
  /^\/$/, 
  /^\/products/, 
  /^\/sell/,
  /^\/about/, 
  /^\/contact/,
  /^\/how-it-works/,
  /^\/pricing/,
  /^\/guidelines/,
  /^\/terms/,
  /^\/privacy/,
  /^\/unauthorized/,
  /^\/api\/products/,
  /^\/api\/categories/,
  /^\/api\/brands/,
];

const AUTH_PATTERNS = [
  /^\/login/,
  /^\/register/,
  /^\/forgot-password/,
  /^\/reset-password/,
  /^\/verify-email/,
  /^\/super_admin/,
  /^\/seller\/login/,
  /^\/seller\/register/,
];

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Skip Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // Allow all public routes
  if (PUBLIC_PATTERNS.some((p) => p.test(pathname))) {
    return NextResponse.next();
  }

  // NextAuth v5 uses "authjs.session-token" in dev and "__Secure-authjs.session-token" on HTTPS
  const isSecure = req.url.startsWith("https");
  const cookieName = isSecure ? "__Secure-authjs.session-token" : "authjs.session-token";
  const token = await getToken({ req, secret: process.env.AUTH_SECRET, cookieName });
  const isLoggedIn = !!token;
  const userRole = token?.role as UserRole | undefined;

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && AUTH_PATTERNS.some((p) => p.test(pathname))) {
    const dashboardUrl = getDashboardUrl(userRole!);
    return NextResponse.redirect(new URL(dashboardUrl, req.url));
  }

  // Redirect unauthenticated users to login/super_admin
  if (!isLoggedIn && !AUTH_PATTERNS.some((p) => p.test(pathname))) {
    const loginPath = pathname.startsWith("/admin") ? "/super_admin" : (pathname.startsWith("/seller") ? "/seller/login" : "/login");
    const loginUrl = new URL(loginPath, req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based protection
  if (pathname.startsWith("/admin")) {
    if (
      userRole !== UserRole.SUPER_ADMIN &&
      userRole !== UserRole.ADMIN
    ) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  if (pathname.startsWith("/seller") && !pathname.startsWith("/seller/login") && !pathname.startsWith("/seller/register")) {
    if (userRole !== UserRole.SELLER) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  if (pathname.startsWith("/buyer")) {
    if (userRole !== UserRole.BUYER) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

function getDashboardUrl(role: UserRole): string {
  switch (role) {
    case UserRole.SUPER_ADMIN:
    case UserRole.ADMIN:
      return "/admin/dashboard";
    case UserRole.SELLER:
      return "/seller/dashboard";
    case UserRole.BUYER:
      return "/";
    default:
      return "/";
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
