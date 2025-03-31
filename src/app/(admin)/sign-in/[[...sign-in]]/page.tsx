import { SignIn } from "@clerk/nextjs";
import { Home } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="flex h-screen gap-4 flex-col items-center justify-center">
      <SignIn />
      <Link href="/">
        <Button variant="default">
          Strona główna
          <Home className="h-5 w-5" />
        </Button>
      </Link>
    </div>
  );
}
