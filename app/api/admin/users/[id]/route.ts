import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import User from "@/lib/db/models/User.model";
import Company from "@/lib/db/models/Company.model";
import Product from "@/lib/db/models/Product.model";
import Enquiry from "@/lib/db/models/Enquiry.model";
import Wishlist from "@/lib/db/models/Wishlist.model";
import { auth } from "@/lib/auth/config";
import { UserRole } from "@/types";

export async function GET(
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
    await connectToDatabase();

    const user = await User.findById(id).select("-password").lean();
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Fetch related company details if seller or if exists
    const company = await Company.findOne({ owner: id }).lean();

    // Fetch products created by this user
    const products = await Product.find({ seller: id })
      .select("name price currency status views category brand images createdAt referenceNumber slug")
      .populate("category", "name")
      .populate("brand", "name")
      .sort({ createdAt: -1 })
      .lean();

    // Fetch enquiries submitted by buyer
    const buyerEnquiries = await Enquiry.find({ buyer: id })
      .populate("product", "name slug referenceNumber images price currency")
      .sort({ createdAt: -1 })
      .lean();

    // Fetch enquiries assigned/received by seller
    const sellerEnquiries = await Enquiry.find({ seller: id })
      .populate("product", "name slug referenceNumber images price currency")
      .sort({ createdAt: -1 })
      .lean();

    // Fetch wishlist items
    const wishlist = await Wishlist.find({ user: id })
      .populate("product", "name price currency images slug referenceNumber")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        user,
        company,
        products,
        buyerEnquiries,
        sellerEnquiries,
        wishlist,
      },
    });
  } catch (error: any) {
    console.error("GET user full detail error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch user details" },
      { status: 500 }
    );
  }
}
