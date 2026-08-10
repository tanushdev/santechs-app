import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import User from "@/lib/db/models/User.model";
import { auth } from "@/lib/auth/config";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id).select("-password").lean();
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("GET user profile error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, oldPassword, newPassword } = body;

    await connectToDatabase();
    const user = await User.findById(session.user.id).select("+password");
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Handle password change if requested
    if (oldPassword && newPassword) {
      if (!user.password) {
        return NextResponse.json({ success: false, error: "Password login not configured for this account" }, { status: 400 });
      }

      const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordCorrect) {
        return NextResponse.json({ success: false, error: "Incorrect current password" }, { status: 400 });
      }

      if (newPassword.length < 8) {
        return NextResponse.json({ success: false, error: "New password must be at least 8 characters long" }, { status: 400 });
      }

      user.password = await bcrypt.hash(newPassword, 12);
    }

    // Handle text profile fields update
    if (name) {
      user.name = name;
    }
    if (phone) {
      user.phone = phone;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        name: user.name,
        phone: user.phone,
      }
    });
  } catch (error) {
    console.error("PATCH user profile error:", error);
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}
