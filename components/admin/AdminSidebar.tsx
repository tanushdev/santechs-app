"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  Users,
  MessageSquare,
  BarChart3,
  Factory,
  Tag,
  CheckSquare,
  Star,
  ChevronDown,
  UserCheck,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SidebarLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  isSubmenu?: boolean;
  onLinkClick?: () => void;
}

function SidebarLink({ href, icon: Icon, label, badge, isSubmenu, onLinkClick }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onLinkClick}
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
  onLinkClick?: () => void;
  onClose?: () => void;
}

export function AdminSidebarNavContent({
  pendingProducts = 0,
  pendingSellers = 0,
  newEnquiries = 0,
  onLinkClick,
  onClose,
}: AdminSidebarProps) {
  const [sellersOpen, setSellersOpen] = useState(true);
  const [buyersOpen, setBuyersOpen] = useState(true);
  const [usersOpen, setUsersOpen] = useState(true);
  const [platformOpen, setPlatformOpen] = useState(true);

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header with Logo + Close Button */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-sidebar-border shrink-0">
        <Link
          href="/admin/dashboard"
          onClick={() => {
            onLinkClick?.();
            onClose?.();
          }}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg orange-gradient flex items-center justify-center shrink-0">
            <Factory className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold font-heading text-sidebar-foreground">
            San<span className="text-primary">techs</span>
          </span>
        </Link>

        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-black shrink-0 flex items-center justify-center cursor-pointer border border-slate-200 shadow-xs"
            aria-label="Close menu"
            title="Close Menu"
          >
            <X className="w-4.5 h-4.5" />
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="space-y-1">
          <SidebarLink href="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" onLinkClick={() => { onLinkClick?.(); onClose?.(); }} />
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
                onLinkClick={() => { onLinkClick?.(); onClose?.(); }}
              />
              <SidebarLink
                href="/admin/products"
                icon={Package}
                label="Pending Products"
                badge={pendingProducts}
                isSubmenu={true}
                onLinkClick={() => { onLinkClick?.(); onClose?.(); }}
              />
              <SidebarLink
                href="/admin/all-products"
                icon={CheckSquare}
                label="All Products"
                isSubmenu={true}
                onLinkClick={() => { onLinkClick?.(); onClose?.(); }}
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
                href="/admin/enquiries"
                icon={MessageSquare}
                label="Enquiries"
                badge={newEnquiries}
                isSubmenu={true}
                onLinkClick={() => { onLinkClick?.(); onClose?.(); }}
              />
            </div>
          )}
        </div>

        {/* User Management Submenu */}
        <div className="space-y-1">
          <button
            onClick={() => setUsersOpen(!usersOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-sidebar-foreground/45 uppercase tracking-wider hover:text-sidebar-foreground transition-colors"
          >
            <span>User Management</span>
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", usersOpen ? "" : "-rotate-90")} />
          </button>

          {usersOpen && (
            <div className="space-y-1">
              <SidebarLink
                href="/admin/all-users"
                icon={Users}
                label="All Users"
                isSubmenu={true}
                onLinkClick={() => { onLinkClick?.(); onClose?.(); }}
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
              <SidebarLink href="/admin/categories" icon={Tag} label="Categories" isSubmenu={true} onLinkClick={() => { onLinkClick?.(); onClose?.(); }} />
              <SidebarLink href="/admin/featured" icon={Star} label="Featured" isSubmenu={true} onLinkClick={() => { onLinkClick?.(); onClose?.(); }} />
              <SidebarLink href="/admin/analytics" icon={BarChart3} label="Analytics" isSubmenu={true} onLinkClick={() => { onLinkClick?.(); onClose?.(); }} />
            </div>
          )}
        </div>
      </nav>

      {/* Sidebar Footer info & Mobile Close Bar */}
      <div className="p-4 border-t border-sidebar-border space-y-3 shrink-0">
        {onClose && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="w-full h-9 text-xs font-bold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Close Sidebar</span>
          </Button>
        )}
        <div className="text-[10px] text-sidebar-foreground/40 font-sans text-center font-semibold">
          Santechs Admin Console
        </div>
      </div>
    </div>
  );
}

export default function AdminSidebar(props: AdminSidebarProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 h-screen w-64 z-40 bg-sidebar border-r border-sidebar-border">
      <AdminSidebarNavContent {...props} />
    </aside>
  );
}
