"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Lock,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ProfileClient() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"general" | "security">("general");

  // Profile Info form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [infoError, setInfoError] = useState<string | null>(null);
  const [infoSuccess, setInfoSuccess] = useState<string | null>(null);

  // Security form states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);

  // Fetch current profile details
  const { data: profile, isLoading } = useQuery({
    queryKey: ["user", "profile"],
    queryFn: async () => {
      const res = await fetch("/api/user/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      const json = await res.json();
      const userData = json.data;
      if (userData) {
        setName(userData.name || "");
        setPhone(userData.phone || "");
      }
      return userData;
    },
  });

  // Mutate profile info
  const updateInfoMutation = useMutation({
    mutationFn: async (payload: { name: string; phone: string }) => {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update profile info");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
      setInfoSuccess("Profile information updated successfully.");
      setInfoError(null);
      setTimeout(() => setInfoSuccess(null), 3000);
    },
    onError: (err: any) => {
      setInfoError(err.message || "Something went wrong.");
      setInfoSuccess(null);
    },
  });

  // Mutate password change
  const updatePasswordMutation = useMutation({
    mutationFn: async (payload: { oldPassword: string; newPassword: string }) => {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update password");
      return json;
    },
    onSuccess: () => {
      setSecuritySuccess("Password updated successfully.");
      setSecurityError(null);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSecuritySuccess(null), 3000);
    },
    onError: (err: any) => {
      setSecurityError(err.message || "Something went wrong.");
      setSecuritySuccess(null);
    },
  });

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setInfoError("Name cannot be empty");
      return;
    }
    if (!phone || phone.trim().length < 10) {
      setInfoError("Phone number is required and must be at least 10 digits");
      return;
    }
    updateInfoMutation.mutate({ name, phone });
  };

  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) {
      setSecurityError("Current password is required");
      return;
    }
    if (newPassword.length < 8) {
      setSecurityError("New password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityError("New passwords do not match");
      return;
    }
    updatePasswordMutation.mutate({ oldPassword, newPassword });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-[#ff7759]" />
        <p className="text-xs text-slate-500 font-mono">Loading profile settings...</p>
      </div>
    );
  }

  const roleLabel =
    profile?.role === "SUPER_ADMIN"
      ? "Super Admin"
      : profile?.role === "ADMIN"
      ? "Administrator"
      : profile?.role === "SELLER"
      ? "Verified Seller"
      : "Verified Buyer";

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Account Settings
          </h1>
          <p className="text-xs text-slate-500">
            Manage your personal profile credentials and account security.
          </p>
        </div>
        <Badge className="w-fit bg-orange-50 text-[#ff7759] border border-orange-200 text-[10px] font-bold rounded-full py-0.5 px-2.5 font-mono uppercase">
          {roleLabel}
        </Badge>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Compact Identity Card & Tab Navigation */}
        <div className="lg:col-span-4 space-y-3">
          <Card className="border-slate-200/80 rounded-2xl bg-white shadow-xs">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center text-lg font-bold font-sans">
                    {profile?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#ff7759] border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white font-bold">
                    ✓
                  </div>
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-slate-900 truncate">
                    {profile?.name || "User"}
                  </h2>
                  <p className="text-xs text-slate-500 truncate">{profile?.email}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Account Type</span>
                  <span className="font-semibold text-slate-800">{roleLabel}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Status</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {profile?.status || "Active"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Member Since</span>
                  <span className="font-mono text-slate-700">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })
                      : "2026"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tab Selector Buttons */}
          <div className="space-y-1.5">
            <button
              onClick={() => setActiveTab("general")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === "general"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white border border-slate-200/80 text-slate-600 hover:text-black hover:bg-slate-50"
              }`}
            >
              <User className={`w-4 h-4 ${activeTab === "general" ? "text-[#ff7759]" : "text-slate-400"}`} />
              <span>Personal Details</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === "security"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white border border-slate-200/80 text-slate-600 hover:text-black hover:bg-slate-50"
              }`}
            >
              <Lock className={`w-4 h-4 ${activeTab === "security" ? "text-[#ff7759]" : "text-slate-400"}`} />
              <span>Password & Security</span>
            </button>
          </div>
        </div>

        {/* Right Column: Settings Form Card */}
        <div className="lg:col-span-8">
          {activeTab === "general" && (
            <Card className="border-slate-200/80 rounded-2xl bg-white shadow-xs">
              <CardContent className="p-5 space-y-4">
                <div className="border-b border-slate-100 pb-2.5">
                  <h2 className="text-sm font-bold text-slate-900">Personal Information</h2>
                  <p className="text-[11px] text-slate-500">
                    Update your display name and direct phone number.
                  </p>
                </div>

                <form onSubmit={handleInfoSubmit} className="space-y-3.5">
                  {infoSuccess && (
                    <div className="p-2.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{infoSuccess}</span>
                    </div>
                  )}
                  {infoError && (
                    <div className="p-2.5 text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{infoError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Full Name *</label>
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-9 rounded-xl border-slate-200 bg-slate-50/50 text-xs focus-visible:ring-[#ff7759] focus-visible:border-[#ff7759]"
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Phone Number *</label>
                      <Input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-9 rounded-xl border-slate-200 bg-slate-50/50 text-xs focus-visible:ring-[#ff7759] focus-visible:border-[#ff7759]"
                        placeholder="e.g. +91 98765 43210"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Email Address (Primary)</label>
                    <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium truncate">{profile?.email}</span>
                      <Badge variant="outline" className="ml-auto text-[9px] font-mono bg-white text-slate-500 border-slate-200 py-0">
                        Verified Auth
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateInfoMutation.isPending}
                      className="bg-black text-white hover:bg-slate-800 rounded-xl px-5 h-9 text-xs font-bold transition-colors cursor-pointer"
                    >
                      {updateInfoMutation.isPending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-[#ff7759]" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card className="border-slate-200/80 rounded-2xl bg-white shadow-xs">
              <CardContent className="p-5 space-y-4">
                <div className="border-b border-slate-100 pb-2.5">
                  <h2 className="text-sm font-bold text-slate-900">Change Password</h2>
                  <p className="text-[11px] text-slate-500">
                    Use a strong password of at least 8 characters to protect your account.
                  </p>
                </div>

                <form onSubmit={handleSecuritySubmit} className="space-y-3.5">
                  {securitySuccess && (
                    <div className="p-2.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{securitySuccess}</span>
                    </div>
                  )}
                  {securityError && (
                    <div className="p-2.5 text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{securityError}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Current Password *</label>
                    <div className="relative">
                      <Input
                        type={showOldPassword ? "text" : "password"}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="h-9 rounded-xl border-slate-200 bg-slate-50/50 pr-9 focus-visible:ring-[#ff7759] focus-visible:border-[#ff7759] text-xs"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showOldPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">New Password *</label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="h-9 rounded-xl border-slate-200 bg-slate-50/50 pr-9 focus-visible:ring-[#ff7759] focus-visible:border-[#ff7759] text-xs"
                          placeholder="Min 8 chars"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Confirm Password *</label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-9 rounded-xl border-slate-200 bg-slate-50/50 pr-9 focus-visible:ring-[#ff7759] focus-visible:border-[#ff7759] text-xs"
                          placeholder="Retype password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={updatePasswordMutation.isPending}
                      className="bg-black text-white hover:bg-slate-800 rounded-xl px-5 h-9 text-xs font-bold transition-colors cursor-pointer"
                    >
                      {updatePasswordMutation.isPending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-[#ff7759]" />
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

