"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface NewsRefreshContextType {
  refreshTimestamp: number;
  triggerRefresh: () => void;
}

const NewsRefreshContext = createContext<NewsRefreshContextType | undefined>(
  undefined
);

export const NewsRefreshProvider = ({ children }: { children: ReactNode }) => {
  const [refreshTimestamp, setRefreshTimestamp] = useState<number>(Date.now());

  const triggerRefresh = () => {
    setRefreshTimestamp(Date.now());
  };

  return (
    <NewsRefreshContext.Provider value={{ refreshTimestamp, triggerRefresh }}>
      {children}
    </NewsRefreshContext.Provider>
  );
};

export const useNewsRefresh = () => {
  const context = useContext(NewsRefreshContext);
  if (context === undefined) {
    throw new Error("useNewsRefresh must be used within a NewsRefreshProvider");
  }
  return context;
};
