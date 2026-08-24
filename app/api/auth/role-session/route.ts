import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { encode } from "next-auth/jwt";
import { cookies } from "next/headers";
import { COOKIE_ADMIN, COOKIE_SELLER, COOKIE_BUYER, getRoleSession } from "@/lib/auth/roleAuth";
import { UserRole } from "@/types";

const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "santechs-secret-key-2026-secure-jwt";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const portal = searchParams.get("portal") || "buyer";

    let allowedRoles: UserRole[] = [UserRole.BUYER];
    if (portal === "admin") {
      allowedRoles = [UserRole.ADMIN, UserRole.SUPER_ADMIN];
    } else if (portal === "seller") {
      allowedRoles = [UserRole.SELLER];
    }

    const session = await getRoleSession(allowedRoles);
    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    return NextResponse.json({ success: false, session: null }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "No active session" }, { status: 401 });
    }

    const role = session.user.role;
    let cookieName = COOKIE_BUYER;

    if (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
      cookieName = COOKIE_ADMIN;
    } else if (role === UserRole.SELLER) {
      cookieName = COOKIE_SELLER;
    }

    // Encode JWT for role-scoped cookie
    const tokenPayload = {
      id: session.user.id,
      sub: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      status: session.user.status,
      company: session.user.company,
      picture: session.user.image,
    };

    const encodedToken = await encode({
      token: tokenPayload,
      secret: AUTH_SECRET,
      salt: cookieName,
    });

    const isSecure = process.env.NODE_ENV === "production";
    const cookieStore = await cookies();

    // Ensure Single Active Role Session (clear other role cookies on login)
    if (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
      try { cookieStore.delete(COOKIE_SELLER); } catch {}
      try { cookieStore.delete(COOKIE_BUYER); } catch {}
    } else if (role === UserRole.SELLER) {
      try { cookieStore.delete(COOKIE_ADMIN); } catch {}
      try { cookieStore.delete(COOKIE_BUYER); } catch {}
    } else if (role === UserRole.BUYER) {
      try { cookieStore.delete(COOKIE_ADMIN); } catch {}
      try { cookieStore.delete(COOKIE_SELLER); } catch {}
    }

    // Set active role-scoped HTTP-only cookie
    cookieStore.set(cookieName, encodedToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      secure: isSecure,
    });

    return NextResponse.json({ success: true, role, cookieName });
  } catch (error: any) {
    console.error("Set role session error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const portal = searchParams.get("portal") || "buyer";

    const cookieStore = await cookies();

    if (portal === "buyer") {
      try { cookieStore.delete(COOKIE_BUYER); } catch {}
    } else if (portal === "seller") {
      try { cookieStore.delete(COOKIE_SELLER); } catch {}
    } else if (portal === "admin") {
      try { cookieStore.delete(COOKIE_ADMIN); } catch {}
    } else if (portal === "all") {
      try { cookieStore.delete(COOKIE_BUYER); } catch {}
      try { cookieStore.delete(COOKIE_SELLER); } catch {}
      try { cookieStore.delete(COOKIE_ADMIN); } catch {}
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete role session error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
