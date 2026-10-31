import { SiteHeader } from "../layout/site-header";
import { SiteFooter } from "../layout/site-footer";
import { CallToAction } from "../layout/call-to-action";
import { localizeNewsRoute } from "@/lib/news-routing";
import { locales, type Locale } from "@/i18n/locales";
export function NewsShell({
  locale,
  route = "/actus",
  children,
  languageRoutes,
}: {
  locale: Locale;
  route?: string;
  languageRoutes?: Partial<Record<Locale, string>>;
  children: React.ReactNode;
}) {
  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"}>
      <SiteHeader
        languageRoutes={
          languageRoutes ??
          Object.fromEntries(
            locales.map((language) => [
              language,
              localizeNewsRoute(language, route),
            ]),
          )
        }
      />
      {children}
      <CallToAction />
      <SiteFooter />
    </div>
  );
}
