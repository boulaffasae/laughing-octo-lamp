import { siteTitle } from "@/app/components/louma/site";
import { AccountContext } from "@/app/components/louma/account";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-url";
import "@fontsource-variable/inter";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: siteTitle,
  description:
    "Créez, téléchargez et retrouvez vos contrats de location de voiture.",
  openGraph: { title: siteTitle, siteName: "Louma" },
  twitter: { title: siteTitle },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return (
    <html lang="fr" dir="ltr">
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
