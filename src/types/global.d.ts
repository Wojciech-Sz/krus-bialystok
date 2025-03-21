type IconProps = {
  className?: string;
  strokeWidth?: string;
  width?: string;
  height?: string;
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  mainImage: string; // URL to the image in Vercel Blob
  content: string; // Markdown content
  publishedAt: Date;
  isPublished: boolean; // For draft/preview functionality
};
