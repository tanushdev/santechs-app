"use client";

import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, Search, Eye, Filter, Calendar, Trash2, Loader2, Plus, Pencil, Download, Upload, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserRole } from "@/types";
import { deleteProduct } from "@/lib/actions/product.actions";
import AdminProductModal from "@/components/admin/AdminProductModal";

const statuses = ["ALL", "APPROVED", "PENDING", "REJECTED", "DRAFT", "ARCHIVED"];

export default function AdminAllProductsPage() {
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Admin Product Modal state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any | null>(null);

  // CSV Import Modal state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleOpenAddModal = () => {
    setProductToEdit(null);
    setProductModalOpen(true);
  };

  const handleOpenEditModal = (product: any) => {
    setProductToEdit(product);
    setProductModalOpen(true);
  };

  const handleExportCsv = () => {
    window.location.href = "/api/admin/products/export";
  };

  const handleImportCsv = async () => {
    if (!importFile) return;
    setIsImporting(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append("file", importFile);

    try {
      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setImportResult(data);
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["admin", "all-products"] });
        queryClient.invalidateQueries({ queryKey: ["categories"] });
      }
    } catch (err: any) {
      setImportResult({ success: false, error: err.message });
    } finally {
      setIsImporting(false);
    }
  };

  const items = products?.items ?? [];
  const filtered = items.filter((p: Record<string, unknown>) => {
    const name = String(p.name ?? "").toLowerCase();
    const ref = String(p.referenceNumber ?? "").toLowerCase();
    const company = String((p.company as Record<string, string>)?.name ?? "").toLowerCase();
    const seller = String((p.seller as Record<string, string>)?.name ?? "").toLowerCase();
    const sellerEmail = String((p.seller as Record<string, string>)?.email ?? "").toLowerCase();
    const q = search.toLowerCase();
    return (
      name.includes(q) ||
      ref.includes(q) ||
      company.includes(q) ||
      seller.includes(q) ||
      sellerEmail.includes(q)
    );
  });

  return (
    <div suppressHydrationWarning className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900">
            All Marketplace Products
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, view, and modify product listings for any seller across the platform.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search all products..."
              className="pl-9 text-xs"
            />
          </div>

          <Button
            variant="outline"
            onClick={handleExportCsv}
            className="h-9 text-xs font-semibold border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              setImportFile(null);
              setImportResult(null);
              setImportModalOpen(true);
            }}
            className="h-9 text-xs font-semibold border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" /> Import CSV
          </Button>

          <Button
            onClick={handleOpenAddModal}
            className="h-9 text-xs font-bold bg-[#ff7759] hover:bg-[#ff7759]/90 text-white rounded-xl flex items-center justify-center gap-1.5 shrink-0 px-4 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Button>
        </div>
      </div>

      {/* CSV Import Modal */}
      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#ff7759]" />
              Bulk Import Products from CSV
            </DialogTitle>
            <DialogDescription className="text-xs">
              Upload a CSV file containing machinery listings. Categories and Sub-Categories will be validated against the standard 16/43 taxonomy.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-2xl text-center cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition-colors"
            >
              <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              {importFile ? (
                <div className="text-xs">
                  <p className="font-bold text-slate-900">{importFile.name}</p>
                  <p className="text-slate-500 font-mono">({(importFile.size / 1024).toFixed(1)} KB)</p>
                </div>
              ) : (
                <div className="text-xs text-slate-600">
                  <p className="font-semibold text-slate-800">Click to select CSV file</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Supports .csv format with standard product columns</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
            </div>

            {importResult && (
              <div className={`p-3 rounded-xl text-xs ${
                importResult.success
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}>
                {importResult.success ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{importResult.message}</span>
                  </div>
                ) : (
                  <p>Error: {importResult.error}</p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setImportModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!importFile || isImporting}
                onClick={handleImportCsv}
                className="bg-black text-white hover:bg-slate-800"
              >
                {isImporting ? "Importing..." : "Start Import"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filter status pills */}
      <div className="flex flex-wrap gap-2">
        {statuses.map((st) => (
          <Button
            key={st}
            size="sm"
            variant={selectedStatus === st ? "default" : "outline"}
            onClick={() => setSelectedStatus(st)}
            className="text-xs font-semibold rounded-xl"
          >
            {st}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-slate-400 text-xs">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
          Loading catalog...
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold font-heading mb-1 text-slate-900">
              No Products Found
            </h3>
            <p className="text-xs text-slate-500">
              No products found matching your search filter.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product: Record<string, unknown>) => {
            const company = (product.company as Record<string, unknown>) ?? {};
            const seller = (product.seller as Record<string, unknown>) ?? {};
            const images = (product.images as string[]) ?? [];
            const productId = String(product._id);

            return (
              <Card key={productId} className="hover:border-slate-300 transition-all flex flex-col justify-between">
                <CardContent className="p-4 space-y-3">
                  <div className="relative aspect-video rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shadow-xs">
                    {images.length > 0 ? (
                      <Image
                        src={images[0]}
                        alt={String(product.name)}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Package className="w-10 h-10" />
                      </div>
                    )}
                    <Badge
                      variant="outline"
                      className={`absolute top-2 left-2 text-[10px] font-bold ${
                        product.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : product.status === "PENDING"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {String(product.status)}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold font-heading text-sm text-slate-900 truncate" title={String(product.name)}>
                      {String(product.name)}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">
                      Ref: <span className="font-mono">{String(product.referenceNumber)}</span> · Seller: <strong>{String(company.name || seller.name || "N/A")}</strong>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="font-bold text-slate-900">
                        {String(product.currency ?? "USD")} {Number(product.price ?? 0).toLocaleString()}{product.unit ? ` / ${String(product.unit)}` : ""}
                      </span>
                      <span className="text-[11px] text-slate-500 ml-2 font-mono">
                        ({Number(product.quantity ?? 1).toLocaleString()} {product.unit ? `${String(product.unit)}${String(product.unit) === "Kg" || String(product.unit) === "Ton" ? "s" : ""}` : "Units"})
                      </span>
                    </div>
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Eye className="w-3.5 h-3.5" />
                      {Number(product.views ?? 0)} views
                    </span>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEditModal(product)}
                      className="h-8 text-xs font-semibold rounded-xl flex items-center gap-1 border-slate-200 hover:bg-slate-50 text-slate-800"
                    >
                      <Pencil className="w-3.5 h-3.5 text-primary" />
                      <span>Edit Details</span>
                    </Button>

                    {isSuperAdmin && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs h-8 rounded-xl px-2.5"
                        disabled={deletingId === productId}
                        onClick={() => handleDelete(productId)}
                      >
                        {deletingId === productId ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Admin Create / Edit Product Modal */}
      <AdminProductModal
        open={productModalOpen}
        onOpenChange={setProductModalOpen}
        productToEdit={productToEdit}
      />
    </div>
  );
}
