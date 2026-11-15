import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";
import { locales } from "@/i18n/locales";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    locales.flatMap((locale) => {
      const url = absoluteUrl(`/${locale}`);
      return url ? [[locale, url]] : [];
    }),
  );
  return Object.values(languages).map((url) => ({
    url,
    alternates: { languages },
  }));
}
