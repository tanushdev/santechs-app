"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { enquirySchema, type EnquiryFormValues } from "@/lib/validations";
import { submitEnquiry } from "@/lib/actions/enquiry.actions";
import { UserRole } from "@/types";
import { Loader2, CheckCircle2, MessageSquare, Shield } from "lucide-react";

interface EnquiryFormProps {
  productId: string;
  productName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const countries = [
  "India", "China", "Bangladesh", "Pakistan", "Vietnam", "Indonesia",
  "Turkey", "USA", "Germany", "UK", "Italy", "Japan", "South Korea",
  "Brazil", "UAE", "Saudi Arabia", "Other",
];

const timelines = [
  "Immediately", "Within 1 month", "1-3 months", "3-6 months", "6+ months", "Flexible",
];

const budgetRanges = [
  "Under $10,000", "$10,000 - $50,000", "$50,000 - $200,000",
  "$200,000 - $500,000", "Over $500,000", "Flexible",
];

export default function EnquiryForm({
  productId,
  productName,
  open,
  onOpenChange,
}: EnquiryFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [enquiryRef, setEnquiryRef] = useState("");

  const form = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      buyerName: session?.user?.name ?? "",
      buyerCompany: "",
      buyerEmail: session?.user?.email ?? "",
      buyerPhone: "",
      buyerCountry: "India",
      requirement: "",
      budget: "",
      timeline: "",
      quantity: 1,
    },
  });

  const onSubmit = async (data: EnquiryFormValues) => {
    if (!session || session.user.role !== UserRole.BUYER) {
      router.push("/login?callbackUrl=" + encodeURIComponent(window.location.pathname));
      return;
    }

    const result = await submitEnquiry(productId, data);
    if (result.success) {
      setEnquiryRef(result.referenceNumber ?? "");
      setSubmitted(true);
    } else {
      form.setError("root", { message: result.error });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0">
        
        {/* Box Modal Header */}
        <DialogHeader className="p-4 sm:p-5 bg-slate-50 border-b border-slate-100 flex-shrink-0 text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 font-sans tracking-tight">
                Request Official Quote
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-medium truncate max-w-xs sm:max-w-md">
                For: <span className="text-slate-800 font-semibold">{productName}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 text-center space-y-4"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 font-sans">
                Quote Request Submitted!
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Enquiry Ref: <span className="font-bold text-slate-900">{enquiryRef}</span>
              </p>
            </div>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              Our coordination team is reviewing your requirement specifications. You will receive an official response within 24 business hours.
            </p>
            <div className="pt-2">
              <Button
                onClick={() => {
                  setSubmitted(false);
                  onOpenChange(false);
                }}
                className="rounded-full bg-black text-white hover:bg-neutral-800 font-bold px-8 h-9 text-xs uppercase tracking-wider"
              >
                Done
              </Button>
            </div>
          </motion.div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              
              {/* Scrollable Form Body */}
              <div className="overflow-y-auto p-4 sm:p-5 space-y-3 flex-1 min-h-0">
                
                {/* Error Banner */}
                {form.formState.errors.root && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    {form.formState.errors.root.message}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Buyer Name */}
                  <FormField
                    control={form.control}
                    name="buyerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-slate-700">Full Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John Smith" className="h-10 text-sm rounded-lg border-slate-200 focus-visible:ring-black" />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />

                  {/* Company Name */}
                  <FormField
                    control={form.control}
                    name="buyerCompany"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-slate-700">Company Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ABC Textiles Ltd." className="h-10 text-sm rounded-lg border-slate-200 focus-visible:ring-black" />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="buyerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-slate-700">Email Address *</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="you@company.com" className="h-10 text-sm rounded-lg border-slate-200 focus-visible:ring-black" />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />

                  {/* Phone */}
                  <FormField
                    control={form.control}
                    name="buyerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-slate-700">Phone / WhatsApp *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+91 98765 43210" className="h-10 text-sm rounded-lg border-slate-200 focus-visible:ring-black" />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />

                  {/* Country */}
                  <FormField
                    control={form.control}
                    name="buyerCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-slate-700">Country *</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-black"
                          >
                            {countries.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />

                  {/* Quantity */}
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-slate-700">Quantity Required</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min={1}
                            placeholder="1"
                            className="h-10 text-sm rounded-lg border-slate-200 focus-visible:ring-black"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Requirement Details */}
                <FormField
                  control={form.control}
                  name="requirement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Requirement Details *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Specify requirements, target price, delivery preferences, or technical questions..."
                          className="min-h-[64px] text-sm rounded-lg border-slate-200 focus-visible:ring-black resize-none"
                        />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Budget */}
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-slate-700">Estimated Budget</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-black"
                          >
                            <option value="">Select budget range</option>
                            {budgetRanges.map((b) => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Timeline */}
                  <FormField
                    control={form.control}
                    name="timeline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-slate-700">Purchase Timeline</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-black"
                          >
                            <option value="">Select timeline</option>
                            {timelines.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Privacy Intermediary Note */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>Your identity and contact information are protected and handled securely by Santechs.</span>
                </div>

              </div>

              {/* Box Modal Footer - Fixed Buttons */}
              <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full px-5 h-9 text-xs font-semibold border-slate-200"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-full bg-black text-white hover:bg-neutral-800 font-bold px-6 h-9 text-xs uppercase tracking-wider transition-colors border-0"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 w-3.5 h-3.5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Enquiry"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
