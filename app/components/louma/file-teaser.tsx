"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowDownToLine,
  FileSignature,
  FileText,
  Printer,
  Share2,
} from "lucide-react";
import { words } from "@/lib/contract/agreement";
import type { Locale } from "@/i18n/locales";
import { downloadPdf, type PdfFile } from "./pdf-file";

type Action = "download" | "share" | "print";

export function FileTeaser({
  locale,
  title,
  details,
  thumbnail,
  date,
  dateLabel,
  file,
  onOpen,
}: {
  locale: Locale;
  title: string;
  details?: string;
  thumbnail?: string;
  date: string;
  dateLabel: string;
  file: PdfFile;
  onOpen: () => void;
}) {
  const t = words(locale);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const pending = useRef(false);
  const preparedShare = useRef<File>(null);

  function setShareFallback() {
    setMessage(
      t(
        "Téléchargez le PDF pour le joindre à votre message.",
        "نزّل ملف PDF لإرفاقه برسالتك.",
      ),
    );
  }

  async function run(action: Action) {
    if (pending.current) return;
    setMessage("");
    if (action !== "share") preparedShare.current = null;
    // Open synchronously so the browser can associate the new tab with the click.
    const printTab = action === "print" ? window.open("about:blank") : null;
    if (action === "print" && !printTab) {
      setMessage(
        t(
          "Autorisez les fenêtres contextuelles pour imprimer.",
          "اسمح بالنوافذ المنبثقة للطباعة.",
        ),
      );
      return;
    }
    if (printTab) printTab.opener = null;
    pending.current = true;
    setBusy(true);
    try {
      if (action === "share") {
        const fileToShare =
          preparedShare.current ??
          new File([await file.load(AbortSignal.timeout(30_000))], file.name, {
            type: "application/pdf",
          });
        const retrying = Boolean(preparedShare.current);
        preparedShare.current = null;
        const data = { files: [fileToShare] };
        if (navigator.canShare?.(data)) {
          try {
            await navigator.share(data);
          } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError")
              return;
            // PDF preparation may outlast the browser's click activation.
            if (
              !retrying &&
              error instanceof DOMException &&
              error.name === "NotAllowedError"
            ) {
              preparedShare.current = fileToShare;
              setMessage(
                t(
                  "PDF prêt. Cliquez à nouveau sur Partager.",
                  "ملف PDF جاهز. انقر على مشاركة مرة أخرى.",
                ),
              );
              return;
            }
            setShareFallback();
          }
          return;
        }
        setShareFallback();
        return;
      }
      const blob = await file.load(AbortSignal.timeout(30_000));
      if (printTab?.closed) return;
      const url = URL.createObjectURL(blob);
      window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
      if (printTab) printTab.location.replace(url);
      else downloadPdf(url, file.name);
    } catch {
      printTab?.close();
      setMessage(
        t(
          "Impossible d’ouvrir le PDF. Réessayez.",
          "تعذر فتح ملف PDF. حاول مرة أخرى.",
        ),
      );
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  const actions = [
    ["download", ArrowDownToLine, t("Télécharger", "تنزيل")],
    ["share", Share2, t("Partager", "مشاركة")],
    ["print", Printer, t("Imprimer", "طباعة")],
  ] as const;

  return (
    <li className="library-card">
      <button
        type="button"
        className="library-item"
        aria-haspopup="dialog"
        onClick={onOpen}
      >
        <span className="library-poster" aria-hidden>
          {thumbnail ? (
            <>
              <FileText size={24} />
              <Image
                src={thumbnail}
                alt=""
                fill
                unoptimized
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.hidden = true;
                }}
              />
            </>
          ) : (
            <span className="library-poster-paper">
              <FileSignature size={17} />
              <span>{title}</span>
            </span>
          )}
        </span>
        <span className="library-item-copy">
          <time dateTime={date}>{dateLabel}</time>
          <strong>{title}</strong>
          {details && <small>{details}</small>}
        </span>
      </button>
      <div className="library-card-actions" aria-busy={busy}>
        {actions.map(([action, Icon, label]) => (
          <button
            key={action}
            type="button"
            className="icon-button"
            title={label}
            aria-label={label}
            disabled={busy}
            onClick={() => void run(action)}
          >
            <Icon size={17} aria-hidden />
          </button>
        ))}
      </div>
      {message && (
        <p className="library-card-message" role="status">
          {message}
        </p>
      )}
    </li>
  );
}
