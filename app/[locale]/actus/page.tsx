import { notFound } from "next/navigation";
import { copy, isLocale, seo } from "@/lib/actus";
import { NewsListing } from "@/app/components/actus/listing";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return seo(locale, "/actus", copy[locale].seoTitle, copy[locale].intro);
}
export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <NewsListing locale={locale} />;
}
