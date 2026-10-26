import fr from "./fr.json";
import en from "./en.json";
import darija from "./ary.json";

export const languages = ["FR", "EN", "Darija"] as const;
export type Lang = (typeof languages)[number];
type Dictionary = typeof fr;
export const copy: Record<Lang, Dictionary> = {
  FR: fr,
  EN: en,
  Darija: darija,
};
