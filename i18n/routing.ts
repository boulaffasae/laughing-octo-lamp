import { newsPathnames } from "../lib/news-routing";
import { locales } from "./locales";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales,
  defaultLocale: "fr",
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/new": "/new",
    ...newsPathnames,
  },
});
