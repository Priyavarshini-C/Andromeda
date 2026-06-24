// =============================================================================
// Andromeda — Dashboard Shell (Sidebar + Content Area)
// =============================================================================

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  DollarSign,
  UserCircle,
  BadgeCheck,
  Store,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";

interface DashboardShellProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  seller: {
    id: string;
    businessName: string;
    slug: string;
    isVerified: boolean;
    status: string;
  } | null;
  children: React.ReactNode;
}

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/profile", label: "Store Profile", icon: UserCircle, exact: false },
  { href: "/dashboard/products", label: "Products", icon: Package, exact: false },
  { href: "/dashboard/inventory", label: "Price & Inventory", icon: DollarSign, exact: false },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag, exact: false },
];

export default function DashboardShell({ user, seller, children }: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-1 min-h-0">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-surface-card border-r border-outline-variant/20 shrink-0">
        {/* Seller Identity */}
        <div className="px-5 py-5 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-bold text-sm shrink-0">
              {seller?.businessName?.charAt(0) || "S"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-primary truncate">
                  {seller?.businessName || "Setup Required"}
                </span>
                {seller?.isVerified && (
                  <BadgeCheck className="h-3.5 w-3.5 text-secondary shrink-0" />
                )}
              </div>
              <span className="text-[10px] text-on-surface-variant font-medium">
                {seller?.status === "active" ? "Active Store" : seller?.status || "No store"}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-secondary/10 text-secondary border border-secondary/20"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? "text-secondary" : "text-outline"}`} />
                {item.label}
                {isActive && <ChevronRight className="h-3 w-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Back to Store */}
        <div className="px-3 py-4 border-t border-outline-variant/20">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
          >
            <Store className="h-4 w-4 text-outline" />
            Back to Storefront
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Mobile Nav */}
        <div className="md:hidden px-4 py-3 border-b border-outline-variant/20 bg-surface-card overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-secondary text-white"
                      : "text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
