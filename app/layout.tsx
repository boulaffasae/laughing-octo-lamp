import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Louma — La location, tout simplement",
  description:
    "Créez vos contrats de location de véhicules au Maroc. Trois documents, un scan intelligent et un PDF prêt à signer.",
  appleWebApp: {
    title: "Louma",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
