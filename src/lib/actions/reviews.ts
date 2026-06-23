// =============================================================================
// Andromeda — Reviews Server Actions
// =============================================================================

"use server";

import { db } from "@/lib/db";
import { reviews, reviewVotes } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function submitReview(values: {
  productId: string;
  rating: number;
  title?: string;
  content: string;
}) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return { error: "UNAUTHORIZED" };
  }

  const userId = session.user.id;
  const { productId, rating, title, content } = values;

  try {
    const existing = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.userId, userId)))
      .limit(1);

    if (existing.length > 0) {
      return { error: "ALREADY_EXISTS" };
    }

    await db.insert(reviews).values({
      productId,
      userId,
      rating,
      title,
      content,
      isVerifiedPurchase: true,
    });

    revalidatePath(`/products/${productId}`);
    return { success: true };
  } catch (error) {
    console.error("submitReview action error:", error);
    return { error: "SERVER_ERROR" };
  }
}

export async function voteHelpful(reviewId: string, isHelpful: boolean) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return { error: "UNAUTHORIZED" };
  }

  const userId = session.user.id;

  try {
    const existingVote = await db
      .select()
      .from(reviewVotes)
      .where(and(eq(reviewVotes.reviewId, reviewId), eq(reviewVotes.userId, userId)))
      .limit(1);

    if (existingVote.length > 0) {
      // If user is changing their vote
      if (existingVote[0].isHelpful !== isHelpful) {
        await db
          .update(reviewVotes)
          .set({ isHelpful })
          .where(eq(reviewVotes.id, existingVote[0].id));

        const diffHelpful = isHelpful ? 1 : -1;
        const diffUnhelpful = isHelpful ? -1 : 1;

        await db
          .update(reviews)
          .set({
            helpfulCount: sql`${reviews.helpfulCount} + ${diffHelpful}`,
            unhelpfulCount: sql`${reviews.unhelpfulCount} + ${diffUnhelpful}`,
          })
          .where(eq(reviews.id, reviewId));
      }
    } else {
      // Create new vote
      await db.insert(reviewVotes).values({
        reviewId,
        userId,
        isHelpful,
      });

      await db
        .update(reviews)
        .set({
          helpfulCount: isHelpful ? sql`${reviews.helpfulCount} + 1` : reviews.helpfulCount,
          unhelpfulCount: !isHelpful ? sql`${reviews.unhelpfulCount} + 1` : reviews.unhelpfulCount,
        })
        .where(eq(reviews.id, reviewId));
    }

    // Query updated counts to return
    const reviewResult = await db
      .select({
        helpfulCount: reviews.helpfulCount,
        unhelpfulCount: reviews.unhelpfulCount,
        productId: reviews.productId,
      })
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (reviewResult.length > 0) {
      revalidatePath(`/products/${reviewResult[0].productId}`);
      return {
        success: true,
        helpfulCount: reviewResult[0].helpfulCount,
        unhelpfulCount: reviewResult[0].unhelpfulCount,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("voteHelpful action error:", error);
    return { error: "SERVER_ERROR" };
  }
}
