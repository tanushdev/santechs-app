import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db/connection";
import Enquiry from "@/lib/db/models/Enquiry.model";
import { UserRole } from "@/types";
import { MessageSquare, Calendar, Building2, Package, Clock, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function SellerEnquiriesPage() {
  const session = await auth();

  if (!session || session.user.role !== UserRole.SELLER) {
    redirect("/login?callbackUrl=/seller/enquiries");
  }

  await connectToDatabase();

  const enquiries = await Enquiry.find({ seller: session.user.id })
    .populate("product", "name images price currency referenceNumber slug")
    .sort({ createdAt: -1 })
    .lean();

  const statusBadges: Record<string, { label: string; className: string }> = {
    NEW: { label: "New Enquiry", className: "bg-blue-50 text-blue-700 border-blue-200" },
    UNDER_REVIEW: { label: "Under Review", className: "bg-amber-50 text-amber-700 border-amber-200" },
    BUYER_CONTACTED: { label: "Buyer Contacted", className: "bg-purple-50 text-purple-700 border-purple-200" },
    SELLER_ASSIGNED: { label: "Assigned to You", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    DEAL_CLOSED: { label: "Deal Closed", className: "bg-[#000000] text-white border-black" },
    REJECTED: { label: "Closed / Archival", className: "bg-slate-100 text-slate-600 border-slate-200" },
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#75758a]">
          <MessageSquare className="w-4 h-4 text-black" />
          <span>Seller Workspace</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-black">
          Received Product Enquiries
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
          Manage buyer requests and quote enquiries submitted for your machinery and raw material listings. Santechs acts as your platform coordinator for all inquiries.
        </p>
      </div>

      {/* Enquiries Grid / List */}
      {enquiries.length === 0 ? (
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-black">No Enquiries Received Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When buyers request quotes for your products, their requests will appear here for review.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/seller/products/new"
              className="inline-flex items-center justify-center h-10 px-5 rounded-full bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
            >
              List New Machinery
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enquiry: any) => {
            const statusInfo = statusBadges[enquiry.status] || {
              label: enquiry.status,
              className: "bg-slate-100 text-slate-700 border-slate-200",
            };

            const product = enquiry.product;

            return (
              <div
                key={enquiry._id.toString()}
                className="bg-white border border-[#e5e7eb] rounded-2xl p-6 transition-all hover:border-slate-300 space-y-6"
              >
                {/* Header info */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e7eb] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#75758a]">
                      Ref #{enquiry.referenceNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(enquiry.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
                  
                  {/* Left Details */}
                  <div className="space-y-4">
                    
                    {/* Linked Product Info */}
                    {product && (
                      <div className="flex items-center gap-3 bg-[#eeece7]/30 p-3 rounded-xl border border-[#e5e7eb]">
                        <Package className="w-5 h-5 text-black flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Target Listing</p>
                          <Link
                            href={`/products/${product.slug}`}
                            className="text-sm font-bold text-black hover:underline truncate block"
                          >
                            {product.name}
                          </Link>
                        </div>
                        {product.price && (
                          <div className="text-right text-xs font-mono font-bold text-slate-900">
                            {product.currency || "USD"} {product.price.toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Requirement Note */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#75758a]">
                        Buyer Requirement Notes
                      </p>
                      <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-line">
                        {enquiry.requirement || "No specific requirement notes provided."}
                      </p>
                    </div>

                    {/* Key Specs Tags */}
                    <div className="flex flex-wrap gap-4 pt-1 text-xs text-slate-600 font-mono">
                      {enquiry.quantity && (
                        <span>Quantity Requested: <strong>{enquiry.quantity} unit(s)</strong></span>
                      )}
                      {enquiry.budget && (
                        <span>Budget Range: <strong>{enquiry.budget}</strong></span>
                      )}
                      {enquiry.timeline && (
                        <span>Timeline: <strong>{enquiry.timeline}</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Right Buyer Info / Santechs Card */}
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-3">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#75758a]">
                      Buyer Information
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-bold text-black">
                        <Building2 className="w-4 h-4 text-slate-500" />
                        <span className="truncate">{enquiry.buyerCompany || enquiry.buyerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{enquiry.buyerCountry}</span>
                      </div>
                    </div>

                    {/* Contact details status */}
                    <div className="pt-3 border-t border-slate-200/60 text-xs text-slate-500 space-y-1.5">
                      {enquiry.buyerContactShared ? (
                        <div className="space-y-1 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-emerald-800">
                          <p className="font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Direct Contact Approved
                          </p>
                          <p className="text-[11px] truncate flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {enquiry.buyerEmail}
                          </p>
                          <p className="text-[11px] flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {enquiry.buyerPhone}
                          </p>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60 text-amber-800 text-[11px] leading-relaxed">
                          🛡️ Contact details managed by Santechs team. Our representative will connect both parties upon qualification.
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
