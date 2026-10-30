"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  return (
    <html lang="fr">
      <body>
        <h1>Une erreur est survenue.</h1>
        <button onClick={() => retry()}>Réessayer</button>
      </body>
    </html>
  );
}
