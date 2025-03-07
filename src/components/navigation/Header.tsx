import Link from "next/link";
import React from "react";

import NavLinks from "./NavLinks";
import SocialLinks from "./SocialLinks";

const Header = () => {
  return (
    <header className="section-px sticky inset-x-0 top-0 z-50 flex h-16 items-center justify-between bg-background/90 py-2 shadow-md">
      <Link href={"#hero"} scroll>
        <h1 className="text-4xl font-bold">Logo</h1>
      </Link>
      <NavLinks />
      <SocialLinks />
    </header>
  );
};

export default Header;
