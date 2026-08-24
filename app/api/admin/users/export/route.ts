import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import User from "@/lib/db/models/User.model";
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

    const users = await User.find()
      .populate("company", "name slug address phone email isVerified isApproved")
      .sort({ createdAt: -1 })
      .lean();

    const headers = [
      "User ID",
      "Full Name",
      "Email Address",
      "Phone Number",
      "Role",
      "Account Status",
      "Company Name",
      "Company Country",
      "Company City",
      "Company Verified",
      "Company Approved",
      "Registered Date",
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = users.map((u: any) => [
      escapeCsv(u._id),
      escapeCsv(u.name),
      escapeCsv(u.email),
      escapeCsv(u.phone || ""),
      escapeCsv(u.role),
      escapeCsv(u.status || "ACTIVE"),
      escapeCsv(u.company?.name || ""),
      escapeCsv(u.company?.address?.country || ""),
      escapeCsv(u.company?.address?.city || ""),
      escapeCsv(u.company?.isVerified ? "YES" : "NO"),
      escapeCsv(u.company?.isApproved ? "YES" : "NO"),
      escapeCsv(u.createdAt ? new Date(u.createdAt).toISOString().split("T")[0] : ""),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="santechs-users-export-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error("CSV Users Export Error:", error);
    return NextResponse.json({ success: false, error: "Failed to export users" }, { status: 500 });
  }
}
