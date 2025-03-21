"use server";

import { count, sql } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { news } from "@/db/schema";

const getNewsListing = async (page: number) => {
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

export const getNewsCount = async () =>
  await db.select({ count: count() }).from(news);

export default getNewsListing;
