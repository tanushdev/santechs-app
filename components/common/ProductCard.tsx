"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MapPin,
  Star,
  Eye,
  Heart,
  ArrowRight,
  Calendar,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toggleWishlist, checkWishlistStatus } from "@/lib/actions/wishlist.actions";

interface ProductCardProps {
  product: Record<string, unknown>;
  showStatus?: boolean;
}

const conditionColors: Record<string, string> = {
  EXCELLENT: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  GOOD: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  USED: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  REFURBISHED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export default function ProductCard({
  product,
  showStatus = false,
}: ProductCardProps) {
  const { data: session } = useSession();
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (session) {
      checkWishlistStatus(product._id as string).then((res) => {
        if (res.success) {
          setIsWishlisted(res.wishlisted);
        }
      });
    }
  }, [product._id, session]);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      alert("Please log in to bookmark this product in your wishlist.");
      return;
    }

    setIsWishlisted((prev) => !prev);

    try {
      const res = await toggleWishlist(product._id as string);
      if (!res.success) {
        setIsWishlisted((prev) => !prev);
        alert(res.error || "Failed to update wishlist.");
      }
    } catch (err) {
      setIsWishlisted((prev) => !prev);
    }
  };

  const images = (product.images as string[]) ?? [];
  const location = product.location as Record<string, string> | undefined;
  const status = product.status as string;

  return (
    <div className="group relative bg-card border border-border rounded-2xl overflow-hidden card-hover flex flex-col h-full">
      {/* Featured badge */}
      {Boolean(product.isFeatured) && (
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-primary text-primary-foreground text-[10px] gap-1">
            <Star className="w-2.5 h-2.5 fill-current" />
            Featured
          </Badge>
        </div>
      )}

      {/* Wishlist button */}
      <button
        onClick={handleWishlistToggle}
        className={cn(
          "absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center transition-all hover:border-primary hover:text-primary cursor-pointer",
          isWishlisted ? "opacity-100 border-red-200 text-red-500 bg-white" : "opacity-60 hover:opacity-100 bg-background/80"
        )}
        aria-label="Add to wishlist"
      >
        <Heart className={cn("w-3.5 h-3.5", isWishlisted && "fill-red-500 text-red-500")} />
      </button>

      {/* Status badge (admin/seller view) */}
      {showStatus && (
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="outline" className={`text-[10px] ${
            status === "APPROVED" ? "status-approved" :
            status === "PENDING" ? "status-pending" :
            status === "REJECTED" ? "status-rejected" :
            status === "DRAFT" ? "status-draft" :
            "status-archived"
          }`}>
            {status}
          </Badge>
        </div>
      )}

      {/* Image */}
      <Link href={`/products/${product.slug as string}`} prefetch={true} className="block">
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {images.length > 0 ? (
            <Image
              src={images[0]}
              alt={product.name as string}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Image count */}
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-0.5 text-[10px] text-muted-foreground">
              +{images.length - 1} photos
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Condition + Year */}
        <div className="flex items-center gap-2 mb-2">
          {Boolean(product.condition) && (
            <Badge
              variant="outline"
              className={`text-[10px] ${conditionColors[product.condition as string] ?? ""}`}
            >
              {(product.condition as string).charAt(0) + (product.condition as string).slice(1).toLowerCase()}
            </Badge>
          )}
          {Boolean(product.yearOfManufacture) && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {product.yearOfManufacture as number}
            </span>
          )}
        </div>

        {/* Name */}
        <Link href={`/products/${product.slug as string}`} prefetch={true}>
          <h3 className="font-semibold font-heading text-sm leading-snug mb-1 line-clamp-2 hover:text-primary transition-colors">
            {product.name as string}
          </h3>
        </Link>

        {/* Reference */}
        <p className="text-[10px] text-muted-foreground/60 mb-2">
          Ref: {product.referenceNumber as string}
        </p>

        {/* Location */}
        {Boolean(location) && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">
              {[location?.city, location?.country].filter(Boolean).join(", ")}
            </span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-sm font-bold text-slate-900">
              {product.price
                ? `${product.currency === "INR" ? "₹" : String(product.currency || "USD")} ${Number(product.price).toLocaleString("en-IN")}${product.unit ? ` / ${String(product.unit)}` : ""}`
                : "Price on Request"}
            </span>
          </div>

          {/* Views */}
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Eye className="w-3 h-3" />
            {Number(product.views ?? 0).toLocaleString()}
          </div>
        </div>

        {/* CTA */}
        <Link href={`/products/${product.slug as string}`}>
          <Button
            size="sm"
            className="w-full orange-gradient text-white border-0 hover:opacity-90 group/btn"
          >
            Request Quote
            <ArrowRight className="ml-1.5 w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </Button>
        </Link>

        {/* Published time */}
        {Boolean(product.publishedAt) && (
          <p className="text-[10px] text-muted-foreground/40 text-center mt-2">
            {formatDistanceToNow(new Date(product.publishedAt as string), {
              addSuffix: true,
            })}
          </p>
        )}
      </div>
    </div>
  );
}
