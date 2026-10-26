import { SiteHeader, SiteFooter, BottomCTA } from "../site-chrome";
import { localizeNewsRoute } from "@/lib/news-routing";
import { locales, type Locale } from "@/lib/actus";
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
            locales.map((l) => [l, localizeNewsRoute(l, route)]),
          )
        }
      />
      {children}
      <BottomCTA />
      <SiteFooter />
    </div>
  );
}
