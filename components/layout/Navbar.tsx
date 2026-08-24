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

interface NavCategoryItem {
  name: string;
  slug: string;
  href: string;
  subcategories: { name: string; slug: string; href: string }[];
}

interface NavCategoryGroup {
  label: string;
  href: string;
  type: string;
  categories: NavCategoryItem[];
}

const fallbackNavGroups: NavCategoryGroup[] = [
  {
    label: "Machines",
    href: "/products?type=MACHINE",
    type: "MACHINE",
    categories: [
      {
        name: "Synthetic Filament Spinning",
        slug: "synthetic-filament-spinning-machine",
        href: "/products?category=synthetic-filament-spinning-machine",
        subcategories: [
          { name: "POY Filament Line", slug: "poy-filament-spinning-machine", href: "/products?category=synthetic-filament-spinning-machine&subCategory=poy-filament-spinning-machine" },
          { name: "FDY Filament Line", slug: "fdy-filament-spinning-machine", href: "/products?category=synthetic-filament-spinning-machine&subCategory=fdy-filament-spinning-machine" },
          { name: "IDY Filament Line", slug: "idy-filament-spinning-machine", href: "/products?category=synthetic-filament-spinning-machine&subCategory=idy-filament-spinning-machine" },
          { name: "BCF / Mother Yarn", slug: "bcf-spinning-filament-spinning-machine", href: "/products?category=synthetic-filament-spinning-machine&subCategory=bcf-spinning-filament-spinning-machine" },
        ],
      },
      {
        name: "Non-Woven Machine",
        slug: "non-woven-machine",
        href: "/products?category=non-woven-machine",
        subcategories: [
          { name: "Spunbond Line", slug: "spunbond", href: "/products?category=non-woven-machine&subCategory=spunbond" },
          { name: "Meltblown (MeltBond)", slug: "meltblown", href: "/products?category=non-woven-machine&subCategory=meltblown" },
          { name: "SMS Line", slug: "sms", href: "/products?category=non-woven-machine&subCategory=sms" },
          { name: "Needle Punching & Spunlace", slug: "needle-punching", href: "/products?category=non-woven-machine&subCategory=needle-punching" },
        ],
      },
      {
        name: "Texturing & Warping",
        slug: "dty",
        href: "/products?category=dty",
        subcategories: [
          { name: "DTY Draw Texturing", slug: "dty", href: "/products?category=dty" },
          { name: "ATY Air Texturing", slug: "aty", href: "/products?category=aty" },
          { name: "Splitting Machines", slug: "splitting-machine", href: "/products?category=splitting-machine" },
          { name: "Splitting Warping", slug: "splitting-warping-machine", href: "/products?category=splitting-warping-machine" },
        ],
      },
      {
        name: "Extrusion & Plants",
        slug: "plastic-extrusion-machines",
        href: "/products?category=plastic-extrusion-machines",
        subcategories: [
          { name: "Plastic Extrusion (HDPE/PET)", slug: "plastic-extrusion-machines", href: "/products?category=plastic-extrusion-machines" },
          { name: "STAPLE FIBER Plant", slug: "staple-fiber-spinning-plant", href: "/products?category=staple-fiber-spinning-plant" },
          { name: "PET Bottle Washing Line", slug: "pet-bottle-washing-line", href: "/products?category=pet-bottle-washing-line" },
          { name: "Polymerization & Lab", slug: "continuous-polymerization", href: "/products?category=continuous-polymerization" },
        ],
      },
    ],
  },
  {
    label: "Spare Parts",
    href: "/products?type=SPARE_PART",
    type: "SPARE_PART",
    categories: [
      {
        name: "Spinning & Extrusion Parts",
        slug: "spare-parts",
        href: "/products?category=spare-parts",
        subcategories: [
          { name: "Hot & Cold Godet Rollers", slug: "hot-godet-rollers", href: "/products?category=spare-parts&subCategory=hot-godet-rollers" },
          { name: "Spinnerets & Spin Packs", slug: "spinnerets", href: "/products?category=spare-parts&subCategory=spinnerets" },
          { name: "Metering Pumps & CPF", slug: "metering-pumps", href: "/products?category=spare-parts&subCategory=metering-pumps" },
          { name: "Extruders, Dryers & Winders", slug: "extruder", href: "/products?category=spare-parts&subCategory=extruder" },
        ],
      },
    ],
  },
  {
    label: "Raw Materials",
    href: "/products?type=RAW_MATERIAL",
    type: "RAW_MATERIAL",
    categories: [],
  },
  {
    label: "Services",
    href: "/products?type=SERVICE",
    type: "SERVICE",
    categories: [],
  },
];

