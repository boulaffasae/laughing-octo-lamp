"use client";

import { useMessages } from "next-intl";
import type fr from "./fr.json";

// Preserve typed lists and structured form labels in the existing dictionaries.
export function useCopy(): typeof fr {
  return useMessages() as unknown as typeof fr;
}
