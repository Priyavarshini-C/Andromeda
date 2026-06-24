// =============================================================================
// Andromeda — Enhanced Homepage
// Sections: Hero, Categories, Trending Products, Popular Platforms,
//           Nearby Stores Preview, Seller CTA, AI Placeholder, Value Props, Footer CTA
// =============================================================================

import Link from "next/link";
import {
  Laptop, BookOpen, Home, Shirt, ArrowRight, Scale,
  TrendingUp, Zap, Store, Bot, Star, MapPin, Globe,
  Package, BarChart3, ChevronRight
} from "lucide-react";
import ProductGrid from "@/components/product/ProductGrid";
import { PRODUCTS, CATEGORIES } from "@/lib/utils/mock-data";

// Trending search tags
const TRENDING_SEARCHES = [
  "iPhone 15", "Samsung S24", "Gaming Laptop", "Bluetooth Earbuds",
  "Air Fryer", "Standing Desk", "Mechanical Keyboard", "DSLR Camera",
  "Smart Watch", "Noise Cancelling Headphones", "Kindle", "Robot Vacuum",
];

// Popular Platforms
const PLATFORMS = [
  {
    name: "Amazon",
    desc: "World's largest marketplace",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    href: "https://amazon.in",
    abbr: "AZ",
  },
  {
    name: "Flipkart",
    desc: "India's favourite online store",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    href: "https://flipkart.com",
    abbr: "FK",
  },
  {
    name: "Meesho",
    desc: "Affordable products, direct sellers",
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
    href: "https://meesho.com",
    abbr: "MS",
  },
  {
    name: "Myntra",
    desc: "Fashion & lifestyle",
    color: "text-pink-600",
    bg: "bg-pink-50",
    border: "border-pink-200",
    href: "https://myntra.com",
    abbr: "MY",
  },
  {
    name: "Ajio",
    desc: "Premium fashion brands",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    href: "https://ajio.com",
    abbr: "AJ",
  },
  {
    name: "Nykaa",
    desc: "Beauty, wellness & fashion",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    href: "https://nykaa.com",
    abbr: "NK",
  },
];

// Mock nearby stores preview
const NEARBY_STORES = [
  {
    name: "CosmoBooks",
    category: "Books & Stationery",
    city: "Bengaluru",
    rating: 4.8,
    reviews: 127,
    isVerified: true,
    distance: "0.8 km",
    colorClass: "from-secondary/20 to-primary/10",
  },
  {
    name: "StarShop Electronics",
    category: "Electronics",
    city: "Pune",
    rating: 4.7,
    reviews: 89,
    isVerified: true,
    distance: "1.2 km",
    colorClass: "from-tertiary/20 to-secondary/10",
  },
  {
    name: "Home Planet",
    category: "Home & Kitchen",
    city: "Kolkata",
    rating: 4.6,
    reviews: 203,
    isVerified: false,
    distance: "2.1 km",
    colorClass: "from-success/20 to-tertiary/10",
  },
];

