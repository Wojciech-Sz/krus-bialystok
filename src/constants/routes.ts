export const ROUTES = {
  HOME: "/",
  NEWS: (slug: string) => `/news/post/${slug}`,
  NEWS_LIST: "/news/wszystkie",
  NEWS_ALL: (page: number) => `/news/wszystkie?page=${page}`,
};
