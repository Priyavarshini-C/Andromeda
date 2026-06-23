import { z } from "zod";

export const ReviewCreateSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().optional(),
  content: z.string().min(10, "Review must be at least 10 characters"),
});

export const ReviewVoteSchema = z.object({
  isHelpful: z.boolean(),
});

export type ReviewCreateInput = z.infer<typeof ReviewCreateSchema>;
export type ReviewVoteInput = z.infer<typeof ReviewVoteSchema>;
