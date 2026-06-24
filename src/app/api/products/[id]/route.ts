// =============================================================================
// Andromeda — Product Detail API Route Handler
// =============================================================================

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { products, categories, sellers, reviews, priceHistory } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { successResponse, notFound, serverError } from "@/lib/api-responses";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if the id parameter is a UUID or a slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const productCondition = isUuid ? eq(products.id, id) : eq(products.slug, id);

    // Fetch product with joined category and seller
    const productResult = await db
      .select({
        product: products,
        category: categories,
        seller: sellers,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(sellers, eq(products.sellerId, sellers.id))
      .where(productCondition)
      .limit(1);

    if (productResult.length === 0) {
      return notFound("Product not found");
    }

    const { product, category, seller } = productResult[0];

    // Parse JSON fields
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

    let tags: string[] = [];
    try {
      tags = JSON.parse(product.tags);
    } catch {
      tags = [];
    }

    // Fetch review ratings for breakdown
    const dbReviews = await db
      .select({ rating: reviews.rating })
      .from(reviews)
      .where(eq(reviews.productId, product.id));

    const totalReviews = dbReviews.length;
    const reviewSum = dbReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalReviews > 0 ? Number((reviewSum / totalReviews).toFixed(2)) : 0;

    const breakdown: Record<"1" | "2" | "3" | "4" | "5", number> = {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
    };
    dbReviews.forEach((r) => {
      const ratingStr = r.rating.toString() as "1" | "2" | "3" | "4" | "5";
      if (breakdown[ratingStr] !== undefined) {
        breakdown[ratingStr]++;
      }
    });

    // Fetch price history (last 30 entries)
    const dbPriceHistory = await db
      .select({
        price: priceHistory.price,
        currency: priceHistory.currency,
        recordedAt: priceHistory.recordedAt,
      })
      .from(priceHistory)
      .where(eq(priceHistory.productId, product.id))
      .orderBy(desc(priceHistory.recordedAt))
      .limit(30);

    const priceHistoryPoints = dbPriceHistory
      .map((ph) => ({
        price: ph.price,
        currency: ph.currency,
        recorded_at: ph.recordedAt instanceof Date 
          ? ph.recordedAt.toISOString() 
          : new Date(ph.recordedAt).toISOString(),
      }))
      .reverse(); // Chronological order for graphs

    const discountPct = product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

    // Construct ProductDetail response
    const productDetail = {
      id: product.id,
      title: product.title,
      slug: product.slug,
      thumbnail_url: product.thumbnailUrl,
      price: product.price,
      original_price: product.originalPrice,
      discount_pct: discountPct,
      currency: product.currency,
      stock: product.stock,
      rating: averageRating,
      review_count: totalReviews,
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
      price_history: priceHistoryPoints,
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
        average: averageRating,
        total: totalReviews,
        breakdown,
      },
    };

    return successResponse(productDetail);
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return serverError();
  }
}
