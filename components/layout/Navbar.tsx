"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Factory,
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  User,
  Heart,
  MessageSquare,
  Shield,
  Package,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface NavCategoryGroup {
  label: string;
  href: string;
  items: { label: string; href: string }[];
}

const fallbackCategories: NavCategoryGroup[] = [
  {
    label: "Machines",
    href: "/products?type=MACHINE",
    items: [
      { label: "DTY Machines", href: "/products?search=DTY" },
      { label: "FDY Machines", href: "/products?search=FDY" },
      { label: "POY Machines", href: "/products?search=POY" },
      { label: "Spinning Machines", href: "/products?search=spinning" },
      { label: "Recycling Plants", href: "/products?search=recycling" },
    ],
  },
  {
    label: "Raw Materials",
    href: "/products?type=RAW_MATERIAL",
    items: [
      { label: "PET Flakes", href: "/products?search=PET+flakes" },
      { label: "PET Chips", href: "/products?search=PET+chips" },
      { label: "PET Films", href: "/products?search=PET+films" },
      { label: "Yarn Waste", href: "/products?search=yarn+waste" },
    ],
  },
  {
    label: "Spare Parts",
    href: "/products?type=SPARE_PART",
    items: [
      { label: "Godet Rolls", href: "/products?search=godet+roll" },
      { label: "Filter Screens", href: "/products?search=filter+screen" },
      { label: "Spindles", href: "/products?search=spindle" },
    ],
  },
];

function getDashboardUrl(role: UserRole): string {
  switch (role) {
    case UserRole.SUPER_ADMIN:
    case UserRole.ADMIN:
      return "/admin/dashboard";
    case UserRole.SELLER:
      return "/seller/dashboard";
    case UserRole.BUYER:
      return "/buyer/dashboard";
    default:
      return "/";
  }
}

