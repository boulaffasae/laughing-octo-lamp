import { ALLOWED_UPLOAD_TYPES, MAX_FILE_BYTES } from "../upload-policy.ts";

export type DocumentFields = Record<string, string>;
export type ScanPhase = "upload" | "scanning" | "review";
export interface RentalDetails {
  agency: string;
  start: string;
  end: string;
}

export const DOCUMENT_FIELDS = [
  ["name", "identity", "issued", "address"],
  ["licence", "issued"],
  ["brand", "plate", "fuel"],
];

export const SAMPLE_DOCUMENTS: DocumentFields[] = [
  {
    name: "Amine El Mansouri",
    identity: "BK123456",
    issued: "2020-06-15",
    address: "24, avenue Hassan II, Casablanca",
  },
  { licence: "123456/06", issued: "2020-06-15" },
  { brand: "Dacia Sandero", plate: "12345-A-6", fuel: "Diesel" },
];

export function createEmptyDocuments(): DocumentFields[] {
  return DOCUMENT_FIELDS.map((keys) =>
    Object.fromEntries(keys.map((key) => [key, ""])),
  );
}

export function isSupportedDocument(file: File) {
  return (
    ALLOWED_UPLOAD_TYPES.some((type) => type === file.type) &&
    file.size > 0 &&
    file.size <= MAX_FILE_BYTES
  );
}

export function isValidRental(rental: RentalDetails) {
  return (
    Object.values(rental).every(Boolean) &&
    Date.parse(rental.end) > Date.parse(rental.start)
  );
}
