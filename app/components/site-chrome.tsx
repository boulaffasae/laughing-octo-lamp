"use client";
import { Link, usePathname } from "@/i18n/navigation";
import { useRouter } from "next/navigation";
import { localizeNewsRoute } from "@/lib/news-routing";
import { useLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { useState } from "react";
import { ArrowUpRight, Globe2, Menu } from "lucide-react";
import { useCopy } from "../translations";
export function Logo() {
  return (
    <Link className="logo" href="/" aria-label="Louma accueil">
      <span className="logo-mark">
        <i />
        <i />
        <i />
      </span>
      louma<span className="logo-dot">.</span>
    </Link>
  );
}
export function SiteHeader({
  languageRoutes,
}: {
  languageRoutes?: Partial<Record<string, string>>;
}) {
  const lang = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mobile, setMobile] = useState(false);
  const t = useCopy();
  function changeLang(locale: (typeof routing.locales)[number]) {
    router.replace(
      `/${locale}${languageRoutes?.[locale] ?? localizeNewsRoute(locale, pathname)}${window.location.search}${window.location.hash}`,
      { scroll: false },
    );
  }
  return (
    <header>
      <div className="header-inner">
        <Logo />
        <nav id="site-navigation" className={mobile ? "nav open" : "nav"}>
          {t.nav.map((n, i) => (
            <Link
              key={n}
              href={{ pathname: "/", hash: ["how", "why", "faq"][i] }}
            >
              {n}
            </Link>
          ))}
          <Link
            href="/actus"
            scroll={false}
            onClick={() => setMobile(false)}
            aria-current={pathname.startsWith("/actus") ? "page" : undefined}
          >
            {lang === "ar"
              ? "دليل كراء السيارات"
              : lang === "en"
                ? "Car rental guides"
                : "Conseils location"}
          </Link>
        </nav>
        <div className="header-actions">
          <div className="language">
            <Globe2 size={15} />
            <select
              aria-label={t.languageLabel}
              value={lang}
              onChange={(e) =>
                changeLang(e.target.value as (typeof routing.locales)[number])
              }
            >
              {routing.locales.map((l) => (
                <option key={l} value={l}>
                  {l.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <Link href="/new" className="button small">
            {t.start}
            <ArrowUpRight size={16} />
          </Link>
          <button
            className="menu icon-button"
            aria-label="Menu"
            aria-expanded={mobile}
            aria-controls="site-navigation"
            onClick={() => setMobile(!mobile)}
          >
            <Menu />
          </button>
        </div>
      </div>
    </header>
  );
}
export function BottomCTA() {
  const t = useCopy();
  return (
    <section className="bottom-cta">
      <span className="eyebrow">{t.sub}</span>
      <h2>{t.bottomTitle}</h2>
      <Link href="/new" className="button">
        {t.cta}
        <ArrowUpRight size={18} />
      </Link>
    </section>
  );
}
export function SiteFooter() {
  const t = useCopy();
  return (
    <footer>
      <Logo />
      <p>{t.footerTagline}</p>
      <span>
        © 2026 Louma <span className="footer-star">✳</span> Made for Morocco
      </span>
    </footer>
  );
}
