import type { DocumentFields } from "./documents";
import type { Locale } from "@/i18n/locales";

export type BlockId = "agency" | "renter" | "vehicle" | "rental" | "terms";
export type Agreement = {
  locale: Locale;
  title: string;
  logo: string;
  agency: string;
  documents: DocumentFields[];
  start: string;
  end: string;
  price: string;
  deposit: string;
  terms: string;
  headings: Record<BlockId, string>;
  columns: [BlockId[], BlockId[]];
};

export const words = (locale: Locale) => (fr: string, ar: string) =>
  locale === "ar" ? ar : fr;

export function blockRows(a: Agreement, id: BlockId): [string, string][] {
  const t = words(a.locale);
  const [renter, licence, vehicle] = a.documents;
  const date = (day: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(day) && !Number.isNaN(Date.parse(day))
      ? new Intl.DateTimeFormat(a.locale === "ar" ? "ar-MA" : "fr-MA", {
          dateStyle: "long",
          timeZone: "UTC",
        }).format(new Date(day))
      : day;
  switch (id) {
    case "agency":
      return [[t("Nom", "الاسم"), a.agency]];
    case "renter":
      return [
        [t("Nom complet", "الاسم الكامل"), renter.name],
        [t("Carte nationale", "البطاقة الوطنية"), renter.identity],
        [t("Adresse", "العنوان"), renter.address],
        [t("Permis", "رخصة السياقة"), licence.licence],
        [t("Catégorie", "الفئة"), licence.category],
        [t("Expiration", "تاريخ الانتهاء"), date(licence.expiry)],
      ];
    case "vehicle":
      return [
        [t("Marque et modèle", "الماركة والطراز"), vehicle.brand],
        [t("Immatriculation", "رقم التسجيل"), vehicle.plate],
        [t("Châssis", "رقم الهيكل"), vehicle.vin],
      ];
    case "rental":
      return [
        [t("Début", "البداية"), date(a.start)],
        [t("Fin", "النهاية"), date(a.end)],
        [t("Prix total (MAD)", "المبلغ الإجمالي (درهم)"), a.price],
        [t("Caution (MAD)", "الضمان (درهم)"), a.deposit],
      ];
    case "terms":
      return [];
  }
}
