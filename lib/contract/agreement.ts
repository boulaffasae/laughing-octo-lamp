import { createEmptyDocuments, type DocumentFields } from "./documents";
export type AgreementLocale = "fr" | "ar";

export type BlockId = "renter" | "vehicle" | "rental" | "condition";
export type Agreement = {
  locale: AgreementLocale;
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
  termsTitles: Record<AgreementLocale, string>;
  labels: Record<string, string>;
  blueFields?: Record<string, string>;
};

export const words = (locale: AgreementLocale) => (fr: string, ar: string) =>
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
    "1. Conducteurs autorisés\nSeuls les conducteurs inscrits au contrat et titulaires d’un permis valide pour le véhicule peuvent conduire. Ils présentent leur permis et une pièce d’identité au départ.",
    "١. السائقون المصرح لهم\nتقتصر القيادة على السائقين المسجلين في العقد والحاملين لرخصة سياقة سارية تخول لهم قيادة السيارة. ويقدمون رخصة السياقة ووثيقة الهوية عند التسليم.",
  ],
  [
    "2. Remise et état des lieux\nLe loueur remet un véhicule en état de circuler, avec ses clés, ses documents et ses accessoires. Les parties relèvent ensemble les défauts apparents, le kilométrage et le niveau de carburant au départ et au retour.",
    "٢. التسليم ومعاينة الحالة\nيسلم المؤجر سيارة صالحة للسير مع مفاتيحها ووثائقها وملحقاتها. ويعاين الطرفان معا العيوب الظاهرة وقراءة العداد ومستوى الوقود عند التسليم والإرجاع.",
  ],
  [
    "3. Utilisation du véhicule\nLe locataire respecte le code de la route. Sauf accord écrit du loueur, le véhicule circule au Maroc sur des voies ouvertes à la circulation. La sous-location, les compétitions et le remorquage sont interdits.",
    "٣. استعمال السيارة\nيلتزم المستأجر بقواعد السير. وتستعمل السيارة داخل المغرب على الطرق المفتوحة للسير إلا بموافقة كتابية من المؤجر. ويمنع الكراء من الباطن واستعمال السيارة في السباقات أو للقطر.",
  ],
  [
    "4. Prix et frais de location\nLe prix figure au recto. Les prestations facultatives, le forfait kilométrique et les tarifs applicables aux dépassements ou retards, le cas échéant, sont communiqués et convenus par écrit avant la signature.",
    "٤. السعر ومصاريف الكراء\nيبين السعر في الصفحة الأولى. ويبلغ المؤجر المستأجر بالخدمات الاختيارية والمسافة المشمولة وتعرفة تجاوزها أو التأخر، عند الاقتضاء، ويتفق الطرفان عليها كتابة قبل التوقيع.",
  ],
  [
    "5. Caution\nSi une caution est prévue au recto, le loueur la restitue après le retour et l’état des lieux. Toute retenue correspond à une somme due, détaillée et justifiée par écrit. Le solde est restitué sans délai injustifié.",
    "٥. مبلغ الضمان\nإذا نصت الصفحة الأولى على مبلغ للضمان، يرده المؤجر بعد إرجاع السيارة ومعاينة حالتها. ويقتصر أي اقتطاع على مبالغ مستحقة يبينها المؤجر ويبررها كتابة، ويرد الرصيد دون تأخير غير مبرر.",
  ],
  [
    "6. Carburant et kilométrage\nLe véhicule est rendu avec le même niveau de carburant qu’au départ, sauf accord écrit. L’éventuel dépassement kilométrique se calcule à partir des relevés de départ et de retour et du forfait convenu.",
    "٦. الوقود والمسافة المقطوعة\nتعاد السيارة بمستوى الوقود نفسه المسجل عند التسليم ما لم يتفق الطرفان كتابة على خلاف ذلك. ويحسب أي تجاوز للمسافة المشمولة بناء على قراءتي العداد والمسافة المتفق عليها.",
  ],
  [
    "7. Assurance et assistance\nLe loueur communique les garanties, exclusions et franchises applicables avant signature. En cas de panne, d’accident ou de vol, le locataire se met en sécurité, contacte les services compétents si nécessaire et prévient le loueur aux coordonnées du contrat.",
    "٧. التأمين والمساعدة\nيطلع المؤجر المستأجر قبل التوقيع على التغطيات والاستثناءات ومبالغ التحمل المطبقة. وعند العطل أو الحادث أو السرقة، يتخذ المستأجر تدابير السلامة ويتصل بالجهات المختصة عند الحاجة ويبلغ المؤجر عبر بيانات الاتصال الواردة في العقد.",
  ],
  [
    "8. Restitution et prolongation\nLe locataire restitue le véhicule, les clés, les documents et les accessoires aux date, heure et lieu convenus. Toute prolongation et son prix doivent être acceptés par écrit avant l’échéance.",
    "٨. الإرجاع والتمديد\nيعيد المستأجر السيارة ومفاتيحها ووثائقها وملحقاتها في التاريخ والوقت والمكان المتفق عليها. ويشترط الاتفاق كتابة على أي تمديد وسعره قبل انتهاء مدة الكراء.",
  ],
  [
    "9. Infractions et péages\nLe locataire règle les amendes, péages et frais de stationnement qui lui incombent pour la période de location. Le loueur transmet les justificatifs de toute somme dont il demande le remboursement.",
    "٩. المخالفات ورسوم المرور\nيؤدي المستأجر الغرامات ورسوم المرور والوقوف التي يتحملها عن مدة الكراء. ويقدم المؤجر ما يثبت أي مبلغ يطلب استرداده.",
  ],
  [
    "10. Réclamations\nLe locataire peut adresser une réclamation au loueur aux coordonnées indiquées au contrat. Les parties peuvent chercher une solution amiable et conservent leurs voies de recours.",
    "١٠. الشكاوى\nيمكن للمستأجر توجيه شكواه إلى المؤجر عبر بيانات الاتصال الواردة في العقد. ويمكن للطرفين السعي إلى حل ودي مع احتفاظهما بحقوقهما في التظلم والتقاضي.",
  ],
] as const;

