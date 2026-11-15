import { ArrowDown } from "lucide-react";
import { isLocale } from "@/i18n/locales";
import { notFound } from "next/navigation";
import { words } from "@/lib/contract/agreement";
import { AccountButtons } from "@/app/components/louma/account";
import { Header, Footer, AppBanner } from "@/app/components/louma/site";
import { Wizard } from "@/app/components/louma/wizard";

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
            <h1>
              {t("Créez votre contrat de location", "أنشئ عقد كراء السيارة")}
            </h1>
            <h2>
              {t(
                "De la pièce d’identité au PDF.",
                "من بطاقة الهوية إلى ملف PDF.",
              )}
            </h2>
            <p>
              {t(
                "Scannez vos documents ou saisissez les informations à la main.",
                "امسح الوثائق ضوئيًا أو أدخل المعلومات يدويًا.",
              )}
            </p>
            <div className="hero-actions">
              <a className="button" href="#contrat">
                {t("Créer un contrat", "إنشاء عقد")}{" "}
                <ArrowDown size={17} aria-hidden />
              </a>
              <AccountButtons locale={locale} signup />
            </div>
          </div>
        </section>
        <Wizard locale={locale} />
        <AppBanner locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  );
}
