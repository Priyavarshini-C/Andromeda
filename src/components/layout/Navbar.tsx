// =============================================================================
// Andromeda — Premium Navbar with Session State, User Dropdown & Dual Layouts
// =============================================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, ShoppingBag, User, LogOut, Heart, LayoutDashboard, Gem, Menu, X } from "lucide-react";
import { useCompareStore } from "@/store/compare.store";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { logout } from "@/lib/actions/auth";

export default function Navbar() {
  const pathname = usePathname();
  const compareCount = useCompareStore((state) => state.productIds.length);
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: session, status } = useSession();
  const user = session?.user;

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

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

  const isHeroMode = pathname === "/";

  // Navigation Links array
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Search" },
    { href: "/compare", label: "Compare" },
    { href: "/stores", label: "Local" },
    { href: "/seller", label: "Sellers" },
  ];

  if (isHeroMode) {
    // ── DARK HERO VARIANT (Landing Page) ──
    return (
      <header className="w-full absolute top-0 left-0 right-0 z-50 px-4 pt-6">
        <div className="liquid-glass rounded-full max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          
          {/* Left: Gem Icon + brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <Gem className="h-5 w-5 text-goldmist group-hover:scale-110 transition-transform" />
            <span className="font-sans font-semibold text-lg text-ivory tracking-wide">
              ANDROMEDA
            </span>
          </Link>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs uppercase tracking-[2px] font-sans text-goldmist/80 hover:text-ivory transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Wishlist Heart Icon */}
            <Link
              href="/wishlist"
              className="p-2 text-goldmist/80 hover:text-ivory transition-colors relative"
              title="Wishlist"
            >
              <Heart className="h-4 w-4" />
            </Link>

            {/* Cart ShoppingBag Icon */}
            <Link
              href="/cart"
              className="p-2 text-goldmist/80 hover:text-ivory transition-colors relative"
              title="Shopping Cart"
            >
              <ShoppingBag className="h-4 w-4" />
              {mounted && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose text-[9px] font-semibold text-white">
                  3
                </span>
              )}
            </Link>

            {/* Comparison Badge */}
            {mounted && compareCount > 0 && (
              <Link
                href="/compare"
                className="p-2 text-goldmist/80 hover:text-ivory transition-colors relative"
                title="Compare Matrix"
              >
                <Scale className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-copper text-[9px] font-semibold text-black">
                  {compareCount}
                </span>
              </Link>
            )}

            {/* Auth Sign In or Dropdown */}
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
                      className="h-7 w-7 rounded-full border border-goldmist/30 object-cover"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-ember text-goldmist flex items-center justify-center font-bold text-xs border border-goldmist/30">
                      {(user.name || user.email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-lg bg-charcoal text-ivory shadow-luxury-dark border border-white/5 py-2 z-50">
                    <div className="px-4 py-2 border-b border-white/5">
                      <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-smoke truncate">{user.email}</p>
                      <p className="mt-1 inline-flex items-center rounded bg-rose/20 px-2 py-0.5 text-[9px] font-semibold text-rose uppercase tracking-wider">
                        {user.role || "user"}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs hover:bg-ember transition-colors"
                      >
                        <User className="h-4 w-4 text-smoke" />
                        My Profile
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs hover:bg-ember transition-colors"
                      >
                        <Heart className="h-4 w-4 text-smoke" />
                        Wishlist
                      </Link>
                      {(user.role === "seller" || user.role === "admin") && (
                        <Link
                          href="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs hover:bg-ember transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4 text-smoke" />
                          Dashboard
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-white/5 pt-1 mt-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-xs font-semibold text-rose hover:bg-rose/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : mounted && status !== "loading" ? (
              <Link
                href="/login"
                className="liquid-glass rounded-full px-5 py-2 text-xs font-medium text-ivory border-0 cursor-pointer"
              >
                Sign In
              </Link>
            ) : (
              <div className="h-7 w-7 rounded-full bg-white/5 animate-pulse" />
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-goldmist/80 hover:text-ivory"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 p-4 rounded-xl bg-obsidian border border-white/5 liquid-glass flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs uppercase tracking-[2px] font-sans text-goldmist/80 hover:text-ivory py-2 border-b border-white/5 last:border-0"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>
    );
  }

  // ── LIGHT BODY VARIANT (All Other Pages) ──
  return (
    <header className="w-full bg-ivory border-b border-[#E8D8CE] px-8 py-4 sticky top-0 z-50 text-charcoal">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Gem Icon + brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <Gem className="h-5 w-5 text-rose group-hover:scale-110 transition-transform" />
          <span className="font-sans font-semibold text-lg text-charcoal tracking-wide">
            ANDROMEDA
          </span>
        </Link>

        {/* Center Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs uppercase tracking-[2px] font-sans transition-colors ${
                pathname === link.href ? "text-rose font-medium" : "text-smoke hover:text-charcoal"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Wishlist Heart Icon */}
          <Link
            href="/wishlist"
            className="p-2 text-smoke hover:text-charcoal transition-colors relative"
            title="Wishlist"
          >
            <Heart className={`h-4 w-4 ${pathname === "/wishlist" ? "fill-rose text-rose" : ""}`} />
          </Link>

          {/* Cart ShoppingBag Icon */}
          <Link
            href="/cart"
            className="p-2 text-smoke hover:text-charcoal transition-colors relative"
            title="Shopping Cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {mounted && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose text-[9px] font-semibold text-white">
                3
              </span>
            )}
          </Link>

          {/* Comparison Badge */}
          {mounted && compareCount > 0 && (
            <Link
              href="/compare"
              className="p-2 text-smoke hover:text-charcoal transition-colors relative"
              title="Compare Matrix"
            >
              <Scale className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-copper text-[9px] font-semibold text-white">
                {compareCount}
              </span>
            </Link>
          )}

          {/* Auth Sign In or Dropdown */}
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
                    className="h-7 w-7 rounded-full border border-[#E8D8CE] object-cover"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-parchment text-rose flex items-center justify-center font-bold text-xs border border-[#E8D8CE]">
                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-lg bg-ivory text-charcoal shadow-luxury-light border border-[#E8D8CE] py-2 z-50">
                  <div className="px-4 py-2 border-b border-[#E8D8CE]">
                    <p className="text-xs font-semibold text-charcoal truncate">{user.name}</p>
                    <p className="text-[10px] text-smoke truncate">{user.email}</p>
                    <p className="mt-1 inline-flex items-center rounded bg-rose/10 px-2 py-0.5 text-[9px] font-semibold text-rose uppercase tracking-wider">
                      {user.role || "user"}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs hover:bg-parchment transition-colors"
                    >
                      <User className="h-4 w-4 text-smoke" />
                      My Profile
                    </Link>
                    <Link
                      href="/wishlist"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs hover:bg-parchment transition-colors"
                    >
                      <Heart className="h-4 w-4 text-smoke" />
                      Wishlist
                    </Link>
                    {(user.role === "seller" || user.role === "admin") && (
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs hover:bg-parchment transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-smoke" />
                        Dashboard
                      </Link>
                    )}
                  </div>
                  <div className="border-t border-[#E8D8CE] pt-1 mt-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-xs font-semibold text-rose hover:bg-rose/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : mounted && status !== "loading" ? (
            <Link
              href="/login"
              className="bg-rose text-ivory rounded px-4 py-2 text-xs font-medium hover:bg-blush transition-colors cursor-pointer"
            >
              Sign In
            </Link>
          ) : (
            <div className="h-7 w-7 rounded-full bg-parchment animate-pulse" />
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-smoke hover:text-charcoal"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 p-4 rounded bg-ivory border border-[#E8D8CE] flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs uppercase tracking-[2px] font-sans text-smoke hover:text-charcoal py-2 border-b border-[#E8D8CE] last:border-0"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
