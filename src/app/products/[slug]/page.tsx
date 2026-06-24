import React, { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, ShieldCheck } from "lucide-react";
import ProductDetailsClient from "@/components/product/ProductDetailsClient";
import ReviewForm from "@/components/product/ReviewForm";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { products, categories, sellers, reviews, priceHistory } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const unstable_instant = {
  prefetch: "static",
  samples: [
    { params: { slug: "nebula-x1-pro-smartphone" } },
  ],
};

export async function generateStaticParams() {
  const allProducts = await db
    .select({ slug: products.slug })
    .from(products)
    .where(eq(products.status, "active"));
  
  return allProducts.map((p) => ({
    slug: p.slug,
  }));
}

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const productResult = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  if (productResult.length === 0) {
    return {
      title: "Product Not Found — Andromeda",
    };
  }

  const product = productResult[0];
  return {
    title: `${product.title} — Andromeda`,
    description: product.description?.substring(0, 160) || "",
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full animate-pulse flex-1 flex flex-col">
          <div className="h-4 w-24 bg-surface-container rounded mb-6" />
          <div className="h-[500px] bg-surface-container rounded-xl" />
        </div>
      }
    >
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: ProductPageProps) {
  const { slug } = await params;

  // 1. Fetch product with joined category and seller
  const productResult = await db
    .select({
      product: products,
      category: categories,
      seller: sellers,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .innerJoin(sellers, eq(products.sellerId, sellers.id))
    .where(eq(products.slug, slug))
    .limit(1);

  if (productResult.length === 0) {
    notFound();
  }

  const { product: dbProduct, category: dbCategory, seller: dbSeller } = productResult[0];

  // 2. Parse JSON fields
  let images: string[] = [];
  try {
    images = JSON.parse(dbProduct.images);
  } catch {
    images = dbProduct.images ? [dbProduct.images] : [];
  }

  let specs: Record<string, string> = {};
  try {
    specs = JSON.parse(dbProduct.specs);
  } catch {
    specs = {};
  }

  // 3. Fetch reviews and resolve reviewer names
  const dbReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.content,
      title: reviews.title,
      userName: sql<string>`(SELECT name FROM users WHERE users.id = ${reviews.userId})`,
      isVerified: reviews.isVerifiedPurchase,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(eq(reviews.productId, dbProduct.id))
    .orderBy(desc(reviews.createdAt));

  const mappedReviews = dbReviews.map((r) => ({
    id: r.id,
    userName: r.userName || "Anonymous User",
    rating: r.rating,
    comment: r.comment || "",
    date: r.createdAt instanceof Date 
      ? r.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) 
      : new Date(r.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    isVerified: !!r.isVerified,
  }));

  // 4. Fetch price history
  const dbPriceHistory = await db
    .select({
      price: priceHistory.price,
      recordedAt: priceHistory.recordedAt,
    })
    .from(priceHistory)
    .where(eq(priceHistory.productId, dbProduct.id))
    .orderBy(desc(priceHistory.recordedAt))
    .limit(30);

  const mappedPriceHistory = dbPriceHistory
    .map((ph) => ({
      date: ph.recordedAt instanceof Date 
        ? ph.recordedAt.toISOString().split("T")[0] 
        : new Date(ph.recordedAt).toISOString().split("T")[0],
      price: ph.price,
    }))
    .reverse();

  // 5. Fetch all active sellers to mock comparative offers
  const allSellers = await db
    .select()
    .from(sellers)
    .where(eq(sellers.status, "active"));

  const otherSellers = allSellers.filter((s) => s.id !== dbSeller.id).slice(0, 2);

  // Import mock third-party listings
  const { getMarketplaceListings } = require("@/lib/services/marketplace-aggregator");
  const onlineListings = getMarketplaceListings(dbProduct.id, dbProduct.title, dbProduct.price);

  const localSellersList = [
    {
      id: dbSeller.id,
      source: "local" as const,
      sellerId: dbSeller.id,
      sellerName: dbSeller.businessName,
      isVerified: !!dbSeller.isVerified,
      price: dbProduct.price,
      stock: dbProduct.stock,
      deliveryDays: 0, // Same Day / 2 hrs
      deliveryFee: 0, // Free local pickup
      rating: dbSeller.rating || 4.5,
      shopUrl: `/stores/${dbSeller.slug}`,
    },
    ...otherSellers.map((s, idx) => ({
      id: s.id,
      source: "local" as const,
      sellerId: s.id,
      sellerName: s.businessName,
      isVerified: !!s.isVerified,
      price: Math.round(dbProduct.price * (1 + (idx + 1) * 0.03)), // 3% and 6% local markup
      stock: Math.round(dbProduct.stock * 0.7),
      deliveryDays: idx === 0 ? 0 : 1, // Same Day or Next Day
      deliveryFee: 30, // Small local delivery fee
      rating: s.rating || 4.2,
      shopUrl: `/stores/${s.slug}`,
    })),
  ];

  // Combine both lists
  const sellersList = [...localSellersList, ...onlineListings];


  // 6. Map to the full product object expected by ProductDetailsClient
  const mappedProduct = {
    id: dbProduct.id,
    title: dbProduct.title,
    brand: dbProduct.brand || "",
    slug: dbProduct.slug,
    description: dbProduct.description || "",
    images,
    price: dbProduct.price,
    listPrice: dbProduct.originalPrice || dbProduct.price,
    stock: dbProduct.stock,
    categoryId: dbProduct.categoryId,
    rating: dbProduct.rating || 4.0,
    reviewCount: dbReviews.length,
    specs,
    sellers: sellersList,
    priceHistory: mappedPriceHistory,
    reviews: mappedReviews,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-1 flex flex-col">
      {/* Breadcrumbs / Back button */}
      <div className="mb-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-secondary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Explore
        </Link>
      </div>

      {/* Main product interactive block (Client Component) */}
      <ProductDetailsClient product={mappedProduct} />

      {/* Specifications Grid */}
      <section className="mt-12 border-t border-outline-variant/30 pt-8">
        <h2 className="text-lg font-bold text-primary mb-4">
          Technical Specifications
        </h2>
        <div className="bg-surface-card rounded-xl border border-outline-variant overflow-hidden shadow-observatory max-w-3xl">
          <table className="w-full text-left border-collapse text-xs">
            <tbody>
              {Object.entries(mappedProduct.specs || {}).map(([key, val], index) => (
                <tr
                  key={key}
                  className={`border-b border-outline-variant/30 last:border-b-0 ${
                    index % 2 === 0 ? "bg-surface-card" : "bg-surface-container/30"
                  }`}
                >
                  <td className="p-4 w-48 font-bold text-on-surface-variant/80 bg-surface-container/50">
                    {key}
                  </td>
                  <td className="p-4 font-semibold text-on-surface">
                    {val}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="mt-12 border-t border-outline-variant/30 pt-8">
        <div className="max-w-3xl">
          <h2 className="text-lg font-bold text-primary mb-6">
            Customer Reviews ({mappedProduct.reviews.length})
          </h2>
          
          <div className="flex flex-col gap-6">
            {mappedProduct.reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-surface-card rounded-xl border border-outline-variant p-5 shadow-observatory flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-on-surface">{rev.userName}</span>
                    {rev.isVerified && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-success/15 px-2 py-0.5 text-[9px] font-bold text-success uppercase tracking-wider">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-medium">{rev.date}</span>
                </div>
                
                {/* Review Stars */}
                <div className="flex items-center gap-0.5 text-tertiary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < rev.rating ? "fill-current" : "text-outline-variant"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs leading-relaxed text-on-surface-variant font-medium">
                  {rev.comment}
                </p>
              </div>
            ))}

            {mappedProduct.reviews.length === 0 && (
              <p className="text-sm text-on-surface-variant italic">
                No reviews yet. Be the first to review this product!
              </p>
            )}

            {/* Review Submission Form */}
            <ReviewForm productId={mappedProduct.id} productSlug={mappedProduct.slug} />
          </div>
        </div>
      </section>
    </div>
  );
}
