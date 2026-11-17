import { redirect } from "next/navigation";
import { ownerId } from "@/lib/document-storage";
import type { Locale } from "@/i18n/locales";
import { Footer, Header } from "./site";
import { ContractLibrary } from "./contract-library";
import { DocumentLibrary } from "./document-library";

export async function PrivateLibraryPage({
  locale,
  kind,
}: {
  locale: Locale;
  kind: "contracts" | "documents";
}) {
  if (!(await ownerId())) redirect("/");
  return (
    <>
      <Header locale={locale} />
      {kind === "contracts" ? (
        <ContractLibrary locale={locale} />
      ) : (
        <DocumentLibrary locale={locale} />
      )}
      <Footer locale={locale} />
    </>
  );
}
