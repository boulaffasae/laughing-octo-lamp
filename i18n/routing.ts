import { locales } from "./locales";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales,
  defaultLocale: "fr",
  localePrefix: "always",
  localeDetection: false,
  alternateLinks: false,
});
