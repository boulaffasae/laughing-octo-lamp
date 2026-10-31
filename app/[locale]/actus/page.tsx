import { notFound } from "next/navigation";
import { newsCopy } from "@/lib/news/copy";
import { isLocale } from "@/i18n/locales";
import { createPageMetadata } from "@/lib/news/metadata";
import { NewsListing } from "@/app/components/news/listing";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return createPageMetadata(
    locale,
    "/actus",
    newsCopy[locale].seoTitle,
    newsCopy[locale].intro,
  );
}
export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <NewsListing locale={locale} />;
}