export default function Navbar() {
  const pathname = usePathname();
  const isSellPage = pathname === "/sell";
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const queryClient = useQueryClient();

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

  // Fetch categories dynamically from database (added by admin)
  const { data: dbCategories } = useQuery({
    queryKey: ["categories", "nav"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) return [];
      const json = await res.json();
      return json.data ?? [];
    },
  });

  // Dynamically group database categories by type
  const categories: NavCategoryGroup[] = (() => {
    if (!dbCategories || dbCategories.length === 0) return fallbackCategories;

    const typeMap: Record<string, { label: string; href: string; items: { label: string; href: string }[] }> = {
      MACHINE: { label: "Machines", href: "/products?type=MACHINE", items: [] },
      RAW_MATERIAL: { label: "Raw Materials", href: "/products?type=RAW_MATERIAL", items: [] },
      SPARE_PART: { label: "Spare Parts", href: "/products?type=SPARE_PART", items: [] },
      SERVICE: { label: "Services", href: "/products?type=SERVICE", items: [] },
    };

    dbCategories.forEach((cat: { name: string; slug: string; type: string }) => {
      if (typeMap[cat.type]) {
        typeMap[cat.type].items.push({
          label: cat.name,
          href: `/products?category=${cat.slug}`,
        });
      }
    });

    return Object.values(typeMap).filter((group) => group.items.length > 0);
  })();

  const unreadCount = notifData?.unreadCount ?? 0;

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md shadow-sm border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg orange-gradient flex items-center justify-center">
                <Factory className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-heading">
                San<span className="text-primary">techs</span>
              </span>
            </Link>

            {/* Desktop Nav — DYNAMICALLY POPULATED FROM DB */}
            {!isSellPage && (
              <nav className="hidden lg:flex items-center gap-1">
                {categories.map((cat) => (
                  <div
                    key={cat.label}
                    className="relative"
                    onMouseEnter={() => setActiveMenu(cat.label)}
                    onMouseLeave={() => setActiveMenu(null)}
                  >
                    <Link
                      href={cat.href}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                    >
                      {cat.label}
                      <ChevronDown className="w-3 h-3 transition-transform duration-200" style={{ transform: activeMenu === cat.label ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    </Link>

                    <AnimatePresence>
                      {activeMenu === cat.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 top-full pt-1 w-52 z-50"
                        >
                          <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-2xl overflow-hidden">
                            {cat.items.map((item) => (
                              <Link
                                key={item.label}
                                href={item.href}
                                className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                              >
                                {item.label}
                              </Link>
                            ))}
                            <div className="border-t border-border p-2">
                              <Link
                                href={cat.href}
                                className="block px-2 py-1.5 text-xs font-medium text-primary hover:underline"
                              >
                                View All →
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </nav>
            )}

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              {!isSellPage && (
                <Link href="/products">
                  <Button variant="ghost" size="icon" className="hidden sm:flex">
                    <Search className="w-4 h-4" />
                  </Button>
                </Link>
              )}

              {session ? (
                <>
                  {/* Notifications */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="relative cursor-pointer hover:bg-accent h-9 w-9 flex items-center justify-center rounded-md transition-colors outline-none">
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
                        <Link href={`${getDashboardUrl(session.user.role)}/notifications`}>
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

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 h-9 px-2 hover:bg-accent rounded-md transition-colors outline-none cursor-pointer">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={session.user.image ?? ""} />
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {session.user.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-medium max-w-24 truncate">
                        {session.user.name}
                      </span>
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuLabel>
                        <div className="flex flex-col">
                          <span className="font-medium truncate">{session.user.name}</span>
                          <span className="text-xs text-muted-foreground truncate">
                            {session.user.email}
                          </span>
                          <Badge variant="outline" className="w-fit mt-1 text-[10px]">
                            {session.user.role.replace("_", " ")}
                          </Badge>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <Link href={getDashboardUrl(session.user.role)} className="block w-full">
                        <DropdownMenuItem className="cursor-pointer">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Dashboard
                        </DropdownMenuItem>
                      </Link>
                      {session.user.role === UserRole.BUYER && (
                        <>
                          <Link href="/buyer/wishlist" className="block w-full">
                            <DropdownMenuItem className="cursor-pointer">
                              <Heart className="w-4 h-4 mr-2" />
                              Wishlist
                            </DropdownMenuItem>
                          </Link>
                          <Link href="/buyer/quotes" className="block w-full">
                            <DropdownMenuItem className="cursor-pointer">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              My Quotes
                            </DropdownMenuItem>
                          </Link>
                        </>
                      )}
                      {session.user.role === UserRole.SELLER && (
                        <Link href="/seller/products" className="block w-full">
                          <DropdownMenuItem className="cursor-pointer">
                            <Package className="w-4 h-4 mr-2" />
                            My Products
                          </DropdownMenuItem>
                        </Link>
                      )}
                      {(session.user.role === UserRole.ADMIN ||
                        session.user.role === UserRole.SUPER_ADMIN) && (
                        <Link href="/admin/dashboard" className="block w-full">
                          <DropdownMenuItem className="cursor-pointer">
                            <Shield className="w-4 h-4 mr-2" />
                            Admin Panel
                          </DropdownMenuItem>
                        </Link>
                      )}
                      <DropdownMenuSeparator />
                      <Link href={`${getDashboardUrl(session.user.role)}/profile`} className="block w-full">
                        <DropdownMenuItem className="cursor-pointer">
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          const base = window.location.origin;
                          const path = (session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN")
                            ? "/super_admin"
                            : (session?.user?.role === "SELLER" ? "/seller/login" : "/");
                          signOut({ callbackUrl: `${base}${path}` });
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href={isSellPage ? "/seller/login" : "/login"}>
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href={isSellPage ? "/seller/register" : "/register"}>
                    <Button size="sm" className="orange-gradient text-white border-0 shadow-lg hover:opacity-90">
                      {isSellPage ? "Register Free" : "Join Free"}
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden bg-white border-t border-[#e5e7eb] shadow-xl"
            >
              <div className="px-4 py-4 space-y-1">
                {!isSellPage ? (
                  categories.map((cat) => (
                    <div key={cat.label}>
                      <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {cat.label}
                      </p>
                      {cat.items.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="space-y-1 py-2">
                    <Link
                      href="/"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors font-semibold"
                    >
                      Marketplace Home
                    </Link>
                    <Link
                      href="/contact"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors font-semibold"
                    >
                      Contact Us
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
