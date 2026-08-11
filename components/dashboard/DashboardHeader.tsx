"use client";

import { useSession, signOut } from "next-auth/react";
import { Bell, LogOut, Building2, ShieldCheck, Loader2, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebarNavContent } from "@/components/admin/AdminSidebar";
import { SellerSidebarNavContent } from "@/components/seller/SellerSidebar";
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
  const isSeller = pathname.startsWith("/seller");

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
    mutationFn: async ({ ids, markAll }: { ids?: string[]; markAll?: boolean }) => {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, markAll }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadCount = notifData?.unreadCount ?? 0;

  const formatRelativeTime = (dateInput: string | Date) => {
    const d = new Date(dateInput);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  };

  const getSectionName = () => {
    if (pathname.includes("/buyer/dashboard")) return "Buyer Dashboard";
    if (pathname.includes("/buyer/quotes")) return "My Quote Requests";
    if (pathname.includes("/buyer/wishlist")) return "Saved Equipment";
    if (pathname.includes("/seller/dashboard")) return "Seller Command Center";
    if (pathname.includes("/seller/products")) return "Inventory Listings";
    if (pathname.includes("/seller/enquiries")) return "Quote Requests & Deals";
    if (pathname.includes("/seller/company")) return "Company Profile";

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
      className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 bg-white border-b border-[#e5e7eb] shrink-0"
    >
      {/* Left side: Hamburger button on Mobile/Tablet + Page Title */}
      <div className="flex items-center gap-3">
        {(isAdmin || isSeller) && (
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger
              className="lg:hidden h-9.5 w-9.5 text-slate-800 hover:bg-slate-100/90 rounded-xl shrink-0 flex items-center justify-center transition-colors cursor-pointer border border-slate-200 shadow-2xs"
              aria-label="Expand navigation menu"
              title="Expand Navigation Menu"
            >
              <Menu className="w-5 h-5 text-slate-900" />
            </SheetTrigger>
            <SheetContent side="left" showCloseButton={false} className="p-0 w-72 bg-sidebar border-r border-sidebar-border">
              {isAdmin ? (
                <AdminSidebarNavContent
                  onLinkClick={() => setMobileNavOpen(false)}
                  onClose={() => setMobileNavOpen(false)}
                />
              ) : (
                <SellerSidebarNavContent
                  onLinkClick={() => setMobileNavOpen(false)}
                  onClose={() => setMobileNavOpen(false)}
                />
              )}
            </SheetContent>
          </Sheet>
        )}

        <div>
          <h2 className="text-sm font-bold text-slate-800 tracking-tight font-sans truncate">
            {getSectionName()}
          </h2>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notifications Icon Button */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative cursor-pointer hover:bg-[#eeece7]/60 h-9 w-9 flex items-center justify-center rounded-full transition-colors outline-none text-slate-500 hover:text-black shrink-0">
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
              <Link
                href={
                  isAdmin
                    ? "/admin/dashboard"
                    : session?.user?.role === "SELLER"
                    ? "/seller/dashboard"
                    : "/buyer/dashboard"
                }
                className="block text-center text-xs font-bold text-[#ff7759] hover:underline py-1"
              >
                Go to Alert Center
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Dropdown Profile Menu */}
        {session?.user && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 outline-none cursor-pointer group">
              <Avatar className="w-8 h-8 rounded-full border border-border group-hover:border-primary transition-colors">
                <AvatarImage src={session.user.image ?? (session.user as any).avatar} />
                <AvatarFallback className="orange-gradient text-white text-xs font-bold">
                  {session.user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {session.user.name}
                </span>
                <span className="text-[10px] text-slate-500 font-mono uppercase">
                  {session.user.role?.replace("_", " ")}
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 space-y-1">
              <DropdownMenuLabel className="font-normal p-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-bold leading-none text-slate-900">{session.user.name}</p>
                  <p className="text-[11px] leading-none text-slate-500 truncate">{session.user.email}</p>
                  <Badge variant="outline" className="mt-1 w-fit text-[9px] font-bold bg-[#ff7759]/10 text-[#ff7759] border-[#ff7759]/20">
                    {session.user.role?.replace("_", " ")}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Profile Link */}
              <Link
                href={
                  isAdmin
                    ? "/admin/dashboard/profile"
                    : session.user.role === "SELLER"
                    ? "/seller/dashboard/profile"
                    : "/buyer/dashboard/profile"
                }
                className="block w-full"
              >
                <DropdownMenuItem className="cursor-pointer text-xs flex items-center gap-2 p-2">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
              </Link>

              {isAdmin && (
                <Link href="/admin/dashboard" className="block w-full">
                  <DropdownMenuItem className="cursor-pointer text-xs flex items-center gap-2 p-2">
                    <ShieldCheck className="w-4 h-4 text-slate-500" />
                    <span>Super Admin Console</span>
                  </DropdownMenuItem>
                </Link>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/" })}
                className="cursor-pointer text-xs text-red-600 focus:text-red-600 focus:bg-red-50 flex items-center gap-2 p-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
