import { newsUrl } from "@/lib/news-routing";
import { notFound, permanentRedirect } from "next/navigation";
import {
  copy,
  getArticles,
  isLocale,
  locales,
  pageSize,
  seo,
} from "@/lib/actus";
import { NewsListing } from "@/app/components/actus/listing";
type Props = { params: Promise<{ locale: string; page: string }> };
export function generateStaticParams() {
  return locales.flatMap((locale) =>
    Array.from(
      {
        length: Math.max(1, Math.ceil(getArticles(locale).length / pageSize)),
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
    Number(page) > Math.max(1, Math.ceil(getArticles(locale).length / pageSize))
  )
    notFound();
  if (page === "1")
    return seo(locale, "/actus", copy[locale].seoTitle, copy[locale].intro);
  return seo(
    locale,
    `/actus/page/${page}`,
    `${copy[locale].seoTitle} — ${copy[locale].page} ${page}`,
    copy[locale].intro,
  );
}
export default async function Page({ params }: Props) {
  const { locale, page } = await params;
  if (!isLocale(locale) || !/^[1-9]\d*$/.test(page)) notFound();
  if (page === "1") permanentRedirect(newsUrl(locale));
  return <NewsListing locale={locale} page={Number(page)} />;
}
