import React from "react";
import Link from "next/link";
import { Laptop, BookOpen, Home, Shirt, SlidersHorizontal, Star } from "lucide-react";
import ProductGrid from "@/components/product/ProductGrid";
import { PRODUCTS, CATEGORIES, getProductsBySearch, getProductsByCategory } from "@/lib/utils/mock-data";

export const unstable_instant = { prefetch: "static" };

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const categorySlug = params.category || "";

  let filteredProducts = PRODUCTS;
  let title = "All Products";
  let subtitle = "Discover and compare top listings across the platform";

  // Apply search query
  if (query) {
    filteredProducts = getProductsBySearch(query);
    title = `Search Results`;
    subtitle = `Showing matches for "${query}"`;
  } 
  // Apply category filter
  else if (categorySlug) {
    const category = CATEGORIES.find((c) => c.slug === categorySlug);
    if (category) {
      filteredProducts = getProductsByCategory(categorySlug);
      title = category.name;
      subtitle = `Explore and compare items in ${category.name}`;
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
      
      {/* Header Banner */}
      <div className="mb-8 border-b border-slate-100 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant font-medium">
          {subtitle} ({filteredProducts.length} items found)
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
          
          {/* Categories Filter Block */}
          <div className="bg-white rounded-xl border border-outline-variant p-5 shadow-observatory">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">
              Categories
            </h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/products"
                  className={`flex items-center justify-between p-2 rounded-lg text-xs font-bold transition-all ${
                    !categorySlug ? "bg-primary text-white" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>All Categories</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    !categorySlug ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {PRODUCTS.length}
                  </span>
                </Link>
              </li>
              {CATEGORIES.map((cat) => {
                const count = PRODUCTS.filter((p) => p.categoryId === cat.id).length;
                const Icon = cat.slug === "electronics" ? Laptop : 
                            cat.slug === "books" ? BookOpen : 
                            cat.slug === "home-kitchen" ? Home : Shirt;
                const isSelected = categorySlug === cat.slug;
                
                return (
                  <li key={cat.id}>
                    <Link
                      href={`/products?category=${cat.slug}`}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs font-bold transition-all ${
                        isSelected ? "bg-primary text-white" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5" />
                        {cat.name}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      }`}>
                        {count}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick Mock Filter Block */}
          <div className="bg-white rounded-xl border border-outline-variant p-5 shadow-observatory">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">
              <SlidersHorizontal className="h-4 w-4" />
              Filter By
            </div>
            
            {/* Price Mock */}
            <div className="mb-4">
              <h4 className="text-xs font-bold text-primary mb-2">Price Range</h4>
              <div className="h-1 bg-slate-100 rounded relative mb-2">
                <div className="absolute left-0 right-0 top-0 bottom-0 bg-secondary rounded" />
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold text-on-surface-variant">
                <span>Min: ₹0</span>
                <span>Max: ₹1,00,000</span>
              </div>
            </div>

            {/* Rating Mock */}
            <div>
              <h4 className="text-xs font-bold text-primary mb-2">Customer Review</h4>
              <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                {Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="flex items-center gap-2 hover:text-secondary cursor-pointer">
                    <input type="checkbox" className="rounded text-secondary focus:ring-secondary/20" />
                    <div className="flex items-center gap-0.5 text-tertiary">
                      {Array.from({ length: 5 - i }).map((_, starI) => (
                        <Star key={starI} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                    <span>&amp; Up</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </aside>

        {/* Main Product Grid Container */}
        <div className="flex-1">
          <ProductGrid products={filteredProducts} emptyMessage="No products match your search/category selection." />
        </div>

      </div>

    </div>
  );
}
