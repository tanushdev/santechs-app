import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import Product from "@/lib/db/models/Product.model";
import { auth } from "@/lib/auth/config";
import { UserRole } from "@/types";

export async function PATCH(
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
    const { isFeatured } = await req.json();

    if (typeof isFeatured !== "boolean") {
      return NextResponse.json({ success: false, error: "isFeatured must be a boolean" }, { status: 400 });
    }

    await connectToDatabase();

    const product = await Product.findByIdAndUpdate(
      id,
      { isFeatured },
      { new: true }
    );

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Product featured state updated successfully`,
      data: { isFeatured: product.isFeatured },
    });
  } catch (error) {
    console.error("Toggle featured error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update featured state" },
      { status: 500 }
    );
  }
}
