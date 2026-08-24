import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@/types";

const PUBLIC_PATTERNS = [
  /^\/$/, 
  /^\/products/, 
  /^\/sell$/,
  /^\/about/, 
  /^\/contact/,
  /^\/how-it-works/,
  /^\/pricing/,
  /^\/guidelines/,
  /^\/seller-guidelines/,
  /^\/terms/,
  /^\/privacy/,
  /^\/unauthorized/,
  /^\/api\/products/,
  /^\/api\/categories/,
  /^\/api\/brands/,
  /^\/super_admin/,
  /^\/seller\/login/,
  /^\/seller\/register/,
  /^\/login/,
  /^\/register/,
  /^\/forgot-password/,
  /^\/reset-password/,
  /^\/verify-email/,
];

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Skip Next.js internals & Auth endpoints
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // Always allow public routes and login portals
  if (PUBLIC_PATTERNS.some((p) => p.test(pathname))) {
    return NextResponse.next();
  }

  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "santechs-secret-key-2026-secure-jwt";
  const isSecure = req.url.startsWith("https");

  // Read standard session token
  const defaultCookieName = isSecure ? "__Secure-authjs.session-token" : "authjs.session-token";
  const nextAuthToken = await getToken({ req, secret, cookieName: defaultCookieName }).catch(() => null);

  // Read role-scoped session tokens
  const adminToken = await getToken({ req, secret, cookieName: "santechs_admin_session", salt: "santechs_admin_session" }).catch(() => null);
  const sellerToken = await getToken({ req, secret, cookieName: "santechs_seller_session", salt: "santechs_seller_session" }).catch(() => null);
  const buyerToken = await getToken({ req, secret, cookieName: "santechs_buyer_session", salt: "santechs_buyer_session" }).catch(() => null);

  const mainRole = nextAuthToken?.role as UserRole | undefined;

  // 1. Strict Admin Protection (/admin/*) -> SUPER_ADMIN or ADMIN ONLY
  if (pathname.startsWith("/admin")) {
    const isAdmin =
      [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(mainRole as UserRole) ||
      [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(adminToken?.role as UserRole);

    if (!isAdmin) {
      const loginUrl = new URL("/super_admin", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. Strict Seller Protection (/seller/*) -> SELLER ONLY
  if (pathname.startsWith("/seller")) {
    const isSeller =
      mainRole === UserRole.SELLER ||
      sellerToken?.role === UserRole.SELLER;

    if (!isSeller) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("role", "seller");
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 3. Strict Buyer Protection (/buyer/*) -> BUYER ONLY
  if (pathname.startsWith("/buyer")) {
    const isBuyer =
      mainRole === UserRole.BUYER ||
      buyerToken?.role === UserRole.BUYER;

    if (!isBuyer) {
      // If user is a Seller, prevent access to buyer area and redirect to seller dashboard
      if (mainRole === UserRole.SELLER || sellerToken?.role === UserRole.SELLER) {
        return NextResponse.redirect(new URL("/seller/dashboard", req.url));
      }
      // If user is an Admin, redirect to admin portal
      if (
        mainRole === UserRole.ADMIN ||
        mainRole === UserRole.SUPER_ADMIN ||
        adminToken?.role === UserRole.ADMIN ||
        adminToken?.role === UserRole.SUPER_ADMIN
      ) {
        return NextResponse.redirect(new URL("/admin/sellers", req.url));
      }

      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
