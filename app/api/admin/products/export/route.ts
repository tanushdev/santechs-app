import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import Product from "@/lib/db/models/Product.model";
import { auth } from "@/lib/auth/config";
import { UserRole, ProductStatus } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    await connectToDatabase();

    const isAdmin = session?.user?.role && [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(session.user.role);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const products = await Product.find({})
      .populate("category", "name slug")
      .populate("subCategory", "name slug")
      .populate("seller", "name email phone")
      .populate("company", "name slug address")
      .sort({ createdAt: -1 })
      .lean();

    const headers = [
      "Reference Number",
      "Product Name",
      "Model Number",
      "Category",
      "Sub-Category",
      "Seller Name",
      "Seller Email",
      "Company Name",
      "Price",
      "Currency",
      "Year",
      "Condition",
      "Country",
      "State",
      "City",
      "Continent",
      "Status",
      "Published Date",
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = products.map((p: any) => [
      escapeCsv(p.referenceNumber),
      escapeCsv(p.name),
      escapeCsv(p.modelNumber || p.machineModel || ""),
      escapeCsv(p.category?.name || ""),
      escapeCsv(p.subCategory?.name || ""),
      ...(isAdmin
        ? [escapeCsv(p.seller?.name || ""), escapeCsv(p.seller?.email || ""), escapeCsv(p.company?.name || "")]
        : [escapeCsv(p.company?.name || "Verified Seller")]),
      escapeCsv(p.price || 0),
      escapeCsv(p.currency || "INR"),
      escapeCsv(p.yearOfManufacture || ""),
      escapeCsv(p.condition || ""),
      escapeCsv(p.location?.country || ""),
      escapeCsv(p.location?.state || ""),
      escapeCsv(p.location?.city || ""),
      escapeCsv(p.location?.continent || ""),
      escapeCsv(p.status || ""),
      escapeCsv(p.publishedAt ? new Date(p.publishedAt).toISOString().split("T")[0] : ""),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="santechs-products-export-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error("CSV Products Export Error:", error);
    return NextResponse.json({ success: false, error: "Failed to export products" }, { status: 500 });
  }
}
