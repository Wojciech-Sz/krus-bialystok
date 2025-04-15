import React from "react";

import { getNewsListing } from "@/lib/actions/news.action";

import NewsCard from "./NewsCard";

const NewsGrid = async ({ page = 1 }: { page: number }) => {
  const news = await getNewsListing(page);
  return (
    <div className="news-grid h-[150svh] sm:h-[75svh]">
      {news &&
        news.map((newsItem) => (
          <NewsCard
            key={newsItem.slug}
            slug={newsItem.slug}
            mainImage={newsItem.mainImage}
            title={newsItem.title}
          />
        ))}
    </div>
  );
};

export default NewsGrid;
