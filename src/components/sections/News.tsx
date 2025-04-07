import React from "react";

import { getNewsListing, getNewsCount } from "@/lib/actions/news.action";

import NewsCard from "../cards/NewsCard";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";

const News = async ({ page = "1" }: { page: string }) => {
  const currentPage = Number(page) < 1 ? 1 : Number(page);
  const news = await getNewsListing(currentPage);
  const newsCount = await getNewsCount();
  const totalPages = Math.ceil(newsCount[0].count / 6);
  return (
    newsCount[0].count > 0 && (
      <section id="news" className="section section-pt-big">
        <div className="section-container">
          <h2 className="section-title">Aktualności</h2>
          <div className="news-grid h-[150svh] sm:h-[75svh]">
            {news.map((newsItem) => (
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
                  href={`/?page=${Math.max(1, currentPage - 1)}`}
                  aria-disabled={currentPage === 1}
                  className={`${currentPage === 1 ? "hidden" : ""}`}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href={`/?page=${page}`}
                          isActive={page === currentPage}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                }
              )}
              <PaginationItem>
                <PaginationNext
                  href={`/?page=${Math.min(totalPages, currentPage + 1)}`}
                  aria-disabled={currentPage === totalPages}
                  className={`${currentPage === totalPages ? "hidden" : ""}`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </section>
    )
  );
};

export default News;
