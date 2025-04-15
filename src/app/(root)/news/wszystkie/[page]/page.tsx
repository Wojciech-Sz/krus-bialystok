import React, { Suspense } from "react";

import NewsGrid from "@/components/News/NewsGrid";
import NewsSkeleton from "@/components/News/NewsSkeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getNewsCount } from "@/lib/actions/news.action";

const News = async ({ params }: { params: PageParams }) => {
  const { page } = await params;
  const currentPage = Number(page) < 1 || !page ? 1 : Number(page);
  const newsCount = await getNewsCount();
  const totalPages = Math.ceil(newsCount[0].count / 6);
  return (
    <section className="section section-pt-small section-pb relative">
      <div id="hero" className="absolute -top-16" />
      <div className="section-container items-center">
        <h1 className="section-title self-start">Wszystkie aktualności</h1>
        <Suspense fallback={<NewsSkeleton />}>
          <NewsGrid page={currentPage} />
        </Suspense>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={`/news/wszystkie/${Math.max(1, currentPage - 1)}`}
                aria-disabled={currentPage === 1}
                className={`${currentPage === 1 ? "hidden" : ""}`}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href={`/news/wszystkie/${page}`}
                      isActive={page === currentPage}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <PaginationItem key={page}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return null;
            })}
            <PaginationItem>
              <PaginationNext
                href={`/news/wszystkie/${Math.min(totalPages, currentPage + 1)}`}
                aria-disabled={currentPage === totalPages}
                className={`${currentPage === totalPages ? "hidden" : ""}`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </section>
  );
};

export default News;
