"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Scale, ShoppingBag, Menu } from "lucide-react";
import { useCompareStore } from "@/store/compare.store";
import SearchBar from "@/components/search/SearchBar";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const compareCount = useCompareStore((state) => state.productIds.length);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch for store values
  useEffect(() => {
    setMounted(true);
  }, []);

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

          {/* User Cart Placeholder */}
          <Link
            href="#"
            className="flex items-center justify-center p-2 rounded-full hover:bg-primary-container transition-colors"
            title="Cart"
          >
            <ShoppingBag className="h-5 w-5 text-slate-300" />
          </Link>
        </div>
      </div>

      {/* Mobile Search Bar Row */}
      <div className="px-4 pb-3 sm:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
