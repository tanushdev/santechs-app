"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Factory,
  Tag,
  Activity,
  CheckSquare,
  Star,
  ChevronDown,
  UserCheck,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SidebarLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  isSubmenu?: boolean;
}

function SidebarLink({ href, icon: Icon, label, badge, isSubmenu }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
          : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
        isSubmenu ? "ml-6 py-1.5 text-xs" : ""
      )}
    >
      <Icon className={cn("flex-shrink-0", isSubmenu ? "w-3.5 h-3.5" : "w-4 h-4")} />
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <Badge className="h-5 min-w-5 px-1.5 text-[10px] bg-primary/20 text-primary border-0">
          {badge > 99 ? "99+" : badge}
        </Badge>
      )}
    </Link>
  );
}

interface AdminSidebarProps {
  pendingProducts?: number;
  pendingSellers?: number;
  newEnquiries?: number;
}

export default function AdminSidebar({
  pendingProducts = 0,
  pendingSellers = 0,
  newEnquiries = 0,
}: AdminSidebarProps) {
  const { data: session } = useSession();

  // Accordion submenus state
  const [sellersOpen, setSellersOpen] = useState(true);
  const [buyersOpen, setBuyersOpen] = useState(true);
  const [platformOpen, setPlatformOpen] = useState(true);

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 z-40 flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-sidebar-border flex-shrink-0 gap-3">
        <div className="w-8 h-8 rounded-lg orange-gradient flex items-center justify-center flex-shrink-0">
          <Factory className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold font-heading text-sidebar-foreground">
          San<span className="text-primary">techs</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="space-y-1">
          <SidebarLink href="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
        </div>

        {/* Seller Management Submenu */}
        <div className="space-y-1">
          <button
            onClick={() => setSellersOpen(!sellersOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-sidebar-foreground/45 uppercase tracking-wider hover:text-sidebar-foreground transition-colors"
          >
            <span>Seller Menu</span>
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", sellersOpen ? "" : "-rotate-90")} />
          </button>

          {sellersOpen && (
            <div className="space-y-1">
              <SidebarLink
                href="/admin/sellers"
                icon={UserCheck}
                label="Pending Sellers"
                badge={pendingSellers}
                isSubmenu={true}
              />
              <SidebarLink
                href="/admin/products"
                icon={Package}
                label="Pending Products"
                badge={pendingProducts}
                isSubmenu={true}
              />
              <SidebarLink
                href="/admin/all-products"
                icon={CheckSquare}
                label="All Products"
                isSubmenu={true}
              />
            </div>
          )}
        </div>

        {/* Buyer Management Submenu */}
        <div className="space-y-1">
          <button
            onClick={() => setBuyersOpen(!buyersOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-sidebar-foreground/45 uppercase tracking-wider hover:text-sidebar-foreground transition-colors"
          >
            <span>Buyer Menu</span>
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", buyersOpen ? "" : "-rotate-90")} />
          </button>

          {buyersOpen && (
            <div className="space-y-1">
              <SidebarLink
                href="/admin/all-users"
                icon={Users}
                label="All Users"
                isSubmenu={true}
              />
              <SidebarLink
                href="/admin/enquiries"
                icon={MessageSquare}
                label="Enquiries"
                badge={newEnquiries}
                isSubmenu={true}
              />
            </div>
          )}
        </div>

        {/* Platform Settings Submenu */}
        <div className="space-y-1">
          <button
            onClick={() => setPlatformOpen(!platformOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-sidebar-foreground/45 uppercase tracking-wider hover:text-sidebar-foreground transition-colors"
          >
            <span>System & Settings</span>
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", platformOpen ? "" : "-rotate-90")} />
          </button>

          {platformOpen && (
            <div className="space-y-1">
              <SidebarLink href="/admin/categories" icon={Tag} label="Categories" isSubmenu={true} />
              <SidebarLink href="/admin/featured" icon={Star} label="Featured" isSubmenu={true} />
              <SidebarLink href="/admin/analytics" icon={BarChart3} label="Analytics" isSubmenu={true} />
            </div>
          )}
        </div>
      </nav>

      {/* Sidebar Footer info */}
      <div className="p-4 border-t border-sidebar-border text-[10px] text-sidebar-foreground/30 font-sans text-center font-semibold">
        Santechs Admin Console
      </div>
    </aside>
  );
}
