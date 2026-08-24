"use server";

import { auth } from "@/lib/auth/config";
import { connectToDatabase } from "@/lib/db/connection";
import Enquiry from "@/lib/db/models/Enquiry.model";
import Product from "@/lib/db/models/Product.model";
import Notification from "@/lib/db/models/Notification.model";
import ActivityLog from "@/lib/db/models/ActivityLog.model";
import User from "@/lib/db/models/User.model";
import { enquirySchema } from "@/lib/validations";
import {
  EnquiryStatus,
  NotificationType,
  ProductStatus,
  UserRole,
} from "@/types";
import { sendEmail, emailTemplates } from "@/lib/email";

function generateRef(): string {
  return `ENQ-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 5)
    .toUpperCase()}`;
}

export async function submitEnquiry(productId: string, data: unknown) {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: "Please sign in to submit a quotation request" };
    }
    if (session.user.role === UserRole.SELLER) {
      return { success: false, error: "Seller accounts cannot submit buyer quotation requests. Please sign in with a verified buyer account." };
    }
    if (session.user.role !== UserRole.BUYER) {
      return { success: false, error: "Please sign in as a buyer to submit an enquiry" };
    }

    const parsed = enquirySchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid enquiry data" };
    }

    await connectToDatabase();

    const product = await Product.findById(productId);
    if (!product || product.status !== ProductStatus.APPROVED) {
      return { success: false, error: "Product not found or unavailable" };
    }

    const ref = generateRef();
    const enquiry = await Enquiry.create({
      ...parsed.data,
      referenceNumber: ref,
      product: productId,
      buyer: session.user.id,
      originalSeller: product.seller,
      seller: product.seller,
      isForwardedToSeller: false,
      status: EnquiryStatus.NEW,
      buyerContactShared: false,
      sellerContactShared: false,
    });

    // Update product enquiry count
    await Product.findByIdAndUpdate(productId, { $inc: { enquiryCount: 1 } });

    // Notify ONLY super admin(s) — buyer's phone is hidden from seller
    const admins = await User.find({
      role: { $in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    });

    await Notification.insertMany(
      admins.map((admin) => ({
        recipient: admin._id,
        type: NotificationType.ENQUIRY_RECEIVED,
        title: `New Enquiry — ${ref}`,
        message: `${parsed.data.buyerName} from ${parsed.data.buyerCompany} enquired about "${product.name}"`,
        link: `/admin/enquiries/${enquiry._id}`,
        data: { enquiryId: enquiry._id, productId },
      }))
    );

    // Email admin
    const adminEmailList = admins.map((a) => a.email).join(",");
    const adminTemplates = emailTemplates.enquiryReceived(
      adminEmailList,
      ref,
      product.name
    );
    await sendEmail({ to: adminEmailList, ...adminTemplates });

    // Instantly Email Buyer with Official Quotation & Cost Estimate Breakdown
    const buyerEmail = parsed.data.buyerEmail || session.user.email;
    if (buyerEmail) {
      const buyerQuotationEmail = emailTemplates.buyerQuotationCostEstimate({
        buyerName: parsed.data.buyerName || session.user.name || "Client",
        buyerCompany: parsed.data.buyerCompany || "Enterprise Buyer",
        buyerEmail,
        referenceNumber: ref,
        productName: product.name,
        productModel: product.machineModel || "",
        price: product.price,
        currency: product.currency || "INR",
        quantity: parsed.data.quantity || 1,
        year: product.yearOfManufacture,
        condition: product.condition,
        locationCountry: product.location?.country,
        locationCity: product.location?.city,
        timeline: parsed.data.timeline,
        requirement: parsed.data.requirement,
      });

      await sendEmail({
        to: buyerEmail,
        ...buyerQuotationEmail,
      });
    }

    await ActivityLog.create({
      actor: session.user.id,
      action: "ENQUIRY_SUBMITTED",
      resource: "Enquiry",
      resourceId: enquiry._id.toString(),
    });

    return {
      success: true,
      message:
        "Enquiry submitted successfully! Our team will contact you shortly.",
      enquiryId: enquiry._id.toString(),
      referenceNumber: ref,
    };
  } catch (error) {
    console.error("Submit enquiry error:", error);
    return { success: false, error: "Failed to submit enquiry." };
  }
}

export async function updateEnquiryStatus(
  enquiryId: string,
  status: EnquiryStatus,
  notes?: string
) {
  try {
    const session = await auth();
    if (
      !session ||
      ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(session.user.role)
    ) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDatabase();

    const updateData: Record<string, unknown> = { status };
    if (notes) updateData.adminNotes = notes;

    // Set timestamp fields
    if (status === EnquiryStatus.CONTACTED_BUYER) {
      updateData.contactedBuyerAt = new Date();
    }
    if (status === EnquiryStatus.SELLER_ASSIGNED) {
      updateData.sellerAssignedAt = new Date();
    }
    if (status === EnquiryStatus.DEAL_CLOSED) {
      updateData.dealClosedAt = new Date();
    }

    const enquiry = await Enquiry.findByIdAndUpdate(enquiryId, updateData, {
      returnDocument: "after",
    }).populate("buyer seller product");

    if (!enquiry) return { success: false, error: "Enquiry not found" };

    // Notify buyer
    await Notification.create({
      recipient: enquiry.buyer,
      type: NotificationType.ENQUIRY_UPDATED,
      title: "Enquiry Status Update",
      message: `Your enquiry ${enquiry.referenceNumber} status: ${status.replace(/_/g, " ")}`,
      link: `/buyer/quotes`,
    });

    await ActivityLog.create({
      actor: session.user.id,
      action: "ENQUIRY_STATUS_UPDATED",
      resource: "Enquiry",
      resourceId: enquiryId,
      details: { status, notes },
    });

    return { success: true, message: "Enquiry status updated!" };
  } catch (error) {
    console.error("Update enquiry status error:", error);
    return { success: false, error: "Failed to update enquiry." };
  }
}

