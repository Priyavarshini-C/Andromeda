// =============================================================================
// Andromeda — Product Comparison API Route Handler
// =============================================================================

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { products, categories, sellers, reviews, priceHistory } from "@/lib/db/schema";
import { eq, inArray, desc } from "drizzle-orm";
import { successResponse, serverError, validationError } from "@/lib/api-responses";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return validationError({ body: ["Invalid JSON body"] });
    }

    const { productIds } = body;
    if (!productIds || !Array.isArray(productIds) || productIds.length < 2 || productIds.length > 4) {
      return validationError({
        productIds: ["Must provide between 2 and 4 product IDs for comparison"],
      });
    }

    // Fetch products
    const dbProducts = await db
      .select({
        product: products,
        category: categories,
        seller: sellers,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(sellers, eq(products.sellerId, sellers.id))
      .where(inArray(products.id, productIds));

    if (dbProducts.length === 0) {
      return successResponse({ products: [], spec_keys: [] });
    }

    const actualProductIds = dbProducts.map((p) => p.product.id);

    // Fetch reviews for these products to compute rating summaries
    const dbReviews = await db
      .select({
        productId: reviews.productId,
        rating: reviews.rating,
      })
      .from(reviews)
      .where(inArray(reviews.productId, actualProductIds));

    // Fetch price history for these products (last 30 days)
    const dbPriceHistory = await db
      .select({
        productId: priceHistory.productId,
        price: priceHistory.price,
        currency: priceHistory.currency,
        recordedAt: priceHistory.recordedAt,
      })
      .from(priceHistory)
      .where(inArray(priceHistory.productId, actualProductIds))
      .orderBy(desc(priceHistory.recordedAt));

    // Group reviews and price histories by productId
    const reviewsMap: Record<string, typeof dbReviews> = {};
    const priceHistoryMap: Record<string, typeof dbPriceHistory> = {};

    actualProductIds.forEach((id) => {
      reviewsMap[id] = [];
      priceHistoryMap[id] = [];
    });

    dbReviews.forEach((r) => {
      reviewsMap[r.productId]?.push(r);
    });

    dbPriceHistory.forEach((ph) => {
      // Keep only up to 30 history points per product
      if (priceHistoryMap[ph.productId].length < 30) {
        priceHistoryMap[ph.productId].push(ph);
      }
    });

    // Find min price, max rating, and best value for comparison badges
    let minPrice = Infinity;
    let maxRating = -1;
    let bestValueScore = -1;

    const computedStats = dbProducts.map(({ product }) => {
      const pReviews = reviewsMap[product.id] || [];
      const totalReviews = pReviews.length;
      const reviewSum = pReviews.reduce((sum, r) => sum + r.rating, 0);
      const rating = totalReviews > 0 ? Number((reviewSum / totalReviews).toFixed(2)) : 0;
      
      const price = product.price;
      const valueScore = price > 0 ? rating / price : 0;

      if (price < minPrice) minPrice = price;
      if (rating > maxRating) maxRating = rating;
      if (valueScore > bestValueScore) bestValueScore = valueScore;

      return {
        id: product.id,
        price,
        rating,
        valueScore,
      };
    });

    // Union of all spec keys
    const specKeysSet = new Set<string>();

    // Build the list of CompareProducts
    const productsList = dbProducts.map(({ product, category, seller }) => {
      const stats = computedStats.find((s) => s.id === product.id)!;
      const pReviews = reviewsMap[product.id] || [];
      
      // Breakdown calculation
      const breakdown: Record<"1" | "2" | "3" | "4" | "5", number> = {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
      };
      pReviews.forEach((r) => {
        const ratingStr = r.rating.toString() as "1" | "2" | "3" | "4" | "5";
        if (breakdown[ratingStr] !== undefined) {
          breakdown[ratingStr]++;
        }
      });

      // Price history formatting
      const historyPoints = (priceHistoryMap[product.id] || [])
        .map((ph) => ({
          price: ph.price,
          currency: ph.currency,
          recorded_at: ph.recordedAt instanceof Date 
            ? ph.recordedAt.toISOString() 
            : new Date(ph.recordedAt).toISOString(),
        }))
        .reverse();

      // Spec keys parsing
      let specs: Record<string, string> = {};
      try {
        specs = JSON.parse(product.specs);
        Object.keys(specs).forEach((k) => specKeysSet.add(k));
      } catch {
        specs = {};
      }

      let images: string[] = [];
      try {
        images = JSON.parse(product.images);
      } catch {
        images = product.images ? [product.images] : [];
      }

      let tags: string[] = [];
      try {
        tags = JSON.parse(product.tags);
      } catch {
        tags = [];
      }

      const discountPct = product.originalPrice && product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

      return {
        id: product.id,
        title: product.title,
        slug: product.slug,
        thumbnail_url: product.thumbnailUrl,
        price: product.price,
        original_price: product.originalPrice,
        discount_pct: discountPct,
        currency: product.currency,
        stock: product.stock,
        rating: stats.rating,
        review_count: pReviews.length,
        brand: product.brand,
        is_featured: product.isFeatured,
        description: product.description || "",
        short_desc: product.shortDesc || "",
        images,
        specs,
        tags,
        sku: product.sku,
        meta_title: product.metaTitle,
        meta_description: product.metaDescription,
        price_history: historyPoints,
        seller: {
          id: seller.id,
          business_name: seller.businessName,
          slug: seller.slug,
          is_verified: seller.isVerified,
        },
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
        },
        review_summary: {
          average: stats.rating,
          total: pReviews.length,
          breakdown,
        },
        // Comparison badges
        is_cheapest: stats.price === minPrice && minPrice !== Infinity,
        is_highest_rated: stats.rating === maxRating && maxRating > 0,
        is_best_value: stats.valueScore === bestValueScore && bestValueScore > 0,
      };
    });

    return successResponse({
      products: productsList,
      spec_keys: Array.from(specKeysSet),
    });
  } catch (error) {
    console.error("POST /api/compare error:", error);
    return serverError();
  }
}
