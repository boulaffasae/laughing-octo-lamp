import * as rootParams from "next/root-params";
import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { isLocale } from "./locales";

export default getRequestConfig(async ({ locale }) => {
  const resolved = locale ?? (await rootParams.locale());
  if (!isLocale(resolved)) notFound();
  return { locale: resolved, messages: {} };
});
