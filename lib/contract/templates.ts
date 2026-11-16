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

export const contractTemplates: readonly Template[] = [
  {
    id: "classic",
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
  return (
    contractTemplates.find(
      (template) => template.color === color.toLowerCase(),
    ) ?? contractTemplates[0]
  );
}
