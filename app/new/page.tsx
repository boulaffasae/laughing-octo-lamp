import { redirect } from "next/navigation";
import {
  contractTemplatePath,
  contractTemplates,
} from "@/lib/contract/templates";

export const instant = false;

export default function Page() {
  redirect(contractTemplatePath(contractTemplates[0]));
}
