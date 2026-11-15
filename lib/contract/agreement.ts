import { createEmptyDocuments, type DocumentFields } from "./documents";
import type { Locale } from "@/i18n/locales";

export type BlockId = "agency" | "renter" | "vehicle" | "rental" | "terms";
export type Agreement = {
  locale: Locale;
  title: string;
  logo: string;
  color: string;
  agency: string;
  company: string;
  agencyAddress: string;
  registration: string;
  phone: string;
  documents: DocumentFields[];
  start: string;
  end: string;
  startTime: string;
  endTime: string;
  condition: string;
  place: string;
  price: string;
  deposit: string;
  terms: string;
  headings: Record<BlockId, string>;
  order: Exclude<BlockId, "agency" | "terms">[];
};

export const words = (locale: Locale) => (fr: string, ar: string) =>
  locale === "ar" ? ar : fr;

export function headingInk(color: string) {
  const rgb = [1, 3, 5].map(
    (index) => parseInt(color.slice(index, index + 2), 16) / 255,
  );
  const [r, g, b] = rgb.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return r * 0.2126 + g * 0.7152 + b * 0.0722 > 0.179 ? "#000" : "#fff";
}

export function initialAgreement(locale: Locale): Agreement {
  const t = words(locale);
  return {
    locale,
    title: t("Contrat de location de véhicule", "عقد كراء السيارة"),
    logo: "",
    color: "#235346",
    agency: "",
    company: "",
    agencyAddress: "",
    registration: "",
    phone: "",
    documents: createEmptyDocuments(),
    start: "",
    end: "",
    startTime: "",
    endTime: "",
    condition: "",
    place: "",
    price: "",
    deposit: "",
    terms: t(
      "01 · Véhicule et conducteurs\nLe véhicule décrit au recto est remis au locataire. Conducteurs autorisés : …\n\n02 · Utilisation\nZone de circulation : …\nUsage et restrictions convenus : …\n\n03 · Kilométrage et carburant\nKilométrage au départ : …  ·  Plafond convenu : …\nNiveau de carburant au départ : …  ·  Niveau attendu au retour : …\n\n04 · Assurance et assistance\nGaranties, franchise et exclusions : …\nEn cas de panne, vol ou accident, prévenir l’agence. Contact et procédure : …\n\n05 · Restitution\nLieu de retour : …\nL’état du véhicule est relevé à la restitution. Modalités convenues en cas de prolongation ou de retard : …",
      "01 · السيارة والسائقون\nتُسلّم السيارة المبيّنة في الوجه الأول للمستأجر. السائقون المرخّص لهم: …\n\n02 · الاستعمال\nنطاق السير: …\nالاستعمال والقيود المتفق عليها: …\n\n03 · المسافة والوقود\nعداد المسافة عند التسليم: … · الحد المتفق عليه: …\nمستوى الوقود عند التسليم: … · المستوى المطلوب عند الإرجاع: …\n\n04 · التأمين والمساعدة\nالضمانات والتحمل والاستثناءات: …\nعند العطل أو السرقة أو الحادث، يُبلّغ مكتب الكراء. الاتصال والإجراءات: …\n\n05 · الإرجاع\nمكان الإرجاع: …\nتُسجّل حالة السيارة عند الإرجاع. الشروط المتفق عليها عند التمديد أو التأخير: …",
    ),
    headings: {
      agency: t("Agence", "الوكالة"),
      renter: t("Locataire", "المستأجر"),
      vehicle: t("Véhicule", "السيارة"),
      rental: t("Départ / Retour", "التسليم / الإرجاع"),
      terms: t("Conditions de location", "شروط الكراء"),
    },
    order: ["renter", "vehicle", "rental"],
  };
}

export function blockRows(a: Agreement, id: BlockId): [string, string][] {
  const t = words(a.locale);
  const [renter, licence, vehicle] = a.documents;
  const date = (day: string = "") =>
    /^\d{4}-\d{2}-\d{2}$/.test(day) ? day.split("-").reverse().join("/") : day;
  const dateTime = (day: string, time: string) =>
    [date(day), time].filter(Boolean).join(" · ");
  switch (id) {
    case "agency":
      return [
        [t("Nom de l’agence", "اسم الوكالة"), a.agency],
        [t("Raison sociale", "اسم الشركة"), a.company],
        [t("Adresse", "العنوان"), a.agencyAddress],
        ["RC / ICE", a.registration],
        [t("Téléphone", "الهاتف"), a.phone],
      ];
    case "renter":
      return [
        [t("Nom et prénom", "الاسم الكامل"), renter.name],
        [t("CNIE", "رقم البطاقة الوطنية"), renter.identity],
        [t("CNIE délivrée le", "تاريخ إصدار البطاقة"), date(renter.issued)],
        [
          t("Adresse", "العنوان"),
          [renter.address, renter.city].filter(Boolean).join(", "),
        ],
        [t("Permis", "رخصة السياقة"), licence.licence],
        [t("Permis délivré le", "تاريخ إصدار الرخصة"), date(licence.issued)],
      ];
    case "vehicle":
      return [
        [t("Marque / Modèle", "الماركة / الطراز"), vehicle.brand],
        [t("Immatriculation", "رقم التسجيل"), vehicle.plate],
        [t("Carburant", "الوقود"), vehicle.fuel ?? ""],
        [t("État au départ", "حالة السيارة عند التسليم"), a.condition],
      ];
    case "rental":
      return [
        [t("Départ", "التسليم"), dateTime(a.start, a.startTime)],
        [t("Retour", "الإرجاع"), dateTime(a.end, a.endTime)],
        [t("Total (MAD)", "المجموع (درهم)"), a.price],
        [t("Caution (MAD)", "الضمان (درهم)"), a.deposit],
      ];
    case "terms":
      return [];
  }
}
