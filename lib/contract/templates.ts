import type { BlockId } from "./agreement";

type FormBlock = Exclude<BlockId, "condition">;
type Column = { blocks: readonly FormBlock[]; weight: number };
type Template = {
  id: string;
  color: string;
  fr: string;
  ar: string;
  rows: readonly (readonly Column[])[];
  wideFields?: readonly FormBlock[];
};

export type PublicTemplate = Template & { slug: string; description: string };

export const contractTemplates: readonly [PublicTemplate, ...PublicTemplate[]] =
  [
    {
      id: "classic",
      slug: "modele-contrat-location-voiture-vert-classique",
      description:
        "Une mise en page en deux colonnes pour renseigner le locataire, le véhicule et la période de location.",
      color: "#235346",
      fr: "Vert · Classique",
      ar: "أخضر · كلاسيكي",
      rows: [
        [
          { blocks: ["renter"], weight: 1 },
          { blocks: ["vehicle", "rental"], weight: 1 },
        ],
      ],
    },
    {
      id: "blue",
      slug: "modele-contrat-location-voiture-bleu-carnet-de-location",
      description:
        "Un format carnet avec une liste de pièces à vérifier et des champs dédiés au conducteur.",
      color: "#254e9a",
      fr: "Bleu · Carnet de location",
      ar: "أزرق · دفتر الكراء",
      rows: [
        [
          { blocks: ["renter"], weight: 5 },
          { blocks: ["vehicle", "rental"], weight: 4 },
        ],
      ],
    },
    {
      id: "banded",
      slug: "modele-contrat-location-voiture-ocre-bandeau",
      description:
        "Un bandeau présente les informations du véhicule au-dessus des renseignements sur le locataire et la location.",
      color: "#8a5418",
      fr: "Ocre · Bandeau",
      ar: "مغرة · شريط علوي",
      rows: [
        [{ blocks: ["vehicle"], weight: 1 }],
        [
          { blocks: ["renter"], weight: 3 },
          { blocks: ["rental"], weight: 2 },
        ],
      ],
      wideFields: ["vehicle"],
    },
    {
      id: "tabular",
      slug: "modele-contrat-location-voiture-aubergine-tableau",
      description:
        "Les informations sur le véhicule et la location sont présentées côte à côte, au-dessus des renseignements sur le locataire.",
      color: "#652d56",
      fr: "Aubergine · Tableau",
      ar: "أرجواني داكن · جدول",
      rows: [
        [
          { blocks: ["vehicle"], weight: 1 },
          { blocks: ["rental"], weight: 1 },
        ],
        [{ blocks: ["renter"], weight: 1 }],
      ],
      wideFields: ["renter"],
    },
  ];

// Keep resolving colors stored by drafts created with earlier versions.
const legacyTemplates: readonly Template[] = [
  {
    id: "panels",
    color: "#543b75",
    fr: "Violet · Encadrés",
    ar: "بنفسجي · إطارات",
    rows: [
      [
        { blocks: ["vehicle", "rental"], weight: 2 },
        { blocks: ["renter"], weight: 3 },
      ],
    ],
  },
  {
    id: "signature",
    color: "#903d43",
    fr: "Bordeaux · Signature",
    ar: "عنابي · توقيع",
    rows: [
      [{ blocks: ["renter"], weight: 1 }],
      [
        { blocks: ["vehicle"], weight: 1 },
        { blocks: ["rental"], weight: 1 },
      ],
    ],
  },
  {
    id: "register",
    color: "#25323e",
    fr: "Ardoise · Registre",
    ar: "رمادي داكن · سجل",
    rows: [
      [{ blocks: ["vehicle"], weight: 1 }],
      [{ blocks: ["rental"], weight: 1 }],
      [{ blocks: ["renter"], weight: 1 }],
    ],
    wideFields: ["vehicle", "rental", "renter"],
  },
];

export function templateForColor(color: string) {
  const normalizedColor = color.toLowerCase();
  return (
    contractTemplates.find((template) => template.color === normalizedColor) ??
    legacyTemplates.find((template) => template.color === normalizedColor) ??
    contractTemplates[0]
  );
}

export function publicContractTemplate(id: string) {
  const template = contractTemplates.find((entry) => entry.id === id);
  if (!template) throw new Error(`Unknown public contract template: ${id}`);
  return template;
}

export function contractTemplatePath(template: PublicTemplate) {
  return `/${template.slug}`;
}