export async function shareContact(
  enquiryId: string,
  shareType: "buyer" | "seller"
) {
  try {
    const session = await auth();
    if (
      !session ||
      session.user.role !== UserRole.SUPER_ADMIN
    ) {
      return { success: false, error: "Unauthorized — Only Super Admin can share contacts" };
    }

    await connectToDatabase();

    const updateData =
      shareType === "buyer"
        ? { buyerContactShared: true }
        : { sellerContactShared: true };

    const enquiry = await Enquiry.findByIdAndUpdate(enquiryId, updateData, {
      returnDocument: "after",
    }).populate("buyer seller product");

    if (!enquiry) return { success: false, error: "Enquiry not found" };

    // Notify relevant party
    const recipientId =
      shareType === "buyer" ? enquiry.seller : enquiry.buyer;

    await Notification.create({
      recipient: recipientId,
      type: NotificationType.CONTACT_SHARED,
      title: "Contact Details Shared",
      message:
        shareType === "buyer"
          ? `Buyer contact for enquiry ${enquiry.referenceNumber} has been shared with you.`
          : `Seller contact for enquiry ${enquiry.referenceNumber} has been shared with you.`,
      link: `/admin/enquiries/${enquiryId}`,
    });

    await ActivityLog.create({
      actor: session.user.id,
      action: "CONTACT_SHARED",
      resource: "Enquiry",
      resourceId: enquiryId,
      details: { shareType },
    });

    return {
      success: true,
      message: `${shareType === "buyer" ? "Buyer" : "Seller"} contact shared successfully!`,
    };
  } catch (error) {
    console.error("Share contact error:", error);
    return { success: false, error: "Failed to share contact." };
  }
}

export async function getBuyerEnquiries(page = 1, limit = 10) {
  try {
    const session = await auth();
    if (!session || session.user.role !== UserRole.BUYER) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDatabase();

    const skip = (page - 1) * limit;
    const [enquiries, total] = await Promise.all([
      Enquiry.find({ buyer: session.user.id })
        .populate("product", "name slug images referenceNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Enquiry.countDocuments({ buyer: session.user.id }),
    ]);

    return {
      success: true,
      data: {
        items: enquiries,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch enquiries." };
  }
}

export async function getAdminEnquiries(
  page = 1,
  limit = 20,
  status?: EnquiryStatus
) {
  try {
    const session = await auth();
    if (
      !session ||
      ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(session.user.role)
    ) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDatabase();

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [enquiries, total] = await Promise.all([
      Enquiry.find(filter)
        .populate("product", "name slug images referenceNumber")
        .populate("buyer", "name email")
        .populate("seller", "name email company")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Enquiry.countDocuments(filter),
    ]);

    return {
      success: true,
      data: {
        items: enquiries,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch enquiries." };
  }
}

export async function assignAndForwardEnquiryToSeller(
  enquiryId: string,
  sellerId: string,
  adminNotes?: string
) {
  try {
    const session = await auth();
    if (
      !session ||
      ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(session.user.role)
    ) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDatabase();

    const sellerUser = await User.findById(sellerId).populate("company");
    if (!sellerUser) {
      return { success: false, error: "Selected seller not found" };
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      enquiryId,
      {
        assignedSeller: sellerId,
        seller: sellerId,
        isForwardedToSeller: true,
        sellerAssignedAt: new Date(),
        forwardedAt: new Date(),
        status: EnquiryStatus.SELLER_ASSIGNED,
        ...(adminNotes ? { adminNotes } : {}),
      },
      { returnDocument: "after" }
    ).populate("product buyer originalSeller assignedSeller");

    if (!enquiry) {
      return { success: false, error: "Enquiry not found" };
    }

    // Notify the assigned seller
    await Notification.create({
      recipient: sellerId,
      type: NotificationType.ENQUIRY_RECEIVED,
      title: `New Buyer Lead Assigned — ${enquiry.referenceNumber}`,
      message: `Admin routed a buyer quote request for "${(enquiry.product as any)?.name || "Machinery"}" to your storefront.`,
      link: `/seller/enquiries`,
      data: { enquiryId: enquiry._id, productId: enquiry.product },
    });

    await ActivityLog.create({
      actor: session.user.id,
      action: "ENQUIRY_FORWARDED_TO_SELLER",
      resource: "Enquiry",
      resourceId: enquiryId,
      details: {
        sellerId,
        sellerName: sellerUser.name,
        companyName: (sellerUser as any).company?.name,
      },
    });

    return {
      success: true,
      message: `Lead successfully forwarded to ${sellerUser.name}!`,
      data: JSON.parse(JSON.stringify(enquiry)),
    };
  } catch (error) {
    console.error("Assign enquiry error:", error);
    return { success: false, error: "Failed to assign and forward enquiry." };
  }
}
