import type { Locale } from "../../i18n/locales.ts";

export function formatArticleDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : locale, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(date));
}
export function createHeadingId(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

export function createArticleSlug(title: string) {
  return createHeadingId(title.normalize("NFKD").replace(/\p{M}/gu, ""));
}
