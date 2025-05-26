import React from "react";

import Header from "@/components/navigation/Header";
import Footer from "@/components/sections/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 justify-center flex-col items-center">
        {children}
      </main>
      <Footer />
    </section>
  );
}
