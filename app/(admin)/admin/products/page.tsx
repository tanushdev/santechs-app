"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, Search, CheckCircle2, XCircle, Eye, Building2, Calendar, MapPin } from "lucide-react";
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

export default function AdminPendingProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [detailProduct, setDetailProduct] = useState<Record<string, any> | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin", "products", "pending"],
    queryFn: async () => {
      const res = await fetch("/api/products?status=PENDING");
      if (!res.ok) return { items: [] };
      const json = await res.json();
      return json.data ?? { items: [] };
    },
  });

  const handleApprove = async (productId: string) => {
    setActionLoading(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedProductId || !rejectionReason) return;
    setActionLoading(selectedProductId);
    try {
      const res = await fetch(`/api/admin/products/${selectedProductId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason }),
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
        setRejectModalOpen(false);
        setSelectedProductId(null);
        setRejectionReason("");
      }
    } finally {
      setActionLoading(null);
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
            Pending Product Approvals
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review machine specifications and images before publishing to the live marketplace.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pending products..."
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">
          Loading pending product listings...
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold font-heading mb-1">
              No Pending Products
            </h3>
            <p className="text-sm text-muted-foreground">
              All seller product submissions have been reviewed and processed!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((product: Record<string, unknown>) => {
            const company = (product.company as Record<string, unknown>) ?? {};
            const productId = String(product._id);
            const images = (product.images as string[]) ?? [];

            return (
              <Card key={productId}>
                <CardContent className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="relative w-20 h-20 rounded-xl bg-muted overflow-hidden flex-shrink-0 border border-border">
                      {images.length > 0 ? (
                        <Image
                          src={images[0]}
                          alt={String(product.name)}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                          <Package className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold font-heading text-base truncate">
                          {String(product.name)}
                        </h3>
                        <Badge variant="outline" className="status-pending text-[10px]">
                          Pending Approval
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Ref: <span className="font-mono">{String(product.referenceNumber)}</span> · Seller: {String(company.name ?? "Seller")}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1 text-xs">
                        <span className="font-semibold text-foreground">
                          {String(product.currency ?? "USD")} {Number(product.price ?? 0).toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">| Condition: {String(product.condition ?? "USED")}</span>
                        {Boolean(product.yearOfManufacture) && (
                          <span className="text-muted-foreground">| Year: {String(product.yearOfManufacture)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
                      disabled={actionLoading === productId}
                      onClick={() => setDetailProduct(product)}
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      Review Details
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                      disabled={actionLoading === productId}
                      onClick={() => handleApprove(productId)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Approve & Publish
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      disabled={actionLoading === productId}
                      onClick={() => {
                        setSelectedProductId(productId);
                        setRejectModalOpen(true);
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-1.5" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Reject Product Submission
            </DialogTitle>
            <DialogDescription>
              Specify the reason for rejection (e.g., incomplete specifications or low-quality images). The seller will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Missing serial number and low resolution photos..."
              className="min-h-[100px]"
            />
             <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={!rejectionReason}
                onClick={handleReject}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deep Specification Review Modal */}
      <Dialog open={!!detailProduct} onOpenChange={(open) => !open && setDetailProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8">
          {detailProduct && (
            <div className="space-y-6">
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="text-xl font-bold text-black font-sans">
                  Review Listing Specifications
                </DialogTitle>
                <DialogDescription className="font-mono text-xs">
                  Reference No: {String(detailProduct.referenceNumber)} · Seller ID: {String(detailProduct.seller)}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Column: Visual Assets & Description */}
                <div className="space-y-5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Visuals & Story</h4>
                  
                  {/* Photo grid preview */}
                  {Array.isArray(detailProduct.images) && detailProduct.images.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {detailProduct.images.map((img: string, idx: number) => (
                        <div key={idx} className="relative aspect-video rounded-xl bg-slate-50 overflow-hidden border border-slate-100">
                          <Image src={img} alt={`Asset Preview ${idx}`} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="aspect-video w-full rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300">
                      <Package className="w-10 h-10" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-900">Description</h5>
                    <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl leading-relaxed whitespace-pre-line border">
                      {String(detailProduct.description || "No description provided.")}
                    </p>
                  </div>

                  {/* Brochure PDF if any */}
                  {detailProduct.brochurePdf && (
                    <a
                      href={String(detailProduct.brochurePdf)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-slate-950 text-white font-bold text-[10px] uppercase tracking-wider rounded-full px-4.5 py-2.5 hover:bg-slate-800 transition-all shadow-sm"
                    >
                      View Machine Catalog/Brochure (PDF)
                    </a>
                  )}
                </div>

                {/* Right Column: Spec attributes Grid */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-3">Technical Specifications</h4>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 bg-slate-50 p-5 rounded-2xl border text-xs text-slate-600">
                      <p><strong>Brand / Manufacturer:</strong> {String(detailProduct.manufacturer || "N/A")}</p>
                      <p><strong>Machine Model:</strong> {String(detailProduct.machineModel || "N/A")}</p>
                      <p><strong>Year of Manufacture:</strong> {String(detailProduct.yearOfManufacture || "N/A")}</p>
                      <p><strong>Condition:</strong> {String(detailProduct.condition || "USED")}</p>
                      <p><strong>Production Capacity:</strong> {String(detailProduct.productionCapacity || "N/A")}</p>
                      <p><strong>No. of Positions:</strong> {String(detailProduct.numberOfPositions ?? "N/A")}</p>
                      <p><strong>No. of Spindles:</strong> {String(detailProduct.numberOfSpindles ?? "N/A")}</p>
                      <p><strong>Quantity Available:</strong> {String(detailProduct.quantity ?? 1)}</p>
                      <p><strong>Price Listed:</strong> {String(detailProduct.currency || "USD")} {Number(detailProduct.price ?? 0).toLocaleString()}</p>
                      <p><strong>Negotiable:</strong> {detailProduct.priceNegotiable ? "Yes" : "No"}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-3">Service & Accessories Inclusion</h4>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600">
                      <p><strong>Utilities Included:</strong> {detailProduct.utilitiesIncluded ? "Yes" : "No"}</p>
                      <p><strong>Accessories Included:</strong> {detailProduct.accessoriesIncluded ? "Yes" : "No"}</p>
                      <p><strong>Spare Parts Included:</strong> {detailProduct.sparePartsIncluded ? "Yes" : "No"}</p>
                      <p><strong>Installation Support:</strong> {detailProduct.installationSupport ? "Yes" : "No"}</p>
                      <p><strong>Relocation Support:</strong> {detailProduct.relocationSupport ? "Yes" : "No"}</p>
                      <p><strong>Dismantling Support:</strong> {detailProduct.dismantlingSupport ? "Yes" : "No"}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-2">Location of Asset</h4>
                    <p className="text-xs text-slate-600 flex items-start gap-1.5 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                      <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        {detailProduct.location
                          ? [
                              (detailProduct.location as any).street,
                              (detailProduct.location as any).city,
                              (detailProduct.location as any).state,
                              (detailProduct.location as any).country,
                              (detailProduct.location as any).pincode,
                            ]
                              .filter(Boolean)
                              .join(", ")
                          : "No Location Specified"}
                      </span>
                    </p>
                  </div>
                </div>

              </div>

              {/* Approve / Reject Actions inside the modal */}
              <div className="border-t pt-5 flex items-center justify-between gap-4">
                <Button variant="outline" onClick={() => setDetailProduct(null)} className="font-semibold text-xs rounded-xl h-10 px-5">
                  Close Preview
                </Button>
                
                <div className="flex items-center gap-3">
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl h-10 px-5"
                    disabled={actionLoading === String(detailProduct._id)}
                    onClick={() => {
                      handleApprove(String(detailProduct._id));
                      setDetailProduct(null);
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Approve & Publish
                  </Button>
                  <Button
                    variant="outline"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10 font-bold text-xs rounded-xl h-10 px-5"
                    disabled={actionLoading === String(detailProduct._id)}
                    onClick={() => {
                      setSelectedProductId(String(detailProduct._id));
                      setRejectModalOpen(true);
                      setDetailProduct(null);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-1.5" />
                    Reject Submission
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
