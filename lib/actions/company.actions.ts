"use server";

import { auth } from "@/lib/auth/config";
import { connectToDatabase } from "@/lib/db/connection";
import Company from "@/lib/db/models/Company.model";
import User from "@/lib/db/models/User.model";
import { companySchema } from "@/lib/validations";
import { UserRole } from "@/types";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 50) + "-" + Math.random().toString(36).substring(2, 6);
}

export async function updateCompanyProfile(data: unknown) {
  try {
    const session = await auth();
    if (!session || session.user.role !== UserRole.SELLER) {
      return { success: false, error: "Unauthorized" };
    }

    const parsed = companySchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    let company;
    if (user.company) {
      // Update existing company
      company = await Company.findByIdAndUpdate(
        user.company,
        {
          ...parsed.data,
          slug: generateSlug(parsed.data.name),
        },
        { returnDocument: "after" }
      );
    } else {
      // Create new company
      company = await Company.create({
        ...parsed.data,
        owner: user._id,
        slug: generateSlug(parsed.data.name),
        isApproved: false,
        isVerified: false,
      });

      // Link to user
      user.company = company._id as any;
      await user.save();
    }

    return {
      success: true,
      message: "Company profile updated successfully!",
      company: JSON.parse(JSON.stringify(company)),
    };
  } catch (error) {
    console.error("Update company profile error:", error);
    return { success: false, error: "Failed to update company profile." };
  }
}

export async function getCompanyProfile() {
  try {
    const session = await auth();
    if (!session || session.user.role !== UserRole.SELLER) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id).populate("company");
    if (!user?.company) {
      return { success: true, company: null };
    }

    return { success: true, company: JSON.parse(JSON.stringify(user.company)) };
  } catch (error) {
    console.error("Get company profile error:", error);
    return { success: false, error: "Failed to fetch company profile." };
  }
}
