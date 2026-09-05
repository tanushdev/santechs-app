"use server";

import { auth } from "@/lib/auth/config";
import { connectToDatabase } from "@/lib/db/connection";
import Product from "@/lib/db/models/Product.model";
import Category from "@/lib/db/models/Category.model";
import Notification from "@/lib/db/models/Notification.model";
import ActivityLog from "@/lib/db/models/ActivityLog.model";
import { productSchema } from "@/lib/validations";
import { NotificationType, ProductStatus, UserRole } from "@/types";
import User from "@/lib/db/models/User.model";
import { sendEmail, emailTemplates } from "@/lib/email";
import { getContinentFromCountry } from "@/lib/utils/continent";
import { invalidateCategoryCache } from "@/lib/cache/category-cache";
import { revalidatePath } from "next/cache";

function generateRef(): string {
  return `SAN-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`;
}

function toSlug(name: string, ref: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 60) +
    "-" +
    ref.toLowerCase()
  );
}

export async function createProduct(data: unknown) {
  try {
    const session = await auth();
    if (
      !session ||
      ![UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(
        session.user.role
      )
    ) {
      return { success: false, error: "Unauthorized" };
    }

    const rawData = (data ?? {}) as Record<string, any>;
    const parsed = productSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid data",
      };
    }

    await connectToDatabase();

    const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(
      session.user.role
    );
    let targetSellerId = session.user.id;
    let targetCompanyId: any = null;

    if (isAdmin && rawData.sellerId) {
      targetSellerId = rawData.sellerId;
    }

    const targetUser = await User.findById(targetSellerId).populate("company");
    if (targetUser?.company) {
      targetCompanyId = targetUser.company._id ?? targetUser.company;
    } else if (!isAdmin && !targetUser?.company) {
      return {
        success: false,
        error: "Please complete your company profile first",
      };
    }

    const ref = generateRef();
    const productData = parsed.data as Record<string, any>;
    if (productData.model) {
      productData.machineModel = productData.model;
      delete productData.model;
    }
    if (productData.brand === "") {
      delete productData.brand;
    }
    if (productData.subCategory === "") {
      delete productData.subCategory;
    }

    if (productData.location?.country && !productData.location.continent) {
      const derived = getContinentFromCountry(productData.location.country);
      if (derived) productData.location.continent = derived;
    }

    let productType = productData.type;
    if (!productType && productData.category) {
      const selectedCat = await Category.findById(productData.category).select("type").lean();
      if (selectedCat?.type) {
        productType = selectedCat.type;
      }
    }

    const initialStatus = isAdmin
      ? (rawData.status as ProductStatus) || ProductStatus.APPROVED
      : ProductStatus.PENDING;

    const product = await Product.create({
      ...productData,
      type: productType || "MACHINE",
      referenceNumber: ref,
      slug: toSlug(parsed.data.name, ref),
      seller: targetSellerId,
      company: targetCompanyId,
      status: initialStatus,
    });

    // Notify all admins if created by a seller
    if (!isAdmin) {
      const admins = await User.find({
        role: { $in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      });

      await Notification.insertMany(
        admins.map((admin) => ({
          recipient: admin._id,
          type: NotificationType.PRODUCT_SUBMITTED,
          title: "New Product Pending Review",
          message: `"${parsed.data.name}" submitted by ${targetUser?.name ?? "Seller"}`,
          link: `/admin/products/${product._id}`,
          data: { productId: product._id },
        }))
      );
    }

    // Log activity
    await ActivityLog.create({
      actor: session.user.id,
      action: "PRODUCT_CREATED",
      resource: "Product",
      resourceId: product._id.toString(),
    });

    invalidateCategoryCache();

    return {
      success: true,
      message: isAdmin ? "Product created successfully!" : "Product submitted for review!",
      productId: product._id.toString(),
    };
  } catch (error) {
    console.error("Create product error:", error);
    return { success: false, error: "Failed to create product." };
  }
}

export async function updateProduct(productId: string, data: unknown) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const rawData = (data ?? {}) as Record<string, any>;
    const parsed = productSchema.partial().safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid data",
      };
    }

    await connectToDatabase();

    const product = await Product.findById(productId);
    if (!product) return { success: false, error: "Product not found" };

    const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(
      session.user.role
    );

    // Seller can only edit their own products
    if (!isAdmin && product.seller.toString() !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const updateData = parsed.data as Record<string, any>;
    if (updateData.model) {
      updateData.machineModel = updateData.model;
      delete updateData.model;
    }
    if (updateData.brand === "") {
      delete updateData.brand;
    }
    if (updateData.subCategory === "") {
      delete updateData.subCategory;
    }

    if (updateData.location?.country && !updateData.location.continent) {
      const derived = getContinentFromCountry(updateData.location.country);
      if (derived) updateData.location.continent = derived;
    }

    if (!updateData.type && updateData.category) {
      const selectedCat = await Category.findById(updateData.category).select("type").lean();
      if (selectedCat?.type) {
        updateData.type = selectedCat.type;
      }
    }

    // Admin can update seller/company assignment if sellerId is provided
    if (isAdmin && rawData.sellerId) {
      const newSeller = await User.findById(rawData.sellerId).populate("company");
      if (newSeller) {
        updateData.seller = newSeller._id;
        updateData.company = newSeller.company?._id ?? newSeller.company ?? null;
      }
    }

    // Admin can update status directly
    if (isAdmin && rawData.status) {
      updateData.status = rawData.status;
    } else if (!isAdmin && product.status === ProductStatus.APPROVED) {
      // If seller edits an approved product, resubmit for review
      updateData.status = ProductStatus.PENDING;
    }

    await Product.findByIdAndUpdate(productId, updateData, { returnDocument: "after" });

    await ActivityLog.create({
      actor: session.user.id,
      action: "PRODUCT_UPDATED",
      resource: "Product",
      resourceId: productId,
    });

    invalidateCategoryCache();

    return { success: true, message: "Product updated successfully!" };
  } catch (error) {
    console.error("Update product error:", error);
    return { success: false, error: "Failed to update product." };
  }
}

