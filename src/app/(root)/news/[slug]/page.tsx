import Image from "next/image";
import { notFound } from "next/navigation";
import React from "react";

import { getNewsBySlug } from "@/lib/actions/news.action";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const MarkdownIt = require("markdown-it");

// Define the cache configuration
export const revalidate = 3600; // Revalidate at most every hour

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const news = await getNewsBySlug(slug!);

  if (!news) {
    return {
      title: "News Not Found",
    };
  }

  return {
    title: `${news.title} | KRUS Białystok`,
    description: news.title,
    openGraph: {
      images: [news.mainImage],
    },
  };
}

const NewsPage = async ({ params }: { params: Params }) => {
  const { slug } = await params;
  console.log(slug);
  if (!slug) {
    notFound();
  }

  const news = await getNewsBySlug(slug!);

  if (!news) {
    notFound();
  }
  const md = new MarkdownIt();
  const parsedContent = md.render(news.content);

  return (
    <section className="section-container section-pt-small section-pb">
      <article className="flex flex-col gap-6 relative">
        <div id="hero" className="absolute -top-16" />
        <h1 className="text-3xl md:text-4xl font-bold">{news.title}</h1>

        <div className="relative w-full h-[300px] md:h-[400px]">
          <Image
            src={news.mainImage}
            alt={news.title}
            fill
            className="object-cover rounded-lg"
            priority
          />
        </div>

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: parsedContent }}
        />
      </article>
    </section>
  );
};

export default NewsPage;
