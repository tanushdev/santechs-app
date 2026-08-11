"use client";

import { useState } from "react";
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
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
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

const roles = ["ALL", "BUYER", "SELLER", "ADMIN"];
const ITEMS_PER_PAGE = 3;

export default function AdminAllUsersPage() {
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"account" | "company" | "products" | "enquiries" | "wishlist">("account");
  
  // Pagination states
  const [productsPage, setProductsPage] = useState(1);
  const [enquiriesPage, setEnquiriesPage] = useState(1);

  const { data: session } = useSession();

  // Query all users
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["admin", "all-users", selectedRole],
    queryFn: async () => {
      const url = selectedRole === "ALL" ? "/api/admin/users" : `/api/admin/users?role=${selectedRole}`;
      const res = await fetch(url);
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
    setProductsPage(1);
    setEnquiriesPage(1);
    setDetailModalOpen(true);
  };

  const filtered = (users ?? []).filter((u: Record<string, unknown>) => {
    const name = String(u.name ?? "").toLowerCase();
    const email = String(u.email ?? "").toLowerCase();
    const role = String(u.role ?? "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q) || role.includes(q);
  });

  const detailUser = userDetailData?.user;
  const company = userDetailData?.company;
  const products = userDetailData?.products ?? [];
  const buyerEnquiries = userDetailData?.buyerEnquiries ?? [];
  const sellerEnquiries = userDetailData?.sellerEnquiries ?? [];
  const wishlist = userDetailData?.wishlist ?? [];

  // Paginated Products
  const totalProductsPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginatedProducts = products.slice((productsPage - 1) * ITEMS_PER_PAGE, productsPage * ITEMS_PER_PAGE);

  // Paginated Buyer Enquiries
  const totalEnquiriesPages = Math.ceil(buyerEnquiries.length / ITEMS_PER_PAGE);
  const paginatedBuyerEnquiries = buyerEnquiries.slice((enquiriesPage - 1) * ITEMS_PER_PAGE, enquiriesPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">
            User Account Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Directory of all registered buyers, sellers, and admin accounts. Click any user to inspect their profile and added items.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Role filter buttons */}
      <div className="flex flex-wrap gap-2">
        {roles.map((r) => (
          <Button
            key={r}
            size="sm"
            variant={selectedRole === r ? "default" : "outline"}
            onClick={() => setSelectedRole(r)}
            className="text-xs font-semibold"
          >
            {r.replace("_", " ")}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
          Loading user database...
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-lg font-bold font-heading mb-1">No Users Found</h3>
            <p className="text-sm text-muted-foreground">No accounts match the criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((user: Record<string, unknown>) => {
            const role = String(user.role);
            return (
              <Card
                key={String(user._id)}
                onClick={() => handleOpenDetail(String(user._id))}
                className="hover:border-primary/50 transition-all cursor-pointer group card-hover"
              >
                <CardContent className="p-5 flex items-start gap-4 justify-between">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-2xl orange-gradient flex items-center justify-center text-white font-bold text-lg flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      {String(user.name).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold font-heading text-sm truncate group-hover:text-primary transition-colors">
                          {String(user.name)}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-[10px] shrink-0 font-semibold px-2 py-0.5 ${
                            role === "SUPER_ADMIN" || role === "ADMIN"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200"
                              : role === "SELLER"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {role.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {String(user.email)}
                      </p>
                      {Boolean(user.phone) && (
                        <p className="text-[11px] text-slate-500 font-mono">
                          {String(user.phone)}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground/60">
                        <span>Joined {new Date(String(user.createdAt)).toLocaleDateString()}</span>
                        <span className="font-medium text-primary flex items-center gap-1 group-hover:underline">
                          <span>View details</span>
                          <Eye className="w-3 h-3 shrink-0" />
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
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 self-center disabled:opacity-50"
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
      )}

      {/* User Full Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-white rounded-2xl border-slate-200 shadow-2xl">
          <DialogHeader className="p-6 pb-4 border-b border-slate-200 shrink-0 bg-slate-50/50">
            {detailLoading ? (
              <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                <span>Loading user profile...</span>
              </div>
            ) : detailUser ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-6">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl orange-gradient flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">
                    {detailUser.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <DialogTitle className="text-lg sm:text-xl font-bold font-heading text-slate-900 leading-snug">
                      {detailUser.name}
                    </DialogTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          detailUser.role === "SUPER_ADMIN" || detailUser.role === "ADMIN"
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
                      className="text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 shrink-0 self-start sm:self-center font-semibold rounded-xl"
                    >
                      {deletingId === detailUser._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 shrink-0" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                      )}
                      <span>Delete User</span>
                    </Button>
                  )}
              </div>
            ) : (
              <DialogTitle className="text-red-500">Failed to load user</DialogTitle>
            )}
          </DialogHeader>

          {detailLoading ? (
            <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span>Fetching associated storefronts, listings, and quotes...</span>
            </div>
          ) : detailUser ? (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {/* Modal Tabs Navigation */}
              <div className="flex items-center gap-2 px-6 border-b border-slate-200 bg-slate-50/50 overflow-x-auto shrink-0">
                <button
                  onClick={() => setActiveTab("account")}
                  className={`py-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === "account"
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span>Account Details</span>
                </button>

                {detailUser.role === "SELLER" && (
                  <>
                    {company && (
                      <button
                        onClick={() => setActiveTab("company")}
                        className={`py-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                          activeTab === "company"
                            ? "border-primary text-primary"
                            : "border-transparent text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Company Profile</span>
                      </button>
                    )}

                    <button
                      onClick={() => setActiveTab("products")}
                      className={`py-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                        activeTab === "products"
                          ? "border-primary text-primary"
                          : "border-transparent text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <Package className="w-3.5 h-3.5 shrink-0" />
                      <span>Products ({products.length})</span>
                    </button>
                  </>
                )}

                {detailUser.role === "BUYER" && (
                  <>
                    <button
                      onClick={() => setActiveTab("enquiries")}
                      className={`py-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                        activeTab === "enquiries"
                          ? "border-primary text-primary"
                          : "border-transparent text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                      <span>Quote Requests ({buyerEnquiries.length})</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("wishlist")}
                      className={`py-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                        activeTab === "wishlist"
                          ? "border-primary text-primary"
                          : "border-transparent text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 shrink-0" />
                      <span>Wishlist ({wishlist.length})</span>
                    </button>
                  </>
                )}
              </div>

              {/* Tab Content Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* 1. Account Details Tab */}
                {activeTab === "account" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Full Name</span>
                        <p className="text-sm font-bold text-slate-900">{detailUser.name}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Email Address</span>
                        <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{detailUser.email}</span>
                        </p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Phone Number</span>
                        <p className="text-sm font-bold text-slate-900 font-mono flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{detailUser.phone || "Not provided"}</span>
                        </p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Account Role</span>
                        <p className="text-sm font-bold text-slate-900 uppercase">{detailUser.role}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Joined Date</span>
                        <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {new Date(detailUser.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Last Login</span>
                        <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {detailUser.lastLoginAt
                              ? new Date(detailUser.lastLoginAt).toLocaleString()
                              : "Never logged in"}
                          </span>
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
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                              <Building2 className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-base text-slate-900 truncate">{company.name}</h3>
                              <p className="text-xs text-slate-500 font-mono">Slug: {company.slug}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={`text-[10px] font-bold shrink-0 self-start sm:self-center ${company.isApproved ? "status-approved" : "status-pending"}`}>
                            {company.isApproved ? "Approved Storefront" : "Pending Verification"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">GST / Tax ID</span>
                            <p className="text-xs font-mono font-bold text-slate-800">{company.gstNumber || "N/A"}</p>
                          </div>
                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Establishment Year</span>
                            <p className="text-xs font-bold text-slate-800">{company.establishedYear || "N/A"}</p>
                          </div>
                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Company Phone</span>
                            <p className="text-xs font-mono font-bold text-slate-800">{company.phone || "N/A"}</p>
                          </div>
                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Company Email</span>
                            <p className="text-xs font-bold text-slate-800 truncate">{company.email || "N/A"}</p>
                          </div>
                          {company.website && (
                            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1 sm:col-span-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Website</span>
                              <a
                                href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5 truncate"
                              >
                                <span className="truncate">{company.website}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            </div>
                          )}
                        </div>

                        {company.description && (
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Description</span>
                            <p className="text-xs text-slate-700 leading-relaxed">{company.description}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-slate-400 text-xs">
                        No company profile registered for this account.
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Products Added Tab (with Pagination) */}
                {activeTab === "products" && (
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    {products.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 text-xs">
                        No products added by this user.
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          {paginatedProducts.map((p: any) => (
                            <div
                              key={p._id}
                              className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 relative shrink-0 border border-slate-200">
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
                                <div className="min-w-0 flex-1 space-y-0.5">
                                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate" title={p.name}>
                                    {p.name}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 font-mono">
                                    <span className="text-[10px] text-slate-600 bg-slate-200/60 px-1.5 py-0.2 rounded font-semibold">
                                      Ref: {p.referenceNumber}
                                    </span>
                                    <span>•</span>
                                    <span className="font-bold text-slate-900">{p.currency} {p.price?.toLocaleString()}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 text-slate-600">
                                      <Eye className="w-3 h-3 text-slate-400 shrink-0" />
                                      <span>{p.views ?? 0} Views</span>
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] font-bold px-2 py-0.5 ${
                                    p.status === "APPROVED"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : p.status === "PENDING"
                                      ? "bg-amber-50 text-amber-700 border-amber-200"
                                      : "bg-rose-50 text-rose-700 border-rose-200"
                                  }`}
                                >
                                  {p.status}
                                </Badge>
                                {p.slug && (
                                  <Link href={`/products/${p.slug}`} target="_blank">
                                    <Button size="sm" variant="outline" className="h-7 text-xs font-semibold px-2.5 rounded-lg border-slate-200 hover:bg-white hover:text-primary flex items-center gap-1">
                                      <span>View</span>
                                      <ExternalLink className="w-3 h-3 shrink-0" />
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination Bar for Products */}
                        {totalProductsPages > 1 && (
                          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs shrink-0 mt-auto">
                            <span className="text-slate-500 font-medium">
                              Showing <strong>{(productsPage - 1) * ITEMS_PER_PAGE + 1}</strong>–<strong>{Math.min(productsPage * ITEMS_PER_PAGE, products.length)}</strong> of <strong>{products.length}</strong> products
                            </span>
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={productsPage === 1}
                                onClick={() => setProductsPage((p) => Math.max(1, p - 1))}
                                className="h-7 text-xs font-semibold px-2 rounded-lg border-slate-200 flex items-center gap-1"
                              >
                                <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
                                <span>Prev</span>
                              </Button>
                              <span className="text-slate-600 font-bold px-1.5 font-mono text-[11px]">
                                {productsPage} / {totalProductsPages}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={productsPage === totalProductsPages}
                                onClick={() => setProductsPage((p) => Math.min(totalProductsPages, p + 1))}
                                className="h-7 text-xs font-semibold px-2 rounded-lg border-slate-200 flex items-center gap-1"
                              >
                                <span>Next</span>
                                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* 4. Quote Requests Tab (with Pagination) */}
                {activeTab === "enquiries" && (
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    {buyerEnquiries.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 text-xs">
                        No quote requests linked to this account.
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          {paginatedBuyerEnquiries.map((e: any) => (
                            <div
                              key={e._id}
                              className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                                  {e.product?.name ?? "Product Inquiry"}
                                </span>
                                <Badge variant="outline" className="text-[10px] font-bold bg-amber-50 text-amber-700 border-amber-200 shrink-0">
                                  {e.status?.replace(/_/g, " ")}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 font-mono bg-white p-2 rounded-lg border border-slate-100">
                                <div className="truncate"><span className="text-slate-400">Ref:</span> {e.referenceNumber}</div>
                                <div className="truncate"><span className="text-slate-400">Qty:</span> {e.quantity || "N/A"}</div>
                                <div className="truncate"><span className="text-slate-400">Budget:</span> {e.budget || "N/A"}</div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination Bar for Enquiries */}
                        {totalEnquiriesPages > 1 && (
                          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs shrink-0 mt-auto">
                            <span className="text-slate-500 font-medium">
                              Showing <strong>{(enquiriesPage - 1) * ITEMS_PER_PAGE + 1}</strong>–<strong>{Math.min(enquiriesPage * ITEMS_PER_PAGE, buyerEnquiries.length)}</strong> of <strong>{buyerEnquiries.length}</strong> requests
                            </span>
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={enquiriesPage === 1}
                                onClick={() => setEnquiriesPage((p) => Math.max(1, p - 1))}
                                className="h-7 text-xs font-semibold px-2 rounded-lg border-slate-200 flex items-center gap-1"
                              >
                                <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
                                <span>Prev</span>
                              </Button>
                              <span className="text-slate-600 font-bold px-1.5 font-mono text-[11px]">
                                {enquiriesPage} / {totalEnquiriesPages}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={enquiriesPage === totalEnquiriesPages}
                                onClick={() => setEnquiriesPage((p) => Math.min(totalEnquiriesPages, p + 1))}
                                className="h-7 text-xs font-semibold px-2 rounded-lg border-slate-200 flex items-center gap-1"
                              >
                                <span>Next</span>
                                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
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
                            className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <h5 className="font-bold text-xs text-slate-900 truncate" title={item.product?.name}>
                                {item.product?.name ?? "Product Item"}
                              </h5>
                              <p className="text-[11px] text-slate-600 font-mono font-semibold">
                                {item.product?.currency} {item.product?.price?.toLocaleString()}
                              </p>
                            </div>
                            {item.product?.slug && (
                              <Link href={`/products/${item.product.slug}`} target="_blank">
                                <Button size="sm" variant="outline" className="h-8 text-xs font-semibold px-3 rounded-lg border-slate-200 flex items-center gap-1.5 shrink-0">
                                  <span>Open</span>
                                  <ExternalLink className="w-3 h-3 shrink-0" />
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
