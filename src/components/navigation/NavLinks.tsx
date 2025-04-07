import { SignedIn, UserButton } from "@clerk/nextjs";
import { FilePlus } from "lucide-react";
import Link from "next/link";
import React from "react";

import { navLinks } from "@/constants";

const NavLinks = () => {
  return (
    <nav
      role="navigation"
      className="sm:flex justify-self-center hidden gap-2 "
    >
      <ul className="flex items-center gap-2">
        {navLinks.map((link) => (
          <li
            key={link.name}
            className={`nav-li ${
              link.name === "Kontakt" &&
              "rounded-md bg-primary text-background transition-all duration-300"
            }`}
          >
            <Link
              href={link.href}
              className="relative flex items-center gap-1 px-2 py-1"
              scroll
              title={link.name}
            >
              {link.icon}

              <p className="hidden lg:block">{link.name}</p>
            </Link>
          </li>
        ))}
      </ul>
      <SignedIn>
        <UserButton />
        <div className="nav-li rounded-md bg-primary text-background transition-all duration-300">
          <Link
            href="/studio"
            prefetch={false}
            className="relative flex items-center gap-1 px-2 py-1"
          >
            <FilePlus className="size-7 lg:size-5" />
            <p className="hidden lg:block">Studio</p>
          </Link>
        </div>
      </SignedIn>
    </nav>
  );
};

export default NavLinks;