function previousFooter(locale: AgreementLocale) {
  const t = words(locale);
  return t(
    "Adresse : ……………………\nTél. : ……………… - Fax : ……………… - ICE : ………………\nRaison sociale : ……………… - Capital : ……………… - RC : ………… - TP : ………… - IF : …………\nE-mail : ……………………",
    "العنوان: ……………………\nالهاتف: ……………… - الفاكس: ……………… - المعرّف الموحد للمقاولة: ………………\nاسم الشركة: ……………… - رأس المال: ……………… - السجل التجاري: ………… - الضريبة المهنية: ………… - المعرّف الضريبي: …………\nالبريد الإلكتروني: ……………………",
  );
}

function defaultFooter(locale: AgreementLocale) {
  return words(locale)(
    "Adresse : ……………………\nTél. : ……………… · E-mail : ……………………\nICE : ………………\nPatente : ………… · IF : …………\nRC : …………",
    "العنوان: ……………………\nالهاتف: ……………… · البريد الإلكتروني: ……………………\nالمعرّف الموحد للمقاولة: ………………\nالضريبة المهنية: ………… · المعرّف الضريبي: …………\nالسجل التجاري: …………",
  );
}

export function agencyFooterText(agreement: Agreement) {
  const oldDefault = words(agreement.locale)(
    "Raison sociale : …… - RC : …… - ICE : …… - Adresse : …… - Téléphone : ……",
    "اسم الشركة: …… - السجل التجاري: …… - المعرّف الموحد للمقاولة: …… - العنوان: …… - الهاتف: ……",
  );
  return agreement.footerText === oldDefault ||
    agreement.footerText === previousFooter(agreement.locale)
    ? defaultFooter(agreement.locale)
    : agreement.footerText;
}

