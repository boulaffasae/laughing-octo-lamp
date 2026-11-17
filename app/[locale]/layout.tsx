import { siteTitle } from "@/app/components/louma/site";
import { AccountContext } from "@/app/components/louma/account";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/i18n/locales";
import { siteUrl } from "@/lib/site-url";
import "@fontsource-variable/inter";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: siteTitle,
  description:
    "Créez, téléchargez et retrouvez vos contrats de location de voiture.",
  openGraph: { title: siteTitle, siteName: "Louma" },
  twitter: { title: siteTitle },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return (
    <html lang={locale} dir="ltr">
      <body>
        {key ? (
          <ClerkProvider publishableKey={key} localization={frFR}>
            <AccountContext>{children}</AccountContext>
          </ClerkProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
