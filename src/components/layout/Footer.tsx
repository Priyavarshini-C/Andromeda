// =============================================================================
// Andromeda — Premium Global Footer (Obsidian Canvas Theme)
// =============================================================================

"use client";

import Link from "next/link";
import { Gem } from "lucide-react";

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="w-full bg-[#0E0A09] py-16 px-8 md:px-24 border-t border-[rgba(200,120,64,0.15)] text-smoke">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          
          {/* Column 1: About (Span 5) */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <Gem className="h-5 w-5 text-rose group-hover:scale-110 transition-transform" />
              <span className="font-sans font-semibold text-lg text-ivory tracking-wide">
                ANDROMEDA
              </span>
            </Link>
            <p className="text-sm font-normal leading-7 text-smoke max-w-sm font-light">
              Aggregating national marketplaces, local boutique shops, and independent sellers into a single, unified discovery engine. One search, infinite choices.
            </p>
            <p className="text-xs font-serif italic text-goldmist">
              &ldquo;One Search. Infinite Choices.&rdquo;
            </p>
          </div>

          {/* Column 2: For Sellers (Span 2) */}
          <div className="md:col-span-2 flex flex-col">
            <h3 className="text-[#E8C99A] font-semibold text-xs uppercase tracking-[2px] mb-6">
              For Sellers
            </h3>
            <ul className="space-y-4 text-xs font-semibold uppercase tracking-wider">
              <li>
                <Link href="/seller" className="text-smoke hover:text-[#FAF6F2] transition-colors">
                  Sell on Andromeda
                </Link>
              </li>
              <li>
                <Link href="/seller/register" className="text-smoke hover:text-[#FAF6F2] transition-colors">
                  Seller Onboarding
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-smoke hover:text-[#FAF6F2] transition-colors">
                  Seller Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Browse Categories (Span 2) */}
          <div className="md:col-span-2 flex flex-col">
            <h3 className="text-[#E8C99A] font-semibold text-xs uppercase tracking-[2px] mb-6">
              Categories
            </h3>
            <ul className="space-y-4 text-xs font-semibold uppercase tracking-wider">
              <li>
                <Link href="/products?category=electronics" className="text-smoke hover:text-[#FAF6F2] transition-colors">
                  Electronics
                </Link>
              </li>
              <li>
                <Link href="/products?category=fashion" className="text-smoke hover:text-[#FAF6F2] transition-colors">
                  Fashion
                </Link>
              </li>
              <li>
                <Link href="/products?category=food" className="text-smoke hover:text-[#FAF6F2] transition-colors">
                  Food &amp; Pantry
                </Link>
              </li>
              <li>
                <Link href="/products?category=books" className="text-smoke hover:text-[#FAF6F2] transition-colors">
                  Books &amp; Media
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Support (Span 3) */}
          <div className="md:col-span-3 flex flex-col">
            <h3 className="text-[#E8C99A] font-semibold text-xs uppercase tracking-[2px] mb-6">
              Support
            </h3>
            <ul className="space-y-4 text-xs font-semibold uppercase tracking-wider">
              <li>
                <Link href="/faq" className="text-smoke hover:text-[#FAF6F2] transition-colors">
                  FAQ &amp; Guides
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-smoke hover:text-[#FAF6F2] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-smoke hover:text-[#FAF6F2] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-smoke hover:text-[#FAF6F2] transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="mt-16 border-t border-[rgba(200,120,64,0.1)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-smoke font-light">
            &copy; {currentYear} Andromeda Technologies. Built to elevate product discovery.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-smoke hover:text-[#E8C99A] transition-colors" title="Facebook">
              <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z"/></svg>
            </a>
            <a href="#" className="text-smoke hover:text-[#E8C99A] transition-colors" title="Twitter">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" className="text-smoke hover:text-[#E8C99A] transition-colors" title="Instagram">
              <svg className="h-4.5 w-4.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="#" className="text-smoke hover:text-[#E8C99A] transition-colors" title="Github">
              <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
