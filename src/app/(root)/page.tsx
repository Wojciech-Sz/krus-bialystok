import Hero from "@/components/sections/Hero";
import News from "@/components/sections/News";
import Team from "@/components/sections/Team";

// Define the cache configuration
export const revalidate = 3600; // Revalidate at most every hour

export default async function Home() {
  return (
    <>
      <Hero />

      <News />

      <Team />
    </>
  );
}
