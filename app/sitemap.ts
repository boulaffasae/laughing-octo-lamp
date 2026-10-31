import { localizeNewsRoute } from "@/lib/news-routing";
import type { MetadataRoute } from "next";
import { absoluteUrl, siteUrl } from "@/lib/site-url";
import {
  getArticleLanguageRoutes,
  getArticles,
  ARTICLES_PER_PAGE,
} from "@/lib/news/articles";
import { locales } from "@/i18n/locales";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteUrl) return [];
  return locales.flatMap((locale) => {
    const articles = getArticles(locale);
    const routes = [
      "",
      "/actus",
      ...Array.from(
        { length: Math.ceil(articles.length / ARTICLES_PER_PAGE) - 1 },
        (_, i) => `/actus/page/${i + 2}`,
      ),
      ...articles.map((article) => `/actus/${article.slug}`),
    ];
    return routes.map((route) => {
      const article = articles.find(
        (article) => route === `/actus/${article.slug}`,
      );
      const translations = article
        ? getArticleLanguageRoutes(article.id)
        : undefined;
      return {
        url: absoluteUrl(`/${locale}${localizeNewsRoute(locale, route)}`)!,
        alternates: {
          languages: Object.fromEntries(
            locales
              .filter((language) => !translations || translations[language])
              .map((language) => [
                language,
                absoluteUrl(
                  `/${language}${translations?.[language] ?? localizeNewsRoute(language, route)}`,
                )!,
              ]),
          ),
        },
      };
    });
  });
}
