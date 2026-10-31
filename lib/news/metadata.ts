import { newsUrl } from "../news-routing.ts";
import { getArticleLanguageRoutes, type Article } from "./articles.ts";
import { newsCopy } from "./copy.ts";
import type { Metadata } from "next";
import { locales, type Locale } from "../../i18n/locales.ts";
import { siteUrl, absoluteUrl } from "../site-url.ts";
import { localizeNewsRoute } from "../news-routing.ts";

export function createPageMetadata(
  locale: Locale,
  route: string,
  title: string,
  description: string,
  languageRoutes?: Partial<Record<Locale, string>>,
): Metadata {
  const url = absoluteUrl(`/${locale}${localizeNewsRoute(locale, route)}`);
  return {
    title: `${title} | Louma`,
    description,
    alternates: {
      canonical: url,
      languages: siteUrl
        ? Object.fromEntries(
            locales
              .filter((language) => !languageRoutes || languageRoutes[language])
              .map((language) => [
                language,
                absoluteUrl(
                  `/${language}${languageRoutes?.[language] ?? localizeNewsRoute(language, route)}`,
                )!,
              ]),
          )
        : undefined,
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: { fr: "fr_MA", en: "en_GB", ar: "ar_MA" }[locale],
      url,
      siteName: "Louma",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export function createArticleMetadata(article: Article): Metadata {
  const metadata = createPageMetadata(
    article.locale,
    `/actus/${article.slug}`,
    article.title,
    article.description,
    getArticleLanguageRoutes(article.id),
  );
  return {
    ...metadata,
    authors: [{ name: article.author }],
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: article.date,
      authors: [article.author],
    },
  };
}

export function createArticleStructuredData(article: Article) {
  const { locale } = article;
  const copy = newsCopy[locale];
  return [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.title,
      description: article.description,
      datePublished: article.date,
      author: { "@type": "Organization", name: article.author },
      publisher: { "@type": "Organization", name: "Louma" },
      inLanguage: locale,
      mainEntityOfPage: absoluteUrl(newsUrl(locale, `/${article.slug}`)),
    },
    ...(absoluteUrl(newsUrl(locale))
      ? [
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: copy.home,
                item: absoluteUrl(`/${locale}`),
              },
              {
                "@type": "ListItem",
                position: 2,
                name: copy.nav,
                item: absoluteUrl(newsUrl(locale)),
              },
              {
                "@type": "ListItem",
                position: 3,
                name: article.title,
                item: absoluteUrl(newsUrl(locale, `/${article.slug}`)),
              },
            ],
          },
        ]
      : []),
  ];
}
