import { NextRequest, NextResponse } from "next/server";
import { rejectProduct } from "@/lib/actions/product.actions";
import { auth } from "@/lib/auth/config";
import { UserRole } from "@/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (
      !session ||
      ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(session.user.role)
    ) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const { rejectionReason } = await req.json();

    if (!rejectionReason) {
      return NextResponse.json({ success: false, error: "Rejection reason is required" }, { status: 400 });
    }

    const result = await rejectProduct(id, rejectionReason);

    if (result.success) {
      return NextResponse.json({ success: true, message: result.message });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error("API reject product error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reject product" },
      { status: 500 }
    );
  }
}
