"use client";

import { useEffect, useEffectEvent, useState, type ReactNode } from "react";
import { ArrowDownToLine, Printer, Share2 } from "lucide-react";
import { words } from "@/lib/contract/agreement";
import type { Locale } from "@/i18n/locales";
import { LibraryModal } from "./library-modal";

type PreviewFile = {
  name: string;
  load: (signal: AbortSignal) => Promise<Blob>;
};

export function PdfPreview({
  locale,
  title,
  file,
  fileKey,
  sidebar,
  onClose,
}: {
  locale: Locale;
  title: string;
  file: PreviewFile;
  fileKey: string | number;
  sidebar?: ReactNode;
  onClose: () => void;
}) {
  const t = words(locale);
  return (
    <LibraryModal
      title={title}
      closeLabel={t("Fermer", "إغلاق")}
      onClose={onClose}
    >
      <div
        className={
          sidebar
            ? "library-preview library-preview-with-sidebar"
            : "library-preview"
        }
      >
        <PdfPane key={fileKey} locale={locale} file={file} />
        {sidebar && (
          <aside className="library-preview-sidebar">{sidebar}</aside>
        )}
      </div>
    </LibraryModal>
  );
}

function PdfPane({ locale, file }: { locale: Locale; file: PreviewFile }) {
  const t = words(locale);
  const [loaded, setLoaded] = useState<{ blob: Blob; url: string }>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [message, setMessage] = useState("");
  const load = useEffectEvent((signal: AbortSignal) => file.load(signal));

  useEffect(() => {
    const request = new AbortController();
    let url: string | undefined;
    load(request.signal)
      .then((blob) => {
        if (request.signal.aborted) return;
        url = URL.createObjectURL(blob);
        setLoaded({ blob, url });
      })
      .catch(() => {
        if (!request.signal.aborted) setFailed(true);
      });
    return () => {
      request.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [attempt]);

  async function share() {
    if (!loaded) return;
    setMessage("");
    const data = {
      files: [new File([loaded.blob], file.name, { type: "application/pdf" })],
    };
    try {
      if (navigator.canShare?.(data)) {
        await navigator.share(data);
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
    setMessage(
      t(
        "Téléchargez le PDF pour le joindre à votre message.",
        "نزّل ملف PDF لإرفاقه برسالتك.",
      ),
    );
  }

  function print() {
    if (!loaded) return;
    setMessage("");
    const tab = window.open("about:blank", "_blank");
    if (!tab) {
      setMessage(
        t(
          "Autorisez les fenêtres contextuelles pour ouvrir le PDF à imprimer.",
          "اسمح بالنوافذ المنبثقة لفتح ملف PDF وطباعته.",
        ),
      );
      return;
    }
    tab.opener = null;
    // Decouple the print tab's URL from the preview, which can close or switch versions.
    const url = URL.createObjectURL(loaded.blob);
    tab.location.replace(url);
    window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
  }

  const downloadLabel = t("Télécharger", "تنزيل");
  return (
    <div className="library-preview-main">
      <div className="pdf-tools">
        {loaded ? (
          <a
            className="button secondary"
            href={loaded.url}
            download={file.name}
          >
            <ArrowDownToLine size={16} aria-hidden />
            {downloadLabel}
          </a>
        ) : (
          <button type="button" className="button secondary" disabled>
            <ArrowDownToLine size={16} aria-hidden />
            {downloadLabel}
          </button>
        )}
        <button
          type="button"
          className="button secondary"
          disabled={!loaded}
          onClick={() => void share()}
        >
          <Share2 size={16} aria-hidden />
          {t("Partager", "مشاركة")}
        </button>
        <button
          type="button"
          className="button secondary"
          disabled={!loaded}
          onClick={print}
        >
          <Printer size={16} aria-hidden />
          {t("Imprimer", "طباعة")}
        </button>
      </div>
      {message && <p role="status">{message}</p>}
      {loaded ? (
        <iframe
          className="library-pdf-frame"
          src={loaded.url}
          title={file.name}
        />
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
