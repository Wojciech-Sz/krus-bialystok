import { auth } from "@clerk/nextjs/server";

import NewsForm from "@/components/admin/NewsForm";

export default async function StudioPage() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) return redirectToSignIn();
  return <NewsForm />;
}
