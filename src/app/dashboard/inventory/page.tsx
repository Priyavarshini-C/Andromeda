// =============================================================================
// Andromeda — Price & Inventory Dashboard Page (Server Component)
// =============================================================================

import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sellers, products, categories } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import InventoryClient from "@/components/dashboard/InventoryClient";

async function InventoryContent() {
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

  const sellerProducts = await db
    .select({
      id: products.id,
      title: products.title,
      slug: products.slug,
      price: products.price,
      originalPrice: products.originalPrice,
      stock: products.stock,
      status: products.status,
      brand: products.brand,
      categoryName: categories.name,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.sellerId, seller.id))
    .orderBy(desc(products.createdAt));

  return (
    <InventoryClient
      products={sellerProducts.map((p: any) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: p.price,
        originalPrice: p.originalPrice,
        stock: p.stock,
        status: p.status,
        brand: p.brand,
        categoryName: p.categoryName,
      }))}
    />
  );
}

export default function InventoryPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-surface-container rounded" />
          <div className="h-12 bg-surface-container rounded-xl" />
          <div className="h-64 bg-surface-container rounded-xl" />
        </div>
      }
    >
      <InventoryContent />
    </Suspense>
  );
}
