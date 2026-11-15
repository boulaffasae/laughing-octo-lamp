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
  termsFr: string;
  termsAr: string;
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

const rentalTerms = [
  [
    "1. Conducteurs autorisés\nSeuls les conducteurs inscrits au contrat et titulaires d’un permis valide peuvent conduire.\nConducteur supplémentaire / n° de permis : …",
    "١. السائقون المصرح لهم\nلا يجوز قيادة السيارة إلا للسائقين المسجلين في العقد والحاملين لرخصة سياقة سارية.\nالسائق الإضافي / رقم الرخصة: …",
  ],
  [
    "2. Utilisation du véhicule\nLe locataire respecte le code de la route et les limites d’utilisation convenues.\nZone autorisée / restrictions : …",
    "٢. استعمال السيارة\nيلتزم المستأجر بقواعد السير والقيود المتفق عليها لاستعمال السيارة.\nنطاق السير المسموح / القيود: …",
  ],
  [
    "3. Départ et état des lieux\nLes parties relèvent ensemble l’état, les accessoires, le compteur et le niveau de carburant au départ et au retour.\nCompteur et carburant au départ / au retour : …",
    "٣. التسليم ومعاينة الحالة\nيسجل الطرفان حالة السيارة وملحقاتها وقراءة العداد ومستوى الوقود عند التسليم والإرجاع.\nالعداد والوقود عند التسليم / الإرجاع: …",
  ],
  [
    "4. Kilométrage et carburant\nForfait kilométrique : … km. Prix du km supplémentaire : … MAD.\nNiveau de carburant attendu au retour / frais convenus : …",
    "٤. المسافة والوقود\nالمسافة المشمولة: … كم. سعر الكيلومتر الإضافي: … درهم.\nمستوى الوقود المطلوب عند الإرجاع / الرسوم المتفق عليها: …",
  ],
  [
    "5. Prix et dépôt de garantie\nLe prix et le dépôt figurent au recto. Les retenues éventuelles sont détaillées et justifiées.\nMode de paiement / délai de restitution du dépôt : …",
    "٥. السعر ومبلغ الضمان\nيُبيّن السعر ومبلغ الضمان في الصفحة الأولى. تُفصّل وتُبرّر أي اقتطاعات.\nطريقة الدفع / أجل رد مبلغ الضمان: …",
  ],
  [
    "6. Assurance et sinistre\nEn cas de panne, de vol ou d’accident, prévenir rapidement l’agence et lui transmettre les justificatifs disponibles.\nGaranties / franchise / exclusions : …\nContact d’assistance : …",
    "٦. التأمين والحوادث\nعند العطل أو السرقة أو الحادث، يجب إبلاغ الوكالة سريعًا وإرسال الوثائق المتاحة إليها.\nالتغطية / مبلغ التحمل / الاستثناءات: …\nرقم المساعدة: …",
  ],
  [
    "7. Restitution et prolongation\nRestituer le véhicule, ses clés, ses documents et ses accessoires à la date et au lieu convenus. Toute prolongation requiert l’accord de l’agence.\nLieu de retour / frais de retard convenus : …",
    "٧. الإرجاع والتمديد\nتُعاد السيارة ومفاتيحها ووثائقها وملحقاتها في الموعد والمكان المتفق عليهما. يتطلب التمديد موافقة الوكالة.\nمكان الإرجاع / رسوم التأخير المتفق عليها: …",
  ],
] as const;

export const frontPageOrder = (a: Agreement) =>
  [a.order[0], "agency", ...a.order.slice(1)] as const;

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
    termsFr: rentalTerms.map(([fr]) => fr).join("\n\n"),
    termsAr: rentalTerms.map(([, ar]) => ar).join("\n\n"),
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
