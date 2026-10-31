import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export async function SiteShell({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"}>
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
