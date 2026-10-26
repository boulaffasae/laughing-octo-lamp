import { localizeNewsRoute } from "@/lib/news-routing";
import type { MetadataRoute } from "next";
import {
  absolute,
  articleRoutes,
  getArticles,
  locales,
  pageSize,
  siteUrl,
} from "@/lib/actus";
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
    return routes.map((route) => {
      const article = articles.find((a) => route === `/actus/${a.slug}`);
      const translations = article ? articleRoutes(article.id) : undefined;
      return {
        url: absolute(`/${locale}${localizeNewsRoute(locale, route)}`)!,
        alternates: {
          languages: Object.fromEntries(
            locales
              .filter((l) => !translations || translations[l])
              .map((l) => [
                l,
                absolute(
                  `/${l}${translations?.[l] ?? localizeNewsRoute(l, route)}`,
                )!,
              ]),
          ),
        },
      };
    });
  });
}
