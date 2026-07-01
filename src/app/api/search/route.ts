// =============================================================================
// Andromeda — Search API Route Handler (FTS Fallback via SQL)
// =============================================================================

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { products, categories, sellers } from "@/lib/db/schema";
import { eq, and, gte, lte, like, or, sql, desc, asc } from "drizzle-orm";
import { successResponse, serverError, validationError } from "@/lib/api-responses";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q") || "";
    const page = Number(searchParams.get("page") || "1");
    const pageSize = Number(searchParams.get("pageSize") || "20");
    const categorySlug = searchParams.get("category") || "";
    const brand = searchParams.get("brand") || "";
    const sellersParam = searchParams.get("sellers") || "";
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const minRating = searchParams.get("minRating") ? Number(searchParams.get("minRating")) : undefined;
    const inStock = searchParams.get("inStock") === "true";
    const sortBy = searchParams.get("sortBy") || "relevance";
    const order = searchParams.get("order") || "desc";

    if (!q) {
      return validationError({ q: ["Search query is required"] });
    }

    const start = Date.now();

    // Base WHERE conditions
    const conditions = [
      eq(products.status, "active"),
      or(
        like(products.title, `%${q}%`),
        like(products.description, `%${q}%`),
        like(products.brand, `%${q}%`),
        like(products.shortDesc, `%${q}%`)
      ),
    ];

    if (categorySlug) {
      conditions.push(eq(categories.slug, categorySlug));
    }
    if (brand) {
      conditions.push(eq(products.brand, brand));
    }
    if (sellersParam) {
      const sellerIds = sellersParam.split(",");
      conditions.push(or(...sellerIds.map((id) => eq(products.sellerId, id))));
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

    const whereClause = and(...conditions);

    // Sorting
    let orderByClause;
    const sortOrder = order === "asc" ? asc : desc;

    if (sortBy === "price") {
      orderByClause = sortOrder(products.price);
    } else if (sortBy === "rating") {
      orderByClause = sortOrder(products.rating);
    } else {
      // Default: relevance fallback (recent products first)
      orderByClause = sortOrder(products.createdAt);
    }

    // Query paginated results
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

    // Format hits
    const hits = dbProducts.map(({ product, category, seller }: any) => {
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

    // Total count for metadata
    const totalResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(sellers, eq(products.sellerId, sellers.id))
      .where(whereClause);
    const total = Number(totalResult[0]?.count || 0);

    // Compute facet counts dynamically
    const categoryCounts = await db
      .select({
        id: categories.id,
        slug: categories.slug,
        name: categories.name,
        count: sql<number>`COUNT(${products.id})`,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(sellers, eq(products.sellerId, sellers.id))
      .where(whereClause)
      .groupBy(categories.id);

    const categoriesFacet = categoryCounts.map((c: any) => ({
      value: c.slug,
      label: c.name,
      count: Number(c.count),
    }));

    const brandCounts = await db
      .select({
        brand: products.brand,
        count: sql<number>`COUNT(${products.id})`,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(sellers, eq(products.sellerId, sellers.id))
      .where(and(whereClause, sql`${products.brand} IS NOT NULL`))
      .groupBy(products.brand);

    const brandsFacet = brandCounts.map((b: any) => ({
      value: b.brand || "",
      label: b.brand || "",
      count: Number(b.count),
    }));

    const sellerCounts = await db
      .select({
        id: sellers.id,
        name: sellers.businessName,
        count: sql<number>`COUNT(${products.id})`,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(sellers, eq(products.sellerId, sellers.id))
      .where(whereClause)
      .groupBy(sellers.id);

    const sellersFacet = sellerCounts.map((s: any) => ({
      value: s.id,
      label: s.name,
      count: Number(s.count),
    }));

    const processingTimeMs = Date.now() - start;

    return successResponse(
      {
        hits,
        facets: {
          categories: categoriesFacet,
          brands: brandsFacet,
          sellers: sellersFacet,
          price_ranges: [
            {
              label: "Under ₹10,000",
              min: 0,
              max: 10000,
              count: hits.filter((h: any) => h.price < 10000).length,
            },
            {
              label: "₹10,000 - ₹25,000",
              min: 10000,
              max: 25000,
              count: hits.filter((h: any) => h.price >= 10000 && h.price <= 25000).length,
            },
            {
              label: "₹25,000 - ₹50,000",
              min: 25000,
              max: 50000,
              count: hits.filter((h: any) => h.price >= 25000 && h.price <= 50000).length,
            },
            {
              label: "Above ₹50,000",
              min: 50000,
              max: 9999999,
              count: hits.filter((h: any) => h.price > 50000).length,
            },
          ],
          ratings: [
            { value: "4", label: "4★ & above", count: hits.filter((h: any) => h.rating >= 4).length },
            { value: "3", label: "3★ & above", count: hits.filter((h: any) => h.rating >= 3).length },
          ],
        },
        query: q,
        processing_time_ms: processingTimeMs,
      },
      {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      }
    );
  } catch (error) {
    console.error("GET /api/search error:", error);
    return serverError();
  }
}
