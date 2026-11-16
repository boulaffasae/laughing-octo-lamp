"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { words } from "@/lib/contract/agreement";
import type { Locale } from "@/i18n/locales";
import { PreviewSkeleton } from "./library-skeleton";

import type { PdfFile } from "./pdf-file";

import type { PreviewRequest } from "./library-preview-request";

export function PdfPane({
  locale,
  file,
  initialRequest,
}: {
  locale: Locale;
  file: PdfFile;
  initialRequest?: PreviewRequest<Blob>;
}) {
  const t = words(locale);
  const [loaded, setLoaded] = useState<string>();
  const [frameReady, setFrameReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const load = useEffectEvent((signal: AbortSignal) => file.load(signal));

  useEffect(() => {
    const request = new AbortController();
    let url: string | undefined;
    (attempt === 0 && initialRequest
      ? initialRequest.result
      : load(request.signal)
    )
      .then((blob) => {
        if (request.signal.aborted) return;
        url = URL.createObjectURL(blob);
        setLoaded(url);
      })
      .catch(() => {
        if (!request.signal.aborted) setFailed(true);
      });
    return () => {
      request.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [attempt, initialRequest]);

  return (
    <div className="library-preview-main">
      {loaded && (
        <iframe
          className="library-pdf-frame"
          style={frameReady ? undefined : { visibility: "hidden" }}
          src={loaded}
          title={file.name}
          onLoad={() => setFrameReady(true)}
        />
      )}
      {failed ? (
        <div className="library-empty">
          <p role="alert">
            {t("Impossible de charger le PDF.", "تعذر تحميل ملف PDF.")}
          </p>
          <button
            type="button"
            className="button secondary"
            onClick={() => {
              setFailed(false);
              setAttempt((value) => value + 1);
            }}
          >
            {t("Réessayer", "إعادة المحاولة")}
          </button>
        </div>
      ) : (
        !frameReady && (
          <PreviewSkeleton
            label={t("Chargement du PDF…", "جارٍ تحميل ملف PDF…")}
          />
        )
      )}
    </div>
  );
}
