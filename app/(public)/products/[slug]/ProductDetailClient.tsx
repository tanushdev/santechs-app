"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EnquiryForm from "@/components/common/EnquiryForm";
import {
  MapPin,
  CheckCircle2,
  XCircle,
  FileText,
  Wrench,
  PackageCheck,
  ArrowRight,
  TrendingUp,
  ArrowLeft,
  Share2,
  Eye,
  Calendar,
  Check,
  Zap,
} from "lucide-react";

interface ProductDetailClientProps {
  product: any;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(product.images?.[0] ?? "");
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [views, setViews] = useState<number>(product.views ?? 0);

  useEffect(() => {
    const sessionKey = `viewed_${product._id}`;
    const alreadyViewed = typeof window !== "undefined" ? sessionStorage.getItem(sessionKey) : null;

    if (!alreadyViewed && product.slug) {
      fetch(`/api/products/${product.slug}/view`, { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && typeof data.views === "number") {
            setViews(data.views);
            sessionStorage.setItem(sessionKey, "true");
          }
        })
        .catch(() => {});
    }
  }, [product._id, product.slug]);

  const conditionColors: Record<string, { label: string; badgeClass: string }> = {
    EXCELLENT: { label: "Excellent Condition", badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
    GOOD: { label: "Good Condition", badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
    USED: { label: "Used Asset", badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
    REFURBISHED: { label: "Refurbished", badgeClass: "bg-purple-500/10 text-purple-600 border-purple-500/30" },
  };

  const condition = conditionColors[product.condition] ?? {
    label: product.condition || "Standard",
    badgeClass: "bg-slate-500/10 text-slate-600 border-slate-500/30",
  };

  const specs = [
    { label: "Manufacturer", value: product.manufacturer },
    { label: "Model / Series", value: product.machineModel || product.model },
    { label: "Condition Rating", value: product.condition },
    { label: "Year Built", value: product.yearOfManufacture },
    { label: "Production Capacity", value: product.productionCapacity },
    { label: "Total Spindles", value: product.numberOfSpindles },
    { label: "Working Positions", value: product.numberOfPositions },
    { label: "Machine Type", value: product.machineType },
    { label: "Units Available", value: product.quantity },
  ].filter((s) => s.value != null && s.value !== "");

  const supports = [
    { label: "Installation Support", value: product.installationSupport },
    { label: "Commissioning Support", value: product.commissioningSupport },
    { label: "Relocation Assistance", value: product.relocationSupport },
    { label: "Dismantling Support", value: product.dismantlingSupport },
    { label: "On-site Inspection", value: product.inspectionAvailable },
  ];

  const includes = [
    { label: "Utilities Included", value: product.utilitiesIncluded },
    { label: "Accessories Included", value: product.accessoriesIncluded },
    { label: "Spare Parts Included", value: product.sparePartsIncluded },
  ];

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      
      {/* Top Action Header Bar */}
      <div className="bg-white border-b border-slate-200 shadow-2xs py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Machinery Catalog
          </Link>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
            <span className="hidden sm:inline">REF: {product.referenceNumber}</span>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-sans font-medium"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copied ? "Link Copied!" : "Share"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column - Product Photos & Data Specifications (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Header Title Block */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                {product.category && (
                  <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border border-orange-500/20 text-xs font-semibold">
                    {product.category.name}
                  </Badge>
                )}
                <Badge variant="outline" className={`text-xs font-semibold border ${condition.badgeClass}`}>
                  {condition.label}
                </Badge>
                {product.isFeatured && (
                  <Badge className="bg-slate-900 text-white text-xs font-semibold">
                    <Zap className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" /> Featured Asset
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-4">
                {product.yearOfManufacture && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Built {product.yearOfManufacture}
                  </span>
                )}
                <span className="flex items-center gap-1.5 font-medium">
                  <Eye className="w-4 h-4 text-slate-400" />
                  {views.toLocaleString()} {views === 1 ? "View" : "Views"}
                </span>
                {product.location && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    {[product.location.city, product.location.country].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
            </div>

            {/* Media Gallery Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-100">
                {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt={product.name}
                    fill
                    className="object-contain"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                    <FileText className="w-12 h-12 stroke-[1.5]" />
                    <span className="text-xs font-medium text-slate-400">No Machine Photos Provided</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {product.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                        selectedImage === img
                          ? "border-orange-500 ring-2 ring-orange-500/20"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description Card */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h2 className="text-lg font-bold text-slate-900 border-l-4 border-orange-500 pl-3">
                Equipment Description
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line pt-2">
                {product.description || "No specific detailed description provided for this listing."}
              </p>
            </div>

            {/* Technical Specifications Parameters Grid */}
            {specs.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <h2 className="text-lg font-bold text-slate-900 border-l-4 border-orange-500 pl-3">
                  Technical Specifications
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-sm"
                    >
                      <span className="text-slate-500 font-medium text-xs">{spec.label}</span>
                      <span className="font-semibold text-slate-900 text-xs sm:text-sm">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Included Accessories & Seller Support Services */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Included Deliverables */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-orange-500" />
                  Included Deliverables
                </h3>
                <div className="space-y-3">
                  {includes.map((inc) => (
                    <div key={inc.label} className="flex items-center gap-3 text-sm">
                      {inc.value ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                      )}
                      <span className={inc.value ? "text-slate-800 font-semibold" : "text-slate-400"}>
                        {inc.label}
                      </span>
                    </div>
                  ))}
                </div>
                {product.accessoriesDescription && (
                  <p className="text-xs text-slate-600 bg-orange-50/50 p-3 rounded-xl border border-orange-100 mt-2">
                    <strong>Notes:</strong> {product.accessoriesDescription}
                  </p>
                )}
              </div>

              {/* Seller Services */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-500" />
                  Seller Services
                </h3>
                <div className="space-y-3">
                  {supports.map((s) => (
                    <div key={s.label} className="flex items-center gap-3 text-sm">
                      {s.value ? (
                        <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                      )}
                      <span className={s.value ? "text-slate-800 font-semibold" : "text-slate-400"}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Right Column - Pricing & Quote Request Console (4 Cols) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 space-y-6 lg:sticky lg:top-24">
              
              {/* Pricing Display */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Asking Price</span>
                <div className="text-2xl font-bold text-slate-950">
                  {product.price
                    ? `${product.currency === "INR" ? "₹" : product.currency} ${Number(product.price).toLocaleString("en-IN")}${product.unit ? ` / ${product.unit}` : ""}`
                    : "Price on Request"}
                </div>
                <div className="text-xs text-slate-500 pt-2 border-t border-slate-200/60 mt-3 flex items-center justify-between">
                  <span>Available Inventory:</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    {product.quantity
                      ? `${Number(product.quantity).toLocaleString("en-IN")} ${product.unit ? `${product.unit}${product.unit === "Kg" || product.unit === "Ton" ? "s" : ""}` : "unit(s)"}`
                      : `1 ${product.unit || "unit"}`}
                  </span>
                </div>
              </div>

              {/* Request Quote Button */}
              <Button
                onClick={() => setEnquiryOpen(true)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 group/btn border-0"
              >
                Request Quote
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Button>

              {/* Location Information */}
              {product.location && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <MapPin className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Equipment Location</div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      {[product.location.city, product.location.state, product.location.country].filter(Boolean).join(", ")}
                    </div>
                  </div>
                </div>
              )}

              {/* Escrow Guarantee Note */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Intermediary inspection & transaction safety guaranteed.</span>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Quote Enquiry Form Modal */}
      <EnquiryForm
        productId={product._id}
        productName={product.name}
        open={enquiryOpen}
        onOpenChange={setEnquiryOpen}
      />
    </div>
  );
}
