import { localizeNewsRoute } from "./news-routing";
import fs from "node:fs";
import { siteUrl } from "./site-url";
export { siteUrl } from "./site-url";
import matter from "gray-matter";
import path from "node:path";
import { cache } from "react";
import type { Metadata } from "next";
export const locales = ["fr", "en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const pageSize = 20;
export const copy = {
  fr: {
    title: "Le journal de la location",
    seoTitle: "Actualités et conseils de location de voiture au Maroc",
    nav: "Conseils location",
    intro:
      "Les bons réflexes, avant de prendre la route. Guides et conseils pour louer une voiture au Maroc en confiance.",
    read: "Lire le guide",
    back: "Tous les articles",
    by: "Par",
    related: "À lire aussi",
    contents: "Dans ce guide",
    page: "Page",
    home: "Accueil",
    cta: "Créer un contrat",
    note: "Des conseils pour mieux préparer votre location au Maroc.",
  },
  en: {
    title: "The rental journal",
    seoTitle: "Morocco car rental news and practical guides",
    nav: "Car rental guides",
    intro:
      "Good habits before you hit the road. Practical guides for renting a car in Morocco with confidence.",
    read: "Read the guide",
    back: "All articles",
    by: "By",
    related: "Read next",
    contents: "In this guide",
    page: "Page",
    home: "Home",
    cta: "Create a contract",
    note: "Practical advice for your car rental in Morocco.",
  },
  ar: {
    title: "دليل كراء السيارات",
    seoTitle: "مقالات ونصائح كراء السيارات في المغرب",
    nav: "دليل كراء السيارات",
    intro:
      "خطوات واضحة قبل الانطلاق. أدلة ونصائح لكراء سيارة في المغرب بثقة وراحة بال.",
    read: "اقرأ الدليل",
    back: "جميع المقالات",
    by: "بقلم",
    related: "اقرأ أيضاً",
    contents: "في هذا الدليل",
    page: "صفحة",
    home: "الرئيسية",
    cta: "إنشاء عقد",
    note: "نصائح عملية للاستعداد لكراء سيارة في المغرب.",
  },
};
export type Article = {
  slug: string;
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  date: string;
  body: string;
  locale: Locale;
};
export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
export const getArticles = cache((locale: Locale): Article[] => {
  const folder = path.join(process.cwd(), "content/actus", locale);
  return fs
    .readdirSync(folder)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(folder, file), "utf8");
      const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!match) throw new Error(`Invalid article: ${file}`);
      const meta = matter(raw).data;
      for (const key of ["title", "description", "category", "author", "date"])
        if (typeof meta[key] !== "string" || !meta[key].trim())
          throw new Error(`Missing ${key}: ${file}`);
      return {
        title: meta.title,
        description: meta.description,
        category: meta.category,
        author: meta.author,
        date: meta.date,
        id: file.replace(/\.md$/, ""),
        slug: articleSlug(meta.title),
        body: match[2],
        locale,
      };
    })
    .sort(
      (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug),
    );
});
export function articleDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : locale, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(date));
}
export function absolute(url: string) {
  return siteUrl ? new URL(url, siteUrl).toString() : undefined;
}
export function seo(
  locale: Locale,
  route: string,
  title: string,
  description: string,
  languageRoutes?: Partial<Record<Locale, string>>,
): Metadata {
  const url = absolute(`/${locale}${localizeNewsRoute(locale, route)}`);
  return {
    title: `${title} | Louma`,
    description,
    alternates: {
      canonical: url,
      languages: siteUrl
        ? Object.fromEntries(
            locales
              .filter((l) => !languageRoutes || languageRoutes[l])
              .map((l) => [
                l,
                absolute(
                  `/${l}${languageRoutes?.[l] ?? localizeNewsRoute(l, route)}`,
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
export function headingId(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

export function articleSlug(title: string) {
  return headingId(title.normalize("NFKD").replace(/\p{M}/gu, ""));
}
export function articleRoutes(id: string) {
  return Object.fromEntries(
    locales.flatMap((locale) => {
      const article = getArticles(locale).find((a) => a.id === id);
      return article
        ? [[locale, localizeNewsRoute(locale, `/actus/${article.slug}`)]]
        : [];
    }),
  ) as Partial<Record<Locale, string>>;
}
