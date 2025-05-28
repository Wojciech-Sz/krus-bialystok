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
    <NewsRefreshProvider>
      <SidebarProvider>
        <div className="flex flex-1">
          <NewsSidebar />

          <main className="flex-1 h-screen grid grid-rows-[auto_1fr] ">
            {children}
          </main>

          <Toaster />
        </div>
      </SidebarProvider>
    </NewsRefreshProvider>
  );
}
