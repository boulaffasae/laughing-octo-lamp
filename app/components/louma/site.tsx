import Image from "next/image";
import { words } from "@/lib/contract/agreement";
import type { Locale } from "@/i18n/locales";
import { AccountButtons } from "./account";

export const topics = [
  "mentions-legales",
  "confidentialite",
  "conditions",
  "contact",
] as const;
export function siteLabels(locale: Locale) {
  const t = words(locale);
  return [
    t("Mentions légales", "الإشعارات القانونية"),
    t("Confidentialité", "الخصوصية"),
    t("Conditions d’utilisation", "شروط الاستخدام"),
    t("Contact", "اتصل بنا"),
  ];
}

export function Logo({ locale }: { locale: Locale }) {
  return (
    <a className="logo" href={`/${locale}`} aria-label="Louma">
      <Image src="/louma.svg" width={36} height={36} alt="" />
      louma
    </a>
  );
}

export function Header({
  locale,
  path = "",
}: {
  locale: Locale;
  path?: string;
}) {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Logo locale={locale} />
        <div className="header-actions">
          <nav
            className="languages"
            aria-label={words(locale)("Langue", "اللغة")}
          >
            <a
              href={`/fr${path}`}
              lang="fr"
              aria-current={locale === "fr" ? "page" : undefined}
            >
              FR
            </a>
            <a
              href={`/ar${path}`}
              lang="ar"
              aria-current={locale === "ar" ? "page" : undefined}
            >
              العربية
            </a>
          </nav>
          <AccountButtons locale={locale} />
        </div>
      </div>
    </header>
  );
}

export function AppBanner({ locale }: { locale: Locale }) {
  const t = words(locale);
  const url = process.env.NEXT_PUBLIC_APP_STORE_URL;
  const googleBadge = `/stores/google-${locale}.png`;
  const appleBadge = `/stores/apple-${t("fr-fr", "ar-sa")}.svg`;
  return (
    <section className="app-banner">
      <div className="shell app-grid">
        <div className="app-copy">
          <h2>{t("Louma sur mobile", "لوما على الهاتف")}</h2>
          <div className="store-badges">
            {url && (
              <a className="official-store apple-store" href={url}>
                {/* eslint-disable-next-line @next/next/no-img-element -- official store artwork */}
                <img
                  src={appleBadge}
                  alt={t("Télécharger dans l’App Store", "تنزيل من App Store")}
                />
              </a>
            )}
            <a
              className="official-store google-store"
              href="https://play.google.com/store/apps/details?id=com.getlouma"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- official store artwork */}
              <img
                src={googleBadge}
                alt={t("Disponible sur Google Play", "متوفر على Google Play")}
              />
            </a>
          </div>
        </div>
        <div className="app-device">
          <Image src="/louma-phone.svg" alt="" width={300} height={340} />
          <div
            className="device-scroll"
            tabIndex={0}
            aria-label={t(
              "Exemple de contrat PDF recto verso",
              "مثال لعقد PDF بوجهين",
            )}
          >
            <Image
              src={`/demo/${locale}-1.png`}
              width={420}
              height={594}
              alt={t("Recto du contrat", "الوجه الأول للعقد")}
            />
            <Image
              src={`/demo/${locale}-2.png`}
              width={420}
              height={594}
              alt={t("Verso du contrat", "الوجه الثاني للعقد")}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

const socials = [
  [
    "Instagram",
    "https://www.instagram.com/getlouma/",
    "M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5ZM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm5-1h.01",
  ],
  [
    "TikTok",
    "https://www.tiktok.com/@louma.site",
    "M14 3v12a4.5 4.5 0 1 1-4.5-4.5M14 3c0 3 2 5 5 5",
  ],
  [
    "Facebook",
    "https://www.facebook.com/getlouma",
    "M14 22V7q0-3 4-3h1m-9 7h9",
  ],
  [
    "LinkedIn",
    "https://www.linkedin.com/company/getlouma/",
    "M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm5 5v6m4 0v-6m0 2c1-3 5-3 5 1v3M8 7h.01",
  ],
] as const;

export function Footer({ locale }: { locale: Locale }) {
  return (
    <footer className="shell site-footer">
      <div>
        <Logo locale={locale} />
        <nav
          aria-label={words(locale)("Réseaux sociaux", "شبكات التواصل")}
          className="socials"
        >
          {socials.map(([name, href, path]) => (
            <a key={name} href={href} aria-label={name}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d={path} />
              </svg>
            </a>
          ))}
        </nav>
      </div>
      <div className="footer-grid">
        <nav aria-label={words(locale)("Informations", "معلومات")}>
          {topics.map((topic, i) => (
            <a key={topic} href={`/${locale}/info/${topic}`}>
              {siteLabels(locale)[i]}
            </a>
          ))}
        </nav>
        <div>
          <AccountButtons locale={locale} />
        </div>
      </div>
    </footer>
  );
}
