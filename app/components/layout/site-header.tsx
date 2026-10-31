"use client";
import { Link, usePathname } from "@/i18n/navigation";
import { useRouter } from "next/navigation";
import { localizeNewsRoute } from "@/lib/news-routing";
import { useLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { isLocale, type Locale } from "@/i18n/locales";
import { newsCopy } from "@/lib/news/copy";
import { useState } from "react";
import { ArrowUpRight, Globe2, Menu } from "lucide-react";
import { useCopy } from "@/app/translations";
import { SiteLogo } from "./site-logo";

export function SiteHeader({
  languageRoutes,
}: {
  languageRoutes?: Partial<Record<Locale, string>>;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const copy = useCopy();
  function changeLanguage(nextLocale: Locale) {
    router.replace(
      `/${nextLocale}${languageRoutes?.[nextLocale] ?? localizeNewsRoute(nextLocale, pathname)}${window.location.search}${window.location.hash}`,
      { scroll: false },
    );
  }
  return (
    <header>
      <div className="header-inner">
        <SiteLogo />
        <nav id="site-navigation" className={isMenuOpen ? "nav open" : "nav"}>
          {copy.nav.map((label, i) => (
            <Link
              key={label}
              href={{ pathname: "/", hash: ["how", "why", "faq"][i] }}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/actus"
            scroll={false}
            onClick={() => setMenuOpen(false)}
            aria-current={pathname.startsWith("/actus") ? "page" : undefined}
          >
            {newsCopy[isLocale(locale) ? locale : "fr"].nav}
          </Link>
        </nav>
        <div className="header-actions">
          <div className="language">
            <Globe2 size={15} />
            <select
              aria-label={copy.languageLabel}
              value={locale}
              onChange={(event) => {
                if (isLocale(event.target.value))
                  changeLanguage(event.target.value);
              }}
            >
              {routing.locales.map((language) => (
                <option key={language} value={language}>
                  {language.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <Link href="/new" className="button small">
            {copy.start}
            <ArrowUpRight size={16} />
          </Link>
          <button
            className="menu icon-button"
            aria-label="Menu"
            aria-expanded={isMenuOpen}
            aria-controls="site-navigation"
            onClick={() => setMenuOpen(!isMenuOpen)}
          >
            <Menu />
          </button>
        </div>
      </div>
    </header>
  );
}
