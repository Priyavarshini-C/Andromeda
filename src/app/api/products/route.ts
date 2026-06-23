// =============================================================================
// Andromeda — Products Listing API Route Handler
// =============================================================================

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { products, categories, sellers } from "@/lib/db/schema";
import { eq, and, gte, lte, like, or, sql, desc, asc } from "drizzle-orm";
import { successResponse, serverError, validationError } from "@/lib/api-responses";
import { ProductQuerySchema } from "@/lib/validations/product";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const queryParams: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      if (key === "inStock" || key === "isFeatured") {
        queryParams[key] = value === "true";
      } else if (key === "page" || key === "pageSize" || key === "minPrice" || key === "maxPrice" || key === "minRating") {
        queryParams[key] = Number(value);
      } else if (key === "tags") {
        queryParams[key] = value.split(",");
      } else {
        queryParams[key] = value;
      }
    });

    const parsed = ProductQuerySchema.safeParse(queryParams);
    if (!parsed.success) {
      // Map Zod errors
      const details: Record<string, string[]> = {};
      parsed.error.errors.forEach((err) => {
        const field = err.path.join(".");
        if (!details[field]) details[field] = [];
        details[field].push(err.message);
      });
      return validationError(details);
    }

    const {
      page,
      pageSize,
      categoryId,
      sellerId,
      brand,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      isFeatured,
      tags,
      sortBy,
      order,
    } = parsed.data;

    // Build WHERE conditions
    const conditions = [eq(products.status, "active")];

    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }
    if (sellerId) {
      conditions.push(eq(products.sellerId, sellerId));
    }
    if (brand) {
      conditions.push(eq(products.brand, brand));
    }
    if (minPrice !== undefined) {
      conditions.push(gte(products.price, minPrice));
    }
    if (maxPrice !== undefined) {
      conditions.push(lte(products.price, maxPrice));
    }
    if (minRating !== undefined) {
      conditions.push(gte(products.rating, minRating));
    }
    if (inStock) {
      conditions.push(gte(products.stock, 1));
    }
    if (isFeatured !== undefined) {
      conditions.push(eq(products.isFeatured, isFeatured));
    }
    if (tags && tags.length > 0) {
      tags.forEach((tag) => {
        conditions.push(like(products.tags, `%"${tag}"%`));
      });
    }

    const whereClause = and(...conditions);

    // Build ORDER BY clause
    let orderByClause;
    const sortOrder = order === "asc" ? asc : desc;

    if (sortBy === "price") {
      orderByClause = sortOrder(products.price);
    } else if (sortBy === "rating") {
      orderByClause = sortOrder(products.rating);
    } else if (sortBy === "discount_pct") {
      // Sort by computed discount percentage: (original_price - price) / original_price
      orderByClause = sortOrder(
        sql`CASE WHEN ${products.originalPrice} > 0 THEN ((${products.originalPrice} - ${products.price}) / ${products.originalPrice}) ELSE 0 END`
      );
    } else {
      orderByClause = sortOrder(products.createdAt);
    }

    // Query for total count
    const totalResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .where(whereClause);
    const total = Number(totalResult[0]?.count || 0);

    // Query for paginated data
    const offset = (page - 1) * pageSize;
    const dbProducts = await db
      .select({
        product: products,
        category: categories,
        seller: sellers,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(sellers, eq(products.sellerId, sellers.id))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(pageSize)
      .offset(offset);

    // Map database results to ProductCard format
    const hits = dbProducts.map(({ product, category, seller }) => {
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
        rating: product.rating,
        review_count: product.reviewCount,
        brand: product.brand,
        is_featured: product.isFeatured,
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
      };
    });

    const totalPages = Math.ceil(total / pageSize);
    const meta = {
      page,
      pageSize,
      total,
      totalPages,
    };

    return successResponse(hits, meta);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return serverError();
  }
}
