"use client";

import Link from "next/link";

const CURRENT_YEAR = 2026;

export default function Footer() {
  return (
    <footer className="w-full border-t border-outline-variant bg-surface-card py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Tagline & Description */}
          <div className="md:col-span-2">
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary dark:from-white to-secondary dark:to-secondary-container bg-clip-text text-transparent">
              ANDROMEDA
            </span>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-on-surface-variant">
              One Search. Infinite Choices. We aggregate e-commerce listings, independent sellers, and local retail stores into a single ecosystem to help you find the absolute best options instantly.
            </p>
            <p className="mt-4 text-xs text-on-surface-variant font-medium">
              &quot;One Search. Infinite Choices.&quot;
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-primary">Discover</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-on-surface-variant hover:text-secondary transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-on-surface-variant hover:text-secondary transition-colors">
                  Product Comparison
                </Link>
              </li>
              <li>
                <Link href="#" className="text-on-surface-variant hover:text-secondary transition-colors">
                  Local Businesses
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Info */}
          <div>
            <h3 className="text-sm font-semibold text-primary">Platform</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="#" className="text-on-surface-variant hover:text-secondary transition-colors">
                  About Andromeda
                </Link>
              </li>
              <li>
                <Link href="#" className="text-on-surface-variant hover:text-secondary transition-colors">
                  Seller Portal
                </Link>
              </li>
              <li>
                <Link href="#" className="text-on-surface-variant hover:text-secondary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-outline-variant pt-6 text-center text-xs text-on-surface-variant">
          <p>© {CURRENT_YEAR} Andromeda Technologies. All rights reserved. Confidential — Internal Use Only.</p>
        </div>
      </div>
    </footer>
  );
}
