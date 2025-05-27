"use client";

import { UserButton } from "@clerk/nextjs";
import {
  Home,
  PlusCircle,
  Search,
  Trash2,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef, useMemo } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNewsRefresh } from "@/contexts/NewsRefreshContext";
import {
  deleteNews,
  getNewsCount,
  getNewsSidebar,
} from "@/lib/actions/news.action";

interface SidebarNewsItem {
  title: string;
  slug: string;
}

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

  const limit = 10;
  const totalPages = Math.ceil(count / limit);

  // Debounce search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Load data
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const [newsData, countData] = await Promise.all([
          getNewsSidebar(currentPage, debouncedSearchQuery),
          getNewsCount(debouncedSearchQuery),
        ]);

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

      setNews((prevNews) =>
        prevNews.filter((item) => item.slug !== newsToDelete.slug)
      );
      setCount((prevCount) => prevCount - 1);

      if (pathname === `/studio/${newsToDelete.slug}`) {
        router.push("/studio");
      }

      toast.success("Article deleted successfully");

      if (news.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Error deleting news:", error);
      toast.error("Failed to delete article");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setNewsToDelete(null);
    }
  };

  const navigationItems = useMemo(
    () => [
      {
        title: "Główna",
        url: "/",
        icon: Home,
      },
      {
        title: "Nowy artykuł",
        url: "/studio",
        icon: PlusCircle,
      },
    ],
    []
  );

  return (
    <>
      <Sidebar className="border-r">
        <SidebarHeader className="border-b">
          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              <span className="font-semibold">Studio</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Nawigacja</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between">
              <span>Artykuły</span>
              <Badge variant="secondary" className="text-xs">
                {count}
              </Badge>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2 pb-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Wyszukaj artykuły..."
                    className="pl-8 h-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <SidebarMenu>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <SidebarMenuItem key={i}>
                      <div className="flex items-center gap-2 p-2">
                        <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                        <div className="h-4 flex-1 bg-muted animate-pulse rounded" />
                      </div>
                    </SidebarMenuItem>
                  ))
                ) : news.length === 0 ? (
                  <SidebarMenuItem>
                    <div className="p-2 text-sm text-muted-foreground">
                      {searchQuery
                        ? "Nie znaleziono artykułów"
                        : "Brak artykułów"}
                    </div>
                  </SidebarMenuItem>
                ) : (
                  news.map((item) => (
                    <SidebarMenuItem key={item.slug}>
                      <div className="flex items-center gap-1 w-full">
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === `/studio/${item.slug}`}
                          className="flex-1"
                        >
                          <Link
                            href={`/studio/${item.slug}`}
                            title={item.title}
                          >
                            <FileText className="h-4 w-4" />
                            <span className="truncate">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-destructive shrink-0"
                          onClick={() => {
                            setNewsToDelete(item);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 pt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {currentPage} z {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 p-2">
                <UserButton />
                <span className="text-sm text-muted-foreground">Admin</span>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Article</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{newsToDelete?.title}&quot;
              ? This action cannot be undone.
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
    </>
  );
}
