// =============================================================================
// Andromeda — Stores (Sellers Directory) API Route
// Returns sellers with optional proximity sorting and category filtering
// =============================================================================

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { sellers, products, categories } from "@/lib/db/schema";
import { eq, and, sql, desc, asc, gte, like } from "drizzle-orm";
import { successResponse, serverError } from "@/lib/api-responses";

// Haversine distance in km (computed in JS since SQLite lacks trig functions)
function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const lat = sp.get("lat") ? Number(sp.get("lat")) : null;
    const lng = sp.get("lng") ? Number(sp.get("lng")) : null;
    const maxDistanceKm = sp.get("radius") ? Number(sp.get("radius")) : 50;
    const categorySlug = sp.get("category") || "";
    const minRating = sp.get("minRating") ? Number(sp.get("minRating")) : 0;
    const query = sp.get("q") || "";
    const sortBy = sp.get("sortBy") || "distance"; // distance | rating | name
    const page = Number(sp.get("page") || "1");
    const pageSize = Number(sp.get("pageSize") || "20");

    // Fetch all active sellers with their product counts per category
    const conditions = [eq(sellers.status, "active")];

    if (query) {
      conditions.push(like(sellers.businessName, `%${query}%`));
    }
    if (minRating > 0) {
      conditions.push(gte(sellers.rating, minRating));
    }

    const whereClause = and(...conditions);

    const dbSellers = await db
      .select()
      .from(sellers)
      .where(whereClause);

    // Compute distances and filter
    let enriched = dbSellers.map((s) => {
      let distanceKm: number | null = null;
      if (lat !== null && lng !== null && s.latitude !== null && s.longitude !== null) {
        distanceKm = haversineKm(lat, lng, s.latitude, s.longitude);
      }

      // Parse business hours
      let hours: Record<string, string> = {};
      try {
        hours = s.businessHours ? JSON.parse(s.businessHours) : {};
      } catch { /* ignore */ }

      return {
        id: s.id,
        businessName: s.businessName,
        slug: s.slug,
        description: s.description,
        logoUrl: s.logoUrl,
        address: s.addressLine1,
        city: s.city,
        state: s.state,
        pincode: s.pincode,
        phone: s.phone,
        email: s.email,
        website: s.website,
        isVerified: s.isVerified,
        rating: s.rating,
        reviewCount: s.reviewCount,
        productCount: s.productCount,
        latitude: s.latitude,
        longitude: s.longitude,
        businessHours: hours,
        distanceKm: distanceKm !== null ? Math.round(distanceKm * 10) / 10 : null,
      };
    });

    // Filter by distance if user location is provided
    if (lat !== null && lng !== null) {
      enriched = enriched.filter(
        (s) => s.distanceKm !== null && s.distanceKm <= maxDistanceKm
      );
    }

    // Filter by category if specified
    if (categorySlug) {
      // Get category ID
      const cat = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, categorySlug))
        .limit(1);

      if (cat.length > 0) {
        // Get seller IDs that have products in this category
        const sellerIdsInCategory = await db
          .select({ sellerId: products.sellerId })
          .from(products)
          .where(and(eq(products.categoryId, cat[0].id), eq(products.status, "active")))
          .groupBy(products.sellerId);

        const validIds = new Set(sellerIdsInCategory.map((r) => r.sellerId));
        enriched = enriched.filter((s) => validIds.has(s.id));
      }
    }

    // Sort
    if (sortBy === "distance" && lat !== null && lng !== null) {
      enriched.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    } else if (sortBy === "rating") {
      enriched.sort((a, b) => b.rating - a.rating);
    } else {
      enriched.sort((a, b) => a.businessName.localeCompare(b.businessName));
    }

    // Paginate
    const total = enriched.length;
    const offset = (page - 1) * pageSize;
    const paginated = enriched.slice(offset, offset + pageSize);

    return successResponse(paginated, {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("GET /api/stores error:", error);
    return serverError();
  }
}
