import Link from "next/link";
import React, { Suspense } from "react";

import { ROUTES } from "@/constants/routes";

import NewsGrid from "../News/NewsGrid";
import NewsSkeleton from "../News/NewsSkeleton";
import { Button } from "../ui/button";

const News = async () => {
  return (
    <section id="news" className="section section-pt-big">
      <div className="section-container">
        <h2 className="section-title">Aktualności</h2>
        <Suspense fallback={<NewsSkeleton />}>
          <NewsGrid page={1} />
        </Suspense>
        <Button asChild size="lg" className="w-fit self-center text-base">
          <Link href={ROUTES.NEWS_LIST}>Wszystkie aktualności</Link>
        </Button>
      </div>
    </section>
  );
};

export default News;
