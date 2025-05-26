import React from "react";

import { getNewsListing } from "@/lib/actions/news.action";

import NewsCard from "./NewsCard";

const NewsGrid = async ({ page = 1 }: { page: number }) => {
  const news = await getNewsListing(page);
  const newsCount = news.length;
  return (
    <div className={`news-grid ${newsCount <= 3 && "h-[75dvh] min-h-[400px]"}`}>
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
