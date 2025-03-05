import Link from "next/link";
import React from "react";

import { navLinks } from "@/constants";

const NavLinks = () => {
  return (
    <nav role="navigation" className="flex gap-2">
      <ul className="flex items-center gap-2 text-lg font-semibold">
        {navLinks.map((link) => (
          <li
            key={link.name}
            className={`nav-li ${
              link.name === "Kontakt" &&
              "rounded-md bg-primary text-background transition-all duration-300 hover:text-accent-foreground"
            }`}
          >
            <Link
              href={link.href}
              className="relative block px-2"
              scroll
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavLinks;
