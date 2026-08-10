"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, Search, Eye, Filter, Calendar, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserRole } from "@/types";
import { deleteProduct } from "@/lib/actions/product.actions";

const statuses = ["ALL", "APPROVED", "PENDING", "REJECTED", "DRAFT", "ARCHIVED"];

export default function AdminAllProductsPage() {
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === UserRole.SUPER_ADMIN;

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin", "all-products", selectedStatus],
    queryFn: async () => {
      const url = selectedStatus === "ALL" ? "/api/products?limit=100" : `/api/products?status=${selectedStatus}&limit=100`;
      const res = await fetch(url);
      if (!res.ok) return { items: [] };
      const json = await res.json();
      return json.data ?? { items: [] };
    },
  });

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to permanently delete this product? This action cannot be undone.")) {
      return;
    }
    setDeletingId(productId);
    try {
      const res = await deleteProduct(productId);
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["admin", "all-products"] });
      } else {
        alert(res.error || "Failed to delete product");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const items = products?.items ?? [];
  const filtered = items.filter((p: Record<string, unknown>) => {
    const name = String(p.name ?? "").toLowerCase();
    const ref = String(p.referenceNumber ?? "").toLowerCase();
    const company = String((p.company as Record<string, string>)?.name ?? "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || ref.includes(q) || company.includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">
            All Marketplace Products
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete inventory overview across all sellers and statuses.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all products..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Filter status pills */}
      <div className="flex flex-wrap gap-2">
        {statuses.map((st) => (
          <Button
            key={st}
            size="sm"
            variant={selectedStatus === st ? "default" : "outline"}
            onClick={() => setSelectedStatus(st)}
            className="text-xs"
          >
            {st}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">
          Loading catalog...
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-lg font-bold font-heading mb-1">
              No Products Found
            </h3>
            <p className="text-sm text-muted-foreground">
              No products found matching your search filter.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product: Record<string, unknown>) => {
            const company = (product.company as Record<string, unknown>) ?? {};
            const images = (product.images as string[]) ?? [];
            return (
              <Card key={String(product._id)}>
                <CardContent className="p-4 space-y-3">
                  <div className="relative aspect-video rounded-xl bg-muted overflow-hidden border border-border">
                    {images.length > 0 ? (
                      <Image
                        src={images[0]}
                        alt={String(product.name)}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                        <Package className="w-10 h-10" />
                      </div>
                    )}
                    <Badge
                      variant="outline"
                      className="absolute top-2 left-2 text-[10px] status-approved"
                    >
                      {String(product.status)}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-bold font-heading text-sm truncate">
                      {String(product.name)}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Ref: {String(product.referenceNumber)} · Seller: {String(company.name ?? "N/A")}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                    <span className="font-bold text-foreground">
                      {String(product.currency ?? "USD")} {Number(product.price ?? 0).toLocaleString()}
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {Number(product.views ?? 0)} views
                    </span>
                  </div>

                  {isSuperAdmin && (
                    <div className="flex justify-end pt-2 border-t border-border/60">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-8 rounded-full px-3"
                        disabled={deletingId === String(product._id)}
                        onClick={() => handleDelete(String(product._id))}
                      >
                        {deletingId === String(product._id) ? (
                          <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3 mr-1.5" />
                        )}
                        Delete Product
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
