"use server";

import { connectToDatabase } from "@/lib/db/connection";
import User from "@/lib/db/models/User.model";
import Company from "@/lib/db/models/Company.model";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations";
import { UserRole, UserStatus } from "@/types";
import { sendEmail } from "@/lib/email";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 50);
}

function generateToken(): string {
  return (
    Math.random().toString(36).substring(2) +
    Date.now().toString(36)
  );
}

export async function registerUser(data: unknown) {
  try {
    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input",
      };
    }

    await connectToDatabase();

    const { name, email, password, role, phone } = parsed.data;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return { success: false, error: "Email already registered" };
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = generateToken();

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      phone,
      status:
        role === UserRole.SELLER ? UserStatus.PENDING : UserStatus.ACTIVE,
      emailVerificationToken: verificationToken,
    });

    // Send verification email
    await sendEmail({
      to: email,
      subject: "Verify your Santechs account",
      html: `
        <h2>Welcome to Santechs, ${name}!</h2>
        <p>Please verify your email address to get started.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}" 
           style="background:#f97316;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;">
          Verify Email
        </a>
        <p>This link expires in 24 hours.</p>
      `,
    });

    return {
      success: true,
      message:
        role === UserRole.SELLER
          ? "Account created! Please verify your email and complete your company profile."
          : "Account created! Please verify your email.",
      userId: user._id.toString(),
    };
  } catch (error) {
    console.error("Register error:", error);
    return {
      success: false,
      error: "Failed to create account. Please try again.",
    };
  }
}

export async function verifyEmail(token: string) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      return { success: false, error: "Invalid or expired verification link" };
    }

    user.emailVerified = new Date();
    user.emailVerificationToken = undefined;
    if (user.status === UserStatus.PENDING && user.role === UserRole.BUYER) {
      user.status = UserStatus.ACTIVE;
    }
    await user.save();

    return { success: true, message: "Email verified successfully!" };
  } catch (error) {
    console.error("Verify email error:", error);
    return { success: false, error: "Verification failed. Please try again." };
  }
}

export async function forgotPassword(email: string) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return success even if user not found (security)
      return {
        success: true,
        message: "If this email exists, a reset link has been sent.",
      };
    }

    const resetToken = generateToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    await sendEmail({
      to: email,
      subject: "Reset your Santechs password",
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}"
           style="background:#f97316;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;">
          Reset Password
        </a>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });

    return {
      success: true,
      message: "If this email exists, a reset link has been sent.",
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    return { success: false, error: "Failed to process request." };
  }
}

export async function resetPassword(token: string, password: string) {
  try {
    await connectToDatabase();

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() },
    });

    if (!user) {
      return {
        success: false,
        error: "Invalid or expired reset link",
      };
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    return { success: true, message: "Password reset successfully!" };
  } catch (error) {
    console.error("Reset password error:", error);
    return { success: false, error: "Failed to reset password." };
  }
}
