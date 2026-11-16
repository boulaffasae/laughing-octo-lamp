"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Link, Tooltip } from "@heroui/react";
import { LibraryModal } from "./library-modal";
import { ArrowDownToLine, Eye, Printer, Share2 } from "lucide-react";
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
  const mounted = useRef(false);
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
    mounted.current = true;
    const allocated = urls.current;
    return () => {
      mounted.current = false;
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
      if (!mounted.current) {
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
      close();
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

  const canShare =
    view?.mode === "share" && navigator.canShare?.({ files: [view.file] });
  const icons = {
    download: ArrowDownToLine,
    view: Eye,
    share: Share2,
    print: Printer,
  };
  const modes = preview
    ? (["download", "view", "share", "print"] as const)
    : (["download", "share", "print"] as const);

  return (
    <div className="pdf-actions">
      <div className="pdf-tools" aria-busy={busy}>
        {modes.map((mode) => {
          const Icon = icons[mode];
          const control =
            mode === "download" && href ? (
              <Link
                className="library-icon-link"
                href={href}
                download
                aria-label={labels[mode]}
              >
                <Icon size={18} aria-hidden />
              </Link>
            ) : (
              <Button
                isIconOnly
                size="sm"
                variant="outline"
                isDisabled={busy}
                aria-label={labels[mode]}
                onPress={() => void open(mode)}
              >
                <Icon size={18} aria-hidden />
              </Button>
            );
          return (
            <Tooltip key={mode}>
              {control}
              <Tooltip.Content>{labels[mode]}</Tooltip.Content>
            </Tooltip>
          );
        })}
      </div>
      {message && !view && (
        <p className="error" role="alert">
          {message}
        </p>
      )}
      <LibraryModal
        title={labels[view?.mode ?? "view"]}
        open={Boolean(view)}
        onClose={close}
        wide={view?.mode === "view"}
        actions={
          view && (
            <>
              {canShare && (
                <Button onPress={() => void share()}>{labels.share}</Button>
              )}
              {view.mode !== "share" && (
                <Link href={view.url} target="_blank" rel="noopener">
                  {t(
                    "Ouvrir dans un nouvel onglet",
                    "فتح في علامة تبويب جديدة",
                  )}
                </Link>
              )}
              <Link href={view.url} download={name}>
                {labels.download}
              </Link>
            </>
          )
        }
      >
        {view?.mode === "view" && (
          <iframe
            className="library-pdf-frame"
            src={view.url}
            title={labels.view}
          />
        )}
        {view?.mode === "share" && !canShare && (
          <p>
            {t(
              "Téléchargez le PDF pour le joindre à votre message.",
              "نزّل ملف PDF لإرفاقه برسالتك.",
            )}
          </p>
        )}
        {view?.mode === "print" && (
          <p>
            {t(
              "Ouvrez le PDF, puis utilisez l’option Imprimer du navigateur.",
              "افتح ملف PDF ثم استخدم خيار الطباعة في المتصفح.",
            )}
          </p>
        )}
        {message && (
          <p className="error" role="alert">
            {message}
          </p>
        )}
      </LibraryModal>
    </div>
  );
}
