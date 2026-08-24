import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import User from "@/lib/db/models/User.model";
import Company from "@/lib/db/models/Company.model";
import Product from "@/lib/db/models/Product.model";
import Notification from "@/lib/db/models/Notification.model";
import { auth } from "@/lib/auth/config";
import { NotificationType, ProductStatus, UserRole, UserStatus } from "@/types";
import { sendEmail, emailTemplates } from "@/lib/email";

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

    await connectToDatabase();

    const user = await User.findById(id).populate("company");
    if (!user) {
      return NextResponse.json({ success: false, error: "Seller not found" }, { status: 404 });
    }

    user.status = UserStatus.ACTIVE;
    await user.save();

    if (user.company) {
      const company = await Company.findById(user.company);
      if (company) {
        company.isApproved = true;
        company.isVerified = true;
        await company.save();
      }
    }

    // Approve all pending products submitted by this seller
    await Product.updateMany(
      { seller: user._id, status: ProductStatus.PENDING },
      { status: ProductStatus.APPROVED }
    );

    // Create Notification
    await Notification.create({
      recipient: user._id,
      type: NotificationType.SELLER_APPROVED,
      title: "Seller Account Approved!",
      message: "Your seller account has been approved. You can now start listing products.",
      link: "/seller/dashboard",
    });

    // Send email (handles gracefully if SMTP fails)
    const templates = emailTemplates.sellerApproved(user.name);
    await sendEmail({
      to: user.email,
      ...templates,
    });

    return NextResponse.json({ success: true, message: "Seller approved successfully" });
  } catch (error) {
    console.error("Approve seller error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to approve seller" },
      { status: 500 }
    );
  }
}
