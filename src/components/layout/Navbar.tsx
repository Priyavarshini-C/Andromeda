// =============================================================================
// Andromeda — Premium Navbar with Session State and User Dropdown
// =============================================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, ShoppingBag, User, LogOut, Heart, LayoutDashboard } from "lucide-react";
import { useCompareStore } from "@/store/compare.store";
import SearchBar from "@/components/search/SearchBar";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { logout } from "@/lib/actions/auth";

export default function Navbar() {
  const pathname = usePathname();
  const compareCount = useCompareStore((state) => state.productIds.length);
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: session, status } = useSession();
  const user = session?.user;

  // Avoid hydration mismatch for store values
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-primary text-white shadow-observatory">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-secondary-container to-tertiary bg-clip-text text-transparent group-hover:opacity-90">
              ANDROMEDA
            </span>
          </Link>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-secondary-container ${
                pathname === "/" ? "text-secondary-container" : "text-slate-300"
              }`}
            >
              Home
            </Link>
            <Link
              href="/products"
              className={`text-sm font-medium transition-colors hover:text-secondary-container ${
                pathname.startsWith("/products") ? "text-secondary-container" : "text-slate-300"
              }`}
            >
              Explore Products
            </Link>
          </nav>
        </div>

        {/* Search Bar Wrapper */}
        <div className="flex-1 max-w-md mx-8 hidden sm:block">
          <SearchBar />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Comparison Page Link */}
          <Link
            href="/compare"
            className={`relative flex items-center justify-center p-2 rounded-full hover:bg-primary-container transition-colors ${
              pathname === "/compare" ? "text-secondary-container" : "text-white"
            }`}
            title="Compare Products"
          >
            <Scale className="h-5 w-5" />
            {mounted && compareCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-tertiary text-[10px] font-bold text-white ring-2 ring-primary">
                {compareCount}
              </span>
            )}
          </Link>

          {/* User Auth Section */}
          {mounted && status === "authenticated" && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 focus:outline-hidden cursor-pointer"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="h-8 w-8 rounded-full border-2 border-secondary-container object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-secondary-container text-primary flex items-center justify-center font-bold text-sm border-2 border-primary-container">
                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface-card text-on-surface shadow-observatory-lifted border border-outline-variant/30 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-outline-variant/30">
                    <p className="text-xs font-bold text-primary truncate">{user.name}</p>
                    <p className="text-[10px] text-on-surface-variant truncate">{user.email}</p>
                    <p className="mt-1 inline-flex items-center rounded-sm bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary uppercase tracking-wider">
                      {(user as any).role || "user"}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/products" // For now, direct to products or placeholder profile
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold hover:bg-surface-container transition-colors"
                    >
                      <User className="h-4 w-4 text-outline" />
                      My Profile
                    </Link>
                    <Link
                      href="/compare"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold hover:bg-surface-container transition-colors"
                    >
                      <Heart className="h-4 w-4 text-outline" />
                      Wishlist & Alerts
                    </Link>
                    {(user as any).role === "seller" || (user as any).role === "admin" ? (
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold hover:bg-surface-container transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-outline" />
                        Dashboard
                      </Link>
                    ) : null}
                  </div>
                  <div className="border-t border-outline-variant/30 pt-1 mt-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-xs font-bold text-error hover:bg-error/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : mounted && status !== "loading" ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-400 text-slate-200 hover:text-white hover:border-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-secondary-container text-primary hover:bg-opacity-95 transition-opacity"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="h-8 w-8 rounded-full bg-slate-700 animate-pulse" />
          )}
        </div>
      </div>

      {/* Mobile Search Bar Row */}
      <div className="px-4 pb-3 sm:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
