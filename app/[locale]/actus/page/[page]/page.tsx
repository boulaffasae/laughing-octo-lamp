import { newsUrl } from "@/lib/news-routing";
import { notFound, permanentRedirect } from "next/navigation";
import { newsCopy } from "@/lib/news/copy";
import { getArticles, ARTICLES_PER_PAGE } from "@/lib/news/articles";
import { isLocale, locales } from "@/i18n/locales";
import { createPageMetadata } from "@/lib/news/metadata";
import { NewsListing } from "@/app/components/news/listing";
type Props = { params: Promise<{ locale: string; page: string }> };
export function generateStaticParams() {
  return locales.flatMap((locale) =>
    Array.from(
      {
        length: Math.max(
          1,
          Math.ceil(getArticles(locale).length / ARTICLES_PER_PAGE),
        ),
      },
      (_, i) => ({ locale, page: String(i + 1) }),
    ),
  );
}
export async function generateMetadata({ params }: Props) {
  const { locale, page } = await params;
  if (
    !isLocale(locale) ||
    !/^[1-9]\d*$/.test(page) ||
    Number(page) >
      Math.max(1, Math.ceil(getArticles(locale).length / ARTICLES_PER_PAGE))
  )
    notFound();
  if (page === "1")
    return createPageMetadata(
      locale,
      "/actus",
      newsCopy[locale].seoTitle,
      newsCopy[locale].intro,
    );
  return createPageMetadata(
    locale,
    `/actus/page/${page}`,
    `${newsCopy[locale].seoTitle} — ${newsCopy[locale].page} ${page}`,
    newsCopy[locale].intro,
  );
}
export default async function Page({ params }: Props) {
  const { locale, page } = await params;
  if (!isLocale(locale) || !/^[1-9]\d*$/.test(page)) notFound();
  if (page === "1") permanentRedirect(newsUrl(locale));
  return <NewsListing locale={locale} page={Number(page)} />;
}
