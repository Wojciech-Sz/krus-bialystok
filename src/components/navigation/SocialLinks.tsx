import React from "react";

import { socialLinks } from "@/constants";

const SocialLinks = () => {
  return (
    <ul className={"flex items-center justify-center gap-3"}>
      {socialLinks.map((link) => (
        <li key={link.id} className={"hover:text-primary"}>
          <a
            href={link.href}
            rel="noreferrer noopener"
            target="_blank"
            title={link.title}
          >
            {link.icon}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default SocialLinks;
