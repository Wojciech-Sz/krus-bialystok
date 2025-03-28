"use client";

import { UserButton } from "@clerk/nextjs";
import { Home, PlusCircle, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useNewsRefresh } from "@/contexts/NewsRefreshContext";
import {
  deleteNews,
  getNewsCount,
  getNewsSidebar,
} from "@/lib/actions/news.action";

export default function NewsSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { refreshTimestamp } = useNewsRefresh();
  const [searchQuery, setSearchQuery] = useState("");
  const [news, setNews] = useState<SidebarNewsItem[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<SidebarNewsItem | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const page = Number(searchParams.get("page")) || 1;
  const limit = 6;

  // Fetch news when component mounts, when page/searchQuery changes, or when refreshTimestamp changes
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setLoading(true);
        const newsData = await getNewsSidebar(page, searchQuery);
        const countData = await getNewsCount(searchQuery);

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
  }, [page, searchQuery, refreshTimestamp]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    router.push("/studio");
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
        const newsData = await getNewsSidebar(page, searchQuery);
        const countData = await getNewsCount(searchQuery);

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

  const totalPages = Math.ceil(count / limit);

  return (
    <>
      <Sidebar variant="inset" collapsible="none">
        <SidebarHeader className="p-4">
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
        </SidebarHeader>

        <Separator />

        <SidebarContent className="px-2 mt-2">
          {loading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Loading news...
            </div>
          ) : news.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {searchQuery
                ? "No news found matching your search."
                : "No news posts yet."}
            </div>
          ) : (
            <SidebarMenu>
              {news.map((item) => (
                <SidebarMenuItem key={item.slug}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/studio/${item.slug}`}
                  >
                    <Link className="h-full" href={`/studio/${item.slug}`}>
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    onClick={(e) => handleDeleteClick(item, e)}
                    className="text-destructive group-hover:text-destructive/80 size-8 top-1/2! p-2 -translate-y-1/2"
                  >
                    <Trash2 />
                    <span className="sr-only">Delete</span>
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}
        </SidebarContent>

        {totalPages > 1 && (
          <SidebarFooter className="p-4">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => {
                  router.push(`/studio?page=${page - 1}`);
                }}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => {
                  router.push(`/studio?page=${page + 1}`);
                }}
              >
                Next
              </Button>
            </div>
          </SidebarFooter>
        )}
      </Sidebar>

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
