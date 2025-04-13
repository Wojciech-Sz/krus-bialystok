import Link from "next/link";
import React from "react";

import { ROUTES } from "@/constants/routes";
import { getNewsListing } from "@/lib/actions/news.action";

import NewsCard from "../cards/NewsCard";
import { Button } from "../ui/button";

const News = async () => {
  const news = await getNewsListing(1);
  return (
    <section id="news" className="section section-pt-big">
      <div className="section-container">
        <h2 className="section-title">Aktualności</h2>
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
        <Button asChild size="lg" className="w-fit self-center text-base">
          <Link href={ROUTES.NEWS_LIST}>Wszystkie aktualności</Link>
        </Button>
      </div>
    </section>
  );
};

export default News;
