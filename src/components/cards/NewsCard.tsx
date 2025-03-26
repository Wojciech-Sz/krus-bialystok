import Image from "next/image";
import Link from "next/link";
import React from "react";

interface NewsCardProps {
  slug: string;
  mainImage: string;
  title: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ slug, mainImage, title }) => {
  return (
    <Link
      href={`/news/${slug}`}
      prefetch={false}
      className={`group relative size-full overflow-hidden rounded-md`}
    >
      <Image
        width={960}
        height={960}
        src={mainImage}
        alt={title}
        className="size-full object-cover transition duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-white/20 transition duration-300 group-hover:opacity-0" />
      <div className="absolute bottom-5 left-5 w-auto text-white sm:bottom-7 sm:left-7 group-hover:translate-x-2 transition duration-300">
        <h3 className="text-2xl lg:text-3xl">{title}</h3>
      </div>
    </Link>
  );
};

export default NewsCard;