export function initialAgreement(locale: AgreementLocale): Agreement {
  const t = words(locale);
  return {
    locale,
    title: t("Contrat de location de véhicule", "عقد كراء السيارة"),
    logo: "",
    color: "#235346",
    agency: "",
    footerText: defaultFooter(locale),
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
  | "blueFields"
>;
export type FieldKey = AgreementField | readonly [number | "blue", string];
type ContractField = {
  key: FieldKey;
  label: string;
  type?: "date" | "time" | "tel";
  fullWidth?: boolean;
  lines?: number;
};

export function fieldValue(a: Agreement, key: FieldKey) {
  if (typeof key === "string") return a[key];
  if (key[0] === "blue") return a.blueFields?.[key[1]] ?? "";
  const document = a.documents[key[0]];
  if (key[0] === 0 && key[1] === "address")
    return [document.address, document.city].filter(Boolean).join("\n");
  return document[key[1]] ?? "";
}

export function fieldId(key: FieldKey) {
  return typeof key === "string" ? key : key.join("-");
}

export function contractFields(
  locale: AgreementLocale,
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
      {
        key: [0, "address"],
        label: t("Adresse", "العنوان"),
        fullWidth: true,
        lines: 2,
      },
      {
        key: ["blue", "phone"],
        label: t("Téléphone mobile", "الهاتف المحمول"),
        type: "tel",
      },
      { key: [1, "licence"], label: t("Permis", "رخصة السياقة") },
      {
        key: [1, "issued"],
        label: t("Permis délivré le", "تاريخ إصدار الرخصة"),
        type: "date",
      },
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

export function blueContractFields(locale: AgreementLocale) {
  const t = words(locale);
  const field = (
    key: string,
    fr: string,
    ar: string,
    type?: "date" | "time",
  ): ContractField => ({
    key: ["blue", key],
    label: t(fr, ar),
    type,
  });
  const base = contractFields(locale);
  return {
    ...base,
    reference: field("reference", "N° de contrat", "رقم العقد"),
    renter: [
      ...base.renter.slice(0, 2),
      field("nationality", "Nationalité", "الجنسية"),
      field("birthDate", "Date de naissance", "تاريخ الميلاد", "date"),
      field("profession", "Profession", "المهنة"),
      field("passport", "N° de passeport", "رقم جواز السفر"),
      ...base.renter.slice(2),
      field(
        "licencePlace",
        "Lieu de délivrance du permis",
        "مكان إصدار الرخصة",
      ),
      field("otherAddress", "Autre adresse", "عنوان آخر"),
    ],
    driver: [
      field("driverName", "Nom et prénom", "الاسم الكامل"),
      field("driverLicence", "N° de permis", "رقم رخصة السياقة"),
      field(
        "driverLicenceDate",
        "Permis délivré le",
        "تاريخ إصدار الرخصة",
        "date",
      ),
      field("driverLicencePlace", "Lieu de délivrance", "مكان إصدار الرخصة"),
      field("driverIdentity", "CNIE", "رقم البطاقة الوطنية"),
    ],
    rental: [
      ...base.rental,
      field("extension", "Prolongation", "التمديد"),
      field("startMileage", "Kilométrage de départ", "عداد التسليم"),
      field("endMileage", "Kilométrage de retour", "عداد الإرجاع"),
      field("days", "Nombre de jours", "عدد الأيام"),
    ],
    amounts: [
      ...base.amounts,
      field("payment", "Mode de règlement", "طريقة الدفع"),
      field("balance", "Reste à payer (MAD)", "المتبقي (درهم)"),
    ],
    inspection: [
      field("fuelLevel", "Niveau de carburant", "مستوى الوقود"),
      field("wash", "Lavage", "الغسل"),
    ],
  };
}

export function blueDocumentChecklist(locale: AgreementLocale) {
  const t = words(locale);
  return [
    { key: "registration", label: t("Carte grise", "البطاقة الرمادية") },
    { key: "insurance", label: t("Assurance", "التأمين") },
    { key: "taxSticker", label: t("Vignette", "الضريبة السنوية") },
    {
      key: "technicalInspection",
      label: t("Visite technique", "الفحص التقني"),
    },
    { key: "authorization", label: t("Autorisation", "الترخيص") },
    { key: "contractCopy", label: t("Contrat", "العقد") },
  ];
}

export const addressMaxLength = 360;

export const blank = "……………………";

export const conditionDiagram = "/contract-car.png";
export const conditionNoteGroups = [
  [0, 1, 2],
  [3, 4, 5],
] as const;
