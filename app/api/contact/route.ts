import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import User from "@/lib/db/models/User.model";
import Notification from "@/lib/db/models/Notification.model";
import { NotificationType, UserRole } from "@/types";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { name, email, phone, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    // Find the superadmin user to receive the notification
    const superAdmin = await User.findOne({ role: UserRole.SUPER_ADMIN });
    if (superAdmin) {
      await Notification.create({
        recipient: superAdmin._id,
        type: NotificationType.MESSAGE_RECEIVED,
        title: "New Contact Enquiry",
        message: `New message from ${name} (${email}, Phone: ${phone}): "${message.substring(0, 100)}${message.length > 100 ? "..." : ""}"`,
        link: "/admin/dashboard", // Redirect to dashboard
      });
    }

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully. A coordinator will review it shortly.",
    });
  } catch (error: any) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong." },
      { status: 500 }
    );
  }
}
