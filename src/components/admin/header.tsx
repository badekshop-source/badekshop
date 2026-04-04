"use client";

import { useState } from "react";
import { Bell, Menu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AdminSidebar } from "./sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface AdminHeaderProps {
  pendingCount?: number;
  userName?: string;
  userEmail?: string;
}

export function AdminHeader({ pendingCount = 0, userName = "Admin", userEmail = "" }: AdminHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = (userName || "A").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile menu + search */}
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2 relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-3" />
            <Input
              type="search"
              placeholder="Search orders, customers..."
              className="w-64 pl-9 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
        </div>

        {/* Right: Notifications + User */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5" />
            {pendingCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {pendingCount > 9 ? "9+" : pendingCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">{userEmail}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
              <span className="text-blue-700 font-semibold text-sm">{initials}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <AdminSidebar pendingCount={pendingCount} />
        </SheetContent>
      </Sheet>
    </header>
  );
}
