"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Building2, CheckCircle2, XCircle, Clock, Search, ShieldAlert, Mail, Phone, MapPin, Globe, Package, Eye } from "lucide-react";
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

export default function AdminSellersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [detailSeller, setDetailSeller] = useState<Record<string, any> | null>(null);

  const { data: sellers, isLoading } = useQuery({
    queryKey: ["admin", "sellers", "pending"],
    queryFn: async () => {
      const res = await fetch("/api/admin/sellers?status=PENDING");
      if (!res.ok) return [];
      const json = await res.json();
      return json.data ?? [];
    },
  });

  const handleApprove = async (sellerId: string) => {
    setActionLoading(sellerId);
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["admin", "sellers"] });
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedSellerId || !rejectionReason) return;
    setActionLoading(selectedSellerId);
    try {
      const res = await fetch(`/api/admin/sellers/${selectedSellerId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason }),
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["admin", "sellers"] });
        setRejectModalOpen(false);
        setSelectedSellerId(null);
        setRejectionReason("");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = (sellers ?? []).filter((s: Record<string, unknown>) => {
    const name = String(s.name ?? "").toLowerCase();
    const email = String(s.email ?? "").toLowerCase();
    const company = String((s.company as Record<string, string>)?.name ?? "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q) || company.includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">
            Pending Seller Registrations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and verify seller applications before they can list products.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pending sellers..."
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">
          Loading pending sellers...
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold font-heading mb-1">
              All Caught Up!
            </h3>
            <p className="text-sm text-muted-foreground">
              No pending seller registration applications at this time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((seller: Record<string, unknown>) => {
            const company = (seller.company as Record<string, unknown>) ?? {};
            const sellerId = String(seller._id);
            return (
              <Card key={sellerId}>
                <CardContent className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl orange-gradient flex items-center justify-center text-white font-bold text-lg">
                        {String(seller.name).charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold font-heading text-base">
                            {String(seller.name)}
                          </h3>
                          <Badge variant="outline" className="status-pending text-[10px]">
                            Pending Review
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {String(seller.email)}
                        </p>
                      </div>
                    </div>

                    {/* Company Info */}
                    {Boolean(company.name) && (
                      <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-border/50 pb-2">
                          <div className="font-bold flex items-center gap-1.5 text-foreground text-sm">
                            <Building2 className="w-4 h-4 text-primary" />
                            {String(company.name)}
                          </div>
                           {Boolean(company.website) && (
                            <a
                              href={String(company.website).startsWith("http") ? String(company.website) : `https://${company.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline font-semibold flex items-center gap-1"
                            >
                              <Globe className="w-3.5 h-3.5" /> Visit Website
                            </a>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
                          <div className="space-y-1">
                            <p className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>
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
                            {Boolean(company.gstNumber) && <p><strong>GST Number:</strong> {String(company.gstNumber)}</p>}
                            {Boolean(company.panNumber) && <p><strong>PAN Number:</strong> {String(company.panNumber)}</p>}
                            <p><strong>Contact Phone:</strong> {String(company.phone ?? seller.phone ?? "N/A")}</p>
                          </div>
                        </div>

                        {/* Documents */}
                        {Array.isArray(company.documents) && company.documents.length > 0 && (
                          <div className="border-t border-border/50 pt-2 space-y-1.5">
                            <p className="font-bold text-slate-700">Verification Documents:</p>
                            <div className="flex flex-wrap gap-2">
                              {company.documents.map((doc: any, idx: number) => (
                                <a
                                  key={idx}
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-white hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-1 text-[11px] font-semibold text-slate-600 hover:text-black transition-all flex items-center gap-1.5"
                                >
                                  <Package className="w-3 h-3 text-[#ff7759]" />
                                  {doc.name || `Document ${idx + 1}`}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
                      disabled={actionLoading === sellerId}
                      onClick={() => setDetailSeller(seller)}
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      Review Profile
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                      disabled={actionLoading === sellerId}
                      onClick={() => handleApprove(sellerId)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Approve Seller
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      disabled={actionLoading === sellerId}
                      onClick={() => {
                        setSelectedSellerId(sellerId);
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
            <DialogTitle className="text-destructive flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              Reject Seller Application
            </DialogTitle>
            <DialogDescription>
              Please provide a clear reason for rejecting this seller registration. An email notification will be sent to the seller.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Incomplete business documents or unverified tax registration..."
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

      {/* Deep Company Profile Verification Modal */}
      <Dialog open={!!detailSeller} onOpenChange={(open) => !open && setDetailSeller(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8">
          {detailSeller && (() => {
            const company = (detailSeller.company as Record<string, any>) ?? {};
            return (
              <div className="space-y-6">
                <DialogHeader className="border-b pb-4">
                  <DialogTitle className="text-xl font-bold text-black font-sans">
                    Review Corporate Registration
                  </DialogTitle>
                  <DialogDescription className="font-mono text-xs">
                    Applicant Name: {String(detailSeller.name)} · Account Email: {String(detailSeller.email)}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Left Column: Business Metadata */}
                  <div className="space-y-5 text-xs text-slate-600">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Business Profile</h4>
                    
                    <div className="bg-slate-50 p-5 rounded-2xl border space-y-2.5">
                      <p className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                        <Building2 className="w-4 h-4 text-primary" />
                        {String(company.name || "No Company Setup Yet")}
                      </p>
                      <p><strong>Business Type:</strong> {String(company.businessType || "Manufacturer")}</p>
                      <p><strong>Established:</strong> {String(company.establishedYear ?? "N/A")}</p>
                      <p><strong>Employee Count:</strong> {String(company.employeeCount || "N/A")}</p>
                      <p><strong>Annual Turnover:</strong> {String(company.turnover || "N/A")}</p>
                      {company.website && (
                        <p>
                          <strong>Website: </strong>
                          <a
                            href={String(company.website).startsWith("http") ? String(company.website) : `https://${company.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-semibold"
                          >
                            {String(company.website)}
                          </a>
                        </p>
                      )}
                    </div>

                    {company.description && (
                      <div className="space-y-1.5">
                        <h5 className="font-bold text-slate-900">About the Storefront</h5>
                        <p className="bg-slate-50 p-4 rounded-xl leading-relaxed whitespace-pre-line border text-[11px] text-slate-500">
                          {company.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Verification details */}
                  <div className="space-y-6 text-xs text-slate-600">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-3">Verification Details</h4>
                      
                      <div className="bg-slate-50 p-5 rounded-2xl border space-y-2.5">
                        <p><strong>GST Number:</strong> <span className="font-mono text-slate-800 font-bold">{String(company.gstNumber || "N/A")}</span></p>
                        <p><strong>PAN Number:</strong> <span className="font-mono text-slate-800 font-bold">{String(company.panNumber || "N/A")}</span></p>
                        <p><strong>Contact Phone:</strong> {String(company.phone || detailSeller.phone || "N/A")}</p>
                        <p><strong>Contact Email:</strong> {String(company.email || detailSeller.email || "N/A")}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-2">Registered Address</h4>
                      <p className="flex items-start gap-1.5 bg-slate-50 p-3 rounded-xl border">
                        <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>
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
                    </div>

                    {/* Verification Documents */}
                    {Array.isArray(company.documents) && company.documents.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-2.5">Uploaded Credentials</h4>
                        <div className="flex flex-col gap-2">
                          {company.documents.map((doc: any, idx: number) => (
                            <a
                              key={idx}
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-slate-50 hover:bg-slate-100 border rounded-xl p-2.5 font-bold text-slate-700 hover:text-black transition-all flex items-center justify-between"
                            >
                              <span className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-[#ff7759]" />
                                {doc.name || `Document ${idx + 1}`}
                              </span>
                              <span className="text-[10px] text-primary uppercase font-mono tracking-wider font-extrabold">Open File →</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Approve / Reject Actions inside the modal */}
                <div className="border-t pt-5 flex items-center justify-between gap-4">
                  <Button variant="outline" onClick={() => setDetailSeller(null)} className="font-semibold text-xs rounded-xl h-10 px-5">
                    Close Preview
                  </Button>
                  
                  <div className="flex items-center gap-3">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl h-10 px-5"
                      disabled={actionLoading === String(detailSeller._id)}
                      onClick={() => {
                        handleApprove(String(detailSeller._id));
                        setDetailSeller(null);
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Approve Seller
                    </Button>
                    <Button
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10 font-bold text-xs rounded-xl h-10 px-5"
                      disabled={actionLoading === String(detailSeller._id)}
                      onClick={() => {
                        setSelectedSellerId(String(detailSeller._id));
                        setRejectModalOpen(true);
                        setDetailSeller(null);
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-1.5" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
