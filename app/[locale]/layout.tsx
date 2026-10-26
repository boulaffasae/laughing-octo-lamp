import { InstallBanner } from "../components/install-banner";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-url";
import "../globals.css";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "../../i18n/routing";

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: "Louma — La location, tout simplement",
  description:
    "Créez vos contrats de location de véhicules au Maroc. Trois documents, un scan intelligent et un PDF prêt à signer.",
  appleWebApp: {
    title: "Louma",
    capable: true,
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const messages = await getMessages();
  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <InstallBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
