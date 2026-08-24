"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare, Search, Phone, Mail, User, Building2, Globe, Clock,
  ShieldCheck, ArrowRight, ShieldAlert, Lock, Unlock, Package, Calendar,
  Trash2, ChevronLeft, ChevronRight, Send, CheckCircle2, Layers, AlertCircle, Share2, Sparkles, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const PAGE_SIZE = 10;

  // Fetch enquiries
  const { data: enquiryData, isLoading } = useQuery({
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

  const filtered = enquiries.filter((e: any) => {
    const name = String(e.buyerName ?? "").toLowerCase();
    const company = String(e.buyerCompany ?? "").toLowerCase();
    const ref = String(e.referenceNumber ?? "").toLowerCase();
    const product = String(e.product?.name ?? "").toLowerCase();
    const originalSellerName = String(e.originalSeller?.company?.name || e.originalSeller?.name || "").toLowerCase();
    const assignedSellerName = String(e.assignedSeller?.company?.name || e.assignedSeller?.name || "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || company.includes(q) || ref.includes(q) || product.includes(q) || originalSellerName.includes(q) || assignedSellerName.includes(q);
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
            🔒 Super Admin Intermediary Control — Buyer requests are routed privately. Choose which seller receives each lead.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference, buyer, seller..."
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
            const originalSeller = enquiry.originalSeller || enquiry.seller;
            const assignedSeller = enquiry.assignedSeller;
            const isForwarded = enquiry.isForwardedToSeller;
            const product = enquiry.product;

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
                    {isForwarded ? (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Forwarded to Seller
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-600" /> Admin Review Only (Seller Not Alerted)
                      </span>
                    )}
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
                  
                  {/* Left Column: Product, Lead Routing & Buyer Details */}
                  <div className="space-y-4">
                    {product && (
                      <div className="flex items-center gap-3 bg-[#eeece7]/30 p-3.5 rounded-xl border border-[#e5e7eb]">
                        <Package className="w-5 h-5 text-black flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Target Listing</span>
                            {product.subCategory?.name && (
                              <Badge variant="outline" className="text-[9px] font-bold bg-white text-orange-600 border-orange-200 py-0 px-1.5">
                                {product.subCategory.name}
                              </Badge>
                            )}
                            {product.category?.name && (
                              <Badge variant="outline" className="text-[9px] font-bold bg-white text-slate-600 border-slate-200 py-0 px-1.5">
                                {product.category.name}
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm font-bold text-black truncate block">
                            {product.name}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#75758a]">
                        Buyer Requirement Notes
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

                    {/* Deal Participants & Seller Routing Row */}
                    <div className="border-t border-slate-100 pt-4 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Buyer Details */}
                      <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100/80 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                          <User className="w-3.5 h-3.5 text-primary" /> Buyer Credentials
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

                      {/* Seller Lead Assignment Details */}
                      <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#ff7759]" /> Assigned Seller
                          </span>
                          {isForwarded ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] py-0 font-semibold">
                              Lead Sent
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] py-0 font-semibold">
                              Pending Routing
                            </Badge>
                          )}
                        </div>

                        <div className="text-xs space-y-1 text-slate-700">
                          <p className="font-bold text-black">
                            {assignedSeller?.company?.name || assignedSeller?.name || originalSeller?.company?.name || originalSeller?.name || "No Seller Assigned"}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {originalSeller?._id === assignedSeller?._id || !assignedSeller
                              ? "(Original Product Lister)"
                              : `(Re-routed by Admin • Original: ${originalSeller?.company?.name || originalSeller?.name || "N/A"})`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Control & Routing Summary Card */}
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#75758a]">
                        Lead Intermediary Status
                      </p>

                      <div className="space-y-2">
                        {/* Lead Forwarding Indicator */}
                        <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Seller Alert Status</span>
                          {isForwarded ? (
                            <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Forwarded to Storefront
                            </p>
                          ) : (
                            <p className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5" /> Private to Super Admin
                            </p>
                          )}
                        </div>

                        {/* Buyer access indicator */}
                        <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-white border border-slate-200">
                          <span className="text-slate-600 font-medium">Buyer Phone/Email</span>
                          {enquiry.buyerContactShared ? (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold text-[10px] flex items-center gap-1">
                              <Unlock className="w-3 h-3" /> Shared
                            </span>
                          ) : (
                            <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 font-bold text-[10px] flex items-center gap-1">
                              <Lock className="w-3 h-3 text-slate-400" /> Hidden
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="w-full bg-black text-white hover:bg-neutral-800 rounded-full text-xs font-bold uppercase tracking-wider h-10 cursor-pointer"
                      onClick={() => router.push(`/admin/enquiries/${enquiry._id}`)}
                    >
                      Route Lead & Manage Deal
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

    </div>
  );
}
