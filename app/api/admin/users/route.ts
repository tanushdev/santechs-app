import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import User from "@/lib/db/models/User.model";
import { auth } from "@/lib/auth/config";
import { UserRole } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (
      !session ||
      ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(session.user.role)
    ) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    const query: Record<string, unknown> = {
      role: { $ne: UserRole.SUPER_ADMIN },
    };
    if (role && Object.values(UserRole).includes(role as UserRole) && role !== UserRole.SUPER_ADMIN) {
      query.role = role;
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("GET admin users error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Only Super Administrators can delete user accounts." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "User ID is required." },
        { status: 400 }
      );
    }

    if (id === session.user.id) {
      return NextResponse.json(
        { success: false, error: "You cannot delete your own account." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Cascading deletion
    const Company = (await import("@/lib/db/models/Company.model")).default;
    const Product = (await import("@/lib/db/models/Product.model")).default;

    await Company.findOneAndDelete({ owner: id });
    await Product.deleteMany({ seller: id });
    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "User account and all related storefront profiles/listings have been deleted.",
    });
  } catch (error: any) {
    console.error("DELETE admin user error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete user account." },
      { status: 500 }
    );
  }
}
