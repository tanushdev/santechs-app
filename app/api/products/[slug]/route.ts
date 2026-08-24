import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import Product from "@/lib/db/models/Product.model";
import Category from "@/lib/db/models/Category.model";
import Brand from "@/lib/db/models/Brand.model";
import User from "@/lib/db/models/User.model";
import Company from "@/lib/db/models/Company.model";
import { ProductStatus } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();
    const { slug } = await params;

    const product = await Product.findOne({
      slug,
      status: ProductStatus.APPROVED,
    })
      .populate("category", "name slug type")
      .populate("brand", "name logo country")
      .populate("seller", "name avatar")
      .populate({
        path: "company",
        select: "name slug logo phone email address isVerified isApproved establishedYear",
      })
      .lean();

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Increment view counter (fire and forget)
    Product.findByIdAndUpdate(product._id, { $inc: { views: 1 } }).exec();

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Product detail error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
