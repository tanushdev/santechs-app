import { auth } from "@/lib/auth/config";
import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";
import { UserRole } from "@/types";

const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "santechs-secret-key-2026-secure-jwt";

export const COOKIE_ADMIN = "santechs_admin_session";
export const COOKIE_SELLER = "santechs_seller_session";
export const COOKIE_BUYER = "santechs_buyer_session";

export interface CustomSessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: string;
  company?: string;
  image?: string;
}

export interface CustomSession {
  user: CustomSessionUser;
  expires?: string;
}

/**
 * Get role-scoped session for layouts.
 * Checks main NextAuth auth() first.
 * If main session does not match required roles, checks role-specific cookie.
 */
export async function getRoleSession(
  allowedRoles: UserRole[]
): Promise<CustomSession | null> {
  // 1. Check primary NextAuth session
  const primarySession = await auth();
  if (primarySession?.user?.role && allowedRoles.includes(primarySession.user.role as UserRole)) {
    return primarySession as unknown as CustomSession;
  }

  // 2. Determine target cookie based on allowed roles
  const cookieStore = await cookies();
  let targetCookieName = COOKIE_BUYER;

  if (allowedRoles.includes(UserRole.ADMIN) || allowedRoles.includes(UserRole.SUPER_ADMIN)) {
    targetCookieName = COOKIE_ADMIN;
  } else if (allowedRoles.includes(UserRole.SELLER)) {
    targetCookieName = COOKIE_SELLER;
  }

  const roleCookie = cookieStore.get(targetCookieName);
  if (!roleCookie?.value) {
    return null;
  }

  try {
    const isSecure = process.env.NODE_ENV === "production";
    const salt = isSecure
      ? `__Secure-${targetCookieName}`
      : targetCookieName;

    const token = await decode({
      token: roleCookie.value,
      secret: AUTH_SECRET,
      salt: targetCookieName,
    });

    if (!token || !token.role || !allowedRoles.includes(token.role as UserRole)) {
      return null;
    }

    return {
      user: {
        id: (token.id as string) || (token.sub as string),
        email: token.email as string,
        name: token.name as string,
        role: token.role as UserRole,
        status: (token.status as string) || "ACTIVE",
        company: token.company as string | undefined,
        image: token.picture as string | undefined,
      },
    };
  } catch (err) {
    console.error(`Failed to decode ${targetCookieName}:`, err);
    return null;
  }
}
