"use client";

import { UserButton } from "@clerk/nextjs";
import { Home, PlusCircle, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useNewsRefresh } from "@/contexts/NewsRefreshContext";
import {
  deleteNews,
  getNewsCount,
  getNewsSidebar,
} from "@/lib/actions/news.action";
import { cn } from "@/lib/utils";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
  PaginationEllipsis,
} from "../ui/pagination";

export default function NewsSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { refreshTimestamp } = useNewsRefresh();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [news, setNews] = useState<SidebarNewsItem[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<SidebarNewsItem | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const limit = 6;
  const totalPages = Math.ceil(count / limit);

  // Effect for debouncing search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page on new search
    }, 500); // 500ms delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Effect for handling page changes, search query, and refresh trigger
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setNews([]);
        const newsData = await getNewsSidebar(
          currentPage,
          debouncedSearchQuery
        );
        const countData = await getNewsCount(debouncedSearchQuery);

        if (isMounted) {
          setNews(newsData);
          setCount(countData[0]?.count || 0);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        if (isMounted) {
          setNews([]);
          setCount(0);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [currentPage, debouncedSearchQuery, refreshTimestamp]);

  const handleDeleteNews = async () => {
    if (!newsToDelete) return;

    try {
      setIsDeleting(true);
      await deleteNews(newsToDelete.slug);

      // Update local state after successful deletion
      setNews((prevNews) =>
        prevNews.filter((item) => item.slug !== newsToDelete.slug)
      );
      setCount((prevCount) => prevCount - 1);

      if (pathname === `/studio/${newsToDelete.slug}`) {
        router.push("/studio");
      }
      toast.success("News deleted successfully");

      // Adjust current page if necessary
      if (news.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Error deleting news:", error);
      toast.error("Error deleting news");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setNewsToDelete(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex sticky h-screen inset-y-0 top-0 flex-col w-70">
      <div className="flex items-center gap-2 p-4">
        <Link href="/" className="mr-auto">
          <Button variant="ghost" size="icon">
            <Home className="h-5 w-5" />
          </Button>
        </Link>
        <Link href="/studio">
          <Button variant="ghost" size="icon">
            <PlusCircle className="h-5 w-5" />
          </Button>
        </Link>
        <UserButton />
      </div>
      <Separator />
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search news..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <Separator />
      <nav className="flex-1 overflow-auto p-2">
        <ul className="space-y-2">
          {news.map((item) => (
            <li key={item.slug}>
              <div className="flex items-center gap-2">
                <Link
                  title={item.title}
                  href={`/studio/${item.slug}`}
                  prefetch={false}
                  className={cn(
                    "line-clamp-1 overflow-hidden flex-1 rounded-lg p-1 hover:bg-accent",
                    pathname === `/studio/${item.slug}` &&
                      "bg-accent font-medium"
                  )}
                >
                  {item.title}
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:text-destructive cursor-pointer shrink-0"
                  onClick={() => {
                    setNewsToDelete(item);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
          {loading && (
            <li className="p-2 text-sm text-muted-foreground">Loading...</li>
          )}
          {!loading && news.length === 0 && (
            <li className="p-2 text-sm text-muted-foreground">No news found</li>
          )}
        </ul>
      </nav>
      {totalPages > 1 && (
        <div className="p-4">
          <Pagination>
            <PaginationContent className="flex flex-col items-center">
              <div className="flex items-center">
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
                            href="#"
                            prefetch={false}
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page);
                            }}
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
              </div>
              <div className="flex justify-between items-center">
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      prefetch={false}
                      spanClassName="sm:hidden"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage - 1);
                      }}
                    />
                  </PaginationItem>
                )}
                {currentPage < totalPages && (
                  <PaginationItem className="self-end">
                    <PaginationNext
                      href="#"
                      prefetch={false}
                      spanClassName="sm:hidden"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage + 1);
                      }}
                    />
                  </PaginationItem>
                )}
              </div>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete News</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{newsToDelete?.title}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteNews}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
