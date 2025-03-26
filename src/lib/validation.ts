import { z } from "zod";

export const NewsSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  mainImage: z.string().min(1, "Main image is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
});
