"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Lock, Mail, Phone, Calendar, UserCheck, ShieldCheck, Loader2 } from "lucide-react";
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
      setInfoSuccess("Profile information updated successfully!");
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
      setSecuritySuccess("Password updated successfully!");
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
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs text-slate-500 font-mono">Loading profile settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold font-heading text-slate-900">
          Account Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal details, credentials, and account settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab("general")}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-all ${
              activeTab === "general"
                ? "bg-black text-white"
                : "text-slate-600 hover:bg-[#eeece7]/60 hover:text-black"
            }`}
          >
            <User className="w-4 h-4" />
            General Info
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-all ${
              activeTab === "security"
                ? "bg-black text-white"
                : "text-slate-600 hover:bg-[#eeece7]/60 hover:text-black"
            }`}
          >
            <Lock className="w-4 h-4" />
            Password & Security
          </button>
        </div>

        {/* Tab Contents */}
        <div className="md:col-span-3">
          {activeTab === "general" && (
            <Card className="border-[#e5e7eb] rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Profile Details</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Edit public information linked to your Santechs account.</p>
                </div>

                <form onSubmit={handleInfoSubmit} className="space-y-4">
                  {infoSuccess && (
                    <div className="p-3 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
                      {infoSuccess}
                    </div>
                  )}
                  {infoError && (
                    <div className="p-3 text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
                      {infoError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-xl border-slate-200 focus-visible:ring-black"
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number</label>
                      <Input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="rounded-xl border-slate-200 focus-visible:ring-black"
                        placeholder="e.g. +91 99999 99999"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Email Address</label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 font-medium">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{profile?.email}</span>
                      <Badge variant="outline" className="ml-auto text-[9px] font-bold">Primary</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Account Role</label>
                      <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 font-medium">
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        <span>{profile?.role?.replace("_", " ")}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Account Status</label>
                      <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 font-medium">
                        <UserCheck className="w-4 h-4 text-slate-400" />
                        <span>{profile?.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Member Since</label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 font-medium">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>
                        {profile?.createdAt
                          ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={updateInfoMutation.isPending}
                      className="bg-black text-white hover:bg-neutral-800 rounded-full px-6 text-xs uppercase tracking-wider font-semibold"
                    >
                      {updateInfoMutation.isPending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
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
            <Card className="border-[#e5e7eb] rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Change Password</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Ensure your account is protected with a secure password.</p>
                </div>

                <form onSubmit={handleSecuritySubmit} className="space-y-4">
                  {securitySuccess && (
                    <div className="p-3 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
                      {securitySuccess}
                    </div>
                  )}
                  {securityError && (
                    <div className="p-3 text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
                      {securityError}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Password</label>
                    <Input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="rounded-xl border-slate-200 focus-visible:ring-black"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">New Password</label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="rounded-xl border-slate-200 focus-visible:ring-black"
                        placeholder="Min 8 characters"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Confirm New Password</label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="rounded-xl border-slate-200 focus-visible:ring-black"
                        placeholder="Retype new password"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={updatePasswordMutation.isPending}
                      className="bg-black text-white hover:bg-neutral-800 rounded-full px-6 text-xs uppercase tracking-wider font-semibold"
                    >
                      {updatePasswordMutation.isPending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
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
