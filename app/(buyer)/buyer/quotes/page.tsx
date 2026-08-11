import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db/connection";
import Enquiry from "@/lib/db/models/Enquiry.model";
import { UserRole } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { MessageSquare, Clock, ShieldCheck, Mail, Phone, MapPin, Package, ArrowRight, Lock, Unlock, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Quote Requests — Santechs" };

const statusLabels: Record<string, { label: string; className: string }> = {
  NEW: { label: "Inquiry Received", className: "bg-blue-50 text-blue-700 border-blue-200" },
  CONTACTED_BUYER: { label: "Santechs Reviewing", className: "bg-amber-50 text-amber-700 border-amber-200" },
  SELLER_ASSIGNED: { label: "Santechs Reviewing", className: "bg-purple-50 text-purple-700 border-purple-200" },
  NEGOTIATION: { label: "Negotiating", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  QUOTATION_SENT: { label: "Quotation Sent", className: "bg-sky-50 text-sky-700 border-sky-200" },
  INSPECTION_SCHEDULED: { label: "Inspection Scheduled", className: "bg-pink-50 text-pink-700 border-pink-200" },
  DEAL_CLOSED: { label: "Deal Completed", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Cancelled", className: "bg-slate-100 text-slate-600 border-slate-200" },
  CANCELLED: { label: "Cancelled", className: "bg-slate-100 text-slate-600 border-slate-200" },
};

export default async function BuyerQuotesPage() {
  const session = await auth();

  if (!session || session.user.role !== UserRole.BUYER) {
    redirect("/login?callbackUrl=/buyer/quotes");
  }

  await connectToDatabase();

  const enquiries = await Enquiry.find({ buyer: session.user.id })
    .populate({
      path: "product",
      select: "name images price currency referenceNumber slug",
    })
    .populate({
      path: "seller",
      select: "name email phone",
    })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 sm:p-8 space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#75758a]">
          <FileText className="w-4 h-4 text-black" />
          <span>Buyer Dashboard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-black">
          My Quote Requests
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
          Track active quote requests, view Santechs team status updates, and access verified seller contact details once released by our deal coordinator.
        </p>
      </div>

      {/* Quotes List */}
      {enquiries.length === 0 ? (
        <div className="text-center py-20 border border-[#e5e7eb] rounded-2xl bg-slate-50">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-black font-sans mb-1">No Quote Requests Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            You haven&apos;t requested quotes for any industrial machinery or raw materials yet. Browse the marketplace to submit inquiries.
          </p>
          <Link href="/products">
            <Button className="rounded-full bg-black text-white hover:bg-neutral-800 font-semibold px-6 py-2.5 text-xs uppercase tracking-wider">
              Explore Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {enquiries.map((enquiry: any) => {
            const statusInfo = statusLabels[enquiry.status] || {
              label: enquiry.status.replace(/_/g, " "),
              className: "bg-slate-100 text-slate-700 border-slate-200",
            };

            const product = enquiry.product;
            const seller = enquiry.seller;

            return (
              <div
                key={enquiry._id.toString()}
                className="bg-white border border-[#e5e7eb] rounded-2xl p-6 transition-all hover:border-slate-300 space-y-6"
              >
                {/* Header Line */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e7eb] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#75758a]">
                      Ref #{enquiry.referenceNumber}
                    </span>
                    <Badge variant="outline" className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${statusInfo.className}`}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(enquiry.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
                  
                  {/* Left Column: Product & Requirement Details */}
                  <div className="space-y-4">
                    {product ? (
                      <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="relative w-12 h-12 rounded-lg bg-white border border-[#e5e7eb] overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {product.images && product.images.length > 0 ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-slate-350" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Target Listing</p>
                          <Link href={`/products/${product.slug}`} className="text-sm font-bold text-black hover:underline truncate block">
                            {product.name}
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 bg-slate-100 p-3 rounded-lg border">
                        Target product listing is no longer available.
                      </div>
                    )}

                    <div className="space-y-1">
                      <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#75758a]">My Specifications</h4>
                      <p className="text-sm text-slate-700 bg-[#eeece7]/20 p-4 rounded-xl border border-[#e5e7eb]/60 whitespace-pre-line leading-relaxed">
                        {enquiry.requirement || "No custom specifications submitted."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-mono">
                      {enquiry.quantity && (
                        <span>Qty: <strong>{enquiry.quantity}</strong></span>
                      )}
                      {enquiry.budget && (
                        <span>Target Budget: <strong>{enquiry.budget}</strong></span>
                      )}
                      {enquiry.timeline && (
                        <span>Desired Timeline: <strong>{enquiry.timeline}</strong></span>
                      )}
                    </div>

                    {/* Santechs Team Updates Block */}
                    <div className="space-y-1 pt-1">
                      <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#75758a]">
                        Deal Coordinator Status Response
                      </h4>
                      {enquiry.adminNotes ? (
                        <div className="text-xs text-slate-800 bg-[#ff7759]/5 border border-[#ff7759]/20 p-4 rounded-xl leading-relaxed space-y-1.5">
                          <div className="font-bold text-[9px] text-[#ff7759] uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" /> Super Admin Note
                          </div>
                          <p className="font-medium text-xs leading-normal">{enquiry.adminNotes}</p>
                        </div>
                      ) : (
                         <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-100 p-3.5 rounded-xl leading-normal">
                          {enquiry.status === "NEW" && "Your enquiry has been received. Santechs support team is verifying listing availability with the seller."}
                          {enquiry.status === "CONTACTED_BUYER" && "Deal coordinator is currently reviewing your specifications and will contact you shortly."}
                          {enquiry.status === "SELLER_ASSIGNED" && "Coordinator has initiated contact with the seller to discuss your requirements."}
                          {enquiry.status === "NEGOTIATION" && "Active negotiations on pricing and logistics are in progress between buyer and seller."}
                          {enquiry.status === "QUOTATION_SENT" && "Quotation sheet has been prepared and sent to your email address."}
                          {enquiry.status === "INSPECTION_SCHEDULED" && "A physical machine inspection has been scheduled at the equipment site."}
                          {enquiry.status === "DEAL_CLOSED" && "Deal closed successfully! Contacts exchanged and transactions completed."}
                          {["REJECTED", "CANCELLED"].includes(enquiry.status) && "This request was closed or cancelled. Contact support for details."}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Seller Info Lockbox */}
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-150 flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#75758a]">Seller Contact Info</h4>
                      
                      {enquiry.sellerContactShared && seller ? (
                        <div className="space-y-3 text-xs bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                          <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                            <Unlock className="w-3.5 h-3.5" /> Verified Contact Unlocked
                          </div>
                          <div className="space-y-1 text-slate-700 font-sans">
                            <p><strong>Name:</strong> {seller.name}</p>
                            <p className="flex items-center gap-1.5 mt-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {seller.email}</p>
                            <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {seller.phone || "N/A"}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 text-xs bg-slate-100 p-3 rounded-lg border border-slate-200">
                          <div className="font-bold text-slate-600 flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-slate-400" /> Contact Info Locked
                          </div>
                          <p className="text-[11px] text-slate-500 leading-normal">
                            Seller contact details will be shared once your coordinator verifies your request specifications.
                          </p>
                        </div>
                      )}
                    </div>

                    <Link href={`/products/${product?.slug || ""}`} className="w-full">
                      <Button variant="outline" className="w-full h-10 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-slate-200">
                        View Product
                      </Button>
                    </Link>
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
