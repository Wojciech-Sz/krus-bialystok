import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";

import { navLinks } from "@/constants";

const NavLinks = () => {
  return (
    <nav role="navigation" className="flex gap-2 text-lg font-semibold">
      <ul className="flex items-center gap-2">
        {navLinks.map((link) => (
          <li
            key={link.name}
            className={`nav-li ${
              link.name === "Kontakt" &&
              "rounded-md bg-primary text-background transition-all duration-300"
            }`}
          >
            <Link href={link.href} className="relative block px-2" scroll>
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
      <SignedIn>
        <UserButton />
        <div className="nav-li rounded-md bg-primary text-background transition-all duration-300">
          <Link href="/studio" prefetch={false} className="relative block px-2">
            Studio
          </Link>
        </div>
      </SignedIn>
    </nav>
  );
};

export default NavLinks;
