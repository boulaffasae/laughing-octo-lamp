import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ContractEditor } from "@/app/components/louma/contract-editor";
import { Footer, Header } from "@/app/components/louma/site";
import { logStorageFailure, ownerId } from "@/lib/document-storage";
import { loadDraft } from "@/lib/contract/contract-storage";
import { uuidPattern } from "@/lib/contract/saved-contract";
import { words } from "@/lib/contract/agreement";

export const metadata: Metadata = { robots: { index: false, follow: false } };

type ContractPageProps = Pick<PageProps<"/contracts/[id]">, "params">;

async function EditContract({ params }: ContractPageProps) {
  const { id } = await params;
  const locale = "fr";
  if (!uuidPattern.test(id)) notFound();
  const owner = await ownerId();
  if (!owner) redirect("/");
  const t = words(locale);
  let saved;
  try {
    saved = await loadDraft(owner, id);
  } catch (error) {
    logStorageFailure("list", error);
    return (
      <>
        <Header locale={locale} />
        <main className="shell files-empty">
          <p role="alert">
            {t("Impossible de charger le contrat.", "تعذر تحميل العقد.")}
          </p>
          <Link className="button secondary" href="/contracts">
            {t("Mes modèles", "قوالبي")}
          </Link>
        </main>
        <Footer locale={locale} />
      </>
    );
  }
  if (!saved) notFound();

  return (
    <>
      <Header locale={locale} />
      <main>
        <section className="hero">
          <div className="shell">
            <Link href="/contracts">{t("← Mes modèles", "قوالبي ←")}</Link>
            <h1>{t("Modifier le contrat", "تعديل العقد")}</h1>
          </div>
        </section>
        <ContractEditor locale={locale} saved={saved} />
      </main>
      <Footer locale={locale} />
    </>
  );
}

export default function Page({ params }: ContractPageProps) {
  return (
    <Suspense fallback={null}>
      <EditContract params={params} />
    </Suspense>
  );
}
