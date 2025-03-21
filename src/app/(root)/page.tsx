import Hero from "@/components/sections/Hero";
import News from "@/components/sections/News";
import Team from "@/components/sections/Team";

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { page } = await searchParams;
  return (
    <>
      <Hero />
      <News page={page as string} />
      <Team />
    </>
  );
}
