"use client";

import { useSession, signOut } from "next-auth/react";
import { Bell, LogOut, Building2 } from "lucide-react";
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
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SellerHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Get current page section name
  const getSectionName = () => {
    if (pathname.includes("/seller/products/new")) return "Add New Product";
    if (pathname.includes("/seller/products")) return "Product Catalog";
    if (pathname.includes("/seller/enquiries")) return "Quote Requests & Deals";
    if (pathname.includes("/seller/company")) return "Company Profile Settings";
    return "Overview Dashboard";
  };

  return (
    <header className="h-16 border-b border-[#e5e7eb] bg-white px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
      
      {/* Page Title */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 tracking-tight font-sans">
          {getSectionName()}
        </h2>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        
        {/* Notifications Icon Button linking to Enquiries */}
        <Link href="/seller/enquiries">
          <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 text-slate-500 hover:text-black hover:bg-[#eeece7]/60 relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#ff7759] rounded-full" />
          </Button>
        </Link>

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
            
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-1 bg-white border border-slate-200 shadow-lg">
              <DropdownMenuLabel className="px-3 py-2">
                <p className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider">Authenticated as</p>
                <p className="text-sm font-bold text-slate-900 truncate mt-0.5">{session.user.name}</p>
                <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 my-1" />
              
              <DropdownMenuItem className="p-0">
                <Link href="/seller/company" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 hover:bg-[#eeece7]/60 cursor-pointer w-full">
                  <Building2 className="w-3.5 h-3.5" />
                  Company Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-100 my-1" />
              
              <DropdownMenuItem
                onClick={() => signOut({
                  callbackUrl: (session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN")
                    ? "/super_admin"
                    : (session?.user?.role === "SELLER" ? "/seller/login" : "/")
                })}
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
