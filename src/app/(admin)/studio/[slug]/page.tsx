import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import NewsForm from "@/components/admin/NewsForm";
import { getNewsBySlug } from "@/lib/actions/news.action";

export default async function StudioEditPage({ params }: { params: Params }) {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) return redirectToSignIn();

  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const newsItem = await getNewsBySlug(slug);

  if (!newsItem) {
    notFound();
  }

  return <NewsForm initialData={newsItem} />;
}
