import Link from "next/link";
import { Laptop, BookOpen, Home, Shirt, ArrowRight, Search, Scale } from "lucide-react";
import ProductGrid from "@/components/product/ProductGrid";
import { PRODUCTS, CATEGORIES } from "@/lib/utils/mock-data";

export default function HomePage() {
  // Use all mock products for landing display
  const featuredProducts = PRODUCTS.slice(0, 4);

  return (
    <div className="flex flex-col w-full">
      
      {/* Premium Hero Section */}
      <section className="gradient-hero text-white py-20 lg:py-28 px-4 relative overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 rounded-full bg-secondary-container/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 rounded-full bg-tertiary/10 blur-3xl" />

        <div className="mx-auto max-w-4xl text-center relative z-10">
          {/* Tagline */}
          <span className="inline-flex items-center rounded-full bg-secondary-container/20 px-3.5 py-1 text-xs font-semibold text-secondary-container uppercase tracking-wider">
            One Search. Infinite Choices.
          </span>
          
          {/* Headline */}
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Discover &amp; Compare Everything
          </h1>
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            Search once to compare real-time pricing, specifications, and availability across marketplaces, independent brands, and local stores near you.
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

      {/* Categories Section */}
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

      {/* Featured Section */}
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

      {/* Value Proposition */}
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
                See exactly which sellers stock the item, compare their shipping speeds, rating metrics, and get the lowest final pricing.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-outline-variant p-6 shadow-observatory">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary mb-4">
                <Scale className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-primary">Side-by-Side Evaluation</h4>
              <p className="mt-2 text-xs text-on-surface-variant leading-relaxed">
                Evaluate up to 4 products in detail. Map their specifications on a cohesive grid to instantly see what sets them apart.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-outline-variant p-6 shadow-observatory">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tertiary/10 text-tertiary mb-4">
                <BookOpen className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-primary">Verified Purchase Reviews</h4>
              <p className="mt-2 text-xs text-on-surface-variant leading-relaxed">
                Aggregated, cross-referenced buyer reviews with verified indicators, filtered to isolate and screen fake or biased evaluations.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
