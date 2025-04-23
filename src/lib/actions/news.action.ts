"use server";

import { count, eq, sql } from "drizzle-orm";
import { unstable_cache, revalidateTag } from "next/cache";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { news } from "@/db/schema";
import { NewsSchema } from "@/lib/validation";

import logger from "../logger";

export const getNewsListing = unstable_cache(
  async (page: number) => {
    return db
      .select({
        slug: news.slug,
        title: news.title,
        mainImage: news.mainImage,
      })
      .from(news)
      .orderBy(sql`${news.publishedAt} desc`)
      .limit(6)
      .offset((page - 1) * 6);
  },
  ["news-listing"],
  { tags: ["news"] }
);

export const getNewsSidebar = unstable_cache(
  async (page: number, search?: string) => {
    if (search) {
      return db
        .select({
          slug: news.slug,
          title: news.title,
        })
        .from(news)
        .where(sql`${news.title} ILIKE ${`%${search}%`}`)
        .orderBy(sql`${news.publishedAt} desc`)
        .limit(6)
        .offset((page - 1) * 6);
    }

    return db
      .select({
        slug: news.slug,
        title: news.title,
      })
      .from(news)
      .orderBy(sql`${news.publishedAt} desc`)
      .limit(6)
      .offset((page - 1) * 6);
  },
  ["news-sidebar"],
  { tags: ["news"] }
);

export const getNewsCount = unstable_cache(
  async (search?: string) => {
    if (search) {
      return db
        .select({ count: count() })
        .from(news)
        .where(sql`${news.title} ILIKE ${`%${search}%`}`);
    }

    return db.select({ count: count() }).from(news);
  },
  ["news-count"],
  { tags: ["news"] }
);

export const getNewsById = unstable_cache(
  async (id: number) => {
    const result = await db
      .select({ slug: news.slug })
      .from(news)
      .where(eq(news.id, id))
      .limit(1);
    return result[0];
  },
  ["news-by-id"],
  { tags: ["news"] }
);

export const getNewsBySlug = unstable_cache(
  async (slug: string) => {
    const result = await db
      .select({
        id: news.id,
        title: news.title,
        slug: news.slug,
        images: news.images,
        mainImage: news.mainImage,
        content: news.content,
      })
      .from(news)
      .where(eq(news.slug, slug))
      .limit(1);

    return result[0];
  },
  ["news-by-slug"],
  { tags: ["news"] }
);

// Schema for news validation

export const createNews = async (values: z.infer<typeof NewsSchema>) => {
  try {
    const validatedFields = NewsSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { title, slug, mainImage, content, images } = validatedFields.data;

    // Check if slug already exists
    const existingNews = await getNewsBySlug(slug);
    if (existingNews) {
      return { error: { slug: ["Slug already exists"] } };
    }

    await db.insert(news).values({
      title,
      slug,
      mainImage,
      content,
      images,
    });

    // Revalidate the news tag
    revalidateTag("news");

    return { success: true };
  } catch (error) {
    logger.error("Error creating news:", error);
    return {
      error: { _form: ["Failed to create news. Please try again.", error] },
    };
  }
};

export const updateNews = async (
  id: number,
  values: z.infer<typeof NewsSchema>
) => {
  try {
    const validatedFields = NewsSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { title, slug, mainImage, content, images } = validatedFields.data;

    // Check if slug already exists
    const existingNews = await getNewsBySlug(slug);
    if (existingNews && existingNews.id !== id) {
      return { error: { slug: ["Slug already exists"] } };
    }

    // Make sure the news item exists before updating
    const newsToUpdate = await getNewsById(id);
    if (!newsToUpdate) {
      return { error: { _form: ["News item not found"] } };
    }

    // Update the existing news item
    await db
      .update(news)
      .set({
        title,
        slug,
        mainImage,
        content,
        images,
      })
      .where(eq(news.id, id));

    // Revalidate the news tag
    revalidateTag("news");

    // If the slug was changed, also revalidate the news tag
    if (newsToUpdate.slug !== slug) {
      revalidateTag("news");
    }

    return { success: true };
  } catch (error) {
    logger.error("Error updating news:", error);
    return { error: { _form: ["Failed to update news. Please try again."] } };
  }
};

export const deleteNews = async (slug: string) => {
  try {
    await db.delete(news).where(eq(news.slug, slug));

    // Revalidate the news tag
    revalidateTag("news");

    return { success: true };
  } catch (error) {
    logger.error("Error deleting news:", error);
    return { error: { _form: ["Failed to delete news. Please try again."] } };
  }
};

// Schema for updating images only
const UpdateNewsImagesSchema = z.object({
  id: z.number(),
  images: z.array(z.string().url()),
});

export const updateNewsImages = async (
  values: z.infer<typeof UpdateNewsImagesSchema>
) => {
  try {
    const validatedFields = UpdateNewsImagesSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { id, images } = validatedFields.data;

    // Make sure the news item exists before updating
    const newsToUpdate = await getNewsById(id);
    if (!newsToUpdate) {
      return { error: { _form: ["News item not found"] } };
    }

    // Update the images field
    await db.update(news).set({ images }).where(eq(news.id, id));

    // Revalidate the news tag
    revalidateTag("news");

    return { success: true };
  } catch (error) {
    logger.error("Error updating news images:", error);
    return {
      error: { _form: ["Failed to update news images. Please try again."] },
    };
  }
};
