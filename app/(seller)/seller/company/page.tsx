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
            employeeCount: res.company.employeeCount,
            turnover: res.company.turnover,
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
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-[#e5e7eb]">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#75758a] font-bold">
          Profile Settings
        </span>
        <h1 className="text-3xl font-normal tracking-tight text-black font-sans mt-1">
          Company Profile
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Provide your verified business credentials to list industrial machines.
        </p>
      </div>

      {company && (
        <div className="bg-[#eeece7]/40 border border-[#e5e7eb] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white">
              <Building2 className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h2 className="font-bold text-black text-sm">{company.name}</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge className={company.isApproved ? "bg-[#003c33] text-white border-0 text-[10px] font-bold rounded-full py-0.5 px-2.5" : "bg-amber-500 text-white border-0 text-[10px] font-bold rounded-full py-0.5 px-2.5"}>
                  {company.isApproved ? "Approved Seller" : "Pending Verification"}
                </Badge>
                <Badge variant="outline" className={company.isVerified ? "bg-[#1863dc]/10 text-[#1863dc] border-0 text-[10px] font-bold rounded-full py-0.5 px-2.5" : "border-slate-200 text-slate-500 text-[10px] rounded-full py-0.5 px-2"}>
                  {company.isVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>
          </div>
          {!company.isApproved && (
            <div className="flex items-center gap-2 text-[11px] text-amber-800 font-bold bg-amber-50 border border-amber-200 p-3 rounded-xl max-w-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>Console will appear after verification.</span>
            </div>
          )}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl flex items-center gap-3 text-xs font-bold border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-xl flex items-center gap-3 text-xs font-bold border border-red-200">
          <Info className="w-4 h-4 flex-shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="border border-[#e5e7eb] rounded-2xl p-6 lg:p-8 space-y-6 bg-white shadow-xs">
          <h3 className="font-bold text-sm text-black font-sans uppercase tracking-wider">Business Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name" className="text-xs font-bold text-slate-700">Company Legal Name *</Label>
              <Input id="name" {...register("name")} placeholder="Acme Textiles Ltd" className="h-9 text-sm" />
              {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description" className="text-xs font-bold text-slate-700">About / Description</Label>
              <Textarea id="description" {...register("description")} rows={4} placeholder="Describe your company and core textile operations..." className="text-sm resize-none" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold text-slate-700">Company Email *</Label>
              <Input id="email" type="email" {...register("email")} placeholder="contact@acmetextiles.com" className="h-9 text-sm" />
              {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-bold text-slate-700">Company Phone *</Label>
              <Input id="phone" {...register("phone")} placeholder="+91 98765 43210" className="h-9 text-sm" />
              {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-xs font-bold text-slate-700">Website URL</Label>
              <Input id="website" {...register("website")} placeholder="https://acmetextiles.com" className="h-9 text-sm" />
              {errors.website && <p className="text-xs text-red-600">{errors.website.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="establishedYear" className="text-xs font-bold text-slate-700">Established Year</Label>
              <Input id="establishedYear" type="number" {...register("establishedYear", { valueAsNumber: true })} placeholder="2005" className="h-9 text-sm" />
              {errors.establishedYear && <p className="text-xs text-red-600">{errors.establishedYear.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeCount" className="text-xs font-bold text-slate-700">Employee Count</Label>
              <select id="employeeCount" {...register("employeeCount")} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Select size</option>
                {["1-10", "11-50", "51-200", "201-500", "500+"].map((count) => (
                  <option key={count} value={count}>{count}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="turnover" className="text-xs font-bold text-slate-700">Annual Turnover</Label>
              <select id="turnover" {...register("turnover")} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Select range</option>
                {["Under 1Cr", "1-5Cr", "5-25Cr", "25-100Cr", "100Cr+"].map((range) => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gstNumber" className="text-xs font-bold text-slate-700">GST Number (Optional)</Label>
              <Input id="gstNumber" {...register("gstNumber")} placeholder="24AAAAC1234A1Z1" className="h-9 text-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="panNumber" className="text-xs font-bold text-slate-700">PAN Number (Optional)</Label>
              <Input id="panNumber" {...register("panNumber")} placeholder="ABCDE1234F" className="h-9 text-sm" />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="border border-[#e5e7eb] rounded-2xl p-6 lg:p-8 space-y-6 bg-white shadow-xs">
          <h3 className="font-bold text-sm text-black font-sans uppercase tracking-wider">Registered Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address.street" className="text-xs font-bold text-slate-700">Street Address</Label>
              <Input id="address.street" {...register("address.street")} placeholder="Suite 400, Industrial Estate" className="h-9 text-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address.city" className="text-xs font-bold text-slate-700">City *</Label>
              <Input id="address.city" {...register("address.city")} placeholder="Surat" className="h-9 text-sm" />
              {errors.address?.city && <p className="text-xs text-red-600">{errors.address.city.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address.state" className="text-xs font-bold text-slate-700">State *</Label>
              <Input id="address.state" {...register("address.state")} placeholder="Gujarat" className="h-9 text-sm" />
              {errors.address?.state && <p className="text-xs text-red-600">{errors.address.state.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address.country" className="text-xs font-bold text-slate-700">Country *</Label>
              <Input id="address.country" {...register("address.country")} placeholder="India" className="h-9 text-sm" />
              {errors.address?.country && <p className="text-xs text-red-600">{errors.address.country.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address.pincode" className="text-xs font-bold text-slate-700">Pincode</Label>
              <Input id="address.pincode" {...register("address.pincode")} placeholder="395003" className="h-9 text-sm" />
            </div>
          </div>
        </div>

        {/* Form CTA Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e7eb]">
          <Button type="button" variant="outline" className="rounded-full px-6 h-10 font-semibold text-xs uppercase" onClick={() => router.push("/seller/dashboard")}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="rounded-full bg-black text-white hover:bg-neutral-800 font-semibold px-6 h-10 text-xs uppercase tracking-wider">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save & Submit Profile"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
