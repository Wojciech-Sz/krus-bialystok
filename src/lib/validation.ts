import { z } from "zod";

export const NewsSchema = z.object({
  title: z.string().min(3, "Tytuł musi zawierać co najmniej 3 znaki"),
  slug: z.string().min(3, "Slug musi zawierać co najmniej 3 znaki"),
  mainImage: z.string().url().min(1, "Zdjęcie główne jest wymagane"),
  images: z.array(z.string().url()),
  content: z.string().min(10, "Treść musi zawierać co najmniej 10 znaków"),
});
