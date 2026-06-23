// =============================================================================
// Andromeda — User Wishlist Delete API Route Handler
// =============================================================================

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { wishlists } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { unauthorized, notFound, serverError } from "@/lib/api-responses";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return unauthorized();
    }

    const userId = session.user.id;
    const { id } = await params;

    // 2. Verify wishlist entry exists and belongs to the user
    const existing = await db
      .select()
      .from(wishlists)
      .where(and(eq(wishlists.id, id), eq(wishlists.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return notFound("Wishlist item not found");
    }

    // 3. Delete the entry
    await db
      .delete(wishlists)
      .where(and(eq(wishlists.id, id), eq(wishlists.userId, userId)));

    // 4. Return 204 No Content
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/user/wishlist/[id] error:", error);
    return serverError();
  }
}
