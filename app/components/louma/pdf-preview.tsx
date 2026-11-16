"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { words } from "@/lib/contract/agreement";
import type { Locale } from "@/i18n/locales";
import { LibraryModal } from "./library-modal";

import type { PdfFile } from "./pdf-file";

export function PdfPreview({
  locale,
  title,
  file,
  fileKey,
  onClose,
}: {
  locale: Locale;
  title: string;
  file: PdfFile;
  fileKey: string | number;
  onClose: () => void;
}) {
  const t = words(locale);
  return (
    <LibraryModal
      title={title}
      closeLabel={t("Fermer", "إغلاق")}
      onClose={onClose}
    >
      <PdfPane key={fileKey} locale={locale} file={file} />
    </LibraryModal>
  );
}

export function PdfPane({ locale, file }: { locale: Locale; file: PdfFile }) {
  const t = words(locale);
  const [loaded, setLoaded] = useState<string>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const load = useEffectEvent((signal: AbortSignal) => file.load(signal));

  useEffect(() => {
    const request = new AbortController();
    let url: string | undefined;
    load(request.signal)
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
  }, [attempt]);

  return (
    <div className="library-preview-main">
      {loaded ? (
        <iframe className="library-pdf-frame" src={loaded} title={file.name} />
      ) : failed ? (
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
        <div className="library-empty" role="status">
          {t("Chargement du PDF…", "جارٍ تحميل ملف PDF…")}
        </div>
      )}
    </div>
  );
}
