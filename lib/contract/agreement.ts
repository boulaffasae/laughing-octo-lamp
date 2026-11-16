import { createEmptyDocuments, type DocumentFields } from "./documents";
import type { Locale } from "@/i18n/locales";

export type BlockId = "renter" | "vehicle" | "rental" | "condition";
export type Agreement = {
  locale: Locale;
  title: string;
  logo: string;
  color: string;
  agency: string;
  footerText: string;
  documents: DocumentFields[];
  start: string;
  end: string;
  startTime: string;
  endTime: string;
  conditionNotes: string[];
  place: string;
  price: string;
  deposit: string;
  termsFr: string;
  termsAr: string;
  headings: Record<BlockId, string>;
  termsTitles: Record<Locale, string>;
  labels: Record<string, string>;
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

export function initialAgreement(locale: Locale): Agreement {
  const t = words(locale);
  return {
    locale,
    title: t("Contrat de location de véhicule", "عقد كراء السيارة"),
    logo: "",
    color: "#235346",
    agency: "",
    footerText: t(
      "Raison sociale : …… - RC : …… - ICE : …… - Adresse : …… - Téléphone : ……",
      "اسم الشركة: …… - السجل التجاري: …… - المعرّف الموحد للمقاولة: …… - العنوان: …… - الهاتف: ……",
    ),
    documents: createEmptyDocuments(),
    start: "",
    end: "",
    startTime: "",
    endTime: "",
    conditionNotes: Array<string>(6).fill(""),
    place: "",
    price: "",
    deposit: "",
    termsFr: rentalTerms.map(([fr]) => fr).join("\n\n"),
    termsAr: rentalTerms.map(([, ar]) => ar).join("\n\n"),
    headings: {
      renter: t("Locataire", "المستأجر"),
      vehicle: t("Véhicule", "السيارة"),
      rental: t("Départ / Retour", "التسليم / الإرجاع"),
      condition: t("État", "حالة السيارة"),
    },
    termsTitles: { fr: "Conditions de location", ar: "شروط الكراء" },
    labels: {},
  };
}

type AgreementField = Exclude<
  keyof Agreement,
  | "locale"
  | "documents"
  | "headings"
  | "termsTitles"
  | "labels"
  | "conditionNotes"
>;
export type FieldKey = AgreementField | readonly [number, string];
type ContractField = {
  key: FieldKey;
  label: string;
  type?: "date" | "time";
  fullWidth?: boolean;
};

export function fieldValue(a: Agreement, key: FieldKey) {
  return typeof key === "string" ? a[key] : (a.documents[key[0]][key[1]] ?? "");
}

export function fieldId(key: FieldKey) {
  return typeof key === "string" ? key : key.join("-");
}

export function contractFields(
  locale: Locale,
): Record<Exclude<BlockId, "condition"> | "amounts", ContractField[]> {
  const t = words(locale);
  return {
    renter: [
      { key: [0, "lastName"], label: t("Nom", "اسم العائلة") },
      { key: [0, "firstName"], label: t("Prénom", "الاسم الشخصي") },
      { key: [0, "identity"], label: t("CNIE", "رقم البطاقة الوطنية") },
      {
        key: [0, "issued"],
        label: t("CNIE délivrée le", "تاريخ إصدار البطاقة"),
        type: "date",
      },
      { key: [0, "address"], label: t("Adresse", "العنوان"), fullWidth: true },
      { key: [1, "licence"], label: t("Permis", "رخصة السياقة") },
      {
        key: [1, "issued"],
        label: t("Permis délivré le", "تاريخ إصدار الرخصة"),
        type: "date",
      },
      { key: [0, "city"], label: t("Ville", "المدينة") },
    ],
    vehicle: [
      { key: [2, "brand"], label: t("Marque", "الماركة") },
      { key: [2, "model"], label: t("Modèle", "الطراز") },
      { key: [2, "plate"], label: t("Immatriculation", "رقم التسجيل") },
      { key: [2, "fuel"], label: t("Carburant", "الوقود") },
    ],
    rental: [
      {
        key: "start",
        label: t("Date de départ", "تاريخ التسليم"),
        type: "date",
      },
      {
        key: "startTime",
        label: t("Heure de départ", "وقت التسليم"),
        type: "time",
      },
      { key: "end", label: t("Date de retour", "تاريخ الإرجاع"), type: "date" },
      {
        key: "endTime",
        label: t("Heure de retour", "وقت الإرجاع"),
        type: "time",
      },
    ],
    amounts: [
      { key: "price", label: t("Total (MAD)", "المجموع (درهم)") },
      { key: "deposit", label: t("Caution (MAD)", "الضمان (درهم)") },
    ],
  };
}

export const blank = "……………………";

export const conditionDiagram = "/contract-car.png";
export const conditionNoteGroups = [
  [0, 1, 2],
  [3, 4, 5],
] as const;
