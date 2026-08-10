"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Search, Loader2, Package, Eye, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminFeaturedPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Fetch all approved products (since we only feature active/approved products)
  const { data: products, isLoading } = useQuery({
    queryKey: ["admin", "products", "approved"],
    queryFn: async () => {
      const res = await fetch("/api/products?status=APPROVED&limit=100");
      if (!res.ok) return [];
      const json = await res.json();
      return json.data?.items ?? [];
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: string; isFeatured: boolean }) => {
      const res = await fetch(`/api/admin/products/${id}/feature`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const handleToggleFeatured = async (id: string, currentVal: boolean) => {
    setActionLoadingId(id);
    try {
      await toggleFeaturedMutation.mutateAsync({ id, isFeatured: !currentVal });
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = (products ?? []).filter((product: any) => {
    const name = String(product.name ?? "").toLowerCase();
    const ref = String(product.referenceNumber ?? "").toLowerCase();
    const category = String(product.category?.name ?? "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || ref.includes(q) || category.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#e5e7eb] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#75758a]">
            <Star className="w-4 h-4 text-[#ff7759]" fill="#ff7759" />
            <span>Catalog Promotions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-black font-sans">
            Featured Products Manager
          </h1>
          <p className="text-slate-500 text-xs max-w-xl">
            Promote specific machinery and raw materials to the homepage carousel showcase to increase visibility and enquiries.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search approved listings..."
            className="pl-10 h-11 text-sm border-slate-200 focus-visible:ring-[#ff7759] rounded-full"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#ff7759]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border border-[#e5e7eb] rounded-2xl bg-slate-50">
          <Package className="w-10 h-10 text-slate-350 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-black font-sans mb-1">No Products Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Ensure products have been approved before managing their featured homepage promotion status.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((product: any) => {
            const isFeatured = product.isFeatured ?? false;
            return (
              <div
                key={product._id}
                className={cn(
                  "border rounded-2xl p-5 flex flex-col justify-between gap-5 transition-all",
                  isFeatured
                    ? "bg-[#ff7759]/5 border-[#ff7759]/25 shadow-sm"
                    : "bg-white border-[#e5e7eb] hover:border-slate-350"
                )}
              >
                {/* Details layout */}
                <div className="space-y-4">
                  {/* Photo & Ref header */}
                  <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {product.referenceNumber}
                        </span>
                        {isFeatured && (
                          <Badge className="bg-[#ff7759] text-white border-0 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-white" /> Featured
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-black font-sans leading-snug line-clamp-2">
                        {product.name}
                      </h3>
                    </div>
                  </div>

                  {/* Metadata Info */}
                  <div className="grid grid-cols-2 gap-2.5 text-[11px] bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                    <div>
                      <span className="text-slate-400 block font-mono">Category</span>
                      <span className="font-bold text-slate-800 truncate block">
                        {product.category?.name ?? "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono">Pricing</span>
                      <span className="font-bold text-slate-800 block">
                        {product.currency === "INR" ? "₹" : product.currency}{" "}
                        {product.price?.toLocaleString("en-IN") ?? 0}
                      </span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-100/60">
                      <span className="text-slate-400 block font-mono">Company</span>
                      <span className="font-semibold text-slate-700 truncate block">
                        {product.company?.name ?? "Individual Seller"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100/80">
                  <Link
                    href={`/products/${product.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-black transition-colors"
                  >
                    <Eye className="w-4 h-4" /> Live View
                  </Link>

                  <Button
                    onClick={() => handleToggleFeatured(product._id, isFeatured)}
                    disabled={actionLoadingId === product._id}
                    className={cn(
                      "rounded-full text-xs font-bold uppercase tracking-wider h-9 px-5 transition-all cursor-pointer border flex items-center gap-1.5",
                      isFeatured
                        ? "bg-[#ff7759] hover:bg-[#e05f43] text-white border-0"
                        : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                    )}
                  >
                    {actionLoadingId === product._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isFeatured ? (
                      <>
                        <Star className="w-3.5 h-3.5 fill-white text-white" />
                        Featured
                      </>
                    ) : (
                      <>
                        <Star className="w-3.5 h-3.5" />
                        Feature Item
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
