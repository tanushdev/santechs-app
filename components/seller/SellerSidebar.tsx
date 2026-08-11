"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Building2,
  Factory,
  MessageSquare,
  Lock,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/seller/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/seller/enquiries", icon: MessageSquare, label: "Enquiries" },
  { href: "/seller/products", icon: Package, label: "My Products" },
  { href: "/seller/company", icon: Building2, label: "Company Profile" },
];

export interface SellerSidebarProps {
  isApproved?: boolean;
  onLinkClick?: () => void;
  onClose?: () => void;
}

export function SellerSidebarNavContent({
  isApproved = false,
  onLinkClick,
  onClose,
}: SellerSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Logo + Header */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-sidebar-border shrink-0">
        <Link
          href="/seller/dashboard"
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
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <p className="text-[10px] font-semibold text-sidebar-foreground/30 uppercase tracking-widest px-3 mb-3">
          Seller Console
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const isLockedItem = !isApproved && item.href !== "/seller/company";

          if (isLockedItem) {
            return (
              <div
                key={item.href}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/20 cursor-not-allowed select-none bg-transparent"
                title="Pending administrator approval"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 flex-shrink-0 text-sidebar-foreground/10" />
                  <span>{item.label}</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-sidebar-foreground/20" />
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                onLinkClick?.();
                onClose?.();
              }}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
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
          Santechs Seller Console v1.0
        </div>
      </div>
    </div>
  );
}

export default function SellerSidebar(props: SellerSidebarProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 h-screen w-64 z-40 bg-sidebar border-r border-sidebar-border">
      <SellerSidebarNavContent {...props} />
    </aside>
  );
}
