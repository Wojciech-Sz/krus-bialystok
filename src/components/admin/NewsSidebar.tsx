"use client";

import { UserButton } from "@clerk/nextjs";
import { Home, PlusCircle, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { refreshTimestamp } = useNewsRefresh();
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

  const currentPage = Number(searchParams.get("page")) || 1;
  const limit = 6;

  const totalPages = Math.ceil(count / limit);

  // Effect for debouncing search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Effect for handling page changes and search query
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleDeleteClick = (item: SidebarNewsItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNewsToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!newsToDelete) return;

    try {
      setIsDeleting(true);
      const result = await deleteNews(newsToDelete.slug);

      if (result.success) {
        toast.success("News deleted", {
          description: `"${newsToDelete.title}" has been deleted successfully.`,
        });

        // Refresh the news list
        const newsData = await getNewsSidebar(
          currentPage,
          debouncedSearchQuery
        );
        const countData = await getNewsCount(debouncedSearchQuery);

        setNews(newsData);
        setCount(countData[0]?.count || 0);

        // If we're on the deleted news page, redirect to studio
        if (pathname === `/studio/${newsToDelete.slug}`) {
          router.push("/studio");
        }
      } else {
        toast.error("Error", {
          description: "Failed to delete news. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error deleting news:", error);
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setNewsToDelete(null);
    }
  };

  return (
    <>
      <div className="flex h-screen sticky top-0 pb-4 bg-sidebar max-w-70 w-full flex-col">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/">
                <Home className="h-4 w-4" />
              </Link>
              <UserButton />
              <h2 className="text-lg font-semibold">News</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/studio")}
              className="h-8 px-2"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              <span className="whitespace-nowrap">Add New</span>
            </Button>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search news..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <Separator />

        <div className="px-2 flex-1 mt-2 overflow-auto">
          {loading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Loading news...
            </div>
          ) : news.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {debouncedSearchQuery
                ? "No news found matching your search."
                : "No news posts yet."}
            </div>
          ) : (
            <div className="flex flex-col gap-2 overflow-auto">
              {news.map((item) => (
                <Link
                  href={`/studio/${item.slug}`}
                  className={cn(
                    "flex items-center p-2 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 rounded-md justify-between",
                    pathname === `/studio/${item.slug}` &&
                      "bg-accent text-accent-foreground"
                  )}
                  key={item.slug}
                >
                  <p className="text-wrap text-sm">{item.title}</p>

                  <button
                    onClick={(e) => handleDeleteClick(item, e)}
                    className="text-accent-foreground cursor-pointer hover:text-destructive"
                  >
                    <Trash2 className="size-5" />
                    <span className="sr-only">Delete</span>
                  </button>
                </Link>
              ))}
            </div>
          )}
        </div>

        <Pagination>
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious
                  size="icon"
                  href={`/studio?page=${currentPage - 1}`}
                  spanClassName="sm:hidden"
                />
              </PaginationItem>
            )}
            {currentPage >= 3 && (
              <PaginationItem>
                <PaginationEllipsis className="size-5" />
              </PaginationItem>
            )}
            {/* Calculate which page numbers to show */}
            {(() => {
              let pagesToShow = [];

              if (currentPage <= 2) {
                // For pages 1 and 2, show pages 1, 2, 3
                pagesToShow = [1, 2, 3].filter((page) => page <= totalPages);
              } else if (currentPage >= totalPages - 1) {
                // For last 2 pages, show last 3 pages
                pagesToShow = [
                  totalPages - 2,
                  totalPages - 1,
                  totalPages,
                ].filter((page) => page >= 1);
              } else {
                // For page 3+, show current-1, current, current+1
                pagesToShow = [
                  currentPage - 1,
                  currentPage,
                  currentPage + 1,
                ].filter((page) => page <= totalPages);
              }

              return pagesToShow.map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href={`/studio?page=${pageNum}`}
                    isActive={currentPage === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ));
            })()}
            {currentPage < totalPages - 1 && (
              <PaginationItem>
                <PaginationEllipsis className="size-5" />
              </PaginationItem>
            )}
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext
                  size="icon"
                  href={`/studio?page=${currentPage + 1}`}
                  spanClassName="sm:hidden"
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete News</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{newsToDelete?.title}
              &rdquo;? This action cannot be undone.
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
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
