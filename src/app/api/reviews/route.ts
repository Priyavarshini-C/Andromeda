// =============================================================================
// Andromeda — Reviews API Route Handler
// =============================================================================

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import {
  successResponse,
  unauthorized,
  validationError,
  conflict,
  serverError,
} from "@/lib/api-responses";
import { ReviewCreateSchema } from "@/lib/validations/review";

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

    // 3. Validate input
    const parsed = ReviewCreateSchema.safeParse(body);
    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      parsed.error.issues.forEach((err) => {
        const field = err.path.join(".");
        if (!details[field]) details[field] = [];
        details[field].push(err.message);
      });
      return validationError(details);
    }

    const { productId, rating, title, content } = parsed.data;

    // 4. Check for duplicate review (one per user per product)
    const existingReview = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.userId, userId)))
      .limit(1);

    if (existingReview.length > 0) {
      return conflict("You have already reviewed this product.");
    }

    // 5. Insert new review
    const [insertedReview] = await db
      .insert(reviews)
      .values({
        productId,
        userId,
        rating,
        title,
        content,
        isVerifiedPurchase: true, // Default to true for simplicity in MVP
      })
      .returning();

    return successResponse(insertedReview, null, 21); // 201 Created (using success helper, but wait, successResponse can specify status 201)
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return serverError();
  }
}
