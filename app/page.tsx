import { Footer, Header } from "@/app/components/louma/site";
import { TemplateGallery } from "@/app/components/louma/template-gallery";
import styles from "@/app/components/louma/home.module.css";

const title = "La location, tout simplement";
const description = "Modèles de documents prêts à personnaliser";
const metaDescription =
  "Comparez les modèles Louma de contrat de location de voiture, personnalisez votre contrat en ligne et téléchargez-le en PDF.";
const topics = [
  "La location",
  "La procuration",
  "La quittance",
  "L’invitation",
  "Le règlement",
  "La livraison",
  "La commande",
];
const rotatingTopics = [topics.at(-1), ...topics, ...topics.slice(0, 2)];

export const metadata = {
  title,
  description: metaDescription,
  alternates: { canonical: "/" },
  openGraph: { title, description: metaDescription },
};

export default function Page() {
  const locale = "fr";

  return (
    <>
      <Header locale={locale} />
      <main>
        <section
          className={`shell ${styles.banner}`}
          aria-labelledby="home-title"
        >
          <h1 id="home-title">
            <span className="sr-only">{title}.</span>
            <span className={styles.roller} aria-hidden="true">
              <span className={styles.rollerTrack}>
                {rotatingTopics.map((topic, index) => (
                  <span key={index}>{topic},</span>
                ))}
              </span>
            </span>
            <span aria-hidden="true">tout simplement.</span>
          </h1>
          <p>{description}</p>
        </section>
        <TemplateGallery />
      </main>
      <Footer locale={locale} showLogo={false} />
    </>
  );
}
