import React, { Suspense } from "react";

import NewsGrid from "@/components/News/NewsGrid";
import NewsPagination from "@/components/News/NewsPagination";
import NewsSkeleton from "@/components/News/NewsSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

const News = async ({ searchParams }: { searchParams: SearchParams }) => {
  const { page } = await searchParams;
  const currentPage = Number(page) < 1 || !page ? 1 : Number(page);
  return (
    <section className="section section-pt-small section-pb relative">
      <div id="hero" className="absolute -top-16" />
      <div className="section-container items-center">
        <h1 className="section-title self-start">Wszystkie aktualności</h1>
        <Suspense key={currentPage} fallback={<NewsSkeleton />}>
          <NewsGrid page={currentPage} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-9 w-60" />}>
          <NewsPagination currentPage={currentPage} />
        </Suspense>
      </div>
    </section>
  );
};

export default News;
