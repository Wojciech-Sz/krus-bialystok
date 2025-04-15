type IconProps = {
  className?: string;
  strokeWidth?: string;
  width?: string;
  height?: string;
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
type Params = Promise<{ [key: string]: string | undefined }>;

type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  mainImage: string; // URL to the image in Vercel Blob
  content: string; // Markdown content
  publishedAt: Date;
  isPublished: boolean; // For draft/preview functionality
};

// Define the error types
type FormErrors = {
  title?: string[];
  slug?: string[];
  mainImage?: string[];
  content?: string[];
  _form?: string[];
};

interface NewsItem {
  title: string;
  slug: string;
  mainImage: string;
}

interface SidebarNewsItem {
  title: string;
  slug: string;
}

type PageParams = Promise<{ page: string }>;
