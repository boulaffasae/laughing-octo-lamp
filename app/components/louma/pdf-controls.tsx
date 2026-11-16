"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowDownToLine, Eye, Printer, Share2, X } from "lucide-react";
import { words } from "@/lib/contract/agreement";
import type { Locale } from "@/i18n/locales";
import { downloadPdf } from "./pdf-file";

export function PdfControls({
  locale,
  name,
  href,
  load,
  preview = false,
}: {
  locale: Locale;
  name: string;
  href?: string;
  load: () => Promise<Blob>;
  preview?: boolean;
}) {
  const t = words(locale);
  const titleId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const pdf = useRef<Promise<Blob>>(undefined);
  const urls = useRef(new Set<string>());
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [view, setView] = useState<{
    url: string;
    file: File;
    mode: "view" | "share" | "print";
  }>();

  useEffect(() => {
    const allocated = urls.current;
    return () => {
      allocated.forEach((url) => URL.revokeObjectURL(url));
      allocated.clear();
    };
  }, []);

  const labels = {
    view: t("Voir le PDF", "عرض PDF"),
    download: t("Télécharger le PDF", "تنزيل PDF"),
    share: t("Partager le PDF", "مشاركة PDF"),
    print: t("Imprimer le PDF", "طباعة PDF"),
  };

  async function open(mode: keyof typeof labels) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setMessage("");
    // A PDF tab has the browser's own print controls. Open it before loading
    // the PDF so browsers keep the original click's popup permission.
    const tab = mode === "print" ? window.open("about:blank", "_blank") : null;
    if (tab) tab.opener = null;
    try {
      pdf.current ??= load().catch((error: unknown) => {
        pdf.current = undefined;
        throw error;
      });
      const blob = await pdf.current;
      if (!dialog.current) {
        tab?.close();
        return;
      }
      const url = URL.createObjectURL(blob);
      if (mode === "download" || tab) {
        if (tab) tab.location.replace(url);
        else downloadPdf(url, name);
        // Keep URLs alive long enough for the download or separate viewer.
        window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
        return;
      }
      urls.current.add(url);
      setView({
        url,
        file: new File([blob], name, { type: "application/pdf" }),
        mode,
      });
      dialog.current.showModal();
    } catch {
      tab?.close();
      setMessage(
        t(
          "Impossible de préparer le PDF. Réessayez.",
          "تعذر تجهيز ملف PDF. حاول مرة أخرى.",
        ),
      );
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  function close() {
    if (view) {
      urls.current.delete(view.url);
      // Let an opened preview tab or a download finish reading the URL.
      window.setTimeout(() => URL.revokeObjectURL(view.url), 120_000);
    }
    setView(undefined);
  }

  async function share() {
    if (!view) return;
    const data = { files: [view.file] };
    try {
      await navigator.share(data);
      dialog.current?.close();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessage(
        t(
          "Le partage a échoué. Vous pouvez télécharger le PDF.",
          "تعذرت المشاركة. يمكنك تنزيل ملف PDF.",
        ),
      );
    }
  }

  return (
    <div className="pdf-actions">
      <div className="pdf-tools" aria-busy={busy}>
        {href ? (
          <a
            className="icon-button"
            href={href}
            download
            aria-label={labels.download}
            title={labels.download}
          >
            <ArrowDownToLine size={18} aria-hidden />
          </a>
        ) : (
          <button
            className="icon-button"
            type="button"
            disabled={busy}
            onClick={() => void open("download")}
            aria-label={labels.download}
            title={labels.download}
          >
            <ArrowDownToLine size={18} aria-hidden />
          </button>
        )}
        {preview && (
          <button
            className="icon-button"
            type="button"
            disabled={busy}
            onClick={() => void open("view")}
            aria-label={labels.view}
            title={labels.view}
          >
            <Eye size={18} aria-hidden />
          </button>
        )}
        <button
          className="icon-button"
          type="button"
          disabled={busy}
          onClick={() => void open("share")}
          aria-label={labels.share}
          title={labels.share}
        >
          <Share2 size={18} aria-hidden />
        </button>
        <button
          className="icon-button"
          type="button"
          disabled={busy}
          onClick={() => void open("print")}
          aria-label={labels.print}
          title={labels.print}
        >
          <Printer size={18} aria-hidden />
        </button>
      </div>
      {message && !view && (
        <p className="error" role="alert">
          {message}
        </p>
      )}
      <dialog
        ref={dialog}
        className="workspace-dialog pdf-dialog"
        aria-labelledby={titleId}
        onClose={close}
      >
        {view && (
          <>
            <div className="dialog-header">
              <h2 id={titleId}>{labels[view.mode]}</h2>
              <button
                type="button"
                className="icon-button"
                aria-label={t("Fermer", "إغلاق")}
                onClick={() => dialog.current?.close()}
              >
                <X size={18} aria-hidden />
              </button>
            </div>
            {view.mode === "view" && (
              <iframe src={view.url} title={labels.view} />
            )}
            {view.mode === "share" &&
              !navigator.canShare?.({ files: [view.file] }) && (
                <p>
                  {t(
                    "Téléchargez le PDF pour le joindre à votre message.",
                    "نزّل ملف PDF لإرفاقه برسالتك.",
                  )}
                </p>
              )}
            {view.mode === "print" && (
              <p>
                {t(
                  "Ouvrez le PDF, puis utilisez l’option Imprimer du navigateur.",
                  "افتح ملف PDF ثم استخدم خيار الطباعة في المتصفح.",
                )}
              </p>
            )}
            <div className="dialog-actions">
              {view.mode === "share" &&
                navigator.canShare?.({ files: [view.file] }) && (
                  <button
                    className="button"
                    type="button"
                    onClick={() => void share()}
                  >
                    {labels.share}
                  </button>
                )}
              {view.mode !== "share" && (
                <a
                  className="button secondary"
                  href={view.url}
                  target="_blank"
                  rel="noopener"
                >
                  {t(
                    "Ouvrir dans un nouvel onglet",
                    "فتح في علامة تبويب جديدة",
                  )}
                </a>
              )}
              <a className="button secondary" href={view.url} download={name}>
                {labels.download}
              </a>
            </div>
            {message && (
              <p className="error" role="alert">
                {message}
              </p>
            )}
          </>
        )}
      </dialog>
    </div>
  );
}
