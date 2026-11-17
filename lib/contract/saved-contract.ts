import type { Agreement } from "./agreement";

export type SavedDraft = {
  id: string;
  draft: Agreement;
  edit_version: number;
  historical?: { revision: number; fingerprint: string };
};

export type ContractSummary = {
  id: string;
  title: string;
  renter: string;
  plate: string | null;
  updated_at: string;
};

export type ContractRevision = {
  revision: number;
  created_at: string;
};

export const uuidPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;
