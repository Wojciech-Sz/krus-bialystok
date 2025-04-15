import React from "react";

import { Skeleton } from "../ui/skeleton";

const NewsSkeleton = () => {
  return (
    <div className="news-grid h-[150svh] sm:h-[75svh]">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton className="size-full" key={index} />
      ))}
    </div>
  );
};

export default NewsSkeleton;
