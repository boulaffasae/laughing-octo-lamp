export const newsPaths = {
  fr: "/conseils-location-voiture",
  en: "/car-rental-guides",
  ar: "/دليل-كراء-السيارات",
} as const;
export type NewsLocale = keyof typeof newsPaths;

// Keep the filesystem route internal; publish one descriptive URL per language.
export function localizeNewsRoute(locale: NewsLocale, route: string) {
  if (route !== "/actus" && !route.startsWith("/actus/")) return route;
  const suffix = route.slice("/actus".length);
  return (
    newsPaths[locale] +
    (locale === "ar" ? suffix.replace(/^\/page\//, "/صفحة/") : suffix)
  );
}
export function newsUrl(locale: NewsLocale, suffix = "") {
  return encodeURI(`/${locale}${localizeNewsRoute(locale, `/actus${suffix}`)}`);
}

export const newsPathnames = {
  "/actus": newsPaths,
  "/actus/opengraph-image": {
    fr: `${newsPaths.fr}/opengraph-image`,
    en: `${newsPaths.en}/opengraph-image`,
    ar: `${newsPaths.ar}/opengraph-image`,
  },
  "/actus/[slug]": {
    fr: `${newsPaths.fr}/[slug]`,
    en: `${newsPaths.en}/[slug]`,
    ar: `${newsPaths.ar}/[slug]`,
  },
  "/actus/page/[page]": {
    fr: `${newsPaths.fr}/page/[page]`,
    en: `${newsPaths.en}/page/[page]`,
    ar: `${newsPaths.ar}/صفحة/[page]`,
  },
} as const;

export function newsRedirects() {
  return (Object.keys(newsPaths) as NewsLocale[]).flatMap((locale) => [
    {
      source: `/${locale}/actus/page/1`,
      destination: newsUrl(locale),
      permanent: true,
    },
    {
      source: `/${locale}/actus/page/:page`,
      destination: newsUrl(locale, "/page/:page"),
      permanent: true,
    },
    {
      source: `/${locale}/actus/:path*`,
      destination: `${newsUrl(locale)}/:path*`,
      permanent: true,
    },
  ]);
}
