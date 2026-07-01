// =============================================================================
// Andromeda — Seller Product Manager Page (Server Component)
// =============================================================================

import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sellers, products, categories } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import ProductManagerClient from "@/components/dashboard/ProductManagerClient";

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-surface">
          <div className="animate-pulse space-y-4 text-center">
            <div className="h-8 w-48 bg-surface-container rounded mx-auto" />
            <div className="text-xs text-on-surface-variant animate-bounce">Loading products manager...</div>
          </div>
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}

async function ProductsPageContent() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const sellerResult = await db
    .select()
    .from(sellers)
    .where(eq(sellers.userId, session.user.id))
    .limit(1);

  if (sellerResult.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-primary">No seller profile found</h2>
      </div>
    );
  }

  const seller = sellerResult[0];

  // Fetch all products for this seller
  const sellerProducts = await db
    .select({
      product: products,
      category: categories,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.sellerId, seller.id))
    .orderBy(desc(products.createdAt));

  // Fetch all categories for the "add product" form
  const allCategories = await db.select().from(categories);

  return (
    <ProductManagerClient
      products={sellerProducts.map(({ product, category }: any) => ({
        id: product.id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        originalPrice: product.originalPrice,
        stock: product.stock,
        status: product.status,
        brand: product.brand,
        rating: product.rating,
        reviewCount: product.reviewCount,
        categoryName: category.name,
        categoryId: category.id,
        createdAt: product.createdAt?.toISOString() || "",
      }))}
      categories={allCategories.map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      }))}
    />
  );
}
