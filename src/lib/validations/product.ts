import { z } from "zod";

export const ProductQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  categoryId: z.string().uuid().optional(),
  categorySlug: z.string().optional(),
  sellerId: z.string().uuid().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  inStock: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z
    .enum(["price", "rating", "created_at", "discount_pct"])
    .default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
  q: z.string().optional(), // search query
});

export const CompareRequestSchema = z.object({
  productIds: z
    .array(z.string())
    .min(2, "At least 2 products required")
    .max(4, "Maximum 4 products for comparison"),
});

export const SearchSuggestSchema = z.object({
  q: z.string().min(1),
  limit: z.coerce.number().int().min(1).max(10).default(6),
});

export type ProductQueryInput = z.infer<typeof ProductQuerySchema>;
export type CompareRequestInput = z.infer<typeof CompareRequestSchema>;
