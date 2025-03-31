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
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <article className="prose prose-lg max-w-none">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">{news.title}</h1>

        <div className="relative w-full h-[300px] md:h-[400px] mb-8">
          <Image
            src={news.mainImage}
            alt={news.title}
            fill
            className="object-cover rounded-lg"
            priority
          />
        </div>

        <div
          className="mt-8"
          dangerouslySetInnerHTML={{ __html: parsedContent }}
        />
      </article>
    </main>
  );
};

export default NewsPage;
