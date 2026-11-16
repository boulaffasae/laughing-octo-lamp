import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PrivateLibraryPage } from "@/app/components/louma/private-library-page";
import { LibraryPageSkeleton } from "@/app/components/louma/library-skeleton";
import { isLocale } from "@/i18n/locales";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function Page({
  params,
}: PageProps<"/[locale]/documents">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <Suspense
      fallback={<LibraryPageSkeleton locale={locale} kind="documents" />}
    >
      <PrivateLibraryPage locale={locale} kind="documents" />
    </Suspense>
  );
}
