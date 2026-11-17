import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ownerId } from "@/lib/document-storage";
import type { Locale } from "@/i18n/locales";
import { Footer, Header } from "./site";
import { ContractLibrary } from "./contract-library";
import { DocumentLibrary } from "./document-library";
import { LibraryPageSkeleton } from "./library-skeleton";

type LibraryProps = {
  locale: Locale;
  kind: "contracts" | "documents";
};

async function PrivateLibrary({ locale, kind }: LibraryProps) {
  if (!(await ownerId())) redirect("/");

  return kind === "contracts" ? (
    <ContractLibrary locale={locale} />
  ) : (
    <DocumentLibrary locale={locale} />
  );
}

export function PrivateLibraryPage({ locale, kind }: LibraryProps) {
  return (
    <>
      <Header locale={locale} />
      <Suspense fallback={<LibraryPageSkeleton locale={locale} kind={kind} />}>
        <PrivateLibrary locale={locale} kind={kind} />
      </Suspense>
      <Footer locale={locale} />
    </>
  );
}
