// =============================================================================
// Andromeda — Categories API Route Handler
// =============================================================================

import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { successResponse, serverError } from "@/lib/api-responses";

export async function GET() {
  try {
    // Query categories with sub-query for product count
    const allCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        icon: categories.icon,
        description: categories.description,
        parentId: categories.parentId,
        productCount: sql<number>`CAST((SELECT COUNT(*) FROM ${products} WHERE ${products.categoryId} = ${categories.id} AND ${products.status} = 'active') AS INTEGER)`,
      })
      .from(categories);

    // Filter parent categories (no parentId)
    const parents = allCategories.filter((c: any) => !c.parentId);
    const children = allCategories.filter((c: any) => c.parentId);

    const data = parents.map((parent: any) => {
      const parentChildren = children
        .filter((child: any) => child.parentId === parent.id)
        .map((child: any) => ({
          id: child.id,
          name: child.name,
          slug: child.slug,
          product_count: child.productCount,
        }));

      // Parent's count is the sum of its own products plus its subcategories' products
      const childrenSum = parentChildren.reduce((sum: number, c: any) => sum + c.product_count, 0);
      const totalCount = parent.productCount + childrenSum;

      return {
        id: parent.id,
        name: parent.name,
        slug: parent.slug,
        icon: parent.icon,
        description: parent.description,
        product_count: totalCount,
        children: parentChildren,
      };
    });

    return successResponse(data);
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return serverError();
  }
}
