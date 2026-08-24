import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import Enquiry from "@/lib/db/models/Enquiry.model";
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
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (status && status !== "ALL") {
      query.status = status;
    }

    const [enquiries, total] = await Promise.all([
      Enquiry.find(query)
        .populate({
          path: "product",
          select: "name referenceNumber slug category subCategory images",
          strictPopulate: false,
          populate: [
            { path: "category", select: "name slug type", strictPopulate: false },
            { path: "subCategory", select: "name slug", strictPopulate: false },
          ],
        })
        .populate({ path: "buyer", select: "name email phone company country", strictPopulate: false })
        .populate({
          path: "seller",
          select: "name email phone company",
          strictPopulate: false,
          populate: {
            path: "company",
            select: "name phone businessType isVerified",
            strictPopulate: false,
          }
        })
        .populate({
          path: "originalSeller",
          select: "name email phone company",
          strictPopulate: false,
          populate: {
            path: "company",
            select: "name phone businessType isVerified",
            strictPopulate: false,
          }
        })
        .populate({
          path: "assignedSeller",
          select: "name email phone company",
          strictPopulate: false,
          populate: {
            path: "company",
            select: "name phone businessType isVerified",
            strictPopulate: false,
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Enquiry.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: enquiries,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET admin enquiries error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch enquiries" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (
      !session ||
      ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(session.user.role)
    ) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Enquiry ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    await Enquiry.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Enquiry deleted successfully" });
  } catch (error) {
    console.error("DELETE admin enquiry error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete enquiry" },
      { status: 500 }
    );
  }
}

