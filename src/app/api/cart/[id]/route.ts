// =============================================================================
// Andromeda — Cart Item Detail API Route Handler (PUT and DELETE)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { carts, products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import {
  successResponse,
  unauthorized,
  validationError,
  serverError,
} from "@/lib/api-responses";

interface RouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
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

    const { quantity } = body;
    if (quantity === undefined || isNaN(Number(quantity))) {
      return validationError({ quantity: ["Quantity must be a valid number"] });
    }

    const parsedQty = Math.max(1, Number(quantity));

    // Verify cart item ownership
    const cartItem = await db
      .select({ productId: carts.productId })
      .from(carts)
      .where(and(eq(carts.id, id), eq(carts.userId, userId)))
      .limit(1);

    if (cartItem.length === 0) {
      return validationError({ id: ["Cart item not found or unauthorized"] });
    }

    // Verify stock availability
    const productResult = await db
      .select({ stock: products.stock })
      .from(products)
      .where(eq(products.id, cartItem[0].productId))
      .limit(1);

    if (productResult.length === 0) {
      return validationError({ id: ["Associated product not found"] });
    }

    const productStock = productResult[0].stock;
    if (productStock < parsedQty) {
      return validationError({
        quantity: [`Only ${productStock} items in stock`],
      });
    }

    // Update quantity
    await db
      .update(carts)
      .set({ quantity: parsedQty })
      .where(eq(carts.id, id));

    return successResponse({ success: true });
  } catch (error) {
    console.error("PUT /api/cart/[id] error:", error);
    return serverError();
  }
}

export async function DELETE(request: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorized();
    }

    const userId = session.user.id;

    // Delete item if it belongs to user
    const result = await db
      .delete(carts)
      .where(and(eq(carts.id, id), eq(carts.userId, userId)))
      .returning({ deletedId: carts.id });

    if (result.length === 0) {
      return validationError({ id: ["Cart item not found or unauthorized"] });
    }

    return successResponse({ deletedId: result[0].deletedId });
  } catch (error) {
    console.error("DELETE /api/cart/[id] error:", error);
    return serverError();
  }
}
