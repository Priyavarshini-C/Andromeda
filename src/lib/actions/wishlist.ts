// =============================================================================
// Andromeda — Wishlist Server Actions
// =============================================================================

"use server";

import { db } from "@/lib/db";
import { wishlists } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addToWishlist(
  productId: string,
  collectionName = "My Wishlist",
  note?: string
) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return { error: "UNAUTHORIZED" };
  }

  const userId = session.user.id;

  try {
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
      return { error: "ALREADY_EXISTS" };
    }

    await db.insert(wishlists).values({
      userId,
      productId,
      collectionName,
      note,
    });

    revalidatePath("/products");
    revalidatePath(`/products/${productId}`);
    return { success: true };
  } catch (error) {
    console.error("addToWishlist action error:", error);
    return { error: "SERVER_ERROR" };
  }
}

export async function removeFromWishlist(wishlistId: string) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return { error: "UNAUTHORIZED" };
  }

  const userId = session.user.id;

  try {
    const existing = await db
      .select()
      .from(wishlists)
      .where(and(eq(wishlists.id, wishlistId), eq(wishlists.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return { error: "NOT_FOUND" };
    }

    await db.delete(wishlists).where(and(eq(wishlists.id, wishlistId), eq(wishlists.userId, userId)));

    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("removeFromWishlist action error:", error);
    return { error: "SERVER_ERROR" };
  }
}

export async function checkWishlistItem(productId: string) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return { isSaved: false };
  }

  const userId = session.user.id;

  try {
    const existing = await db
      .select()
      .from(wishlists)
      .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)))
      .limit(1);

    return {
      isSaved: existing.length > 0,
      wishlistId: existing[0]?.id || null,
    };
  } catch (error) {
    console.error("checkWishlistItem action error:", error);
    return { isSaved: false, wishlistId: null };
  }
}
