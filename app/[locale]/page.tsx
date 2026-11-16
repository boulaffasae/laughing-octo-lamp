import { isLocale } from "@/i18n/locales";
import { notFound } from "next/navigation";
import {
  Header,
  Footer,
  AppBanner,
  siteTitle,
} from "@/app/components/louma/site";
import { ContractEditor } from "@/app/components/louma/contract-editor";

export default async function Page({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <>
      <Header locale={locale} />
      <main>
        <section className="hero">
          <div className="shell">
            <h1 lang="fr" dir="ltr">
              {siteTitle}
            </h1>
          </div>
        </section>
        <ContractEditor locale={locale} />
        <AppBanner locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  );
}
