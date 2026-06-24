// =============================================================================
// Andromeda — Seller Dashboard Overview Page
// =============================================================================

import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sellers, products, reviews } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import DashboardOverviewClient from "@/components/dashboard/DashboardOverviewClient";

async function DashboardContent() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Get seller
  const sellerResult = await db
    .select()
    .from(sellers)
    .where(eq(sellers.userId, session.user.id))
    .limit(1);

  if (sellerResult.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="text-xl font-bold text-primary mb-2">No store found</h2>
        <p className="text-sm text-on-surface-variant">
          Your account doesn&apos;t have a seller profile yet. Please contact support.
        </p>
      </div>
    );
  }

  const seller = sellerResult[0];

  // Stats
  const [productStats] = await db
    .select({
      total: sql<number>`COUNT(*)`,
      active: sql<number>`SUM(CASE WHEN ${products.status} = 'active' THEN 1 ELSE 0 END)`,
      draft: sql<number>`SUM(CASE WHEN ${products.status} = 'draft' THEN 1 ELSE 0 END)`,
      totalStock: sql<number>`COALESCE(SUM(${products.stock}), 0)`,
      avgPrice: sql<number>`COALESCE(AVG(${products.price}), 0)`,
      lowStock: sql<number>`SUM(CASE WHEN ${products.stock} <= 5 AND ${products.stock} > 0 THEN 1 ELSE 0 END)`,
      outOfStock: sql<number>`SUM(CASE WHEN ${products.stock} = 0 THEN 1 ELSE 0 END)`,
    })
    .from(products)
    .where(eq(products.sellerId, seller.id));

  const [reviewStats] = await db
    .select({
      total: sql<number>`COUNT(*)`,
      avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
    })
    .from(reviews)
    .innerJoin(products, eq(reviews.productId, products.id))
    .where(eq(products.sellerId, seller.id));

  // Recent products
  const recentProducts = await db
    .select({
      id: products.id,
      title: products.title,
      slug: products.slug,
      price: products.price,
      stock: products.stock,
      status: products.status,
      rating: products.rating,
      reviewCount: products.reviewCount,
    })
    .from(products)
    .where(eq(products.sellerId, seller.id))
    .orderBy(desc(products.createdAt))
    .limit(5);

  return (
    <DashboardOverviewClient
      seller={{
        businessName: seller.businessName,
        rating: seller.rating,
        isVerified: seller.isVerified,
      }}
      stats={{
        totalProducts: Number(productStats.total) || 0,
        activeProducts: Number(productStats.active) || 0,
        draftProducts: Number(productStats.draft) || 0,
        totalStock: Number(productStats.totalStock) || 0,
        avgPrice: Math.round(Number(productStats.avgPrice) || 0),
        lowStock: Number(productStats.lowStock) || 0,
        outOfStock: Number(productStats.outOfStock) || 0,
        totalReviews: Number(reviewStats.total) || 0,
        avgRating: Math.round((Number(reviewStats.avgRating) || 0) * 10) / 10,
      }}
      recentProducts={recentProducts.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: p.price,
        stock: p.stock,
        status: p.status,
        rating: p.rating,
        reviewCount: p.reviewCount,
      }))}
    />
  );
}

function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-64 bg-surface-container rounded" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-surface-container rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-surface-container rounded-xl" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
