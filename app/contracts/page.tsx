import { Suspense } from "react";
import type { Metadata } from "next";
import { PrivateLibraryPage } from "@/app/components/louma/private-library-page";
import { LibraryPageSkeleton } from "@/app/components/louma/library-skeleton";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Page() {
  const locale = "fr";
  return (
    <Suspense
      fallback={<LibraryPageSkeleton locale={locale} kind="contracts" />}
    >
      <PrivateLibraryPage locale={locale} kind="contracts" />
    </Suspense>
  );
}
