"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Search,
  Mail,
  Shield,
  Building2,
  UserCheck,
  Trash2,
  Loader2,
  Eye,
  Phone,
  Calendar,
  Package,
  MessageSquare,
  Heart,
  Globe,
  MapPin,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

function formatDate(dateInput?: string | Date) {
  if (!dateInput) return "N/A";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "N/A";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function formatDateTime(dateInput?: string | Date) {
  if (!dateInput) return "Never logged in";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "Never logged in";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const mins = String(d.getUTCMinutes()).padStart(2, "0");
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()} ${hours}:${mins} UTC`;
}

const roles = [
  { id: "ALL", label: "All Users" },
  { id: "BUYER", label: "Buyers" },
  { id: "SELLER", label: "Sellers" },
  { id: "ADMIN", label: "Admins" },
];

const ITEMS_PER_PAGE = 9;

export default function AdminAllUsersPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"account" | "company" | "products" | "enquiries" | "wishlist">("account");
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Query all users (excluding super admin in API)
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["admin", "all-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) return [];
      const json = await res.json();
      return json.data ?? [];
    },
  });

  // Query selected user full detail
  const { data: userDetailData, isLoading: detailLoading } = useQuery({
    queryKey: ["admin", "user-detail", selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return null;
      const res = await fetch(`/api/admin/users/${selectedUserId}`);
      if (!res.ok) throw new Error("Failed to load user details");
      const json = await res.json();
      return json.data;
    },
    enabled: !!selectedUserId && detailModalOpen,
  });

  // Calculate user counts by role
  const roleCounts = useMemo(() => {
    const counts = { ALL: users.length, BUYER: 0, SELLER: 0, ADMIN: 0 };
    users.forEach((u: any) => {
      const r = u.role as "BUYER" | "SELLER" | "ADMIN";
      if (counts[r] !== undefined) {
        counts[r]++;
      }
    });
    return counts;
  }, [users]);

  // Filter users by role and search query
  const filteredUsers = useMemo(() => {
    return users.filter((u: any) => {
      const matchesRole = selectedRole === "ALL" || u.role === selectedRole;
      const q = search.trim().toLowerCase();
      if (!q) return matchesRole;

      const name = String(u.name ?? "").toLowerCase();
      const email = String(u.email ?? "").toLowerCase();
      const phone = String(u.phone ?? "").toLowerCase();
      const companyName = String(u.company?.name ?? "").toLowerCase();
      const role = String(u.role ?? "").toLowerCase();

      return (
        matchesRole &&
        (name.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          companyName.includes(q) ||
          role.includes(q))
      );
    });
  }, [users, selectedRole, search]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedUsers = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, safeCurrentPage]);

  // Reset pagination when role or search changes
  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to permanently delete this user account? This will cascade delete their associated company profiles and product listings. This action is irreversible.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (selectedUserId === id) {
          setDetailModalOpen(false);
        }
        refetch();
      } else {
        const json = await res.json();
        alert(json.error ?? "Failed to delete user account.");
      }
    } catch (err) {
      alert("An unexpected error occurred while attempting deletion.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenDetail = (id: string) => {
    setSelectedUserId(id);
    setActiveTab("account");
    setDetailModalOpen(true);
  };

  const detailUser = userDetailData?.user;
  const company = userDetailData?.company;
  const products = userDetailData?.products ?? [];
  const buyerEnquiries = userDetailData?.buyerEnquiries ?? [];
  const sellerEnquiries = userDetailData?.sellerEnquiries ?? [];
  const wishlist = userDetailData?.wishlist ?? [];

  if (!mounted) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto" suppressHydrationWarning>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
            User Account Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Directory of all registered buyers, sellers, and admin accounts on Santechs.
          </p>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Accounts</p>
              <p className="text-2xl font-bold font-heading text-slate-900 mt-0.5">{roleCounts.ALL}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Buyers</p>
              <p className="text-2xl font-bold font-heading text-emerald-600 mt-0.5">{roleCounts.BUYER}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <UserCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sellers</p>
              <p className="text-2xl font-bold font-heading text-blue-600 mt-0.5">{roleCounts.SELLER}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Admins</p>
              <p className="text-2xl font-bold font-heading text-purple-600 mt-0.5">{roleCounts.ADMIN}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Shield className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        {/* Role filter buttons with count tags */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {roles.map((r) => {
            const count = roleCounts[r.id as keyof typeof roleCounts] ?? 0;
            const isSelected = selectedRole === r.id;
            return (
              <Button
                key={r.id}
                size="sm"
                variant={isSelected ? "default" : "outline"}
                onClick={() => handleRoleChange(r.id)}
                className={`text-xs h-8 px-3 rounded-full font-medium transition-all ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-xs"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {r.label}
                <span
                  className={`ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </Button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name, email, phone, company..."
            className="pl-9 pr-9 h-9 text-xs rounded-xl border-slate-200 focus-visible:ring-black"
          />
          {search && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Content */}
      {isLoading ? (
        <div className="text-center py-20 text-slate-500 text-xs">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
          Loading user database...
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="py-16 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold font-heading text-slate-900 mb-1">No Accounts Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No registered user accounts matched your search criteria or role filter.
            </p>
            {(search || selectedRole !== "ALL") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedRole("ALL");
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="mt-4 text-xs rounded-full"
              >
                Reset Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* User Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedUsers.map((user: any) => {
              const role = String(user.role);
              const companyName = user.company?.name;
              return (
                <Card
                  key={String(user._id)}
                  onClick={() => handleOpenDetail(String(user._id))}
                  className="border-slate-200/80 hover:border-slate-400 transition-all cursor-pointer group hover:shadow-md bg-white rounded-2xl relative overflow-hidden"
                >
                  <CardContent className="p-5 flex items-start gap-3.5 justify-between">
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-2xl orange-gradient flex items-center justify-center text-white font-bold text-lg flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                        {String(user.name).charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <h3 className="font-bold font-heading text-sm text-slate-900 truncate group-hover:text-primary transition-colors">
                            {String(user.name)}
                          </h3>
                          <Badge
                            variant="outline"
                            className={`text-[10px] shrink-0 font-bold ${
                              role === "ADMIN"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : role === "SELLER"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {role.replace("_", " ")}
                          </Badge>
                        </div>

                        <p className="text-xs text-slate-600 truncate flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{String(user.email)}</span>
                        </p>

                        {Boolean(user.phone) && (
                          <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{String(user.phone)}</span>
                          </p>
                        )}

                        {companyName && (
                          <div className="pt-0.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-full">
                              <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate">{companyName}</span>
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400 border-t border-slate-100 mt-2">
                          <span>Joined {formatDate(user.createdAt)}</span>
                          <span className="font-bold text-primary flex items-center gap-1 group-hover:underline">
                            Details <Eye className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>

                    {session?.user?.role === "SUPER_ADMIN" &&
                      String(user._id) !== session?.user?.id &&
                      role !== "SUPER_ADMIN" && (
                        <button
                          onClick={(e) => handleDelete(String(user._id), e)}
                          disabled={deletingId === String(user._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 self-start disabled:opacity-50"
                          title="Permanently delete user account"
                        >
                          {deletingId === String(user._id) ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500 text-center sm:text-left">
                Showing <span className="font-bold text-slate-900">{(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                <span className="font-bold text-slate-900">
                  {Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredUsers.length)}
                </span>{" "}
                of <span className="font-bold text-slate-900">{filteredUsers.length}</span> user accounts
              </p>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={safeCurrentPage === 1}
                  className="h-8 px-3 text-xs rounded-xl border-slate-200 disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                </Button>

                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 text-xs font-bold rounded-lg transition-colors ${
                        pageNum === safeCurrentPage
                          ? "bg-slate-900 text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={safeCurrentPage === totalPages}
                  className="h-8 px-3 text-xs rounded-xl border-slate-200 disabled:opacity-40"
                >
                  Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Full Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] w-[95vw] sm:w-full flex flex-col p-0 overflow-hidden bg-white rounded-2xl shadow-2xl border-slate-200">
          <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-slate-100 shrink-0">
            {detailLoading ? (
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                Loading user details...
              </div>
            ) : detailUser ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl orange-gradient flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">
                    {detailUser.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <DialogTitle className="text-lg sm:text-xl font-bold font-heading text-slate-900 truncate">
                        {detailUser.name}
                      </DialogTitle>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          detailUser.role === "ADMIN"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : detailUser.role === "SELLER"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {detailUser.role?.replace("_", " ")}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          detailUser.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {detailUser.status}
                      </Badge>
                    </div>
                    <DialogDescription className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                      ID: {detailUser._id}
                    </DialogDescription>
                  </div>
                </div>

                {session?.user?.role === "SUPER_ADMIN" &&
                  detailUser._id !== session?.user?.id &&
                  detailUser.role !== "SUPER_ADMIN" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleDelete(detailUser._id, e)}
                      disabled={deletingId === detailUser._id}
                      className="text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 self-start sm:self-center shrink-0"
                    >
                      {deletingId === detailUser._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      Delete User
                    </Button>
                  )}
              </div>
            ) : (
              <DialogTitle className="text-red-500">Failed to load user</DialogTitle>
            )}
          </DialogHeader>

          {detailLoading ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Fetching associated storefronts, listings, and quotes...
            </div>
          ) : detailUser ? (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {/* Modal Tabs Navigation */}
              <div className="flex items-center gap-1 px-4 sm:px-6 border-b border-slate-100 bg-slate-50/50 overflow-x-auto shrink-0">
                <button
                  onClick={() => setActiveTab("account")}
                  className={`py-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === "account"
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Users className="w-3.5 h-3.5 inline mr-1.5" />
                  Account Details
                </button>

                {detailUser.role === "SELLER" && (
                  <>
                    {company && (
                      <button
                        onClick={() => setActiveTab("company")}
                        className={`py-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === "company"
                            ? "border-primary text-primary"
                            : "border-transparent text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5 inline mr-1.5" />
                        Company Profile
                      </button>
                    )}

                    <button
                      onClick={() => setActiveTab("products")}
                      className={`py-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === "products"
                          ? "border-primary text-primary"
                          : "border-transparent text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <Package className="w-3.5 h-3.5 inline mr-1.5" />
                      Products ({products.length})
                    </button>
                  </>
                )}

                {detailUser.role === "BUYER" && (
                  <>
                    <button
                      onClick={() => setActiveTab("enquiries")}
                      className={`py-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === "enquiries"
                          ? "border-primary text-primary"
                          : "border-transparent text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 inline mr-1.5" />
                      Quote Requests ({buyerEnquiries.length})
                    </button>

                    <button
                      onClick={() => setActiveTab("wishlist")}
                      className={`py-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === "wishlist"
                          ? "border-primary text-primary"
                          : "border-transparent text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 inline mr-1.5" />
                      Wishlist ({wishlist.length})
                    </button>
                  </>
                )}
              </div>

              {/* Tab Content Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {/* 1. Account Details Tab */}
                {activeTab === "account" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Full Name</span>
                        <p className="text-sm font-bold text-slate-900">{detailUser.name}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Email Address</span>
                        <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{detailUser.email}</span>
                        </p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Phone Number</span>
                        <p className="text-sm font-bold text-slate-900 font-mono flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {detailUser.phone || "Not provided"}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Account Role</span>
                        <p className="text-sm font-bold text-slate-900 uppercase">{detailUser.role}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Joined Date</span>
                        <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {formatDate(detailUser.createdAt)}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Last Login</span>
                        <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {formatDateTime(detailUser.lastLoginAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Company Profile Tab */}
                {activeTab === "company" && (
                  <div>
                    {company ? (
                      <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <div className="flex items-center gap-3">
                            <Building2 className="w-8 h-8 text-primary shrink-0" />
                            <div className="min-w-0">
                              <h3 className="font-bold text-base text-slate-900 truncate">{company.name}</h3>
                              <p className="text-xs text-slate-500 font-mono truncate">Slug: {company.slug}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={company.isApproved ? "status-approved shrink-0" : "status-pending shrink-0"}>
                            {company.isApproved ? "Approved Storefront" : "Pending Verification"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">GST / Tax ID</span>
                            <p className="text-xs font-mono font-bold text-slate-800">{company.gstNumber || "N/A"}</p>
                          </div>
                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Establishment Year</span>
                            <p className="text-xs font-bold text-slate-800">{company.establishedYear || "N/A"}</p>
                          </div>
                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Company Phone</span>
                            <p className="text-xs font-mono font-bold text-slate-800">{company.phone || "N/A"}</p>
                          </div>
                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Company Email</span>
                            <p className="text-xs font-bold text-slate-800 truncate">{company.email || "N/A"}</p>
                          </div>
                          {company.website && (
                            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1 sm:col-span-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Website</span>
                              <a
                                href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 truncate"
                              >
                                <span className="truncate">{company.website}</span> <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            </div>
                          )}
                        </div>

                        {company.description && (
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Description</span>
                            <p className="text-xs text-slate-700 leading-relaxed">{company.description}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        No company profile registered for this account.
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Products Added Tab */}
                {activeTab === "products" && (
                  <div>
                    {products.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-xs">
                        No products added by this user.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {products.map((p: any) => (
                          <div
                            key={p._id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100/80 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 relative shrink-0">
                                {p.images?.[0] ? (
                                  <Image
                                    src={p.images[0]}
                                    alt={p.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <Package className="w-5 h-5 text-slate-400 m-auto" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-xs text-slate-900 truncate">{p.name}</h4>
                                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                  <span>Ref: {p.referenceNumber}</span>
                                  <span>•</span>
                                  <span>{p.currency} {p.price?.toLocaleString()}</span>
                                  <span>•</span>
                                  <span>{p.views ?? 0} Views</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-bold ${
                                  p.status === "APPROVED"
                                    ? "status-approved"
                                    : p.status === "PENDING"
                                    ? "status-pending"
                                    : "status-rejected"
                                }`}
                              >
                                {p.status}
                              </Badge>
                              <Link href={`/products/${p.slug}`} target="_blank">
                                <Button size="sm" variant="ghost" className="h-7 text-xs">
                                  View <ExternalLink className="w-3 h-3 ml-1" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Quote Requests Tab */}
                {activeTab === "enquiries" && (
                  <div className="space-y-6">
                    {buyerEnquiries.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-xs">
                        No quote requests submitted by this buyer.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Submitted Quote Requests ({buyerEnquiries.length})
                        </h4>
                        {buyerEnquiries.map((e: any) => (
                          <div
                            key={e._id}
                            className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-xs text-slate-900 truncate">
                                {e.product?.name ?? "Product Inquiry"}
                              </span>
                              <Badge variant="outline" className="text-[10px] font-bold status-pending shrink-0">
                                {e.status?.replace(/_/g, " ")}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 font-mono">
                              <div>Ref: {e.referenceNumber}</div>
                              <div>Qty: {e.quantity || "N/A"}</div>
                              <div>Budget: {e.budget || "N/A"}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Wishlist Tab */}
                {activeTab === "wishlist" && (
                  <div>
                    {wishlist.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-xs">
                        No saved wishlist items for this user.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {wishlist.map((item: any) => (
                          <div
                            key={item._id}
                            className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0 flex-1">
                              <h5 className="font-bold text-xs text-slate-900 truncate">
                                {item.product?.name ?? "Product Item"}
                              </h5>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                {item.product?.currency} {item.product?.price?.toLocaleString()}
                              </p>
                            </div>
                            {item.product?.slug && (
                              <Link href={`/products/${item.product.slug}`} target="_blank">
                                <Button size="sm" variant="ghost" className="h-7 text-xs shrink-0">
                                  Open <ExternalLink className="w-3 h-3 ml-1" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
