import type { Metadata } from "next";
import { PrivateLibraryPage } from "@/app/components/louma/private-library-page";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Page() {
  return <PrivateLibraryPage locale="fr" kind="contracts" />;
}
