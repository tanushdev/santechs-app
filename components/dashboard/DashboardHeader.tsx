"use client";

import { useSession, signOut } from "next-auth/react";
import { Bell, LogOut, Building2, ShieldCheck, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function DashboardHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAdmin = pathname.startsWith("/admin");

  const queryClient = useQueryClient();

  const { data: notifData } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: async () => {
      const res = await fetch("/api/notifications?unread=true&limit=1");
      const json = await res.json();
      return json.data;
    },
    enabled: !!session,
    refetchInterval: 30000,
  });

  const { data: recentNotifications, isLoading: recentNotificationsLoading } = useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: async () => {
      const res = await fetch("/api/notifications?limit=5");
      if (!res.ok) return [];
      const json = await res.json();
      return json.data?.items ?? [];
    },
    enabled: !!session,
  });

  const markReadMutation = useMutation({
    mutationFn: async (payload: { ids?: string[]; markAll?: boolean }) => {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const formatRelativeTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const unreadCount = notifData?.unreadCount ?? 0;

  // Get current page section name
  const getSectionName = () => {
    if (pathname.includes("/seller/products/new")) return "Add New Product";
    if (pathname.includes("/seller/products")) return "Product Catalog";
    if (pathname.includes("/seller/enquiries")) return "Quote Requests & Deals";
    if (pathname.includes("/seller/company")) return "Company Profile Settings";
    if (pathname.includes("/seller/dashboard")) return "Seller Overview";
    
    if (pathname.includes("/admin/dashboard")) return "Admin Control Center";
    if (pathname.includes("/admin/sellers")) return "Seller Approvals";
    if (pathname.includes("/admin/products")) return "Listing Approvals";
    if (pathname.includes("/admin/all-products")) return "Global Product Inventory";
    if (pathname.includes("/admin/all-users")) return "User Management";
    if (pathname.includes("/admin/enquiries")) return "Enquiry & Deal Pipeline";
    if (pathname.includes("/admin/categories")) return "Category Manager";
    return "Dashboard Console";
  };

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-6 lg:px-8 h-16 bg-white border-b border-[#e5e7eb] shrink-0"
    >
      {/* Page Title */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 tracking-tight font-sans">
          {getSectionName()}
        </h2>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        
        {/* Notifications Icon Button */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative cursor-pointer hover:bg-[#eeece7]/60 h-9 w-9 flex items-center justify-center rounded-full transition-colors outline-none text-slate-500 hover:text-black">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center bg-[#ff7759] text-white border-0">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 sm:w-96 p-2 space-y-2">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="font-bold text-sm text-black">Recent Updates</span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markReadMutation.mutate({ markAll: true })}
                  disabled={markReadMutation.isPending}
                  className="text-[10px] font-bold text-[#ff7759] hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </div>
            <DropdownMenuSeparator />

            {recentNotificationsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-[#ff7759]" />
              </div>
            ) : !recentNotifications || recentNotifications.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No recent updates.
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-1">
                {recentNotifications.map((notif: any) => (
                  <DropdownMenuItem
                    key={notif._id}
                    className={cn(
                      "flex flex-col items-start gap-1 p-2.5 rounded-lg cursor-pointer transition-colors text-left",
                      notif.isRead
                        ? "hover:bg-slate-50"
                        : "bg-[#ff7759]/5 hover:bg-[#ff7759]/10 border-l-2 border-[#ff7759]"
                    )}
                    onClick={() => {
                      if (!notif.isRead) {
                        markReadMutation.mutate({ ids: [notif._id] });
                      }
                    }}
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <span className="font-bold text-xs text-slate-900 leading-snug">
                        {notif.title}
                      </span>
                      <span className="text-[9px] text-slate-400 shrink-0 font-mono">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal font-medium break-words w-full">
                      {notif.message}
                    </p>
                    {notif.link && (
                      <Link
                        href={notif.link}
                        className="text-[10px] font-bold text-[#ff7759] mt-1 hover:underline block"
                      >
                        View Details →
                      </Link>
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
            )}

            <DropdownMenuSeparator />
            <div className="p-1">
              <Link href={isAdmin ? "/admin/dashboard/notifications" : "/seller/dashboard/notifications"}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs font-bold text-slate-500 hover:text-black uppercase tracking-wider cursor-pointer"
                >
                  View All Notifications
                </Button>
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Button Dropdown */}
        {session && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 outline-none cursor-pointer">
              <Avatar className="h-8 w-8 hover:opacity-90 transition-opacity ring-2 ring-black/5">
                <AvatarImage src={session.user.image ?? ""} />
                <AvatarFallback className="text-xs bg-black text-white font-bold">
                  {session.user.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-xl p-1 bg-white border border-slate-200 shadow-lg"
            >
              <DropdownMenuLabel className="px-3 py-2">
                <p className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                  Authenticated as
                </p>
                <p className="text-sm font-bold text-slate-900 truncate mt-0.5">
                  {session.user.name}
                </p>
                <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 my-1" />
              
              {!isAdmin ? (
                <DropdownMenuItem className="p-0">
                  <Link
                    href="/seller/company"
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 hover:bg-[#eeece7]/60 cursor-pointer w-full"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Company Profile
                  </Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="p-0">
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 hover:bg-[#eeece7]/60 cursor-pointer w-full"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Admin Control
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator className="bg-slate-100 my-1" />
              
              <DropdownMenuItem
                onClick={() => {
                  const base = window.location.origin;
                  const path = (session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN")
                    ? "/super_admin"
                    : (session?.user?.role === "SELLER" ? "/seller/login" : "/");
                  signOut({ callbackUrl: `${base}${path}` });
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

      </div>
    </header>
  );
}
