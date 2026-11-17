import type { MetadataRoute } from "next";
import {
  contractTemplatePath,
  contractTemplates,
} from "@/lib/contract/templates";
import { absoluteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", ...contractTemplates.map(contractTemplatePath)].flatMap(
    (path) => {
      const url = absoluteUrl(path);
      return url ? [{ url }] : [];
    },
  );
}
