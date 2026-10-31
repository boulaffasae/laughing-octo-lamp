import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { cache } from "react";
import { locales, type Locale } from "../../i18n/locales.ts";
import { localizeNewsRoute } from "../news-routing.ts";
import { createArticleSlug } from "./text.ts";

export const ARTICLES_PER_PAGE = 20;

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
function readArticle(locale: Locale, fileName: string): Article {
  const filePath = path.join(process.cwd(), "content/actus", locale, fileName);
  const source = fs.readFileSync(filePath, "utf8");
  if (!/^---\n[\s\S]*?\n---\n/.test(source))
    throw new Error(`Invalid article: ${fileName}`);
  const { data: metadata, content } = matter(source);
  for (const field of ["title", "description", "category", "author", "date"]) {
    if (typeof metadata[field] !== "string" || !metadata[field].trim())
      throw new Error(`Missing ${field}: ${fileName}`);
  }
  return {
    title: metadata.title,
    description: metadata.description,
    category: metadata.category,
    author: metadata.author,
    date: metadata.date,
    id: fileName.replace(/\.md$/, ""),
    slug: createArticleSlug(metadata.title),
    body: content,
    locale,
  };
}

export const getArticles = cache((locale: Locale): Article[] => {
  const folder = path.join(process.cwd(), "content/actus", locale);
  return fs
    .readdirSync(folder)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => readArticle(locale, fileName))
    .sort(
      (first, second) =>
        second.date.localeCompare(first.date) ||
        first.slug.localeCompare(second.slug),
    );
});

export function getArticleLanguageRoutes(id: string) {
  return Object.fromEntries(
    locales.flatMap((locale) => {
      const article = getArticles(locale).find((article) => article.id === id);
      return article
        ? [[locale, localizeNewsRoute(locale, `/actus/${article.slug}`)]]
        : [];
    }),
  ) as Partial<Record<Locale, string>>;
}
