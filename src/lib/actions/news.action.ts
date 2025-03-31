"use server";

import { count, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { news } from "@/db/schema";
import { NewsSchema } from "@/lib/validation";

import logger from "../logger";

export const getNewsListing = async (page: number) => {
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
};

export const getNewsSidebar = async (page: number, search?: string) => {
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
};

export const getNewsCount = async (search?: string) => {
  if (search) {
    return db
      .select({ count: count() })
      .from(news)
      .where(sql`${news.title} ILIKE ${`%${search}%`}`);
  }

  return db.select({ count: count() }).from(news);
};

export const getNewsById = async (id: number) => {
  const result = await db
    .select({ slug: news.slug })
    .from(news)
    .where(eq(news.id, id))
    .limit(1);
  return result[0];
};

export const getNewsBySlug = async (slug: string) => {
  const result = await db
    .select({
      id: news.id,
      title: news.title,
      slug: news.slug,
      mainImage: news.mainImage,
      content: news.content,
    })
    .from(news)
    .where(eq(news.slug, slug))
    .limit(1);

  return result[0];
};

// Schema for news validation

export type NewsFormValues = z.infer<typeof NewsSchema>;

export const createNews = async (values: NewsFormValues) => {
  try {
    const validatedFields = NewsSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { title, slug, mainImage, content } = validatedFields.data;

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
    });

    // Revalidate the home page and news page to show the latest content
    revalidatePath("/");
    revalidatePath(`/news/${slug}`);

    return { success: true };
  } catch (error) {
    logger.error("Error creating news:", error);
    return {
      error: { _form: ["Failed to create news. Please try again.", error] },
    };
  }
};

export const updateNews = async (id: number, values: NewsFormValues) => {
  try {
    const validatedFields = NewsSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { title, slug, mainImage, content } = validatedFields.data;

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
      })
      .where(eq(news.id, id));

    // Revalidate the home page and the specific news page
    revalidatePath("/");
    revalidatePath(`/news/${slug}`);

    // If the slug was changed, also revalidate the old slug path
    if (newsToUpdate.slug !== slug) {
      revalidatePath(`/news/${newsToUpdate.slug}`);
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

    // Revalidate the home page and the specific news page
    revalidatePath("/");
    revalidatePath(`/news/${slug}`);

    return { success: true };
  } catch (error) {
    logger.error("Error deleting news:", error);
    return { error: { _form: ["Failed to delete news. Please try again."] } };
  }
};
