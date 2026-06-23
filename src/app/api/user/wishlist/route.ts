// =============================================================================
// Andromeda — User Wishlist API Route Handler (GET and POST)
// =============================================================================

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { wishlists, products, categories, sellers } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import {
  successResponse,
  unauthorized,
  validationError,
  conflict,
  serverError,
} from "@/lib/api-responses";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return unauthorized();
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const collectionName = searchParams.get("collection");
    const page = Number(searchParams.get("page") || "1");
    const pageSize = Number(searchParams.get("pageSize") || "20");

    // 2. Build WHERE clause
    const conditions = [eq(wishlists.userId, userId)];
    if (collectionName) {
      conditions.push(eq(wishlists.collectionName, collectionName));
    }

    const whereClause = and(...conditions);

    // 3. Count total items
    const totalResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(wishlists)
      .where(whereClause);
    const total = Number(totalResult[0]?.count || 0);

    // 4. Query paginated entries with joined product details
    const offset = (page - 1) * pageSize;
    const dbWishlist = await db
      .select({
        wishlist: wishlists,
        product: products,
        category: categories,
        seller: sellers,
      })
      .from(wishlists)
      .innerJoin(products, eq(wishlists.productId, products.id))
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(sellers, eq(products.sellerId, sellers.id))
      .where(whereClause)
      .limit(pageSize)
      .offset(offset);

    // 5. Map entries to WishlistItem format
    const items = dbWishlist.map(({ wishlist, product, category, seller }) => {
      const discountPct = product.originalPrice && product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

      return {
        id: wishlist.id,
        collection_name: wishlist.collectionName,
        note: wishlist.note,
        added_at: wishlist.createdAt instanceof Date 
          ? wishlist.createdAt.toISOString() 
          : new Date(wishlist.createdAt).toISOString(),
        product: {
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
        },
      };
    });

    const meta = {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };

    return successResponse(items, meta);
  } catch (error) {
    console.error("GET /api/user/wishlist error:", error);
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return unauthorized();
    }

    const userId = session.user.id;

    // 2. Parse body
    let body;
    try {
      body = await request.json();
    } catch {
      return validationError({ body: ["Invalid JSON body"] });
    }

    const { productId, collectionName = "My Wishlist", note } = body;
    if (!productId) {
      return validationError({ productId: ["Product ID is required"] });
    }

    // 3. Check if already exists in that collection
    const existing = await db
      .select()
      .from(wishlists)
      .where(
        and(
          eq(wishlists.userId, userId),
          eq(wishlists.productId, productId),
          eq(wishlists.collectionName, collectionName)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return conflict("Product is already saved in this wishlist collection.");
    }

    // 4. Insert wishlist entry
    const [inserted] = await db
      .insert(wishlists)
      .values({
        userId,
        productId,
        collectionName,
        note,
      })
      .returning();

    // 5. Fetch full inserted details to respond
    const details = await db
      .select({
        wishlist: wishlists,
        product: products,
        category: categories,
        seller: sellers,
      })
      .from(wishlists)
      .innerJoin(products, eq(wishlists.productId, products.id))
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(sellers, eq(products.sellerId, sellers.id))
      .where(eq(wishlists.id, inserted.id))
      .limit(1);

    const { product, category, seller } = details[0];
    const discountPct = product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

    const responseItem = {
      id: inserted.id,
      collection_name: inserted.collectionName,
      note: inserted.note,
      added_at: inserted.createdAt instanceof Date 
        ? inserted.createdAt.toISOString() 
        : new Date(inserted.createdAt).toISOString(),
      product: {
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
      },
    };

    return successResponse(responseItem, null, 201);
  } catch (error) {
    console.error("POST /api/user/wishlist error:", error);
    return serverError();
  }
}
