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
        length: Math.max(
          0,
          Math.ceil(getArticles(locale).length / pageSize) - 1,
        ),
      },
      (_, i) => ({ locale, page: String(i + 2) }),
    ),
  );
}
export async function generateMetadata({ params }: Props) {
  const { locale, page } = await params;
  if (!isLocale(locale)) notFound();
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
  if (page === "1") permanentRedirect(`/${locale}/actus`);
  return <NewsListing locale={locale} page={Number(page)} />;
}
