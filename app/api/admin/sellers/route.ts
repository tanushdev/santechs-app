import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import User from "@/lib/db/models/User.model";
import Company from "@/lib/db/models/Company.model"; // Ensure model is registered
import Product from "@/lib/db/models/Product.model";
import { auth } from "@/lib/auth/config";
import { UserRole, UserStatus } from "@/types";

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
    const status = searchParams.get("status") || UserStatus.PENDING;

    const filter: any = { role: UserRole.SELLER };

    if (status === UserStatus.PENDING) {
      // Fetch all company IDs that are pending approval
      const pendingCompanies = await Company.find({ isApproved: false }).select("_id").lean();
      const pendingCompanyIds = pendingCompanies.map(c => c._id);

      filter.$or = [
        { status: UserStatus.PENDING },
        { company: { $in: pendingCompanyIds } }
      ];
    } else if (status !== "ALL") {
      filter.status = status as UserStatus;
    }

    // Load sellers with filter, populate company and attach submitted products
    const sellers = await User.find(filter)
      .populate("company")
      .sort({ createdAt: -1 })
      .lean();

    const sellerIds = sellers.map((s) => s._id);
    const products = await Product.find({ seller: { $in: sellerIds } })
      .select("name slug referenceNumber images status price location yearOfManufacture modelNumber category subCategory seller")
      .populate({ path: "category", select: "name slug type", strictPopulate: false })
      .populate({ path: "subCategory", select: "name slug", strictPopulate: false })
      .sort({ createdAt: -1 })
      .lean();

    const sellersWithProducts = sellers.map((s) => ({
      ...s,
      products: products.filter(
        (p: any) => p.seller?.toString() === s._id.toString()
      ),
    }));

    return NextResponse.json({ success: true, data: sellersWithProducts });
  } catch (error) {
    console.error("GET sellers error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sellers" },
      { status: 500 }
    );
  }
}