function getDashboardUrl(role: UserRole): string {
  switch (role) {
    case UserRole.SUPER_ADMIN:
    case UserRole.ADMIN:
      return "/admin/sellers";
    case UserRole.SELLER:
      return "/seller/dashboard";
    case UserRole.BUYER:
      return "/buyer/dashboard";
    default:
      return "/";
  }
}

interface NavbarProps {
  initialSession?: any;
  portal?: "buyer" | "seller";
}

export default function Navbar({ initialSession, portal: propPortal }: NavbarProps = {}) {
  const pathname = usePathname();
  const isSellPage = pathname === "/sell";
  const { data: rawSession } = useSession();

  const portal = propPortal || (isSellPage || pathname.startsWith("/seller") ? "seller" : "buyer");

  const { data: portalSession } = useQuery({
    queryKey: ["role-session", portal],
    queryFn: async () => {
      const res = await fetch(`/api/auth/role-session?portal=${portal}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.session;
    },
    initialData: initialSession,
    staleTime: 10000,
  });

  const session = portalSession || (initialSession?.user?.role === (portal === "seller" ? UserRole.SELLER : UserRole.BUYER) ? initialSession : (rawSession?.user?.role === (portal === "seller" ? UserRole.SELLER : UserRole.BUYER) ? rawSession : null));
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
    queryKey: ["categories-tree"],
    queryFn: async () => {
      const res = await fetch("/api/categories?tree=true");
      if (!res.ok) return [];
      const json = await res.json();
      return json.data ?? [];
    },
  });

  // Dynamically group database categories by type & parent/sub structure
  const navGroups: NavCategoryGroup[] = (() => {
    if (!dbCategories || dbCategories.length === 0) return fallbackNavGroups;

    const typeMap: Record<string, NavCategoryGroup> = {
      MACHINE: { label: "Machines", href: "/products?type=MACHINE", type: "MACHINE", categories: [] },
      SPARE_PART: { label: "Spare Parts", href: "/products?type=SPARE_PART", type: "SPARE_PART", categories: [] },
      RAW_MATERIAL: { label: "Raw Materials", href: "/products?type=RAW_MATERIAL", type: "RAW_MATERIAL", categories: [] },
      SERVICE: { label: "Services", href: "/products?type=SERVICE", type: "SERVICE", categories: [] },
    };

    dbCategories.forEach((cat: any) => {
      if (typeMap[cat.type]) {
        const subItems = (cat.subcategories && Array.isArray(cat.subcategories))
          ? cat.subcategories.map((sub: any) => ({
              name: sub.name,
              slug: sub.slug,
              href: `/products?category=${cat.slug}&subCategory=${sub.slug}`,
            }))
          : [];

        typeMap[cat.type].categories.push({
          name: cat.name,
          slug: cat.slug,
          href: `/products?category=${cat.slug}`,
          subcategories: subItems,
        });
      }
    });

    return Object.values(typeMap);
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

            {/* Desktop Nav — DYNAMICALLY POPULATED MEGA MENU */}
            {!isSellPage && (
              <nav className="hidden lg:flex items-center gap-1">
                {navGroups.map((group) => {
                  const hasCategories = group.categories.length > 0;
                  const hasSubTree = group.categories.some((c) => c.subcategories.length > 0);

                  return (
                    <div
                      key={group.label}
                      className="relative"
                      onMouseEnter={() => hasCategories && setActiveMenu(group.label)}
                      onMouseLeave={() => setActiveMenu(null)}
                    >
                      <Link
                        href={group.href}
                        className="flex items-center gap-1 px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100/80"
                      >
                        {group.label}
                        {hasCategories && (
                          <ChevronDown
                            className="w-3.5 h-3.5 transition-transform duration-200 text-slate-400"
                            style={{
                              transform: activeMenu === group.label ? "rotate(180deg)" : "rotate(0deg)",
                            }}
                          />
                        )}
                      </Link>

                      <AnimatePresence>
                        {hasCategories && activeMenu === group.label && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.15 }}
                            className={`absolute left-0 top-full pt-2 z-50 ${
                              hasSubTree && group.categories.length > 2
                                ? "w-[760px] -left-20"
                                : group.categories.length > 1
                                ? "w-[480px]"
                                : "w-64"
                            }`}
                          >
                            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden p-5 space-y-4">
                              {/* Header Banner inside Dropdown */}
                              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <span className="text-xs font-bold font-heading text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-[#ff7759]" />
                                  Browse {group.label} Directory
                                </span>
                                <Link
                                  href={group.href}
                                  className="text-xs font-bold text-[#ff7759] hover:underline"
                                >
                                  View All {group.label} →
                                </Link>
                              </div>

                              {/* Multi-Column Grid of Categories & Sub-Categories */}
                              <div
                                className={`grid gap-5 ${
                                  hasSubTree && group.categories.length > 2
                                    ? "grid-cols-3"
                                    : group.categories.length > 1
                                    ? "grid-cols-2"
                                    : "grid-cols-1"
                                }`}
                              >
                                {group.categories.map((cat) => (
                                  <div key={cat.slug} className="space-y-2">
                                    {/* Main Category Header Link */}
                                    <Link
                                      href={cat.href}
                                      className="text-xs font-bold text-slate-900 hover:text-[#ff7759] transition-colors block leading-tight font-heading group"
                                    >
                                      <span className="group-hover:underline">{cat.name}</span>
                                    </Link>

                                    {/* Nested Sub-Categories */}
                                    {cat.subcategories.length > 0 && (
                                      <ul className="space-y-1 pl-2 border-l border-orange-100">
                                        {cat.subcategories.slice(0, 5).map((sub) => (
                                          <li key={sub.slug}>
                                            <Link
                                              href={sub.href}
                                              className="text-[11px] text-slate-600 hover:text-[#ff7759] transition-colors block py-0.5 truncate"
                                            >
                                              {sub.name}
                                            </Link>
                                          </li>
                                        ))}
                                        {cat.subcategories.length > 5 && (
                                          <li>
                                            <Link
                                              href={cat.href}
                                              className="text-[10px] font-bold text-[#ff7759] hover:underline block pt-0.5"
                                            >
                                              +{cat.subcategories.length - 5} more...
                                            </Link>
                                          </li>
                                        )}
                                      </ul>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
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
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={async () => {
                          await fetch(`/api/auth/role-session?portal=${portal}`, { method: "DELETE" });
                          await signOut({ redirect: false });
                          const targetPath = portal === "seller" ? "/login?role=seller" : "/";
                          window.location.href = targetPath;
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
                  <Link href={isSellPage ? "/login?role=seller" : "/login"}>
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href={isSellPage ? "/register?role=seller" : "/register"}>
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
                  navGroups.map((group) => (
                    <div key={group.label} className="space-y-1 py-1">
                      {group.categories.length > 0 ? (
                        <p className="px-3 py-1 text-xs font-bold text-[#ff7759] uppercase tracking-wider font-mono">
                          {group.label}
                        </p>
                      ) : (
                        <Link
                          href={group.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2 text-xs font-bold text-slate-800 hover:text-[#ff7759] uppercase tracking-wider font-mono hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          {group.label}
                        </Link>
                      )}
                      {group.categories.map((cat) => (
                        <div key={cat.slug} className="pl-2 space-y-0.5">
                          <Link
                            href={cat.href}
                            onClick={() => setMobileOpen(false)}
                            className="block px-3 py-1.5 text-xs font-bold text-slate-800 hover:text-[#ff7759] hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            {cat.name}
                          </Link>
                          {cat.subcategories.length > 0 && (
                            <div className="pl-3 space-y-0.5 border-l border-orange-100 ml-3">
                              {cat.subcategories.map((sub) => (
                                <Link
                                  key={sub.slug}
                                  href={sub.href}
                                  onClick={() => setMobileOpen(false)}
                                  className="block px-2 py-1 text-[11px] text-slate-600 hover:text-[#ff7759] transition-colors truncate"
                                >
                                  ↳ {sub.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
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
