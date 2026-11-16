import { notFound } from "next/navigation";
import {
  Footer,
  Header,
  siteLabels,
  topics,
} from "@/app/components/louma/site";
import { isLocale, locales } from "@/i18n/locales";
import { words } from "@/lib/contract/agreement";

const address = "5 RUE ENNOUSSOUR 20250 CASABLANCA MAROC";
const email =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "contact@louma.site";

function ContactEmail() {
  return (
    <a href={`mailto:${email}`} dir="ltr">
      {email}
    </a>
  );
}

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
  const content = {
    "mentions-legales": (
      <>
        <p>
          {t(
            "Louma édite un service en ligne de préparation et de gestion de contrats de location de véhicules. L’adresse de correspondance de Louma est indiquée ci-dessous.",
            "تدير لوما خدمة إلكترونية لإعداد عقود كراء السيارات وإدارتها. يرد أدناه عنوان المراسلات الخاص بلوما.",
          )}
        </p>
        <address>
          <bdi dir="ltr">{address}</bdi>
        </address>
        <p>
          <ContactEmail />
        </p>
        <h2>{t("Hébergement", "الاستضافة")}</h2>
        <p>
          {t(
            "Le site est hébergé par Vercel Inc.",
            "تستضيف شركة Vercel Inc. الموقع.",
          )}
        </p>
        <h2>{t("Propriété intellectuelle", "الملكية الفكرية")}</h2>
        <p>
          {t(
            "Le nom, le logo et l’interface de Louma sont protégés par les droits de propriété intellectuelle applicables. Leur reproduction ou leur diffusion est soumise à l’autorisation préalable du titulaire des droits, sous réserve des exceptions prévues par la loi.",
            "يخضع اسم لوما وشعارها وواجهتها لحقوق الملكية الفكرية المطبقة. ويتطلب نسخها أو نشرها إذناً مسبقاً من صاحب الحقوق، مع مراعاة الاستثناءات التي يقررها القانون.",
          )}
        </p>
      </>
    ),
    confidentialite: (
      <>
        <p>
          {t(
            "Louma traite les données de compte, les documents importés et les informations saisies dans les contrats pour fournir le service. Ces informations peuvent concerner l’identité des parties, leurs coordonnées, leur permis de conduire et le véhicule loué. Les renseignements requis servent à l’opération demandée. Les champs facultatifs peuvent rester vides.",
            "تعالج لوما بيانات الحساب والمستندات المرفوعة والمعلومات المدخلة في العقود لتقديم الخدمة. وقد تشمل هذه المعلومات هوية الأطراف وبيانات الاتصال ورخصة السياقة والسيارة المكتراة. تُستخدم المعلومات المطلوبة لتنفيذ العملية المطلوبة، ويمكن ترك الحقول الاختيارية فارغة.",
          )}
        </p>
        <h2>{t("Stockage et prestataires", "التخزين ومقدمو الخدمات")}</h2>
        <p>
          {t(
            "Sans compte, le brouillon reste dans l’onglet. Dans un compte connecté, les documents enregistrés, les contrats et leur historique sont conservés dans l’espace privé. Clerk gère la connexion et les sessions. Vercel et Neon assurent l’hébergement et le stockage. Lorsque vous lancez une lecture automatique, le fichier transmis est traité par Datalab pour en extraire les champs demandés. Sentry reçoit des informations techniques pour diagnostiquer les erreurs.",
            "من دون حساب، تبقى المسودة في علامة التبويب. عند تسجيل الدخول، تُحفظ المستندات المسجلة والعقود وسجل تعديلاتها في المساحة الخاصة. تدير Clerk تسجيل الدخول والجلسات، وتتولى Vercel وNeon الاستضافة والتخزين. عند تشغيل القراءة الآلية، تعالج Datalab الملف المرسل لاستخراج الحقول المطلوبة. وتتلقى Sentry معلومات تقنية لتشخيص الأخطاء.",
          )}
        </p>
        {process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() && (
          <p>
            {t(
              "PostHog mesure les visites à partir d’événements de consultation. Les champs saisis, le contenu des contrats et les enregistrements de session sont exclus de cette mesure.",
              "تقيس PostHog الزيارات باستخدام أحداث المشاهدة. ولا يشمل هذا القياس الحقول المدخلة أو محتوى العقود أو تسجيلات الجلسات.",
            )}
          </p>
        )}
        <p>
          {t(
            "Certains prestataires peuvent traiter des données à l’étranger. Les données sont conservées pendant la durée nécessaire à la fourniture du service, puis, le cas échéant, pendant la durée requise pour respecter une obligation légale ou faire valoir un droit.",
            "قد يعالج بعض مقدمي الخدمات البيانات خارج المغرب. تُحفظ البيانات للمدة اللازمة لتقديم الخدمة، ثم، عند الاقتضاء، للمدة اللازمة للوفاء بالتزام قانوني أو لممارسة حق.",
          )}
        </p>
        <h2>{t("Vos droits", "حقوقكم")}</h2>
        <p>
          {t(
            "Conformément à la loi marocaine n° 09-08, vous pouvez exercer vos droits d’accès, de rectification et d’opposition dans les conditions prévues par la loi en écrivant à ",
            "وفقاً للقانون المغربي رقم 09-08، يمكنكم ممارسة حقوق الولوج والتصحيح والتعرض وفق الشروط المقررة قانوناً عبر مراسلة ",
          )}
          <ContactEmail />.{" "}
          {t(
            "Vous pouvez également saisir la Commission nationale de contrôle de la protection des données à caractère personnel (CNDP).",
            "يمكنكم أيضاً اللجوء إلى اللجنة الوطنية لمراقبة حماية المعطيات ذات الطابع الشخصي.",
          )}
        </p>
      </>
    ),
    conditions: (
      <>
        <h2>{t("Objet du service", "موضوع الخدمة")}</h2>
        <p>
          {t(
            "Louma fournit des modèles et des outils pour préparer, exporter et, avec un compte, conserver des contrats de location de véhicules. Le contrat lie les parties qui le concluent. Il leur appartient de vérifier son contenu, de recueillir les signatures requises et d’accomplir les formalités applicables à leur location.",
            "توفر لوما نماذج وأدوات لإعداد عقود كراء السيارات وتصديرها وحفظها عند استخدام حساب. يُلزم العقد الأطراف التي تبرمه، وعليها التحقق من مضمونه والحصول على التوقيعات المطلوبة وإتمام الإجراءات المطبقة على عملية الكراء.",
          )}
        </p>
        <h2>{t("Utilisation des documents", "استخدام المستندات")}</h2>
        <p>
          {t(
            "Importez uniquement les documents que vous êtes habilité à traiter et vérifiez les informations issues de la lecture automatique avant de les utiliser. Conservez une copie des documents signés dans vos propres archives et protégez l’accès à votre compte.",
            "ارفعوا فقط المستندات التي يحق لكم معالجتها، وتحققوا من المعلومات المستخرجة بالقراءة الآلية قبل استخدامها. احتفظوا بنسخة من المستندات الموقعة في أرشيفكم واحموا بيانات الدخول إلى حسابكم.",
          )}
        </p>
        <h2>{t("Droit applicable", "القانون المطبق")}</h2>
        <p>
          {t(
            "Les présentes conditions sont régies par le droit marocain, sous réserve des dispositions impératives applicables. Toute réclamation peut être adressée à Louma par courriel. À défaut d’accord amiable, le litige relève des juridictions désignées par les règles de compétence applicables.",
            "تخضع هذه الشروط للقانون المغربي، مع مراعاة الأحكام الآمرة المطبقة. ويمكن توجيه أي شكوى إلى لوما عبر البريد الإلكتروني. وفي حال تعذر التوصل إلى حل ودي، يُعرض النزاع على المحاكم المختصة وفق قواعد الاختصاص المطبقة.",
          )}
        </p>
      </>
    ),
    contact: (
      <>
        <p>
          {t(
            "Pour une question sur votre compte, un incident technique ou une demande relative à vos données personnelles, écrivez à Louma.",
            "للاستفسار عن حسابكم أو للإبلاغ عن مشكلة تقنية أو لتقديم طلب يتعلق ببياناتكم الشخصية، راسلوا لوما.",
          )}
        </p>
        <p>
          <ContactEmail />
        </p>
        <address>
          <bdi dir="ltr">{address}</bdi>
        </address>
      </>
    ),
  }[topics[index]];

  return (
    <>
      <Header locale={locale} path={`/info/${topic}`} />
      <main className="shell info-page">
        <h1>{siteLabels(locale)[index]}</h1>
        {content}
      </main>
      <Footer locale={locale} />
    </>
  );
}
