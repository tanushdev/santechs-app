"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/common/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedListings() {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const res = await fetch("/api/products?isFeatured=true&limit=8");
      if (!res.ok) return { items: [], total: 0 };
      const json = await res.json();
      return json.data ?? { items: [], total: 0 };
    },
  });

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-2 block">
              Hand-Picked
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading">
              Featured Listings
            </h2>
          </div>
          <Link href="/products?isFeatured=true">
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.items?.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {data.items.map(
              (product: Record<string, unknown>, i: number) => (
                <motion.div
                  key={product._id as string}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              )
            )}
          </motion.div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No featured listings yet. Check back soon!</p>
            <Link href="/products" className="mt-4 inline-block">
              <Button variant="outline">Browse All Products</Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
