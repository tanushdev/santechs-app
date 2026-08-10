import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import User from "@/lib/db/models/User.model";
import Company from "@/lib/db/models/Company.model";
import Notification from "@/lib/db/models/Notification.model";
import { auth } from "@/lib/auth/config";
import { NotificationType, UserRole, UserStatus } from "@/types";
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
    const { rejectionReason } = await req.json();

    if (!rejectionReason) {
      return NextResponse.json({ success: false, error: "Rejection reason is required" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findById(id).populate("company");
    if (!user) {
      return NextResponse.json({ success: false, error: "Seller not found" }, { status: 404 });
    }

    user.status = UserStatus.SUSPENDED; // Or reject state. Using SUSPENDED as UserStatus has ACTIVE, PENDING, SUSPENDED, BANNED
    await user.save();

    if (user.company) {
      const company = await Company.findById(user.company);
      if (company) {
        company.isApproved = false;
        company.isVerified = false;
        company.rejectionReason = rejectionReason;
        await company.save();
      }
    }

    // Create Notification
    await Notification.create({
      recipient: user._id,
      type: NotificationType.SELLER_REJECTED,
      title: "Seller Application Status Update",
      message: `Your application has not been approved. Reason: ${rejectionReason}`,
      link: "/seller/settings",
    });

    // Send email (handles gracefully if SMTP fails)
    const templates = emailTemplates.sellerRejected(user.name, rejectionReason);
    await sendEmail({
      to: user.email,
      ...templates,
    });

    return NextResponse.json({ success: true, message: "Seller application rejected" });
  } catch (error) {
    console.error("Reject seller error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reject seller application" },
      { status: 500 }
    );
  }
}
