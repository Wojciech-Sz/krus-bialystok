import Image from "next/image";
import Link from "next/link";
import React from "react";

import getNewsListing, { getNewsCount } from "@/lib/actions/news.action";
import { cn } from "@/lib/utils";

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
  const currentPage = Number(page);
  const news = await getNewsListing(currentPage);
  const newsCount = await getNewsCount();
  const totalPages = Math.ceil((newsCount[0]?.count ?? 6) / 6);
  return (
    <section className="section">
      <div id="news" className="absolute -top-16" />
      <h2 className="section-title">Aktualności</h2>
      <div className="flex flex-col items-center gap-5">
        <div
          className={cn(
            "news-grid",
            news.length < 4 ? "h-[75vh] min-h-[400px] grid-rows-2" : ""
          )}
        >
          {news.map((news, i) => (
            <Link
              href={`/news/${news.slug}`}
              prefetch={false}
              key={news.slug}
              className={`group relative ${i === 0 ? "news-span-3" : i === 5 ? "news-span-3" : i === 4 ? "news-span-2 order-last" : "news-span-2"} size-full overflow-hidden rounded-md`}
            >
              <Image
                width={960}
                height={960}
                src={news.mainImage}
                alt={news.title}
                className={
                  "size-full object-cover transition duration-300 group-hover:scale-110"
                }
              />
              <div
                className={
                  "absolute inset-0 bg-white/30 transition duration-300 group-hover:opacity-0"
                }
              />
              <div
                className={
                  "absolute bottom-5 left-5 text-white sm:bottom-7 sm:left-7 group-hover:translate-x-2 transition duration-300"
                }
              >
                <h3 className={"text-2xl font-semibold lg:text-3xl"}>
                  {news.title}
                </h3>
                <div className="border-b-2 border-white w-0 group-hover:w-full transition-all duration-300" />
              </div>
            </Link>
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
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href={`/?page=${i + 1}`}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            {totalPages > 7 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
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
  );
};

export default News;
