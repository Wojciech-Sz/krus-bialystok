import Image from "next/image";
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
    <div className="flex-1 flex pt-4 flex-col max-w-3xl mx-auto px-2">
      <article className="flex flex-col gap-6">
        <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>

        {mainImage && (
          <div className="relative w-full h-[300px] md:h-[400px]">
            <Image
              src={mainImage}
              alt={title}
              fill
              className="object-cover rounded-lg"
              priority
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
