import type { MetadataRoute } from "next";
import { absolute, getArticles, locales, pageSize, siteUrl } from "@/lib/actus";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteUrl) return [];
  return locales.flatMap((locale) => {
    const articles = getArticles(locale);
    const routes = [
      "",
      "/actus",
      ...Array.from(
        { length: Math.ceil(articles.length / pageSize) - 1 },
        (_, i) => `/actus/page/${i + 2}`,
      ),
      ...articles.map((a) => `/actus/${a.slug}`),
    ];
    return routes.map((route) => ({
      url: absolute(`/${locale}${route}`)!,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, absolute(`/${l}${route}`)!]),
        ),
      },
    }));
  });
}
