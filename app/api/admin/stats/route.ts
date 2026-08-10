import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import Product from "@/lib/db/models/Product.model";
import User from "@/lib/db/models/User.model";
import Enquiry from "@/lib/db/models/Enquiry.model";
import Company from "@/lib/db/models/Company.model";
import { auth } from "@/lib/auth/config";
import { EnquiryStatus, ProductStatus, UserRole, UserStatus } from "@/types";

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (
      !session ||
      ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(session.user.role)
    ) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const [
      totalProducts,
      pendingProducts,
      approvedProducts,
      totalUsers,
      totalSellers,
      pendingSellers,
      totalEnquiries,
      newEnquiries,
      closedDeals,
      topProducts,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: ProductStatus.PENDING }),
      Product.countDocuments({ status: ProductStatus.APPROVED }),
      User.countDocuments({ role: { $ne: UserRole.SUPER_ADMIN } }),
      User.countDocuments({ role: UserRole.SELLER }),
      User.countDocuments({
        role: UserRole.SELLER,
        status: UserStatus.PENDING,
      }),
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ status: EnquiryStatus.NEW }),
      Enquiry.countDocuments({ status: EnquiryStatus.DEAL_CLOSED }),
      Product.find({ status: ProductStatus.APPROVED })
        .sort({ views: -1 })
        .limit(5)
        .select("name slug views enquiryCount images referenceNumber")
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        products: {
          total: totalProducts,
          pending: pendingProducts,
          approved: approvedProducts,
        },
        users: {
          total: totalUsers,
          sellers: totalSellers,
          pendingSellers,
        },
        enquiries: {
          total: totalEnquiries,
          new: newEnquiries,
          closed: closedDeals,
          conversionRate:
            totalEnquiries > 0
              ? ((closedDeals / totalEnquiries) * 100).toFixed(1)
              : "0",
        },
        topProducts,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
