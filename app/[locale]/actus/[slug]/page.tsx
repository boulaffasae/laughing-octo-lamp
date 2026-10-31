import { notFound, permanentRedirect } from "next/navigation";
import { newsUrl } from "@/lib/news-routing";
import { getArticles } from "@/lib/news/articles";
import { isLocale, locales } from "@/i18n/locales";
import { createArticleMetadata } from "@/lib/news/metadata";
import { ArticlePage } from "@/app/components/news/article-page";

type Props = { params: Promise<{ locale: string; slug: string }> };
export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getArticles(locale).map((article) => ({ locale, slug: article.slug })),
  );
}
async function resolveArticle(params: Props["params"]) {
  const { locale, slug: rawSlug } = await params;
  let slug: string;
  try {
    slug = decodeURIComponent(rawSlug);
  } catch {
    notFound();
  }
  if (!isLocale(locale)) notFound();
  const article = getArticles(locale).find((article) => article.slug === slug);
  if (!article) {
    const legacy = getArticles(locale).find((article) => article.id === slug);
    if (legacy) permanentRedirect(newsUrl(locale, `/${legacy.slug}`));
    notFound();
  }
  return { locale, article };
}
export async function generateMetadata({ params }: Props) {
  const { article } = await resolveArticle(params);
  return createArticleMetadata(article);
}

export default async function Page({ params }: Props) {
  const { article } = await resolveArticle(params);
  return <ArticlePage article={article} />;
}
