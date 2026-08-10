import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db/connection";
import Wishlist from "@/lib/db/models/Wishlist.model";
import { UserRole } from "@/types";
import Link from "next/link";
import ProductCard from "@/components/common/ProductCard";
import { Heart, FileText, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Wishlist — Santechs" };

export default async function BuyerWishlistPage() {
  const session = await auth();

  if (!session || session.user.role !== UserRole.BUYER) {
    redirect("/login?callbackUrl=/buyer/wishlist");
  }

  await connectToDatabase();

  const items = await Wishlist.find({ user: session.user.id })
    .populate({
      path: "product",
      populate: {
        path: "company",
        select: "name isVerified",
      },
    })
    .sort({ createdAt: -1 })
    .lean();

  // Filter out any entries where the product might have been deleted
  const wishlistedProducts = items
    .map((item: any) => {
      if (!item.product) return null;
      // Serialize the populated product for client component serialization
      return JSON.parse(JSON.stringify(item.product));
    })
    .filter(Boolean);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 sm:p-8 space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#75758a]">
          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          <span>Buyer Dashboard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-black">
          My Wishlist
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
          Access your bookmarked machinery, raw materials, and components listings. Quickly request quotes or review specifications at any time.
        </p>
      </div>

      {/* Wishlist Grid */}
      {wishlistedProducts.length === 0 ? (
        <div className="text-center py-20 border border-[#e5e7eb] rounded-2xl bg-slate-50">
          <Heart className="w-10 h-10 text-slate-350 mx-auto mb-3" />
          <h3 className="text-base font-bold text-black font-sans mb-1">Your Wishlist is Empty</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Bookmark industrial listings while browsing the Santechs marketplace to save them here for quick comparison.
          </p>
          <Link href="/products">
            <Button className="rounded-full bg-black text-white hover:bg-neutral-800 font-semibold px-6 py-2.5 text-xs uppercase tracking-wider">
              Browse Marketplace
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlistedProducts.map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
}
