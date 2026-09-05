import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import Product from "@/lib/db/models/Product.model";
import { ProductStatus } from "@/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ success: false, error: "Slug required" }, { status: 400 });
    }

    await connectToDatabase();

    // Atomically increment views and return the updated count
    const product = await Product.findOneAndUpdate(
      { slug, status: ProductStatus.APPROVED },
      { $inc: { views: 1 } },
      { new: true }
    )
      .select("views")
      .lean();

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      views: product.views,
    });
  } catch (error: any) {
    console.error("View increment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record view" },
      { status: 500 }
    );
  }
}
