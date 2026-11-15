import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { Dashboard } from "@/app/components/louma/dashboard";
import { Footer, Header } from "@/app/components/louma/site";
import { isLocale, type Locale } from "@/i18n/locales";
import { ownerId } from "@/lib/document-storage";

export const metadata: Metadata = { robots: { index: false, follow: false } };

async function PrivateFiles({ locale }: { locale: Locale }) {
  if (!(await ownerId())) redirect(`/${locale}`);
  return (
    <>
      <Header locale={locale} path="/mes-fichiers" />
      <Dashboard locale={locale} />
      <Footer locale={locale} />
    </>
  );
}

export default async function Page({
  params,
}: PageProps<"/[locale]/mes-fichiers">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <Suspense fallback={null}>
      <PrivateFiles locale={locale} />
    </Suspense>
  );
}
