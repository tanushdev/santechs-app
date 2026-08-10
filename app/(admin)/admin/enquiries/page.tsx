"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare, Search, Phone, Mail, User, Building2, Globe, Clock,
  ShieldCheck, ArrowRight, ShieldAlert, Lock, Unlock, Package, Calendar,
  Trash2, ChevronLeft, ChevronRight
} from "lucide-react";
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

const statuses = [
  "ALL", "NEW", "CONTACTED_BUYER", "SELLER_ASSIGNED", "NEGOTIATION",
  "QUOTATION_SENT", "INSPECTION_SCHEDULED", "DEAL_CLOSED", "REJECTED", "CANCELLED"
];

const statusColor: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  CONTACTED_BUYER: "bg-amber-50 text-amber-700 border-amber-200",
  SELLER_ASSIGNED: "bg-purple-50 text-purple-700 border-purple-200",
  NEGOTIATION: "bg-indigo-50 text-indigo-700 border-indigo-200",
  QUOTATION_SENT: "bg-sky-50 text-sky-700 border-sky-200",
  INSPECTION_SCHEDULED: "bg-pink-50 text-pink-700 border-pink-200",
  DEAL_CLOSED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  CANCELLED: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function AdminEnquiriesPage() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const PAGE_SIZE = 10;
  
  // Modal Edit States
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [buyerContactShared, setBuyerContactShared] = useState(false);
  const [sellerContactShared, setSellerContactShared] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: enquiryData, isLoading, refetch } = useQuery({
    queryKey: ["admin", "enquiries", selectedStatus, currentPage],
    queryFn: async () => {
      const base = selectedStatus === "ALL" ? "/api/admin/enquiries" : `/api/admin/enquiries?status=${selectedStatus}`;
      const sep = selectedStatus === "ALL" ? "?" : "&";
      const res = await fetch(`${base}${sep}page=${currentPage}&limit=${PAGE_SIZE}`);
      if (!res.ok) return { data: [], pagination: { total: 0, totalPages: 1 } };
      return await res.json();
    },
  });

  const enquiries = enquiryData?.data ?? [];
  const pagination = enquiryData?.pagination ?? { total: 0, totalPages: 1 };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this enquiry? This action cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/enquiries?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["admin", "enquiries"] });
      } else {
        alert("Failed to delete enquiry.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdate = async () => {
    if (!selectedEnquiry || !newStatus) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${selectedEnquiry._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          adminNotes,
          buyerContactShared,
          sellerContactShared
        }),
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["admin", "enquiries"] });
        setManageModalOpen(false);
        setSelectedEnquiry(null);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const filtered = enquiries.filter((e: any) => {
    const name = String(e.buyerName ?? "").toLowerCase();
    const company = String(e.buyerCompany ?? "").toLowerCase();
    const ref = String(e.referenceNumber ?? "").toLowerCase();
    const product = String(e.product?.name ?? "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || company.includes(q) || ref.includes(q) || product.includes(q);
  });

  const handleStatusFilterChange = (st: string) => {
    setSelectedStatus(st);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#e5e7eb]">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#75758a] font-bold">
            Platform Console
          </span>
          <h1 className="text-3xl font-normal tracking-tight text-black font-sans mt-1">
            Enquiry & Deal Pipeline
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            🔒 Super Admin Control — Verify buyer credentials and coordinate contact access.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference, buyer, product..."
            className="pl-9 rounded-full bg-slate-50 border-slate-200 focus-visible:ring-black"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        {statuses.map((st) => (
          <Button
            key={st}
            size="sm"
            variant={selectedStatus === st ? "default" : "outline"}
            onClick={() => handleStatusFilterChange(st)}
            className={`text-xs font-semibold rounded-full border transition-all ${
              selectedStatus === st
                ? "bg-black border-black text-white"
                : "bg-transparent border-[#e5e7eb] text-slate-600 hover:border-slate-400 hover:text-black"
            }`}
          >
            {st.replace(/_/g, " ")}
          </Button>
        ))}
      </div>

      {/* Pipeline List */}
      {isLoading ? (
        <div className="text-center py-20 text-slate-400 font-mono text-xs">
          Loading enquiries list...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border border-[#e5e7eb] rounded-2xl bg-[#eeece7]/20">
          <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-black mb-1">No Enquiries Found</h3>
          <p className="text-xs text-slate-500">
            No quote request deals match your selected filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((enquiry: any) => {
            const statusStyle = statusColor[enquiry.status] || "bg-slate-100 text-slate-700 border-slate-200";
            return (
              <div
                key={enquiry._id.toString()}
                className="bg-white border border-[#e5e7eb] rounded-2xl p-6 transition-all hover:border-slate-300 space-y-6"
              >
                {/* Header line */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e7eb] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#75758a]">
                      Ref #{enquiry.referenceNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusStyle}`}>
                      {enquiry.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(enquiry.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2.5 text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                      disabled={deletingId === enquiry._id.toString()}
                      onClick={() => handleDelete(enquiry._id.toString())}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Info layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                  
                  {/* Left Column: Product & Requirements */}
                  <div className="space-y-4">
                    {enquiry.product && (
                      <div className="flex items-center gap-3 bg-[#eeece7]/30 p-3 rounded-xl border border-[#e5e7eb]">
                        <Package className="w-5 h-5 text-black flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Target Listing</p>
                          <span className="text-sm font-bold text-black truncate block">
                            {enquiry.product.name}
                          </span>
                        </div>
                        {enquiry.product.price && (
                          <div className="text-right text-xs font-mono font-bold text-slate-900">
                            {enquiry.product.currency === "INR" ? "₹" : enquiry.product.currency}{" "}
                            {enquiry.product.price.toLocaleString("en-IN")}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-1">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#75758a]">
                        Requirement Summary
                      </p>
                      <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-line">
                        {enquiry.requirement || "No detailed requirement notes provided."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-mono">
                      {enquiry.quantity && (
                        <span>Qty: <strong>{enquiry.quantity}</strong></span>
                      )}
                      {enquiry.budget && (
                        <span>Budget: <strong>{enquiry.budget}</strong></span>
                      )}
                      {enquiry.timeline && (
                        <span>Timeline: <strong>{enquiry.timeline}</strong></span>
                      )}
                    </div>

                    {/* Deal Participants Section */}
                    <div className="border-t border-slate-100 pt-4 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Buyer Details */}
                      <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100/80 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                          <User className="w-3.5 h-3.5 text-primary" /> Buyer
                        </div>
                        <div className="text-xs space-y-1 text-slate-700">
                          <p className="font-bold text-black">{enquiry.buyerName}</p>
                          <p className="text-slate-500">{enquiry.buyerCompany} ({enquiry.buyerCountry})</p>
                          <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-100">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {enquiry.buyerEmail}</span>
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {enquiry.buyerPhone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Seller Details */}
                      <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100/80 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                          <Building2 className="w-3.5 h-3.5 text-primary" /> Seller
                        </div>
                        <div className="text-xs space-y-1 text-slate-700">
                          <p className="font-bold text-black">{enquiry.seller?.name || "Seller Owner"}</p>
                          <p className="text-slate-500">{enquiry.seller?.company?.name || "No Company Profile"}</p>
                          <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-100">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {enquiry.seller?.email || "N/A"}</span>
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {enquiry.seller?.phone || enquiry.seller?.company?.phone || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Mini Contact Summary Card */}
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#75758a]">
                        Contact Sharing Status
                      </p>
                      <div className="space-y-2">
                        
                        {/* Buyer access indicator */}
                        <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-white border border-slate-200">
                          <span className="text-slate-600 font-medium">Buyer Details</span>
                          {enquiry.buyerContactShared ? (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold text-[10px] flex items-center gap-1">
                              <Unlock className="w-3 h-3" /> Shared
                            </span>
                          ) : (
                            <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 font-bold text-[10px] flex items-center gap-1">
                              <Lock className="w-3 h-3 text-slate-400" /> Locked
                            </span>
                          )}
                        </div>

                        {/* Seller access indicator */}
                        <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-white border border-slate-200">
                          <span className="text-slate-600 font-medium">Seller Details</span>
                          {enquiry.sellerContactShared ? (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold text-[10px] flex items-center gap-1">
                              <Unlock className="w-3 h-3" /> Shared
                            </span>
                          ) : (
                            <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 font-bold text-[10px] flex items-center gap-1">
                              <Lock className="w-3 h-3 text-slate-400" /> Locked
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="w-full bg-black text-white hover:bg-neutral-800 rounded-full text-xs font-bold uppercase tracking-wider h-10"
                      onClick={() => {
                        setSelectedEnquiry(enquiry);
                        setNewStatus(enquiry.status);
                        setAdminNotes(enquiry.adminNotes ?? "");
                        setBuyerContactShared(enquiry.buyerContactShared ?? false);
                        setSellerContactShared(enquiry.sellerContactShared ?? false);
                        setManageModalOpen(true);
                      }}
                    >
                      Review & Manage Deal
                    </Button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-[#e5e7eb]">
          <p className="text-xs text-slate-500 font-mono">
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 rounded-full border-slate-200 text-xs font-bold"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - currentPage) <= 1)
              .reduce((acc: (number | string)[], p, idx, arr) => {
                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                typeof p === "string" ? (
                  <span key={`ellipsis-${idx}`} className="text-slate-400 text-xs px-1">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    className={`h-8 w-8 rounded-full text-xs font-bold transition-all ${
                      currentPage === p
                        ? "bg-black text-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 rounded-full border-slate-200 text-xs font-bold"
              disabled={currentPage >= pagination.totalPages}
              onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
            >
              Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Expanded Review & Manage Deal Modal */}
      <Dialog open={manageModalOpen} onOpenChange={setManageModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[92vh] flex flex-col p-0">
          
          <DialogHeader className="p-6 pb-4 border-b border-[#e5e7eb] shrink-0">
            <DialogTitle className="text-xl font-bold font-heading">
              Enquiry Review & Broker Control
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              Deals Manager Room · Ref #{selectedEnquiry?.referenceNumber}
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Layout Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
            
            {/* Split Section: Deal State vs. Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Column 1: Deal State, Notes & Target listing (7 Cols) */}
              <div className="md:col-span-6 space-y-5">
                
                {/* Product target card */}
                {selectedEnquiry?.product && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Target Listing</span>
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-black flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-slate-900 block truncate">{selectedEnquiry.product.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Ref: {selectedEnquiry.product.referenceNumber}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Deal Status Stage</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full h-11 text-sm border border-slate-200 rounded-xl px-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5"
                  >
                    {statuses.filter((s) => s !== "ALL").map((st) => (
                      <option key={st} value={st}>{st.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>

                {/* Admin Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Internal Broker Notes</label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Log calls, verify buyer specifications, note negotiation updates..."
                    className="min-h-[140px] text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-black/5 rounded-xl border-slate-200"
                  />
                </div>

              </div>

              {/* Column 2: Dual Contact Verification & Toggles (5 Cols) */}
              <div className="md:col-span-6 space-y-5">
                
                {/* Buyer Details Box */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" /> Buyer Profile
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-700 leading-relaxed font-sans">
                    <p><strong>Name:</strong> {selectedEnquiry?.buyerName}</p>
                    <p><strong>Company:</strong> {selectedEnquiry?.buyerCompany}</p>
                    <p><strong>Country:</strong> {selectedEnquiry?.buyerCountry}</p>
                    <p><strong>Email:</strong> {selectedEnquiry?.buyerEmail}</p>
                    <p><strong>Phone:</strong> {selectedEnquiry?.buyerPhone}</p>
                  </div>

                  {/* Share Contact Toggle */}
                  <label className="flex items-center gap-2.5 pt-2 border-t border-slate-200/60 mt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={buyerContactShared}
                      onChange={(e) => setBuyerContactShared(e.target.checked)}
                      className="w-4 h-4 rounded text-black border-slate-300 focus:ring-black accent-black cursor-pointer"
                    />
                    <div className="text-xs select-none">
                      <p className="font-bold text-slate-900">Share Buyer Contact</p>
                      <p className="text-[10px] text-slate-500">Allows the Seller to contact buyer directly</p>
                    </div>
                  </label>
                </div>

                {/* Seller Details Box */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" /> Seller Profile
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-700 leading-relaxed font-sans">
                    <p><strong>Owner Name:</strong> {selectedEnquiry?.seller?.name || "Seller Owner"}</p>
                    <p><strong>Company:</strong> {selectedEnquiry?.seller?.company?.name || "N/A"}</p>
                    <p><strong>Email:</strong> {selectedEnquiry?.seller?.email || "N/A"}</p>
                    <p><strong>Phone:</strong> {selectedEnquiry?.seller?.phone || selectedEnquiry?.seller?.company?.phone || "N/A"}</p>
                  </div>

                  {/* Share Contact Toggle */}
                  <label className="flex items-center gap-2.5 pt-2 border-t border-slate-200/60 mt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sellerContactShared}
                      onChange={(e) => setSellerContactShared(e.target.checked)}
                      className="w-4 h-4 rounded text-black border-slate-300 focus:ring-black accent-black cursor-pointer"
                    />
                    <div className="text-xs select-none">
                      <p className="font-bold text-slate-900">Share Seller Contact</p>
                      <p className="text-[10px] text-slate-500">Allows the Buyer to contact seller directly</p>
                    </div>
                  </label>
                </div>

              </div>

            </div>

          </div>

          {/* Action buttons */}
          <div className="p-4 border-t border-[#e5e7eb] flex justify-end gap-2 bg-slate-50 rounded-b-2xl shrink-0">
            <Button variant="outline" onClick={() => setManageModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-black text-white hover:bg-neutral-800 rounded-full px-6 text-xs uppercase tracking-wider font-semibold"
              disabled={isUpdating}
              onClick={handleUpdate}
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>

        </DialogContent>
      </Dialog>

    </div>
  );
}
