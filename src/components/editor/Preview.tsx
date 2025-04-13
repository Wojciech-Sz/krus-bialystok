/* eslint-disable @next/next/no-img-element */
import React from "react";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const MarkdownIt = require("markdown-it");

const Preview = ({
  title,
  mainImage,
  content,
}: {
  title: string;
  mainImage: string;
  content: string;
}) => {
  const md = new MarkdownIt();

  // Safely render markdown content
  const parsedContent = md.render(content);

  return (
    <div className="flex flex-1 items-center pt-4 flex-col px-2">
      <article className="flex items-center max-w-3xl flex-col gap-6">
        <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>

        {mainImage && (
          <div className="w-full h-[300px] md:h-[400px]">
            <img
              src={mainImage}
              alt={title}
              className="object-cover size-full rounded-lg"
            />
          </div>
        )}

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: parsedContent }}
        />
      </article>
    </div>
  );
};

export default Preview;
