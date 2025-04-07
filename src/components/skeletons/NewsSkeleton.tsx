import React from "react";

import { Skeleton } from "../ui/skeleton";

const NewsSkeleton = () => {
  return (
    <section id="news" className="section section-pt-big">
      <div className="section-container">
        <h2 className="section-title">Aktualności</h2>
        <div className="news-grid h-[150svh] sm:h-[75svh]">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSkeleton;
