import { ArrowDown, FilePenLine } from "lucide-react";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/locales";
import { Header, Footer, AppBanner } from "@/app/components/louma/site";
import { ContractEditor } from "@/app/components/louma/contract-editor";
import styles from "@/app/components/louma/home.module.css";

export const metadata = { title: "La location, tout simplement" };

export default async function Page({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <>
      <Header locale={locale} />
      <main>
        <section
          className={`shell ${styles.banner}`}
          aria-labelledby="home-title"
        >
          <div className={styles.bannerText}>
            <h1 id="home-title">
              La <span className={styles.accent}>location</span>,<br />
              tout simplement
            </h1>
            <p>
              Vos modèles de documents PDF au Maroc. Personnalisez votre contrat
              de location de voiture et téléchargez-le en PDF.
            </p>
            <div className={styles.actions}>
              <a className="button" href="#modeles">
                Voir les modèles <ArrowDown size={17} aria-hidden />
              </a>
              <a className="button secondary" href="#contrat">
                Ouvrir l’éditeur
              </a>
            </div>
          </div>
          <div className={styles.illustration} aria-hidden>
            <div className={styles.paperBack} />
            <div className={styles.paperFront}>
              <FilePenLine size={31} strokeWidth={1.6} />
              <span />
              <span />
              <span />
            </div>
          </div>
        </section>
        <ContractEditor locale={locale} showTemplateGallery />
        <AppBanner locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  );
}
