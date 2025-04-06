"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

import MobileLinks from "./MobileLinks";
import NavLinks from "./NavLinks";
import SocialLinks from "./SocialLinks";
import MenuIcon from "../icons/MenuIcon";

gsap.registerPlugin(useGSAP);

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const topLine = useRef(null);
  const middleLine = useRef(null);
  const bottomLine = useRef(null);

  const { contextSafe } = useGSAP();

  const toggleMenu = contextSafe(() => {
    setIsOpen(!isOpen);

    if (!isOpen) {
      // Animate to X
      gsap.to(topLine.current, {
        attr: { y1: 4, y2: 20, x1: 1.2, x2: 22.8 },
        duration: 0.3,
        ease: "power1.inOut",
      });
      gsap.to(middleLine.current, {
        attr: { opacity: 0 },
        duration: 0.3,
        ease: "power1.inOut",
      });
      gsap.to(bottomLine.current, {
        attr: { y1: 20, y2: 4, x1: 1.2, x2: 22.8 },
        duration: 0.3,
        ease: "power1.inOut",
      });
    } else {
      // Animate to hamburger
      gsap.to(topLine.current, {
        attr: { y1: 4, y2: 4, x1: 1.2, x2: 22.8 },
        duration: 0.3,
        ease: "power1.inOut",
      });
      gsap.to(middleLine.current, {
        attr: {
          y1: 12,
          y2: 12,
          x1: 1.2,
          x2: 22.8,
          opacity: 1,
        },
        duration: 0.3,
        ease: "power1.inOut",
      });
      gsap.to(bottomLine.current, {
        attr: { y1: 20, y2: 20, x1: 1.2, x2: 22.8 },
        duration: 0.3,
        ease: "power1.inOut",
      });
    }
  });

  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        toggleMenu();
      }
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen, toggleMenu]);
  return (
    <header
      className={`section-px sticky top-0 z-50 h-16 w-full bg-background/90 ${!isOpen && "shadow-md"}`}
    >
      <div className="flex relative items-center justify-between h-full">
        <button
          title="Menu"
          aria-label="Włacz menu"
          className="cursor-pointer p-0 sm:hidden block"
          onMouseDown={toggleMenu}
        >
          <MenuIcon
            topLine={topLine}
            middleLine={middleLine}
            bottomLine={bottomLine}
            className="size-7 text-foreground"
          />
        </button>
        <Link href={"#hero"} scroll>
          <h1 className="sm:text-4xl text-3xl w-max max-sm:absolute max-sm:top-1/2 max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:-translate-y-1/2 text-primary font-space-grotesk font-bold">
            Krus Białystok
          </h1>
        </Link>
        <NavLinks />
        <SocialLinks />
      </div>
      <nav
        role="navigation"
        className={`navbar-links_container ${isOpen ? "max-h-[70vh]" : "max-h-0"}`}
      >
        <MobileLinks closeMenu={toggleMenu} />
      </nav>
      <div
        className={`fixed ${isOpen ? "inset-x-0 bottom-0 top-16" : "hidden"} z-[-1]`}
        onClick={toggleMenu}
      />
    </header>
  );
};

export default Header;
