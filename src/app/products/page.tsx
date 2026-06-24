import React, { Suspense } from "react";
import Link from "next/link";
import { Laptop, BookOpen, Home, Shirt, SlidersHorizontal, Star } from "lucide-react";
import ProductGrid from "@/components/product/ProductGrid";
import { db } from "@/lib/db";
import { products, categories, sellers } from "@/lib/db/schema";
import { eq, and, like, or, sql, desc } from "drizzle-orm";

export const unstable_instant = {
  prefetch: "static",
  samples: [
    { searchParams: { q: null, category: null } },
  ],
};

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full animate-pulse">
          <div className="h-8 w-48 bg-surface-container rounded mb-8" />
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-64 h-96 bg-surface-container rounded-xl" />
            <div className="flex-1 h-96 bg-surface-container rounded-xl" />
          </div>
        </div>
      }
    >
      <ProductsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ProductsContent({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const categorySlug = params.category || "";

  let title = "All Products";
  let subtitle = "Discover and compare top listings across the platform";

  // 1. Build category condition and query category
  let categoryCondition;
  if (categorySlug) {
    const cat = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, categorySlug))
      .limit(1);
    if (cat.length > 0) {
      categoryCondition = eq(products.categoryId, cat[0].id);
      title = cat[0].name;
      subtitle = `Explore and compare items in ${cat[0].name}`;
    }
  }

  // 2. Build search query condition
  let searchCondition;
  if (query) {
    searchCondition = or(
      like(products.title, `%${query}%`),
      like(products.brand, `%${query}%`),
      like(products.description, `%${query}%`)
    );
    title = `Search Results`;
    subtitle = `Showing matches for "${query}"`;
  }

  // 3. Query all products matching the conditions
  const conditions = [eq(products.status, "active")];
  if (categoryCondition) conditions.push(categoryCondition);
  if (searchCondition) conditions.push(searchCondition);

  const dbProducts = await db
    .select({
      product: products,
      category: categories,
      seller: sellers,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .innerJoin(sellers, eq(products.sellerId, sellers.id))
    .where(and(...conditions))
    .orderBy(desc(products.createdAt));

  // 4. Query categories and product counts for the sidebar
  const categoriesWithCounts = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      icon: categories.icon,
      productCount: sql<number>`CAST((SELECT COUNT(*) FROM ${products} WHERE ${products.categoryId} = ${categories.id} AND ${products.status} = 'active') AS INTEGER)`,
    })
    .from(categories)
    .orderBy(categories.sortOrder);

  // 5. Query total active product count
  const totalProductsResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(products)
    .where(eq(products.status, "active"));
  const totalProductsCount = Number(totalProductsResult[0]?.count || 0);

  // 6. Query all active sellers to mock comparisons dynamically
  const allSellers = await db
    .select()
    .from(sellers)
    .where(eq(sellers.status, "active"));

  // 7. Map database rows to the Product format expected by the frontend components
  const mappedProducts = dbProducts.map(({ product, category, seller }) => {
    let images: string[] = [];
    try {
      images = JSON.parse(product.images);
    } catch {
      images = product.images ? [product.images] : [];
    }

    let specs: Record<string, string> = {};
    try {
      specs = JSON.parse(product.specs);
    } catch {
      specs = {};
    }

    // Filter other sellers to create mock comparative offers
    const otherSellers = allSellers.filter((s) => s.id !== seller.id).slice(0, 2);

    const sellersList = [
      {
        sellerId: seller.id,
        sellerName: seller.businessName,
        isVerified: seller.isVerified,
        price: product.price,
        stock: product.stock,
        deliveryDays: 2,
        rating: seller.rating || 4.5,
        shopUrl: "#",
      },
      ...otherSellers.map((s, idx) => ({
        sellerId: s.id,
        sellerName: s.businessName,
        isVerified: s.isVerified,
        price: Math.round(product.price * (1 + (idx + 1) * 0.05)), // 5% and 10% price markup
        stock: Math.round(product.stock * 0.7),
        deliveryDays: 3 + idx,
        rating: s.rating || 4.2,
        shopUrl: "#",
      })),
    ];

    return {
      id: product.id,
      title: product.title,
      brand: product.brand || "",
      slug: product.slug,
      description: product.description || "",
      images,
      price: product.price,
      listPrice: product.originalPrice || product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      rating: product.rating || 4.0,
      reviewCount: product.reviewCount || 0,
      specs,
      sellers: sellersList,
      priceHistory: [],
      reviews: [],
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
      
      {/* Header Banner */}
      <div className="mb-8 border-b border-outline-variant/20 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant font-medium">
          {subtitle} ({mappedProducts.length} items found)
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
          
          {/* Categories Filter Block */}
          <div className="bg-surface-card rounded-xl border border-outline-variant p-5 shadow-observatory">
            <h3 className="text-xs font-bold text-on-surface-variant/60 tracking-wider uppercase mb-4">
              Categories
            </h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/products"
                  className={`flex items-center justify-between p-2 rounded-lg text-xs font-bold transition-all ${
                    !categorySlug ? "bg-primary text-white" : "text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  <span>All Categories</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    !categorySlug ? "bg-white/20 text-white" : "bg-surface-container text-on-surface-variant"
                  }`}>
                    {totalProductsCount}
                  </span>
                </Link>
              </li>
              {categoriesWithCounts.map((cat) => {
                const Icon = cat.slug === "electronics" ? Laptop : 
                            cat.slug === "books" ? BookOpen : 
                            cat.slug === "home-kitchen" ? Home : Shirt;
                const isSelected = categorySlug === cat.slug;
                
                return (
                  <li key={cat.id}>
                    <Link
                      href={`/products?category=${cat.slug}`}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs font-bold transition-all ${
                        isSelected ? "bg-primary text-white" : "text-on-surface-variant hover:bg-surface-container"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5" />
                        {cat.name}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isSelected ? "bg-white/20 text-white" : "bg-surface-container text-on-surface-variant"
                      }`}>
                        {cat.productCount}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick Mock Filter Block */}
          <div className="bg-surface-card rounded-xl border border-outline-variant p-5 shadow-observatory">
            <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant/60 tracking-wider uppercase mb-4">
              <SlidersHorizontal className="h-4 w-4" />
              Filter By
            </div>
            
            {/* Price Mock */}
            <div className="mb-4">
              <h4 className="text-xs font-bold text-primary mb-2">Price Range</h4>
              <div className="h-1 bg-surface-container rounded relative mb-2">
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
              <ul className="space-y-1.5 text-xs text-on-surface-variant font-medium">
                {Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="flex items-center gap-2 hover:text-secondary cursor-pointer">
                    <input type="checkbox" className="rounded text-secondary focus:ring-secondary/20 bg-surface border-outline-variant/50" />
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
          <ProductGrid products={mappedProducts} emptyMessage="No products match your search/category selection." />
        </div>

      </div>

    </div>
  );
}
