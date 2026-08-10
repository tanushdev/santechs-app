"use server";

import { auth } from "@/lib/auth/config";
import { connectToDatabase } from "@/lib/db/connection";
import Wishlist from "@/lib/db/models/Wishlist.model";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

export async function toggleWishlist(productId: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Please log in to add to wishlist." };
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return { success: false, error: "Invalid product identifier." };
    }

    await connectToDatabase();

    const existing = await Wishlist.findOne({
      user: session.user.id,
      product: productId,
    });

    if (existing) {
      await Wishlist.deleteOne({ _id: existing._id });
      revalidatePath("/buyer/wishlist");
      return { success: true, wishlisted: false, message: "Removed from wishlist." };
    } else {
      await Wishlist.create({
        user: session.user.id,
        product: productId,
      });
      revalidatePath("/buyer/wishlist");
      return { success: true, wishlisted: true, message: "Added to wishlist." };
    }
  } catch (error) {
    console.error("toggleWishlist error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function checkWishlistStatus(productId: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: true, wishlisted: false };
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return { success: true, wishlisted: false };
    }

    await connectToDatabase();

    const existing = await Wishlist.findOne({
      user: session.user.id,
      product: productId,
    });

    return { success: true, wishlisted: !!existing };
  } catch (error) {
    console.error("checkWishlistStatus error:", error);
    return { success: false, wishlisted: false };
  }
}
