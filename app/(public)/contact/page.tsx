"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Phone, Mail, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";

const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(8, "Please enter a valid phone number."),
  message: z.string().min(10, "Message must be at least 10 characters long."),
});

type ContactValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  const onSubmit = async (data: ContactValues) => {
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSuccess(true);
        form.reset();
      } else {
        const json = await res.json();
        setError(json.message ?? "Failed to send message. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="bg-white min-h-screen pb-24 font-sans text-slate-800">
      
      {/* ── HERO SECTION ── */}
      <section className="relative py-20 bg-slate-50 border-b border-slate-100 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6 relative z-10">
          <Badge className="bg-[#ff7759]/10 text-[#ff7759] border-[#ff7759]/20 rounded-full px-4 py-1 text-xs font-semibold">
            Contact Support
          </Badge>
          <h1 className="text-4xl md:text-5xl font-normal tracking-[-0.04em] leading-[0.95] text-black font-sans">
            How Can We Help You?
          </h1>
          <p className="text-base sm:text-lg text-[#75758a] max-w-xl mx-auto leading-relaxed">
            Get in touch with Santechs coordinators for account help, listing moderation, or transaction disputes.
          </p>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* Left Side: Contact Information */}
        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-black font-sans">Corporate Coordinates</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              If you have heavy assets to liquidate or bulk textile materials to list, contact our coordinator panel directly.
            </p>
          </div>

          <div className="space-y-6 pt-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-primary flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-black">Phone Sourcing Panel</h4>
                <a href="tel:+919167655133" className="text-xs text-slate-600 hover:text-primary transition-colors block mt-0.5">
                  +91 91676 55133
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-primary flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-black">Email Desk</h4>
                <a href="mailto:Sales@santechs.net" className="text-xs text-slate-600 hover:text-primary transition-colors block mt-0.5">
                  Sales@santechs.net
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-primary flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-black">Registered Address</h4>
                <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                  Office No A 154, Balaji Bhavan, Sector 11, Plot no.42A, Cbd Belapur, Navi Mumbai, Maharashtra, India - 400614
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Message Form */}
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 shadow-sm">
          <h3 className="text-xl font-bold text-black font-sans mb-1">Send a Message</h3>
          <p className="text-xs text-slate-500 mb-6">Our platform coordinators will reply back within 24 hours.</p>

          {success ? (
            <div className="p-6 bg-white border border-emerald-100 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-slate-900 text-sm">Message Sent Successfully!</h4>
              <p className="text-xs text-slate-500">Thank you for contacting us. A coordinator will email or call you shortly.</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl text-center">
                    {error}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Full Name</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          placeholder="Your Name"
                          className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs placeholder:text-slate-400 outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] text-red-500" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-slate-700">Work Email</FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            type="email"
                            placeholder="Email Address"
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs placeholder:text-slate-400 outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
                          />
                        </FormControl>
                        <FormMessage className="text-[10px] text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-slate-700">Contact Number</FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            placeholder="Phone Number"
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs placeholder:text-slate-400 outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
                          />
                        </FormControl>
                        <FormMessage className="text-[10px] text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Message / Request Description</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          rows={4}
                          placeholder="Please describe your enquiry, machinery model specifications, or bulk listing requests..."
                          className="w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs placeholder:text-slate-400 outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all resize-none"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] text-red-500" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full h-11 bg-[#ff7759] hover:bg-[#ff7759]/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-60 flex items-center justify-center gap-2 border-0 shadow-sm"
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Send Message
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </section>

    </div>
  );
}
