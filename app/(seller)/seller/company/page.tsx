"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companySchema, CompanyFormValues } from "@/lib/validations";
import { updateCompanyProfile, getCompanyProfile } from "@/lib/actions/company.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, Info, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function CompanyProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [company, setCompany] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await getCompanyProfile();
        if (res.success && res.company) {
          setCompany(res.company);
          reset({
            name: res.company.name,
            description: res.company.description || "",
            phone: res.company.phone,
            email: res.company.email,
            website: res.company.website || "",
            gstNumber: res.company.gstNumber || "",
            panNumber: res.company.panNumber || "",
            establishedYear: res.company.establishedYear,
            address: {
              street: res.company.address?.street || "",
              city: res.company.address?.city || "",
              state: res.company.address?.state || "",
              country: res.company.address?.country || "",
              pincode: res.company.address?.pincode || "",
            },
          });
        }
      } catch (err) {
        setError("Failed to load company profile");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [reset]);

  const onSubmit = async (data: CompanyFormValues) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await updateCompanyProfile(data);
      if (res.success) {
        setSuccess("Company profile updated successfully!");
        setCompany(res.company);
        router.refresh();
      } else {
        setError(res.error || "An error occurred");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-100/40 via-[#ff7759]/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center shadow-md">
              <Building2 className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#ff7759] font-bold">
                Seller Verification
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Company Profile
              </h1>
              <p className="text-slate-500 text-xs mt-0.5">
                Provide your verified business credentials to list industrial machinery.
              </p>
            </div>
          </div>
        </div>
      </div>

      {company && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ff7759] border border-orange-200 flex items-center justify-center font-bold text-base font-sans">
              {company.name?.charAt(0)?.toUpperCase() || "C"}
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">{company.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={company.isApproved ? "bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded-full py-0.5 px-2.5 font-mono" : "bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold rounded-full py-0.5 px-2.5 font-mono"}>
                  {company.isApproved ? "Approved Seller" : "Pending Approval"}
                </Badge>
                <Badge variant="outline" className={company.isVerified ? "bg-blue-50 text-blue-800 border-blue-200 text-[10px] font-bold rounded-full py-0.5 px-2.5 font-mono" : "border-slate-200 text-slate-500 text-[10px] rounded-full py-0.5 px-2 font-mono"}>
                  {company.isVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>
          </div>
          {!company.isApproved && (
            <div className="flex items-center gap-2.5 text-xs text-amber-800 font-medium bg-amber-50/80 border border-amber-200/80 p-3 rounded-2xl max-w-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>Full marketplace publishing features unlock upon verification.</span>
            </div>
          )}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold border border-red-200">
          <Info className="w-4 h-4 flex-shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 bg-white shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Business Details</h3>
            <p className="text-xs text-slate-500 mt-0.5">Corporate legal identity and public storefront information.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="name" className="text-xs font-bold text-slate-700">Company Legal Name *</Label>
              <Input id="name" {...register("name")} placeholder="Acme Textiles Ltd" className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus-visible:ring-[#ff7759] focus-visible:border-[#ff7759]" />
              {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="description" className="text-xs font-bold text-slate-700">About / Company Description</Label>
              <Textarea id="description" {...register("description")} rows={4} placeholder="Describe your company, manufacturing focus, and history..." className="text-sm rounded-xl border-slate-200 bg-slate-50/50 resize-none focus-visible:ring-[#ff7759] focus-visible:border-[#ff7759]" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-slate-700">Company Email *</Label>
              <Input id="email" type="email" {...register("email")} placeholder="contact@acmetextiles.com" className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus-visible:ring-[#ff7759] focus-visible:border-[#ff7759]" />
              {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-bold text-slate-700">Company Phone *</Label>
              <Input id="phone" {...register("phone")} placeholder="+91 98765 43210" className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus-visible:ring-[#ff7759] focus-visible:border-[#ff7759]" />
              {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="website" className="text-xs font-bold text-slate-700">Website URL</Label>
              <Input id="website" {...register("website")} placeholder="https://acmetextiles.com" className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus-visible:ring-[#ff7759] focus-visible:border-[#ff7759]" />
              {errors.website && <p className="text-xs text-red-600">{errors.website.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="establishedYear" className="text-xs font-bold text-slate-700">Established Year</Label>
              <Input id="establishedYear" type="number" {...register("establishedYear", { valueAsNumber: true })} placeholder="2005" className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus-visible:ring-[#ff7759] focus-visible:border-[#ff7759]" />
              {errors.establishedYear && <p className="text-xs text-red-600">{errors.establishedYear.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gstNumber" className="text-xs font-bold text-slate-700">GST Number (Optional)</Label>
              <Input id="gstNumber" {...register("gstNumber")} placeholder="24AAAAC1234A1Z1" className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus-visible:ring-[#ff7759] focus-visible:border-[#ff7759]" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="panNumber" className="text-xs font-bold text-slate-700">PAN Number (Optional)</Label>
              <Input id="panNumber" {...register("panNumber")} placeholder="ABCDE1234F" className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus-visible:ring-[#ff7759] focus-visible:border-[#ff7759]" />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 bg-white shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Registered Address</h3>
            <p className="text-xs text-slate-500 mt-0.5">Physical location of headquarters or warehousing facilities.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="address.street" className="text-xs font-bold text-slate-700">Street Address</Label>
              <Input id="address.street" {...register("address.street")} placeholder="Suite 400, Industrial Zone" className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus-visible:ring-[#ff7759] focus-visible:border-[#ff7759]" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address.city" className="text-xs font-bold text-slate-700">City *</Label>
              <Input id="address.city" {...register("address.city")} placeholder="Surat" className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus-visible:ring-[#ff7759] focus-visible:border-[#ff7759]" />
              {errors.address?.city && <p className="text-xs text-red-600">{errors.address.city.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address.state" className="text-xs font-bold text-slate-700">State *</Label>
              <Input id="address.state" {...register("address.state")} placeholder="Gujarat" className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus-visible:ring-[#ff7759] focus-visible:border-[#ff7759]" />
              {errors.address?.state && <p className="text-xs text-red-600">{errors.address.state.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address.country" className="text-xs font-bold text-slate-700">Country *</Label>
              <Input id="address.country" {...register("address.country")} placeholder="India" className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus-visible:ring-[#ff7759] focus-visible:border-[#ff7759]" />
              {errors.address?.country && <p className="text-xs text-red-600">{errors.address.country.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address.pincode" className="text-xs font-bold text-slate-700">Pincode</Label>
              <Input id="address.pincode" {...register("address.pincode")} placeholder="395003" className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm focus-visible:ring-[#ff7759] focus-visible:border-[#ff7759]" />
            </div>
          </div>
        </div>

        {/* Form CTA Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" className="rounded-xl px-6 h-10 font-bold text-xs cursor-pointer" onClick={() => router.push("/seller/dashboard")}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="rounded-xl bg-black text-white hover:bg-slate-800 font-bold px-6 h-10 text-xs transition-colors cursor-pointer">
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin text-[#ff7759]" />
                Saving Profile...
              </>
            ) : (
              "Save Company Profile"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