export async function approveProduct(productId: string) {
  try {
    const session = await auth();
    if (
      !session ||
      ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(session.user.role)
    ) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDatabase();

    const product = await Product.findByIdAndUpdate(
      productId,
      {
        status: ProductStatus.APPROVED,
        publishedAt: new Date(),
        rejectionReason: null,
      },
      { returnDocument: "after" }
    ).populate("seller");

    if (!product) return { success: false, error: "Product not found" };

    // Notify seller
    await Notification.create({
      recipient: product.seller._id,
      type: NotificationType.PRODUCT_APPROVED,
      title: "Product Approved!",
      message: `Your listing "${product.name}" is now live on the marketplace.`,
      link: `/products/${product.slug}`,
    });

    const seller = (product.seller as unknown) as { email: string; name: string };
    const templates = emailTemplates.productApproved(
      seller.name,
      product.name,
      `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`
    );
    await sendEmail({ to: seller.email, ...templates });

    await ActivityLog.create({
      actor: session.user.id,
      action: "PRODUCT_APPROVED",
      resource: "Product",
      resourceId: productId,
    });

    invalidateCategoryCache();

    return { success: true, message: "Product approved and published!" };
  } catch (error) {
    console.error("Approve product error:", error);
    return { success: false, error: "Failed to approve product." };
  }
}

export async function rejectProduct(productId: string, reason: string) {
  try {
    const session = await auth();
    if (
      !session ||
      ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(session.user.role)
    ) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDatabase();

    const product = await Product.findByIdAndUpdate(
      productId,
      { status: ProductStatus.REJECTED, rejectionReason: reason },
      { returnDocument: "after" }
    ).populate("seller");

    if (!product) return { success: false, error: "Product not found" };

    await Notification.create({
      recipient: product.seller,
      type: NotificationType.PRODUCT_REJECTED,
      title: "Product Not Approved",
      message: `Your listing "${product.name}" was not approved. Reason: ${reason}`,
      link: `/seller/products/${productId}`,
    });

    await ActivityLog.create({
      actor: session.user.id,
      action: "PRODUCT_REJECTED",
      resource: "Product",
      resourceId: productId,
      details: { reason },
    });

    return { success: true, message: "Product rejected." };
  } catch (error) {
    console.error("Reject product error:", error);
    return { success: false, error: "Failed to reject product." };
  }
}

export async function featureProduct(productId: string, featured: boolean) {
  try {
    const session = await auth();
    if (
      !session ||
      ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(session.user.role)
    ) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDatabase();
    await Product.findByIdAndUpdate(productId, { isFeatured: featured });

    return {
      success: true,
      message: featured ? "Product featured!" : "Product unfeatured.",
    };
  } catch (error) {
    return { success: false, error: "Failed to update feature status." };
  }
}

export async function archiveProduct(productId: string) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    await connectToDatabase();

    const product = await Product.findById(productId);
    if (!product) return { success: false, error: "Product not found" };

    if (
      session.user.role === UserRole.SELLER &&
      product.seller.toString() !== session.user.id
    ) {
      return { success: false, error: "Unauthorized" };
    }

    await Product.findByIdAndUpdate(productId, {
      status: ProductStatus.ARCHIVED,
    });

    return { success: true, message: "Product archived." };
  } catch (error) {
    return { success: false, error: "Failed to archive product." };
  }
}

export async function deleteProduct(productId: string) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    await connectToDatabase();

    const product = await Product.findById(productId).select("seller").lean();
    if (!product) return { success: false, error: "Product not found" };

    const isSellerOwner =
      session.user.role === UserRole.SELLER &&
      String(product.seller) === session.user.id;
    const isSuperAdmin = session.user.role === UserRole.SUPER_ADMIN || session.user.role === UserRole.ADMIN;

    if (!isSellerOwner && !isSuperAdmin) {
      return { success: false, error: "Unauthorized" };
    }

    await Product.findByIdAndDelete(productId);

    // Non-blocking background activity log
    ActivityLog.create({
      actor: session.user.id,
      action: "PRODUCT_DELETED",
      resource: "Product",
      resourceId: productId,
    }).catch(console.error);

    invalidateCategoryCache();

    // Revalidate paths for instant UI refresh
    revalidatePath("/seller/products");
    revalidatePath("/admin/all-products");
    revalidatePath("/products");

    return { success: true, message: "Product deleted successfully!" };
  } catch (error) {
    console.error("Delete product error:", error);
    return { success: false, error: "Failed to delete product." };
  }
}

export async function getSellerProducts(page = 1, limit = 12) {
  try {
    const session = await auth();
    if (!session || session.user.role !== UserRole.SELLER) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDatabase();

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find({ seller: session.user.id })
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments({ seller: session.user.id }),
    ]);

    return {
      success: true,
      data: {
        items: products,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch products." };
  }
}
