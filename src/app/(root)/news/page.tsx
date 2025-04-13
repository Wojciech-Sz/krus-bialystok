import React from "react";

import NewsCard from "@/components/cards/NewsCard";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getNewsListing, getNewsCount } from "@/lib/actions/news.action";

const News = async ({ searchParams }: { searchParams: SearchParams }) => {
  const { page } = await searchParams;
  const currentPage = Number(page) < 1 || !page ? 1 : Number(page);
  const news = await getNewsListing(currentPage);
  const newsCount = await getNewsCount();
  const totalPages = Math.ceil(newsCount[0].count / 6);
  return (
    <section className="section section-pt-small section-pb relative">
      <div id="hero" className="absolute -top-16" />
      <div className="section-container items-center">
        <h1 className="section-title">Wszystkie aktualności</h1>
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
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={`/news?page=${Math.max(1, currentPage - 1)}`}
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
                      href={`/news?page=${page}`}
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
                href={`/news?page=${Math.min(totalPages, currentPage + 1)}`}
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
