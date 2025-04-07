import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";

import { navLinks } from "@/constants";

const MobileLinks = ({ closeMenu }: { closeMenu: () => void }) => {
  return (
    <>
      <ul className="flex items-start w-full py-2 flex-col gap-2">
        {navLinks.map((link) => (
          <li
            onClick={closeMenu}
            key={link.name}
            className={`w-full hover:bg-accent py-2 px-1 transition-all duration-300 font-semibold rounded-md
            }`}
          >
            <Link href={link.href} className="relative block" scroll>
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
      <SignedIn>
        <div className="flex px-1 gap-2 py-2">
          <UserButton />
          <div className="nav-li rounded-md transition-all duration-300">
            <Link
              href="/studio"
              prefetch={false}
              className="relative block px-2"
            >
              Studio
            </Link>
          </div>
        </div>
      </SignedIn>
    </>
  );
};

export default MobileLinks;
