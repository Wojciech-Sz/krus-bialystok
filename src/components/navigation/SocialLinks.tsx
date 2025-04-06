import React from "react";

import { socialLinks } from "@/constants";

const SocialLinks = () => {
  return (
    <ul className={"flex items-center justify-self-end justify-center gap-1"}>
      {socialLinks.map((link) => (
        <li key={link.id} className="nav-li px-1 py-1">
          <a
            href={link.href}
            rel="noreferrer noopener"
            target="_blank"
            title={link.title}
            className="relative flex gap-1 items-center"
          >
            {link.icon}
            <span className="hidden xl:block">{link.title}</span>
          </a>
        </li>
      ))}
    </ul>
  );
};

export default SocialLinks;
