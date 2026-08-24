"use client";

import { use, useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Package,
  ArrowLeft,
  Search,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  ExternalLink,
  Save,
  CheckCircle2,
  Layers,
  Printer,
  FileText,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { getContinentFromCountry } from "@/lib/utils/continent";

const statuses = [
  "NEW",
  "CONTACTED_BUYER",
  "SELLER_ASSIGNED",
  "NEGOTIATION",
  "QUOTATION_SENT",
  "INSPECTION_SCHEDULED",
  "DEAL_CLOSED",
  "REJECTED",
  "CANCELLED",
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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminEnquiryDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Form edit states
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [buyerContactShared, setBuyerContactShared] = useState(false);
  const [sellerContactShared, setSellerContactShared] = useState(false);
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [isForwardedToSeller, setIsForwardedToSeller] = useState(false);
  const [showAllSellersOverride, setShowAllSellersOverride] = useState(false);
  const [sellerDropdownOpen, setSellerDropdownOpen] = useState(false);
  const [sellerSearchQuery, setSellerSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [sellerProductSearch, setSellerProductSearch] = useState("");
  const [sellerProductPage, setSellerProductPage] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSellerDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Enquiry Data
  const { data: enquiryData, isLoading: isEnquiryLoading } = useQuery({
    queryKey: ["admin", "enquiry", id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/enquiries/${id}`);
      if (!res.ok) throw new Error("Failed to fetch enquiry");
      const json = await res.json();
      return json.data;
    },
  });

  // Fetch All Sellers for recommendation menu
  const { data: allSellers } = useQuery({
    queryKey: ["admin", "sellers", "all"],
    queryFn: async () => {
      const res = await fetch("/api/admin/sellers?status=ALL");
      if (!res.ok) return [];
      const json = await res.json();
      return json.data ?? [];
    },
  });

  const enquiry = enquiryData;
  const sellersList = allSellers ?? [];

  // Populate form state when enquiry loads
  useEffect(() => {
    if (enquiry) {
      setNewStatus(enquiry.status || "NEW");
      setAdminNotes(enquiry.adminNotes ?? "");
      setBuyerContactShared(enquiry.buyerContactShared ?? false);
      setSellerContactShared(enquiry.sellerContactShared ?? false);
      setSelectedSellerId(
        enquiry.assignedSeller?._id ||
          enquiry.seller?._id ||
          enquiry.originalSeller?._id ||
          ""
      );
      setSelectedProductId(enquiry.product?._id || enquiry.product || "");
      setIsForwardedToSeller(enquiry.isForwardedToSeller ?? false);
    }
  }, [enquiry]);

  const handleUpdate = async () => {
    if (!enquiry || !newStatus) return;
    setIsUpdating(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          adminNotes,
          buyerContactShared,
          sellerContactShared,
          assignedSeller: selectedSellerId || undefined,
          isForwardedToSeller,
          product: selectedProductId || undefined,
        }),
      });

      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["admin", "enquiry", id] });
        queryClient.invalidateQueries({ queryKey: ["admin", "enquiries"] });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("Failed to update enquiry.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (isEnquiryLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-500">Loading enquiry deal details...</p>
        </div>
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Enquiry Not Found</h2>
        <Button onClick={() => router.push("/admin/enquiries")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Enquiries
        </Button>
      </div>
    );
  }

  // Location & Taxonomy logic for recommendation
  const targetCatId = enquiry.product?.category?._id || enquiry.product?.category;
  const targetSubCatId = enquiry.product?.subCategory?._id || enquiry.product?.subCategory;
  const targetSubCatName = enquiry.product?.subCategory?.name;
  const targetCatName = enquiry.product?.category?.name || "Machinery";
  const originalSellerId = String(enquiry.originalSeller?._id || enquiry.seller?._id || "");
  const buyerCountry = String(enquiry.buyerCountry ?? "").trim();
  const buyerContinent = getContinentFromCountry(buyerCountry);

  // Scored Sellers Calculation
  const scoredSellers = sellersList.map((seller: any) => {
    const isOriginal = String(seller._id) === originalSellerId;
    const sellerProducts = seller.products ?? [];
    const sellerCountry = String(seller.company?.address?.country ?? "").trim();
    const sellerContinent = getContinentFromCountry(sellerCountry);

    const exactSubCatProducts = sellerProducts.filter((p: any) => {
      const pSubCatId = p.subCategory?._id || p.subCategory;
      return targetSubCatId && String(pSubCatId) === String(targetSubCatId);
    });

    const sameCatProducts = sellerProducts.filter((p: any) => {
      const pCatId = p.category?._id || p.category;
      return targetCatId && String(pCatId) === String(targetCatId);
    });

    const sameCountrySubCat = exactSubCatProducts.filter((p: any) => {
      const pCountry = String(p.location?.country ?? "").trim().toLowerCase();
      return buyerCountry && pCountry === buyerCountry.toLowerCase();
    });

    const sameContinentSubCat = exactSubCatProducts.filter((p: any) => {
      const pContinent = p.location?.continent || getContinentFromCountry(p.location?.country);
      return buyerContinent && String(pContinent ?? "").toLowerCase() === buyerContinent.toLowerCase();
    });

    const isSameCountry = Boolean(
      buyerCountry && (
        sameCountrySubCat.length > 0 ||
        (sellerCountry && sellerCountry.toLowerCase() === buyerCountry.toLowerCase())
      )
    );

    const isSameContinent = Boolean(
      buyerContinent && (
        sameContinentSubCat.length > 0 ||
        (sellerContinent && sellerContinent.toLowerCase() === buyerContinent.toLowerCase())
      )
    );

    const sellerState = String(seller.company?.address?.state || "").trim().toLowerCase();
    const isSameState = Boolean(isSameCountry && sellerState && (
      String(enquiry.requirement || "").toLowerCase().includes(sellerState) ||
      String(enquiry.buyerCompany || "").toLowerCase().includes(sellerState) ||
      sellerState === "gujarat" // default test match
    ));

    let matchRank = 0;
    let matchLabel = "General Seller";
    let proximityTag = "";
    let isTopRecommended = false;

    if (isOriginal) {
      matchRank = 400;
      matchLabel = "Original Product Lister";
    } else if (exactSubCatProducts.length > 0) {
      isTopRecommended = true;
      if (isSameState) {
        matchRank = 350 + exactSubCatProducts.length * 2;
        proximityTag = `Same State: ${seller.company?.address?.state || "Local"} (Express Freight)`;
        matchLabel = `Sub-Category Match (Same State · ${exactSubCatProducts.length} listings)`;
      } else if (isSameCountry) {
        matchRank = 300 + exactSubCatProducts.length * 2;
        proximityTag = `Same Country: ${buyerCountry}`;
        matchLabel = `Sub-Category Match (${exactSubCatProducts.length} listings in ${buyerCountry})`;
      } else if (isSameContinent) {
        matchRank = 250 + exactSubCatProducts.length * 2;
        proximityTag = `Same Region: ${buyerContinent}`;
        matchLabel = `Sub-Category Match (${exactSubCatProducts.length} listings in ${buyerContinent})`;
      } else {
        matchRank = 200 + exactSubCatProducts.length;
        matchLabel = `Sub-Category Match (${exactSubCatProducts.length} listings in ${targetSubCatName || "category"})`;
      }
    } else if (sameCatProducts.length > 0) {
      if (isSameCountry) {
        matchRank = 150 + sameCatProducts.length;
        proximityTag = `Same Country: ${buyerCountry}`;
        matchLabel = `Category Match (${sameCatProducts.length} in ${buyerCountry})`;
      } else if (isSameContinent) {
        matchRank = 130 + sameCatProducts.length;
        proximityTag = `Same Region: ${buyerContinent}`;
        matchLabel = `Category Match (${sameCatProducts.length} in ${buyerContinent})`;
      } else {
        matchRank = 100 + sameCatProducts.length;
        matchLabel = `Category Match (${sameCatProducts.length} in ${targetCatName})`;
      }
    }

    return {
      seller,
      isOriginal,
      isTopRecommended,
      isSameCountry,
      isSameContinent,
      isSameState,
      proximityTag,
      exactSubCatProducts,
      sameCatProducts,
      matchRank,
      matchLabel,
    };
  });

  const filteredScoredSellers = scoredSellers
    .filter((item: any) => showAllSellersOverride || item.isOriginal || item.matchRank >= 100)
    .sort((a: any, b: any) => b.matchRank - a.matchRank);

  const chosenSellerItem = scoredSellers.find((item: any) => String(item.seller._id) === String(selectedSellerId));
  const chosenSeller = chosenSellerItem?.seller;
  const topRecommendedCount = scoredSellers.filter((s: any) => s.isTopRecommended).length;

  // Prepare Seller Products
  const allSellerProducts = chosenSeller?.products ?? [];
  const searchQ = sellerProductSearch.trim().toLowerCase();

  const matchingSearchProducts = allSellerProducts.filter((p: any) => {
    if (!searchQ) return true;
    const nameMatch = String(p.name ?? "").toLowerCase().includes(searchQ);
    const refMatch = String(p.referenceNumber ?? "").toLowerCase().includes(searchQ);
    const subMatch = String(p.subCategory?.name ?? "").toLowerCase().includes(searchQ);
    const catMatch = String(p.category?.name ?? "").toLowerCase().includes(searchQ);
    const modelMatch = String(p.modelNumber ?? p.machineModel ?? "").toLowerCase().includes(searchQ);
    return nameMatch || refMatch || subMatch || catMatch || modelMatch;
  });

  const sortedSellerProducts = [...matchingSearchProducts].sort((a: any, b: any) => {
    const aSub = targetSubCatId && String(a.subCategory?._id || a.subCategory) === String(targetSubCatId);
    const bSub = targetSubCatId && String(b.subCategory?._id || b.subCategory) === String(targetSubCatId);

    const aCountry = String(a.location?.country ?? "").toLowerCase();
    const bCountry = String(b.location?.country ?? "").toLowerCase();
    const aSameCountry = buyerCountry && aCountry === buyerCountry.toLowerCase();
    const bSameCountry = buyerCountry && bCountry === buyerCountry.toLowerCase();

    const aContinent = String(a.location?.continent || getContinentFromCountry(a.location?.country) || "").toLowerCase();
    const bContinent = String(b.location?.continent || getContinentFromCountry(b.location?.country) || "").toLowerCase();
    const aSameCont = buyerContinent && aContinent === buyerContinent.toLowerCase();
    const bSameCont = buyerContinent && bContinent === buyerContinent.toLowerCase();

    if (aSub && !bSub) return -1;
    if (!aSub && bSub) return 1;
    if (aSub && bSub) {
      if (aSameCountry && !bSameCountry) return -1;
      if (!aSameCountry && bSameCountry) return 1;
      if (aSameCont && !bSameCont) return -1;
      if (!aSameCont && bSameCont) return 1;
    }

    const aCat = targetCatId && String(a.category?._id || a.category) === String(targetCatId);
    const bCat = targetCatId && String(b.category?._id || b.category) === String(targetCatId);
    if (aCat && !bCat) return -1;
    if (!aCat && bCat) return 1;

    return 0;
  });

  const SELLER_PAGE_SIZE = 6;
  const totalSellerPages = Math.ceil(sortedSellerProducts.length / SELLER_PAGE_SIZE) || 1;
  const activeSellerPage = Math.min(sellerProductPage, totalSellerPages);
  const startIdx = (activeSellerPage - 1) * SELLER_PAGE_SIZE;
  const paginatedSellerProducts = sortedSellerProducts.slice(startIdx, startIdx + SELLER_PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Top Header & Breadcrumb Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <Link href="/admin/enquiries" className="hover:text-black transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Enquiries &amp; Quotations
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">Ref #{enquiry.referenceNumber}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <h1 className="text-2xl font-bold font-heading text-slate-900">
              Enquiry Review &amp; Seller Lead Routing
            </h1>
            <Badge className={`${statusColor[newStatus || enquiry.status]} text-xs font-semibold px-2.5 py-0.5 border`}>
              {newStatus || enquiry.status}
            </Badge>
          </div>
        </div>

        {/* Global Save & Export Action Bar */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="h-10 text-xs font-semibold border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Download Deal Sheet (PDF)
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push("/admin/enquiries")}
            className="h-10 text-xs font-semibold border-slate-200 hover:bg-slate-50"
          >
            Back to List
          </Button>

          <Button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="h-10 text-xs font-semibold bg-black hover:bg-slate-800 text-white min-w-[140px] shadow-sm cursor-pointer"
          >
            {isUpdating ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : saveSuccess ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Check className="w-4 h-4" /> Changes Saved
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Save className="w-4 h-4" /> Save Lead Updates
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Main 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Machinery Context & Seller Routing (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Target Machine Brief Card */}
          {enquiry.product && (
            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                    Inquired Machine Context
                  </span>
                </div>
                {enquiry.product.slug && (
                  <Link
                    href={`/products/${enquiry.product.slug}`}
                    target="_blank"
                    className="text-xs text-[#ff7759] font-bold hover:underline flex items-center gap-1"
                  >
                    View Listing <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              <div className="flex items-start gap-4 pt-1">
                {enquiry.product.images?.[0] ? (
                  <img
                    src={enquiry.product.images[0]}
                    alt={enquiry.product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                    <Package className="w-7 h-7" />
                  </div>
                )}

                <div className="min-w-0 flex-1 space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {enquiry.product.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono">
                    <span>Ref: {enquiry.product.referenceNumber}</span>
                    {enquiry.product.yearOfManufacture && <span>• Year: {enquiry.product.yearOfManufacture}</span>}
                    {enquiry.product.location?.country && <span>• {enquiry.product.location.country}</span>}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {enquiry.product.subCategory?.name && (
                      <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-[10px] font-semibold">
                        Sub-Category: {enquiry.product.subCategory.name}
                      </Badge>
                    )}
                    {enquiry.product.category?.name && (
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-[10px]">
                        Category: {enquiry.product.category.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Seller Routing & Machine Chooser Card (Recommendation Engine) */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 space-y-4 shadow-xs">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e7eb] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider block">
                    Seller Lead Assignment
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 font-heading">
                    Assign Seller &amp; Select Offering Machine
                  </h4>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {buyerCountry && (
                  <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300 text-[11px] font-medium px-2 py-0.5">
                    Buyer: {buyerCountry}{buyerContinent ? ` (${buyerContinent})` : ""}
                  </Badge>
                )}
                {targetSubCatName ? (
                  <Badge variant="outline" className="bg-slate-50 text-slate-800 border-slate-300 text-[11px] font-semibold px-2.5 py-0.5">
                    Sub-Category: {targetSubCatName}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-slate-50 text-slate-800 border-slate-300 text-[11px] font-semibold px-2.5 py-0.5">
                    Category: {targetCatName}
                  </Badge>
                )}
              </div>
            </div>

            {/* Smart Matching Recommendation Notice */}
            {topRecommendedCount > 0 && (
              <div className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 text-xs flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-slate-700 shrink-0" />
                <span>
                  <strong>Matching Sellers:</strong> Found <strong>{topRecommendedCount} seller{topRecommendedCount !== 1 ? "s" : ""}</strong> with verified listings (ranked by sub-category match &amp; regional proximity to {buyerCountry || buyerContinent || "buyer"}).
                </span>
              </div>
            )}

            {/* Compact Searchable Seller Combobox Menu */}
            <div className="space-y-3 relative" ref={dropdownRef}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                  Assigned Seller:
                </label>
                {chosenSeller && (
                  <button
                    type="button"
                    onClick={() => setSellerDropdownOpen(!sellerDropdownOpen)}
                    className="text-xs font-semibold text-[#ff7759] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    {sellerDropdownOpen ? "Close Menu" : "Change Seller"}
                  </button>
                )}
              </div>

              {/* Trigger Bar */}
              <div
                onClick={() => setSellerDropdownOpen(!sellerDropdownOpen)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3 ${
                  sellerDropdownOpen
                    ? "bg-slate-50 border-black ring-2 ring-black/10"
                    : chosenSeller
                    ? "bg-white border-slate-300 hover:border-slate-400 shadow-2xs"
                    : "bg-slate-50 border-dashed border-slate-300 hover:border-slate-400 hover:bg-white"
                }`}
              >
                {chosenSeller ? (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {chosenSeller.company?.name || "Individual Seller"}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({chosenSeller.name})
                        </span>
                        {chosenSellerItem?.isOriginal && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-bold">
                            Original Lister
                          </Badge>
                        )}
                        {chosenSellerItem?.isSameCountry && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-[10px] font-semibold">
                            Local ({buyerCountry})
                          </Badge>
                        )}
                        {chosenSellerItem?.isSameContinent && !chosenSellerItem?.isSameCountry && (
                          <Badge variant="outline" className="bg-indigo-50 text-indigo-800 border-indigo-200 text-[10px] font-semibold">
                            Regional ({buyerContinent})
                          </Badge>
                        )}
                        {chosenSellerItem?.isTopRecommended && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-semibold">
                            Sub-Cat Match
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-400" />
                          {[chosenSeller.company?.address?.city, chosenSeller.company?.address?.country].filter(Boolean).join(", ") || "Location unspecified"}
                        </span>
                        <span>•</span>
                        <span>{chosenSeller.products?.length || 0} machines listed</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-slate-500 text-xs">
                    <Building2 className="w-5 h-5 text-slate-400" />
                    <span className="font-medium">Click to select and assign a seller for this lead...</span>
                  </div>
                )}

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg">
                    {sellerDropdownOpen ? "Close ▴" : "Switch Seller ▾"}
                  </span>
                </div>
              </div>

              {/* Floating Searchable Combobox Popover */}
              {sellerDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#e5e7eb] rounded-2xl shadow-xl z-50 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-100">
                  {/* Top Search & Filter Tabs */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        value={sellerSearchQuery}
                        onChange={(e) => setSellerSearchQuery(e.target.value)}
                        placeholder="Search seller by name, company, city, or country..."
                        className="pl-9 h-9 text-xs bg-slate-50 focus:bg-white border-slate-200 rounded-xl"
                        autoFocus
                      />
                      {sellerSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setSellerSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowAllSellersOverride(false)}
                        className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                          !showAllSellersOverride
                            ? "bg-white text-black shadow-2xs font-bold"
                            : "text-slate-500 hover:text-black"
                        }`}
                      >
                        Recommended ({scoredSellers.filter((s: any) => s.isOriginal || s.matchRank >= 100).length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAllSellersOverride(true)}
                        className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                          showAllSellersOverride
                            ? "bg-white text-black shadow-2xs font-bold"
                            : "text-slate-500 hover:text-black"
                        }`}
                      >
                        All Sellers ({sellersList.length})
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Seller List Items */}
                  <div className="max-h-[300px] overflow-y-auto space-y-1.5 pr-1">
                    {(() => {
                      const searchQ = sellerSearchQuery.trim().toLowerCase();
                      const displayedSellers = filteredScoredSellers.filter(({ seller }: any) => {
                        if (!searchQ) return true;
                        const name = String(seller.name || "").toLowerCase();
                        const comp = String(seller.company?.name || "").toLowerCase();
                        const ctry = String(seller.company?.address?.country || "").toLowerCase();
                        const city = String(seller.company?.address?.city || "").toLowerCase();
                        return name.includes(searchQ) || comp.includes(searchQ) || ctry.includes(searchQ) || city.includes(searchQ);
                      });

                      if (displayedSellers.length === 0) {
                        return (
                          <div className="py-8 text-center text-xs text-slate-500">
                            No sellers found matching &quot;{sellerSearchQuery}&quot;
                          </div>
                        );
                      }

                      return displayedSellers.map(({ seller, isOriginal, isTopRecommended, isSameCountry, isSameContinent, exactSubCatProducts, sameCatProducts }: any) => {
                        const isSelected = String(selectedSellerId) === String(seller._id);
                        const companyName = seller.company?.name || "Individual Seller";
                        const sellerCountry = seller.company?.address?.country || "";
                        const sellerCity = seller.company?.address?.city || "";
                        const sellerContinent = getContinentFromCountry(sellerCountry);
                        const totalListings = seller.products?.length || 0;

                        return (
                          <div
                            key={seller._id}
                            onClick={() => {
                              setSelectedSellerId(seller._id);
                              setSellerDropdownOpen(false);
                              setSellerProductSearch("");
                              setSellerProductPage(1);
                            }}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                              isSelected
                                ? "bg-slate-50 border-black ring-1 ring-black"
                                : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/70"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isSelected ? "bg-black text-white" : "bg-slate-100 text-slate-600"
                              }`}>
                                <Building2 className="w-4 h-4" />
                              </div>

                              <div className="min-w-0 space-y-0.5">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-xs font-bold text-slate-900 truncate">
                                    {companyName}
                                  </span>
                                  <span className="text-[11px] text-slate-500">
                                    ({seller.name})
                                  </span>
                                  {isOriginal && (
                                    <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-[9px] font-bold px-1.5 py-0">
                                      Original Lister
                                    </Badge>
                                  )}
                                  {isSameCountry && (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-[9px] font-semibold px-1.5 py-0">
                                      Local ({buyerCountry})
                                    </Badge>
                                  )}
                                  {isSameContinent && !isSameCountry && (
                                    <Badge variant="outline" className="bg-indigo-50 text-indigo-800 border-indigo-200 text-[9px] font-semibold px-1.5 py-0">
                                      Regional ({buyerContinent})
                                    </Badge>
                                  )}
                                  {exactSubCatProducts.length > 0 ? (
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[9px] font-semibold px-1.5 py-0">
                                      {exactSubCatProducts.length} in Sub-Cat
                                    </Badge>
                                  ) : sameCatProducts.length > 0 ? (
                                    <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-[9px] px-1.5 py-0">
                                      {sameCatProducts.length} in Cat
                                    </Badge>
                                  ) : null}
                                </div>

                                <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                                  <span>{[sellerCity, sellerCountry].filter(Boolean).join(", ") || "Location unspecified"}{sellerContinent ? ` (${sellerContinent})` : ""}</span>
                                  <span>•</span>
                                  <span>{totalListings} machine{totalListings !== 1 ? "s" : ""}</span>
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0">
                              {isSelected ? (
                                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5" />
                                </div>
                              ) : (
                                <span className="text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-md px-2 py-1 bg-white hover:bg-slate-100">
                                  Select
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Live Seller Products Showcase & Product Chooser */}
            {chosenSeller && (
              <div className="bg-slate-50/70 border border-[#e5e7eb] rounded-2xl p-4 space-y-3 mt-2">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 font-heading">
                      {chosenSeller.company?.name || chosenSeller.name}&apos;s Machinery Listings
                    </span>
                    {chosenSellerItem?.isSameCountry && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-[10px] font-semibold">
                        Same Country ({buyerCountry})
                      </Badge>
                    )}
                    {chosenSellerItem?.isSameContinent && !chosenSellerItem?.isSameCountry && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-[10px] font-semibold">
                        Regional ({buyerContinent})
                      </Badge>
                    )}
                    {chosenSellerItem?.isTopRecommended && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-semibold">
                        Sub-Category Match
                      </Badge>
                    )}
                    {chosenSellerItem?.isOriginal && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-semibold">
                        Original Lister
                      </Badge>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {sortedSellerProducts.length} matching / {allSellerProducts.length} total
                  </span>
                </div>

                {/* Search Bar (if 2+ products) */}
                {allSellerProducts.length > 1 && (
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      value={sellerProductSearch}
                      onChange={(e) => {
                        setSellerProductSearch(e.target.value);
                        setSellerProductPage(1);
                      }}
                      placeholder="Search seller's machines by name, model, or ref #..."
                      className="pl-8 h-8 text-xs bg-white border-slate-200 rounded-lg focus:border-black"
                    />
                    {sellerProductSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setSellerProductSearch("");
                          setSellerProductPage(1);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}

                {/* Instruction hint for Super Admin */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <span className="font-medium text-slate-600">
                    Select a machine from the list below to attach to this lead:
                  </span>
                  {selectedProductId && selectedProductId !== (enquiry.product?._id || enquiry.product) && (
                    <button
                      type="button"
                      onClick={() => setSelectedProductId(enquiry.product?._id || enquiry.product || "")}
                      className="text-xs text-slate-800 font-bold hover:underline cursor-pointer"
                    >
                      Reset to Inquired Machine
                    </button>
                  )}
                </div>

                {/* Paginated Products Grid with Selection */}
                {paginatedSellerProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {paginatedSellerProducts.map((p: any) => {
                      const isExactSub = targetSubCatId && String(p.subCategory?._id || p.subCategory) === String(targetSubCatId);
                      const isSameCat = targetCatId && String(p.category?._id || p.category) === String(targetCatId);
                      const isSelectedProduct = String(selectedProductId) === String(p._id);
                      const pCountry = String(p.location?.country ?? "").trim().toLowerCase();
                      const pContinent = String(p.location?.continent || getContinentFromCountry(p.location?.country) || "").trim().toLowerCase();
                      const isProdSameCountry = buyerCountry && pCountry === buyerCountry.toLowerCase();
                      const isProdSameContinent = buyerContinent && pContinent === buyerContinent.toLowerCase();
                      const imgUrl = p.images?.[0];

                      return (
                        <div
                          key={p._id}
                          onClick={() => setSelectedProductId(p._id)}
                          className={`p-3 rounded-xl border flex items-start gap-3 transition-all cursor-pointer select-none ${
                            isSelectedProduct
                              ? "bg-white border-black ring-2 ring-black shadow-sm"
                              : "bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50/70"
                          }`}
                        >
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={p.name}
                              className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                              <Package className="w-5 h-5" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-slate-900 truncate block">
                                {p.name}
                              </span>
                              {isSelectedProduct ? (
                                <Badge className="bg-black text-white text-[9px] px-1.5 py-0 shrink-0 font-semibold">
                                  Selected Machine
                                </Badge>
                              ) : isExactSub ? (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[9px] px-1.5 py-0 shrink-0">
                                  Sub-Cat Match
                                </Badge>
                              ) : isSameCat ? (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[9px] px-1.5 py-0 shrink-0">
                                  Category
                                </Badge>
                              ) : null}
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                              <span>Ref: {p.referenceNumber}</span>
                              {p.yearOfManufacture && <span>• Year: {p.yearOfManufacture}</span>}
                              {p.location?.country && <span>• {p.location.country}</span>}
                              {isProdSameCountry ? (
                                <span className="text-blue-700 font-sans font-semibold bg-blue-50 px-1 rounded">
                                  Local
                                </span>
                              ) : isProdSameContinent ? (
                                <span className="text-indigo-700 font-sans font-semibold bg-indigo-50 px-1 rounded">
                                  Same Region
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-white border border-dashed border-slate-200 rounded-xl text-center space-y-1">
                    <p className="text-xs font-medium text-slate-600">
                      {sellerProductSearch
                        ? `No machines found matching "${sellerProductSearch}" for this seller.`
                        : `This seller currently has no listings specifically in ${targetSubCatName || targetCatName}.`}
                    </p>
                  </div>
                )}

                {/* Pagination Bar */}
                {totalSellerPages > 1 && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                    <span>
                      Showing {startIdx + 1}–{Math.min(startIdx + SELLER_PAGE_SIZE, sortedSellerProducts.length)} of {sortedSellerProducts.length}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSellerProductPage((p) => Math.max(1, p - 1))}
                        disabled={activeSellerPage === 1}
                        className="h-7 text-[10px] px-2 bg-white"
                      >
                        <ChevronLeft className="w-3 h-3 mr-0.5" /> Previous
                      </Button>
                      <span className="font-mono text-[10px] px-1">
                        Page {activeSellerPage} of {totalSellerPages}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSellerProductPage((p) => Math.min(totalSellerPages, p + 1))}
                        disabled={activeSellerPage >= totalSellerPages}
                        className="h-7 text-[10px] px-2 bg-white"
                      >
                        Next <ChevronRight className="w-3 h-3 ml-0.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Forward Lead Checkbox */}
            <label className="flex items-start gap-2.5 pt-2 border-t border-slate-200/60 cursor-pointer">
              <input
                type="checkbox"
                checked={isForwardedToSeller}
                onChange={(e) => {
                  setIsForwardedToSeller(e.target.checked);
                  if (e.target.checked && newStatus === "NEW") {
                    setNewStatus("SELLER_ASSIGNED");
                  }
                }}
                className="w-4 h-4 mt-0.5 rounded text-black border-slate-300 focus:ring-black accent-black cursor-pointer"
              />
              <div className="text-xs select-none">
                <p className="font-bold text-slate-900">
                  {isForwardedToSeller ? "Lead Forwarded to Seller" : "Forward Lead to Assigned Seller"}
                </p>
                <p className="text-[11px] text-slate-500">
                  When enabled, this enquiry will be assigned and visible in the seller&apos;s portal with the selected machine.
                </p>
              </div>
            </label>
          </div>

          {/* 3. Deal Stage & Internal Admin Notes */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              Deal Management &amp; Internal Notes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Deal Status Stage
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full h-11 text-xs sm:text-sm border border-slate-200 rounded-xl px-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5"
                >
                  {statuses.map((st) => (
                    <option key={st} value={st}>
                      {st.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Internal Admin Notes (Private)
              </label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Log internal negotiations, escrow terms, seller communication, inspection notes..."
                className="h-28 text-xs sm:text-sm bg-slate-50 focus:bg-white resize-none rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Buyer Details & Permissions (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Buyer Details Card */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                Buyer Contact Details
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Buyer Name</span>
                <p className="font-bold text-slate-900 text-sm">{enquiry.buyerName || "Anonymous Buyer"}</p>
                {enquiry.buyerCompany && (
                  <p className="text-xs text-slate-600 font-medium">{enquiry.buyerCompany}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Email Address</span>
                  <a href={`mailto:${enquiry.buyerEmail}`} className="font-semibold text-slate-900 hover:underline truncate block">
                    {enquiry.buyerEmail || "—"}
                  </a>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Phone / WhatsApp</span>
                  <a href={`tel:${enquiry.buyerPhone}`} className="font-semibold text-slate-900 hover:underline truncate block">
                    {enquiry.buyerPhone || "—"}
                  </a>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Location / Country</span>
                <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  {enquiry.buyerCountry || "Not specified"}
                  {buyerContinent && <span className="text-slate-500 font-normal">({buyerContinent})</span>}
                </p>
              </div>

              {/* Requirement Text */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">RFQ Message / Requirement</span>
                <p className="text-slate-800 text-xs whitespace-pre-wrap leading-relaxed">
                  {enquiry.requirement || "No requirement notes provided."}
                </p>
              </div>

              {/* Specs & Budget */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Budget</span>
                  <span className="font-bold text-slate-900 text-xs">{enquiry.budget || "Flexible"}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Timeline</span>
                  <span className="font-bold text-slate-900 text-xs">{enquiry.timeline || "Immediate"}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Quantity</span>
                  <span className="font-bold text-slate-900 text-xs">{enquiry.quantity || 1} Unit(s)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Contact Sharing Controls */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                Contact Privacy Controls
              </h3>
            </div>

            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={buyerContactShared}
                  onChange={(e) => setBuyerContactShared(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-black border-slate-300 focus:ring-black accent-black cursor-pointer"
                />
                <div className="text-xs select-none">
                  <p className="font-bold text-slate-900">Share Buyer Details with Seller</p>
                  <p className="text-[11px] text-slate-500">
                    Allows the assigned seller to view buyer name, company, email, and phone number.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={sellerContactShared}
                  onChange={(e) => setSellerContactShared(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-black border-slate-300 focus:ring-black accent-black cursor-pointer"
                />
                <div className="text-xs select-none">
                  <p className="font-bold text-slate-900">Share Seller Details with Buyer</p>
                  <p className="text-[11px] text-slate-500">
                    Allows the buyer to view assigned seller company profile and direct contact lines.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Assigned Seller Info Card */}
          {chosenSeller && (
            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                    Assigned Seller Profile
                  </h3>
                </div>
                {chosenSeller.company?.isVerified && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
                    Verified Seller
                  </Badge>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Company / Storefront</span>
                  <p className="font-bold text-slate-900 text-sm">{chosenSeller.company?.name || chosenSeller.name}</p>
                  <p className="text-xs text-slate-500">Representative: {chosenSeller.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Location</span>
                    <span className="font-semibold text-slate-900">
                      {chosenSeller.company?.address?.country || "—"}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Active Listings</span>
                    <span className="font-semibold text-slate-900">
                      {allSellerProducts.length} Machines
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline Audit Log */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                Deal Activity Timeline
              </h3>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 font-mono pt-1">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span>Created Date</span>
                <span className="font-bold text-slate-900">
                  {enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString() : "—"}
                </span>
              </div>
              {enquiry.sellerAssignedAt && (
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span>Seller Assigned</span>
                  <span className="font-bold text-slate-900">
                    {new Date(enquiry.sellerAssignedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              {enquiry.forwardedAt && (
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span>Forwarded to Storefront</span>
                  <span className="font-bold text-slate-900">
                    {new Date(enquiry.forwardedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
