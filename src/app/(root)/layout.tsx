import React from "react";

import Header from "@/components/navigation/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center">{children}</main>
    </section>
  );
}
