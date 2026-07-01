// =============================================================================
// Andromeda — Premium Dashboard Shell (Sidebar + Content Area)
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
import { motion } from "framer-motion";

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
    <div className="flex flex-1 min-h-0 bg-[#FAF6F2] text-charcoal">
      {/* ── Sidebar (Obsidian Theme) ── */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0E0A09] border-r border-[rgba(200,120,64,0.12)] shrink-0 text-white">
        {/* Seller Identity */}
        <div className="px-5 py-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded bg-[#2E1F16] border border-[rgba(200,120,64,0.18)] flex items-center justify-center text-goldmist font-bold text-sm shrink-0">
              {seller?.businessName?.charAt(0) || "S"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-ivory truncate">
                  {seller?.businessName || "Setup Required"}
                </span>
                {seller?.isVerified && (
                  <BadgeCheck className="h-3.5 w-3.5 text-[#C07840] shrink-0" />
                )}
              </div>
              <span className="text-[10px] text-smoke font-light uppercase tracking-wider block mt-0.5">
                {seller?.status === "active" ? "Verified Store" : seller?.status || "No Profile"}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 relative">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <motion.div
                key={item.href}
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded text-xs font-semibold uppercase tracking-wider transition-all relative ${
                    isActive
                      ? "bg-[#2E1F16] text-[#FAF6F2] border-l-2 border-[#C07840]"
                      : "text-[#8A7D76] hover:text-[#E8C99A]"
                  }`}
                >
                  {/* Smooth indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-[#2E1F16] rounded -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  
                  <item.icon className={`h-4 w-4 ${isActive ? "text-[#C07840]" : "text-[#8A7D76]"}`} />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto text-[#C07840]" />}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Back to Store */}
        <div className="px-3 py-4 border-t border-white/5">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2.5 rounded text-xs font-semibold uppercase tracking-wider text-[#8A7D76] hover:text-[#FAF6F2] transition-colors"
          >
            <Store className="h-4 w-4 text-[#8A7D76]" />
            Back to Storefront
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Mobile Nav */}
        <div className="md:hidden px-4 py-3 border-b border-[#E8D8CE] bg-ivory overflow-x-auto">
          <div className="flex gap-1.5 min-w-max">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-[#8B3A52] text-white"
                      : "text-smoke hover:bg-parchment"
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
        <div className="flex-1 p-6 sm:p-8 bg-[#F5EDE4]">
          {children}
        </div>
      </div>
    </div>
  );
}
