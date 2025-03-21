import {
  text,
  pgTable,
  serial,
  varchar,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const news = pgTable(
  "news",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    mainImage: varchar("main_image", { length: 255 }).notNull(),
    content: text("content").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    // Index for faster queries on the main page (recent published articles)
    index("published_at_idx").on(table.publishedAt),
    // Index for looking up articles by slug
    index("slug_idx").on(table.slug),
  ]
);
