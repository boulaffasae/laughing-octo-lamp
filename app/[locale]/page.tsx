import { isLocale } from "@/i18n/locales";
import { notFound } from "next/navigation";
import { words } from "@/lib/contract/agreement";
import { Header, Footer, AppBanner } from "@/app/components/louma/site";
import { ContractEditor } from "@/app/components/louma/contract-editor";

export default async function Page({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = words(locale);
  return (
    <>
      <Header locale={locale} />
      <main>
        <section className="hero">
          <div className="shell">
            <h1>{t("Contrat de location", "عقد كراء السيارة")}</h1>
          </div>
        </section>
        <ContractEditor locale={locale} />
        <AppBanner locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  );
}
