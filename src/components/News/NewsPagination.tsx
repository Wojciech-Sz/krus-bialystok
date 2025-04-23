import React from "react";

import { ROUTES } from "@/constants/routes";
import { getNewsCount } from "@/lib/actions/news.action";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
} from "../ui/pagination";

const NewsPagination = async ({ currentPage }: { currentPage: number }) => {
  const newsCount = await getNewsCount();
  const totalPages = Math.ceil(newsCount[0].count / 6);
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={ROUTES.NEWS_ALL(Math.max(1, currentPage - 1))}
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
                  href={ROUTES.NEWS_ALL(page)}
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
            href={ROUTES.NEWS_ALL(Math.min(totalPages, currentPage + 1))}
            aria-disabled={currentPage === totalPages}
            className={`${currentPage === totalPages ? "hidden" : ""}`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default NewsPagination;
