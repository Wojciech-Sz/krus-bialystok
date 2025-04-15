import React from "react";

import { Skeleton } from "@/components/ui/skeleton";

const NewsPage = async () => {
  return (
    <main className="section-container section-pt-small section-pb">
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10" />
        <Skeleton className="w-full h-[300px] md:h-[400px] rounded-lg" />
        <Skeleton className="h-[300px] md:h-[400px]" />
      </div>
    </main>
  );
};

export default NewsPage;
