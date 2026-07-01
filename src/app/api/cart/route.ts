// =============================================================================
// Andromeda — User Shopping Cart API Route Handler (GET and POST)
// =============================================================================

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { carts, products, categories, sellers } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import {
  successResponse,
  unauthorized,
  validationError,
  serverError,
} from "@/lib/api-responses";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorized();
    }

    const userId = session.user.id;

    // Fetch all cart items for this user with product details
    const dbCartItems = await db
      .select({
        cart: carts,
        product: products,
        category: categories,
        seller: sellers,
      })
      .from(carts)
      .innerJoin(products, eq(carts.productId, products.id))
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(sellers, eq(products.sellerId, sellers.id))
      .where(eq(carts.userId, userId))
      .orderBy(carts.createdAt);

    const items = dbCartItems.map(({ cart, product, category, seller }: any) => {
      const discountPct =
        product.originalPrice && product.originalPrice > product.price
          ? Math.round(
              ((product.originalPrice - product.price) / product.originalPrice) *
                100
            )
          : 0;

      return {
        id: cart.id,
        quantity: cart.quantity,
        added_at: cart.createdAt,
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

    return successResponse(items);
  } catch (error) {
    console.error("GET /api/cart error:", error);
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorized();
    }

    const userId = session.user.id;

    let body;
    try {
      body = await request.json();
    } catch {
      return validationError({ body: ["Invalid JSON body"] });
    }

    const { productId, quantity = 1 } = body;
    if (!productId) {
      return validationError({ productId: ["Product ID is required"] });
    }

    const parsedQty = Math.max(1, Number(quantity));

    // Verify product exists and check stock
    const productResult = await db
      .select({ stock: products.stock })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (productResult.length === 0) {
      return validationError({ productId: ["Product not found"] });
    }

    const productStock = productResult[0].stock;
    if (productStock < parsedQty) {
      return validationError({
        quantity: [`Only ${productStock} items in stock`],
      });
    }

    // Check if the product is already in the user's cart
    const existing = await db
      .select()
      .from(carts)
      .where(and(eq(carts.userId, userId), eq(carts.productId, productId)))
      .limit(1);

    let resultId: string;

    if (existing.length > 0) {
      // Update quantity
      const newQty = existing[0].quantity + parsedQty;
      if (productStock < newQty) {
        return validationError({
          quantity: [
            `Cannot add more items. Only ${productStock} total items in stock, and you already have ${existing[0].quantity} in your cart.`,
          ],
        });
      }

      await db
        .update(carts)
        .set({ quantity: newQty })
        .where(eq(carts.id, existing[0].id));
      resultId = existing[0].id;
    } else {
      // Insert new cart item
      const [inserted] = await db
        .insert(carts)
        .values({
          userId,
          productId,
          quantity: parsedQty,
        })
        .returning({ id: carts.id });
      resultId = inserted.id;
    }

    return successResponse({ cartItemId: resultId }, null, 201);
  } catch (error) {
    console.error("POST /api/cart error:", error);
    return serverError();
  }
}
