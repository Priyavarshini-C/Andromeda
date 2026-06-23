// =============================================================================
// Andromeda — Autocomplete Suggestions API Route Handler
// =============================================================================

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { products, categories, sellers } from "@/lib/db/schema";
import { eq, and, like, sql } from "drizzle-orm";
import { successResponse, serverError, validationError } from "@/lib/api-responses";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q") || "";
    const limit = Math.min(Number(searchParams.get("limit") || "6"), 10);

    if (!q || q.length < 1) {
      return validationError({ q: ["Search query must be at least 1 character"] });
    }

    const start = Date.now();

    // Query databases in parallel
    const [dbProducts, dbCategories, dbSellers, dbBrands] = await Promise.all([
      db
        .select({
          title: products.title,
          slug: products.slug,
          thumbnail: products.thumbnailUrl,
        })
        .from(products)
        .where(and(eq(products.status, "active"), like(products.title, `%${q}%`)))
        .limit(limit),

      db
        .select({
          name: categories.name,
          slug: categories.slug,
        })
        .from(categories)
        .where(and(eq(categories.isActive, true), like(categories.name, `%${q}%`)))
        .limit(limit),

      db
        .select({
          businessName: sellers.businessName,
          slug: sellers.slug,
          logoUrl: sellers.logoUrl,
        })
        .from(sellers)
        .where(and(eq(sellers.status, "active"), like(sellers.businessName, `%${q}%`)))
        .limit(limit),

      db
        .select({
          brand: products.brand,
        })
        .from(products)
        .where(and(eq(products.status, "active"), like(products.brand, `%${q}%`)))
        .groupBy(products.brand)
        .limit(limit),
    ]);

    const suggestions: Array<{
      type: "product" | "category" | "brand" | "seller";
      label: string;
      slug: string;
      thumbnail?: string;
    }> = [];

    // Prioritize categories, then brands, then sellers, then products
    dbCategories.forEach((c) => {
      suggestions.push({
        type: "category",
        label: c.name,
        slug: c.slug,
      });
    });

    dbBrands.forEach((b) => {
      if (b.brand) {
        suggestions.push({
          type: "brand",
          label: b.brand,
          slug: b.brand.toLowerCase().replace(/\s+/g, "-"),
        });
      }
    });

    dbSellers.forEach((s) => {
      suggestions.push({
        type: "seller",
        label: s.businessName,
        slug: s.slug,
        thumbnail: s.logoUrl || undefined,
      });
    });

    dbProducts.forEach((p) => {
      suggestions.push({
        type: "product",
        label: p.title,
        slug: p.slug,
        thumbnail: p.thumbnail || undefined,
      });
    });

    // Truncate list to the requested limit
    const finalSuggestions = suggestions.slice(0, limit);

    const processingTimeMs = Date.now() - start;

    return successResponse({
      suggestions: finalSuggestions,
      processing_time_ms: processingTimeMs,
    });
  } catch (error) {
    console.error("GET /api/search/suggest error:", error);
    return serverError();
  }
}
