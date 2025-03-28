import React from "react";

import NewsSidebar from "@/components/admin/NewsSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { NewsRefreshProvider } from "@/contexts/NewsRefreshContext";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <NewsRefreshProvider>
        <div className="flex flex-1">
          <NewsSidebar />
          <div className="flex-1 mx-4 mt-4">{children}</div>
          <Toaster />
        </div>
      </NewsRefreshProvider>
    </SidebarProvider>
  );
}
