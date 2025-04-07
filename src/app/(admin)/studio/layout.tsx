import React from "react";

import NewsSidebar from "@/components/admin/NewsSidebar";
import { Toaster } from "@/components/ui/sonner";
import { NewsRefreshProvider } from "@/contexts/NewsRefreshContext";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NewsRefreshProvider>
      <div className="flex gap-4 flex-col md:flex-row flex-1">
        <NewsSidebar />
        <div className="flex-1 px-5">{children}</div>
        <Toaster />
      </div>
    </NewsRefreshProvider>
  );
}
