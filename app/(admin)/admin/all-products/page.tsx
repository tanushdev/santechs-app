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
const ITEMS_PER_PAGE = 12;

export default function AdminAllProductsPage() {
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === UserRole.SUPER_ADMIN;

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin", "all-products", selectedStatus],
    queryFn: async () => {
      const url = selectedStatus === "ALL" ? "/api/products?limit=200" : `/api/products?status=${selectedStatus}&limit=200`;
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

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getPages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

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
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search all products..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Filter status pills */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
        {statuses.map((st) => (
          <Button
            key={st}
            size="sm"
            variant={selectedStatus === st ? "default" : "outline"}
            onClick={() => {
              setSelectedStatus(st);
              setCurrentPage(1);
            }}
            className="text-xs shrink-0"
          >
            {st}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedItems.map((product: Record<string, unknown>) => {
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

          {/* Numbered Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="rounded-full px-3.5 text-xs font-semibold"
              >
                Previous
              </Button>

              {getPages().map((p, idx) =>
                typeof p === "number" ? (
                  <Button
                    key={idx}
                    size="sm"
                    variant={p === currentPage ? "default" : "outline"}
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 rounded-full text-xs font-semibold p-0 ${
                      p === currentPage
                        ? "bg-black text-white"
                        : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {p}
                  </Button>
                ) : (
                  <span key={idx} className="px-1 text-xs text-slate-400 font-mono">
                    ...
                  </span>
                )
              )}

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="rounded-full px-3.5 text-xs font-semibold"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
