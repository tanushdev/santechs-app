import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import Enquiry from "@/lib/db/models/Enquiry.model";
import { auth } from "@/lib/auth/config";
import { UserRole } from "@/types";

import Notification from "@/lib/db/models/Notification.model";
import { NotificationType } from "@/types";

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

    const enquiry = await Enquiry.findById(id)
      .populate([
        {
          path: "product",
          populate: [
            { path: "category", select: "name slug type" },
            { path: "subCategory", select: "name slug" },
            { path: "company", select: "name slug logo address isVerified" },
            { path: "seller", select: "name email phone" },
          ],
        },
        { path: "buyer", select: "name email phone company" },
        { path: "originalSeller", select: "name email phone company" },
        { path: "assignedSeller", select: "name email phone company" },
        { path: "seller", select: "name email phone company" },
      ])
      .lean();

    if (!enquiry) {
      return NextResponse.json({ success: false, error: "Enquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: enquiry });
  } catch (error) {
    console.error("GET admin enquiry error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch enquiry" },
      { status: 500 }
    );
  }
}

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
    const body = await req.json();
    const {
      status,
      adminNotes,
      buyerContactShared,
      sellerContactShared,
      assignedSeller,
      isForwardedToSeller,
      product,
      productId,
    } = body;

    await connectToDatabase();

    const updateFields: Record<string, unknown> = {};
    if (status !== undefined) updateFields.status = status;
    if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;
    if (buyerContactShared !== undefined) updateFields.buyerContactShared = buyerContactShared;
    if (sellerContactShared !== undefined) updateFields.sellerContactShared = sellerContactShared;
    if (product || productId) updateFields.product = product || productId;

    if (assignedSeller) {
      updateFields.assignedSeller = assignedSeller;
      updateFields.seller = assignedSeller;
      updateFields.sellerAssignedAt = new Date();
    }

    if (isForwardedToSeller !== undefined) {
      updateFields.isForwardedToSeller = isForwardedToSeller;
      if (isForwardedToSeller) {
        updateFields.forwardedAt = new Date();
      }
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      id,
      updateFields,
      { returnDocument: "after" }
    ).populate([
      { path: "product", strictPopulate: false },
      { path: "buyer", strictPopulate: false },
      { path: "originalSeller", strictPopulate: false },
      { path: "assignedSeller", strictPopulate: false },
    ]);

    if (!enquiry) {
      return NextResponse.json({ success: false, error: "Enquiry not found" }, { status: 404 });
    }

    // If forwarded to seller, notify the assigned seller
    if (isForwardedToSeller && enquiry.seller) {
      await Notification.create({
        recipient: enquiry.seller,
        type: NotificationType.ENQUIRY_RECEIVED,
        title: `New Buyer Lead Forwarded — ${enquiry.referenceNumber}`,
        message: `Admin routed a buyer quote enquiry for "${(enquiry.product as any)?.name || "Machinery"}" to your storefront.`,
        link: `/seller/enquiries`,
        data: { enquiryId: enquiry._id, productId: (enquiry.product as any)?._id },
      });
    }

    return NextResponse.json({ success: true, data: enquiry });
  } catch (error) {
    console.error("PATCH admin enquiry error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update enquiry" },
      { status: 500 }
    );
  }
}
