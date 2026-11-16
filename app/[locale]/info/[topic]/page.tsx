import { notFound } from "next/navigation";
import {
  Footer,
  Header,
  siteLabels,
  topics,
} from "@/app/components/louma/site";
import { isLocale, locales } from "@/i18n/locales";
import { words } from "@/lib/contract/agreement";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    topics.map((topic) => ({ locale, topic })),
  );
}

export default async function Page({
  params,
}: PageProps<"/[locale]/info/[topic]">) {
  const { locale, topic } = await params;
  if (!isLocale(locale)) notFound();
  const index = topics.findIndex((item) => item === topic);
  if (index < 0) notFound();

  const t = words(locale);
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const content = [
    t(
      "Louma est un outil de préparation de contrats de location de véhicule.",
      "لوما أداة لإعداد عقود كراء السيارات.",
    ),
    t(
      "Sans compte, le brouillon reste dans l’onglet. Si vous êtes connecté et utilisez l’enregistrement ou le téléchargement, les champs du contrat sont conservés dans votre espace privé. Vous pouvez aussi activer l’enregistrement automatique du brouillon. Si vous utilisez le scan, le PDF est envoyé à Datalab pour la lecture automatique.",
      "من دون حساب، تبقى المسودة في علامة التبويب. عند حفظ العقد أو تنزيله بعد تسجيل الدخول، تُحفظ بيانات العقد في مساحتك الخاصة. ويمكنك تفعيل الحفظ التلقائي للمسودة. عند المسح، يُرسل ملف PDF إلى Datalab للقراءة الآلية.",
    ),
    t(
      "Vérifiez le contrat avant de le signer ou de le remettre au locataire. Importez uniquement des documents que vous êtes autorisé à traiter.",
      "راجع العقد قبل توقيعه أو تسليمه للمستأجر. ارفع فقط المستندات التي يُسمح لك بمعالجتها.",
    ),
    t("Retrouvez Louma sur TikTok.", "تواصل مع لوما عبر تيك توك."),
  ];
  return (
    <>
      <Header locale={locale} path={`/info/${topic}`} />
      <main className="shell info-page">
        <h1>{siteLabels(locale)[index]}</h1>
        {(topic !== "contact" || !email) && <p>{content[index]}</p>}
        {topic === "confidentialite" && process.env.NEXT_PUBLIC_POSTHOG_KEY && (
          <p>
            {t(
              "PostHog mesure les visites sur Louma. Les données des contrats, les champs saisis et les enregistrements de session sont exclus de cette mesure.",
              "يقيس PostHog زيارات لوما. تُستثنى بيانات العقود والحقول المدخلة وتسجيلات الجلسات من هذا القياس.",
            )}
          </p>
        )}
        {topic === "contact" && (
          <a
            href={
              email ? `mailto:${email}` : "https://www.tiktok.com/@louma.site"
            }
          >
            {email ?? "@louma.site"}
          </a>
        )}
      </main>
      <Footer locale={locale} />
    </>
  );
}
