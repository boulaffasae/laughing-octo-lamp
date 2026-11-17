import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = absoluteUrl("/fr");
  return url ? [{ url }] : [];
}
