import Link from "next/link";
import { copy, locales, type Locale } from "@/lib/actus";
export function NewsShell({
  locale,
  route = "/actus",
  children,
}: {
  locale: Locale;
  route?: string;
  children: React.ReactNode;
}) {
  const t = copy[locale];
  return (
    <>
      <header className="news-header">
        <div className="header-inner">
          <Link className="logo" href={`/${locale}`}>
            louma<span className="logo-dot">.</span>
          </Link>
          <nav aria-label={t.nav}>
            <Link href={`/${locale}`}>{t.home}</Link>
            <Link href={`/${locale}/actus`} aria-current="page">
              {t.nav}
            </Link>
          </nav>
          <div className="news-languages">
            {locales.map((l) => (
              <Link
                key={l}
                href={`/${l}${route}`}
                hrefLang={l}
                lang={l}
                aria-current={l === locale ? "true" : undefined}
              >
                {l.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </header>
      {children}
      <footer className="news-footer">
        <strong>louma.</strong>
        <p>{t.note}</p>
        <Link className="text-link" href={`/${locale}/new`}>
          {t.cta} ↗
        </Link>
      </footer>
    </>
  );
}
