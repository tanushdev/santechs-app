"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ShieldAlert,
  Mail,
  Phone,
  MapPin,
  Globe,
  Package,
  Eye,
  ExternalLink,
  CheckSquare,
  FileText,
  Loader2,
  Sparkles,
  Pencil,
  Plus,
  Download,
  Upload,
  FileSpreadsheet,
} from "lucide-react";
import AdminProductModal from "@/components/admin/AdminProductModal";
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
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

export default function AdminSellersApprovalsPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<"sellers" | "products">("sellers");
  const [search, setSearch] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<{ id: string; type: "seller" | "product" } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Detail Modal States
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [modalActiveTab, setModalActiveTab] = useState<"company" | "products">("company");

  // Admin Product Create / Edit Modal States
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any | null>(null);

  const handleOpenAddProduct = () => {
    setProductToEdit(null);
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (product: any) => {
    setProductToEdit(product);
    setProductModalOpen(true);
  };

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "products") {
      setActiveTab("products");
    }
  }, [searchParams]);

  // Query Pending Sellers
  const { data: sellers, isLoading: sellersLoading } = useQuery({
    queryKey: ["admin", "sellers", "pending"],
    queryFn: async () => {
      const res = await fetch("/api/admin/sellers?status=PENDING");
      if (!res.ok) return [];
      const json = await res.json();
      return json.data ?? [];
    },
  });

  // Query Pending Products
  const { data: pendingProductsData, isLoading: productsLoading } = useQuery({
    queryKey: ["admin", "products", "pending"],
    queryFn: async () => {
      const res = await fetch("/api/products?status=PENDING");
      if (!res.ok) return [];
      const json = await res.json();
      return json.data?.items ?? (Array.isArray(json.data) ? json.data : []);
    },
  });

  const pendingProducts = Array.isArray(pendingProductsData) ? pendingProductsData : [];

  // Query Selected Seller Full Details & Listed Products
  const { data: sellerDetailData, isLoading: detailLoading } = useQuery({
    queryKey: ["admin", "user-detail", selectedSellerId],
    queryFn: async () => {
      if (!selectedSellerId) return null;
      const res = await fetch(`/api/admin/users/${selectedSellerId}`);
      if (!res.ok) throw new Error("Failed to fetch seller detail");
      const json = await res.json();
      return json.data;
    },
    enabled: !!selectedSellerId && detailModalOpen,
  });

  // Approve Seller Account & Products
  const handleApproveSeller = async (sellerId: string, approveProducts = true) => {
    setActionLoading(`seller-${sellerId}`);
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approveProducts }),
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["admin", "sellers"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "user-detail", sellerId] });
        if (selectedSellerId === sellerId) {
          setDetailModalOpen(false);
        }
      } else {
        const json = await res.json();
        alert(json.error ?? "Failed to approve seller account.");
      }
    } catch (err) {
      alert("An unexpected error occurred while approving seller.");
    } finally {
      setActionLoading(null);
    }
  };

  // Approve Individual Product
  const handleApproveProduct = async (productId: string) => {
    setActionLoading(`product-${productId}`);
    try {
      const res = await fetch(`/api/admin/products/${productId}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "sellers"] });
        if (selectedSellerId) {
          queryClient.invalidateQueries({ queryKey: ["admin", "user-detail", selectedSellerId] });
        }
      } else {
        const json = await res.json();
        alert(json.error ?? "Failed to approve product.");
      }
    } catch (err) {
      alert("An unexpected error occurred while approving product.");
    } finally {
      setActionLoading(null);
    }
  };

  // Reject Handler
  const handleOpenRejectModal = (id: string, type: "seller" | "product") => {
    setRejectTarget({ id, type });
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget || !rejectionReason.trim()) return;
    const { id, type } = rejectTarget;
    setActionLoading(`reject-${id}`);

    try {
      const endpoint =
        type === "seller"
          ? `/api/admin/sellers/${id}/reject`
          : `/api/admin/products/${id}/reject`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason }),
      });

      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["admin", "sellers"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
        if (selectedSellerId === id) {
          setDetailModalOpen(false);
        }
        setRejectModalOpen(false);
        setRejectTarget(null);
        setRejectionReason("");
      } else {
        const json = await res.json();
        alert(json.error ?? "Failed to reject item.");
      }
    } catch (err) {
      alert("An error occurred while attempting rejection.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenDetailModal = (sellerId: string) => {
    setSelectedSellerId(sellerId);
    setModalActiveTab("company");
    setDetailModalOpen(true);
  };

  // Filtered Lists
  const filteredSellers = (sellers ?? []).filter((s: Record<string, unknown>) => {
    const name = String(s.name ?? "").toLowerCase();
    const email = String(s.email ?? "").toLowerCase();
    const company = String((s.company as Record<string, string>)?.name ?? "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q) || company.includes(q);
  });

  const filteredProducts = (pendingProducts ?? []).filter((p: Record<string, unknown>) => {
    const name = String(p.name ?? "").toLowerCase();
    const ref = String(p.referenceNumber ?? "").toLowerCase();
    const sellerName = String((p.seller as Record<string, string>)?.name ?? "").toLowerCase();
    const companyName = String((p.company as Record<string, string>)?.name ?? "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || ref.includes(q) || sellerName.includes(q) || companyName.includes(q);
  });

  // CSV Import Modal state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "all-products"] });
        queryClient.invalidateQueries({ queryKey: ["categories"] });
      }
    } catch (err: any) {
      setImportResult({ success: false, error: err.message });
    } finally {
      setIsImporting(false);
    }
  };

  const detailUser = sellerDetailData?.user;
  const detailCompany = sellerDetailData?.company;
  const detailProducts = sellerDetailData?.products ?? [];
  const detailPendingProducts = detailProducts.filter((p: any) => p.status === "PENDING");

  return (
    <div suppressHydrationWarning className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-heading text-slate-900">
              Seller & Product Approvals
            </h1>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-mono text-[10px]">
              {(sellers?.length ?? 0) + (pendingProducts?.length ?? 0)} Pending
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review pending seller registration applications, verify storefront details, and approve product listings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sellers..."
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
            onClick={handleOpenAddProduct}
            className="w-full sm:w-auto h-9 text-xs font-bold bg-[#ff7759] hover:bg-[#ff7759]/90 text-white rounded-xl flex items-center justify-center gap-1.5 shrink-0 px-3.5 shadow-xs cursor-pointer"
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

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <Button
          size="sm"
          variant={activeTab === "sellers" ? "default" : "outline"}
          onClick={() => setActiveTab("sellers")}
          className="text-xs font-semibold rounded-xl flex items-center gap-2"
        >
          <Building2 className="w-4 h-4 shrink-0" />
          <span>Pending Sellers</span>
          <Badge className="ml-1 h-5 px-1.5 text-[10px] bg-white/20 text-white border-0">
            {sellers?.length ?? 0}
          </Badge>
        </Button>

        <Button
          size="sm"
          variant={activeTab === "products" ? "default" : "outline"}
          onClick={() => setActiveTab("products")}
          className="text-xs font-semibold rounded-xl flex items-center gap-2"
        >
          <Package className="w-4 h-4 shrink-0" />
          <span>Pending Products</span>
          <Badge className="ml-1 h-5 px-1.5 text-[10px] bg-white/20 text-white border-0">
            {pendingProducts?.length ?? 0}
          </Badge>
        </Button>
      </div>

      {/* 1. Pending Sellers Tab */}
      {activeTab === "sellers" && (
        <div className="space-y-4">
          {sellersLoading ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
              Loading pending seller applications...
            </div>
          ) : filteredSellers.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold font-heading mb-1 text-slate-900">
                  All Caught Up!
                </h3>
                <p className="text-xs text-slate-500">
                  No pending seller registration applications at this time.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredSellers.map((seller: Record<string, unknown>) => {
                const company = (seller.company as Record<string, unknown>) ?? {};
                const sellerId = String(seller._id);
                const isLoadingAction = actionLoading === `seller-${sellerId}`;

                return (
                  <Card key={sellerId} className="hover:border-slate-300 transition-all">
                    <CardContent className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      <div className="space-y-4 flex-1 min-w-0">
                        {/* Seller Owner Info */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl orange-gradient flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-xs">
                              {String(seller.name).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold font-heading text-base text-slate-900">
                                  {String(seller.name)}
                                </h3>
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold">
                                  Pending Verification
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500">
                                {String(seller.email)}
                              </p>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDetailModal(sellerId)}
                            className="text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Full Profile</span>
                          </Button>
                        </div>

                        {/* Company Storefront Info */}
                        {Boolean(company.name) && (
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-3">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-200/60 pb-2">
                              <div className="font-bold flex items-center gap-1.5 text-slate-900 text-sm">
                                <Building2 className="w-4 h-4 text-primary shrink-0" />
                                <span>{String(company.name)}</span>
                              </div>
                              {Boolean(company.website) && (
                                <a
                                  href={String(company.website).startsWith("http") ? String(company.website) : `https://${company.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline font-semibold flex items-center gap-1 text-[11px]"
                                >
                                  <Globe className="w-3 h-3 shrink-0" /> Visit Website
                                </a>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-600 font-sans">
                              <div className="space-y-1">
                                <p className="flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                                  <span className="truncate">
                                    {company.address
                                      ? [
                                          (company.address as any).street,
                                          (company.address as any).city,
                                          (company.address as any).state,
                                          (company.address as any).country,
                                          (company.address as any).pincode,
                                        ]
                                          .filter(Boolean)
                                          .join(", ")
                                      : "No Address Listed"}
                                  </span>
                                </p>
                                <p><strong>Business Type:</strong> {String(company.businessType ?? "Manufacturer")}</p>
                                <p><strong>Established:</strong> {String(company.establishedYear ?? company.yearEstablished ?? "N/A")}</p>
                              </div>

                              <div className="space-y-1">
                                {Boolean(company.gstNumber) && <p><strong>GST Number:</strong> <span className="font-mono">{String(company.gstNumber)}</span></p>}
                                {Boolean(company.panNumber) && <p><strong>PAN Number:</strong> <span className="font-mono">{String(company.panNumber)}</span></p>}
                                <p><strong>Contact Phone:</strong> <span className="font-mono">{String(company.phone ?? seller.phone ?? "N/A")}</span></p>
                              </div>
                            </div>

                            {/* Documents */}
                            {Array.isArray(company.documents) && company.documents.length > 0 && (
                              <div className="border-t border-slate-200/60 pt-2.5 space-y-1.5">
                                <p className="font-bold text-slate-700 text-[11px]">Uploaded Verification Documents:</p>
                                <div className="flex flex-wrap gap-2">
                                  {company.documents.map((doc: any, idx: number) => (
                                    <a
                                      key={idx}
                                      href={typeof doc === "string" ? doc : doc.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700 hover:text-primary flex items-center gap-1 transition-colors"
                                    >
                                      <FileText className="w-3 h-3 text-slate-400" />
                                      <span>Doc #{idx + 1}</span>
                                      <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Products Listed for Approval by this Seller */}
                            {Array.isArray(seller.products) && seller.products.length > 0 && (
                              <div className="border-t border-slate-200/80 pt-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                    <Package className="w-3.5 h-3.5 text-primary" /> Submitted Machinery Listings ({seller.products.length})
                                  </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {seller.products.map((prod: any) => (
                                    <div key={prod._id} className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2 shadow-xs">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                                          {prod.images?.[0] ? (
                                            <Image src={prod.images[0]} alt={prod.name} fill className="object-cover" />
                                          ) : (
                                            <Package className="w-5 h-5 text-slate-400 m-auto mt-2.5" />
                                          )}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="font-bold text-slate-900 text-xs truncate" title={prod.name}>
                                            {prod.name}
                                          </p>
                                          <p className="text-[11px] text-slate-500 font-mono">
                                            {prod.currency || "USD"} {prod.price?.toLocaleString()}
                                          </p>
                                        </div>
                                      </div>

                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleOpenEditProduct(prod)}
                                        className="h-7 text-[11px] font-semibold px-2.5 rounded-lg border-slate-200 shrink-0"
                                      >
                                        <Pencil className="w-3 h-3 text-primary mr-1" /> Edit
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 self-stretch justify-center border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6">
                        <Button
                          size="sm"
                          onClick={() => handleApproveSeller(sellerId, true)}
                          disabled={Boolean(isLoadingAction)}
                          className="h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-2 shadow-xs px-4"
                        >
                          {isLoadingAction ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                          )}
                          <span>Approve Seller & Listings</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenRejectModal(sellerId, "seller")}
                          disabled={Boolean(isLoadingAction)}
                          className="h-9 text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Reject Application</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. Pending Products Tab */}
      {activeTab === "products" && (
        <div className="space-y-4">
          {productsLoading ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
              Loading pending machinery listings...
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold font-heading mb-1 text-slate-900">
                  No Pending Products
                </h3>
                <p className="text-xs text-slate-500">
                  All submitted machinery and raw material listings have been reviewed.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredProducts.map((p: any) => {
                const productId = String(p._id);
                const isLoadingAction = actionLoading === `product-${productId}`;
                const sellerName = p.seller?.name || "Seller";
                const companyName = p.company?.name || p.seller?.company?.name || "";

                return (
                  <Card key={productId} className="hover:border-slate-300 transition-all">
                    <CardContent className="p-4 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
                      <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 relative shrink-0 border border-slate-200 shadow-xs">
                          {p.images?.[0] ? (
                            <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                          ) : (
                            <Package className="w-8 h-8 text-slate-400 m-auto" />
                          )}
                        </div>

                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold font-heading text-sm sm:text-base text-slate-900 truncate" title={p.name}>
                              {p.name}
                            </h3>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold">
                              Needs Approval
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 font-mono">
                            <span className="bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-700 text-[11px]">
                              Ref: {p.referenceNumber}
                            </span>
                            <span className="font-bold text-slate-900">
                              {p.currency} {p.price?.toLocaleString()}
                            </span>
                            {p.category?.name && (
                              <span className="text-slate-500">• {p.category.name}</span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium pt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Listed by: <strong>{companyName || sellerName}</strong></span>
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end lg:self-center w-full lg:w-auto justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEditProduct(p)}
                          className="h-9 text-xs font-semibold px-3 rounded-xl border-slate-200 flex items-center gap-1"
                        >
                          <Pencil className="w-3.5 h-3.5 text-primary" />
                          <span>Edit Details</span>
                        </Button>
                        {p.slug && (
                          <Link href={`/products/${p.slug}`} target="_blank">
                            <Button size="sm" variant="outline" className="h-9 text-xs font-semibold px-3 rounded-xl border-slate-200">
                              <Eye className="w-3.5 h-3.5 mr-1" /> View Listing
                            </Button>
                          </Link>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleApproveProduct(productId)}
                          disabled={Boolean(isLoadingAction)}
                          className="h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5 px-4"
                        >
                          {isLoadingAction ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          )}
                          <span>Approve Listing</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenRejectModal(productId, "product")}
                          disabled={Boolean(isLoadingAction)}
                          className="h-9 text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl"
                        >
                          <XCircle className="w-3.5 h-3.5 shrink-0" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Seller Full Profile & Products Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="w-[94vw] sm:w-full max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-white rounded-2xl border-slate-200 shadow-2xl">
          <DialogHeader className="p-5 sm:p-6 pb-3 sm:pb-4 border-b border-slate-200 shrink-0 bg-slate-50/50">
            {detailLoading ? (
              <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                <span>Loading seller profile & listings...</span>
              </div>
            ) : detailUser ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl orange-gradient flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
                    {detailUser.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold font-heading text-slate-900 leading-snug">
                      {detailUser.name}
                    </DialogTitle>
                    <p className="text-xs text-slate-500 font-medium">
                      {detailCompany?.name ? `${detailCompany.name} • ${detailUser.email}` : detailUser.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApproveSeller(String(detailUser._id), true)}
                    className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve Seller & All Listings
                  </Button>
                </div>
              </div>
            ) : null}
          </DialogHeader>

          {detailUser && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Modal Tabs */}
              <div className="flex items-center gap-2 px-5 sm:px-6 pt-3 border-b border-slate-200 shrink-0 bg-slate-50/30">
                <button
                  onClick={() => setModalActiveTab("company")}
                  className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                    modalActiveTab === "company"
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Storefront & Documents
                </button>
                <button
                  onClick={() => setModalActiveTab("products")}
                  className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                    modalActiveTab === "products"
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <span>Listed Products ({detailProducts.length})</span>
                  {detailPendingProducts.length > 0 && (
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 text-[9px] px-1.5 py-0 font-bold">
                      {detailPendingProducts.length} Pending
                    </Badge>
                  )}
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                {modalActiveTab === "company" && (
                  <div className="space-y-4">
                    {detailCompany ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Company Name</span>
                            <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                              <Building2 className="w-4 h-4 text-primary shrink-0" />
                              <span>{detailCompany.name}</span>
                            </p>
                          </div>

                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Business Type</span>
                            <p className="text-sm font-bold text-slate-900">{detailCompany.businessType || "Manufacturer"}</p>
                          </div>

                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">GST Number</span>
                            <p className="text-sm font-bold text-slate-900 font-mono">{detailCompany.gstNumber || "Not Provided"}</p>
                          </div>

                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">PAN Number</span>
                            <p className="text-sm font-bold text-slate-900 font-mono">{detailCompany.panNumber || "Not Provided"}</p>
                          </div>
                        </div>

                        {/* Documents */}
                        {Array.isArray(detailCompany.documents) && detailCompany.documents.length > 0 && (
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Verification Certificates & Docs</span>
                            <div className="flex flex-wrap gap-2 pt-1">
                              {detailCompany.documents.map((doc: any, idx: number) => (
                                <a
                                  key={idx}
                                  href={typeof doc === "string" ? doc : doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:text-primary flex items-center gap-1.5 transition-colors"
                                >
                                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Document #{idx + 1}</span>
                                  <ExternalLink className="w-3 h-3 ml-0.5" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-slate-400 text-xs">
                        No company storefront registered yet.
                      </div>
                    )}
                  </div>
                )}

                {modalActiveTab === "products" && (
                  <div className="space-y-3">
                    {detailProducts.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 text-xs">
                        No products added by this seller yet.
                      </div>
                    ) : (
                      detailProducts.map((p: any) => (
                        <div
                          key={p._id}
                          className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 relative shrink-0 border border-slate-200">
                              {p.images?.[0] ? (
                                <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                              ) : (
                                <Package className="w-5 h-5 text-slate-400 m-auto" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate" title={p.name}>
                                {p.name}
                              </h4>
                              <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500 font-mono">
                                <span>Ref: {p.referenceNumber}</span>
                                <span>•</span>
                                <span className="font-bold text-slate-900">{p.currency} {p.price?.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-bold px-2 py-0.5 ${
                                p.status === "APPROVED"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : p.status === "PENDING"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              {p.status}
                            </Badge>
                            {p.status === "PENDING" && (
                              <Button
                                size="sm"
                                onClick={() => handleApproveProduct(String(p._id))}
                                className="h-7 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-2.5"
                              >
                                Approve
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Reason Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6 space-y-4 border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-heading text-slate-900">
              Reject Application / Listing
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">
              Reason for Rejection (sent to user):
            </label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Incomplete GST documentation, inaccurate machine specs, or invalid corporate tax registration."
              className="h-28 text-xs bg-slate-50 border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setRejectModalOpen(false)} className="h-9 text-xs rounded-xl">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmReject}
              disabled={!rejectionReason.trim()}
              className="h-9 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
            >
              Confirm Rejection
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Create / Edit Product Modal */}
      <AdminProductModal
        open={productModalOpen}
        onOpenChange={setProductModalOpen}
        productToEdit={productToEdit}
      />
    </div>
  );
}
