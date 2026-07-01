// =============================================================================
// Andromeda — Products Search Results (Server Component)
// =============================================================================

import React, { Suspense } from "react";
import { db } from "@/lib/db";
import { products, categories, sellers } from "@/lib/db/schema";
import { eq, and, like, or, sql, desc } from "drizzle-orm";
import ProductsPageClient from "@/components/product/ProductsPageClient";
import { Product } from "@/lib/utils/mock-data";

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
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full animate-pulse bg-[#FAF6F2]">
          <div className="h-8 w-48 bg-zinc-200 rounded mb-8" />
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-64 h-96 bg-zinc-200 rounded-xl" />
            <div className="flex-1 h-96 bg-zinc-200 rounded-xl" />
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
  const mappedProducts: Product[] = dbProducts.map(({ product, category, seller }: any) => {
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
    const otherSellers = allSellers.filter((s: any) => s.id !== seller.id).slice(0, 2);

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
      ...otherSellers.map((s: any, idx: number) => ({
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
    <ProductsPageClient
      initialProducts={mappedProducts}
      categoriesWithCounts={categoriesWithCounts}
      categorySlug={categorySlug}
      title={title}
      subtitle={subtitle}
      totalProductsCount={totalProductsCount}
    />
  );
}
