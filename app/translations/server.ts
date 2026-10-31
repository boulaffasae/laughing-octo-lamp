import { getMessages } from "next-intl/server";
import type fr from "./fr.json";

export async function getCopy(): Promise<typeof fr> {
  return (await getMessages()) as unknown as typeof fr;
}