export default function HomePage() {
  const featuredProducts = PRODUCTS.slice(0, 4);
  const trendingProducts = [...PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <div className="flex flex-col w-full">

      {/* ── Premium Hero Section ── */}
      <section className="gradient-hero text-white py-20 lg:py-28 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 rounded-full bg-secondary-container/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 rounded-full bg-tertiary/10 blur-3xl" />

        <div className="mx-auto max-w-4xl text-center relative z-10">
          <span className="inline-flex items-center rounded-full bg-secondary-container/20 px-3.5 py-1 text-xs font-semibold text-secondary-container uppercase tracking-wider">
            One Search. Infinite Choices.
          </span>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Discover &amp; Compare Everything
          </h1>
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            Search once to compare real-time pricing, specifications, and availability across
            marketplaces, independent brands, and local stores near you.
          </p>

          {/* Quick Stats */}
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg mx-auto border-t border-white/10 pt-6">
            <div>
              <p className="text-xl font-bold text-white">10M+</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Products</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">5k+</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Sellers</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">&lt; 100ms</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Latency</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trending Searches Tag Cloud ── */}
      <section className="bg-surface-card border-b border-outline-variant py-6 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest shrink-0 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-secondary" />
              Trending:
            </span>
            {TRENDING_SEARCHES.map((term) => (
              <Link
                key={term}
                href={`/products?search=${encodeURIComponent(term)}`}
                className="inline-flex items-center rounded-full border border-outline-variant bg-surface px-3 py-1 text-xs font-semibold text-on-surface-variant hover:border-secondary/40 hover:text-secondary hover:bg-secondary/5 transition-all"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Exploration ── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 w-full">
        <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-6">
          Explore Universe of Categories
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.slug === "electronics" ? Laptop :
                        cat.slug === "books" ? BookOpen :
                        cat.slug === "home-kitchen" ? Home : Shirt;
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="flex items-center gap-4 p-5 rounded-xl border border-outline-variant bg-white shadow-observatory hover:shadow-observatory-lifted hover:border-slate-300 transition-all duration-300 group"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-container/5 text-primary group-hover:bg-secondary group-hover:text-white transition-colors duration-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primary group-hover:text-secondary transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Browse Options
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Top Searched Products ── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 w-full border-t border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase">
              Trending Comparisons
            </h2>
            <h3 className="text-xl font-bold text-primary mt-1">
              Top Searched Products
            </h3>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1 text-sm font-bold text-secondary hover:gap-1.5 transition-all"
          >
            Explore All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ProductGrid products={featuredProducts} />
      </section>

      {/* ── Trending Today (Top Rated) ── */}
      <section className="bg-slate-50 border-t border-b border-outline-variant py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase">
                🔥 Trending Today
              </h2>
              <h3 className="text-xl font-bold text-primary mt-1">
                Highest Rated This Week
              </h3>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-1 text-sm font-bold text-secondary hover:gap-1.5 transition-all"
            >
              See All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ProductGrid products={trendingProducts} />
        </div>
      </section>

      {/* ── Popular Platforms ── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-10">
          <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-2">
            Popular Platforms
          </h2>
          <h3 className="text-xl font-bold text-primary">
            Compare Across All Major Marketplaces
          </h3>
          <p className="text-sm text-on-surface-variant mt-2 max-w-xl mx-auto">
            Andromeda aggregates listings from every major platform in real time. One search, all options.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {PLATFORMS.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center gap-3 p-4 rounded-xl border ${p.border} ${p.bg} hover:shadow-observatory-lifted transition-all group`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm font-extrabold text-sm ${p.color}`}>
                {p.abbr}
              </div>
              <div className="text-center">
                <p className={`text-xs font-bold ${p.color}`}>{p.name}</p>
                <p className="text-[10px] text-on-surface-variant leading-tight mt-0.5">{p.desc}</p>
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider ${p.color} flex items-center gap-0.5`}>
                View <ChevronRight className="h-2.5 w-2.5" />
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ── Nearby Stores Preview ── */}
      <section className="bg-slate-50 border-t border-b border-outline-variant py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-2">
                <MapPin className="h-3.5 w-3.5 inline mr-1 text-secondary" />
                Local Businesses Near You
              </h2>
              <h3 className="text-xl font-bold text-primary">
                Supporting Independent Sellers
              </h3>
              <p className="text-sm text-on-surface-variant mt-1">
                Buy local. Get faster delivery, better prices, and personal service.
              </p>
            </div>
            <Link
              href="/stores"
              className="hidden sm:flex items-center gap-1 text-sm font-bold text-secondary hover:gap-1.5 transition-all"
            >
              View All Stores
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {NEARBY_STORES.map((store) => (
              <Link
                key={store.name}
                href="/stores"
                className="bg-surface-card rounded-xl border border-outline-variant shadow-observatory hover:shadow-observatory-lifted transition-all overflow-hidden group"
              >
                {/* Store header gradient */}
                <div className={`h-16 bg-gradient-to-br ${store.colorClass}`} />
                <div className="p-5 -mt-6 relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-card border border-outline-variant shadow-sm text-secondary font-bold text-lg mb-3">
                    {store.name.charAt(0)}
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-primary group-hover:text-secondary transition-colors">
                        {store.name}
                      </h4>
                      <p className="text-xs text-on-surface-variant">{store.category}</p>
                    </div>
                    {store.isVerified && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-success/10 text-success px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1 text-tertiary">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span className="text-xs font-bold text-on-surface">{store.rating}</span>
                    </div>
                    <span className="text-[11px] text-on-surface-variant">({store.reviews} reviews)</span>
                    <span className="ml-auto flex items-center gap-0.5 text-[11px] text-secondary font-semibold">
                      <MapPin className="h-3 w-3" /> {store.distance}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-1">{store.city}</p>
                </div>
              </Link>
            ))}
          </div>
          <Link
            href="/stores"
            className="sm:hidden mt-6 flex items-center gap-1 text-sm font-bold text-secondary"
          >
            View All Stores <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── AI Assistant Placeholder ── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 w-full">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-container to-secondary p-8 lg:p-12 text-white">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 translate-y-16 -translate-x-16" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 border border-white/20">
              <Bot className="h-10 w-10 text-secondary-container" />
            </div>
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-3">
                <Zap className="h-3 w-3" /> Coming Soon
              </span>
              <h2 className="text-2xl font-extrabold mb-2">Ask Andromeda AI</h2>
              <p className="text-sm text-white/80 leading-relaxed max-w-xl">
                Describe what you need in plain language and our AI will find the best matches,
                compare them for you, and recommend the smartest buy — personalized to your budget
                and preferences.
              </p>
              <p className="text-xs text-white/60 mt-2">
                Try: <em>&quot;Find me a laptop under ₹60,000 for video editing&quot;</em> or{" "}
                <em>&quot;Best air fryer for a family of 4&quot;</em>
              </p>
            </div>
            <div className="shrink-0">
              <button
                disabled
                className="inline-flex items-center gap-2 rounded-xl bg-white/20 border border-white/30 text-white px-6 py-3 text-sm font-bold cursor-not-allowed opacity-70"
              >
                <Bot className="h-4 w-4" />
                Notify Me When Live
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Value Proposition ── */}
      <section className="bg-slate-50 py-16 border-t border-b border-slate-100 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase">
              Why Andromeda?
            </h2>
            <h3 className="text-xl font-bold text-primary mt-1">
              Engineered for Complete Transparency
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl border border-outline-variant p-6 shadow-observatory">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success mb-4">
                <span className="font-bold text-sm">₹</span>
              </div>
              <h4 className="text-sm font-bold text-primary">Multi-Seller Listings</h4>
              <p className="mt-2 text-xs text-on-surface-variant leading-relaxed">
                See exactly which sellers stock the item, compare their shipping speeds, rating metrics,
                and get the lowest final pricing.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-outline-variant p-6 shadow-observatory">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary mb-4">
                <Scale className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-primary">Side-by-Side Evaluation</h4>
              <p className="mt-2 text-xs text-on-surface-variant leading-relaxed">
                Evaluate up to 4 products in detail. Map their specifications on a cohesive grid to
                instantly see what sets them apart.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-outline-variant p-6 shadow-observatory">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tertiary/10 text-tertiary mb-4">
                <BookOpen className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-primary">Verified Purchase Reviews</h4>
              <p className="mt-2 text-xs text-on-surface-variant leading-relaxed">
                Aggregated, cross-referenced buyer reviews with verified indicators, filtered to isolate
                and screen fake or biased evaluations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Seller CTA Banner ── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 rounded-2xl bg-gradient-to-r from-primary to-primary-container p-8 lg:p-12">
          <div className="text-white flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Store className="h-5 w-5 text-secondary-container" />
              <span className="text-xs font-bold uppercase tracking-widest text-secondary-container">
                Own a Business?
              </span>
            </div>
            <h2 className="text-2xl font-extrabold mb-3">
              Join 5,000+ Sellers Growing on Andromeda
            </h2>
            <p className="text-sm text-white/80 leading-relaxed max-w-lg mb-5">
              Whether you sell directly or have your own website — Andromeda puts your products
              in front of 100,000+ shoppers every day. Free to start. No transaction fees.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/seller/register"
                className="inline-flex items-center gap-2 rounded-xl bg-secondary-container text-primary px-6 py-3 text-sm font-bold hover:opacity-90 transition-opacity"
              >
                <Package className="h-4 w-4" />
                Start Selling Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/seller"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 text-white px-6 py-3 text-sm font-bold hover:bg-white/10 transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                Learn More
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex flex-col gap-4 shrink-0">
            {[
              { icon: Globe, label: "100K+ daily shoppers" },
              { icon: TrendingUp, label: "Real-time analytics" },
              { icon: Star, label: "Verified seller badge" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-white/90">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
