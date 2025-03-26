CREATE TABLE "news" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"main_image" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"published_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "news_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX "published_at_idx" ON "news" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "slug_idx" ON "news" USING btree ("slug");