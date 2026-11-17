"use client";

import { useRef, useState } from "react";
import { Camera, Upload } from "lucide-react";
import { prepareImage } from "@/lib/contract/prepare-image";
import { words } from "@/lib/contract/agreement";
import { MAX_FILE_BYTES } from "@/lib/upload-policy";
import type { Locale } from "@/i18n/locales";
import {
  LibraryResults,
  PeriodFilter,
  libraryTimeZone,
  useLibraryList,
} from "./library-list";
import { PdfPane } from "./pdf-preview";
import { LibraryModal } from "./library-modal";
import {
  usePreviewRequest,
  type PreviewRequest,
} from "./library-preview-request";
import { fetchPdf } from "./pdf-file";
import { FileTeaser } from "./file-teaser";

type DocumentSummary = { id: string; created_at: string };

export function DocumentLibrary({ locale }: { locale: Locale }) {
  const t = words(locale);
  const list = useLibraryList<"documents", DocumentSummary>("documents");
  const date = new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    dateStyle: "medium",
    timeZone: libraryTimeZone,
  });
  const preview = usePreviewRequest(
    (document: DocumentSummary) => document.id,
    (document, signal) => fetchPdf(`/api/documents/${document.id}`, signal),
  );
  const [selected, setSelected] = useState<{
    document: DocumentSummary;
    request: PreviewRequest<Blob>;
  }>();
  const title = t("Document PDF", "مستند PDF");
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState({
    busy: false,
    error: false,
    message: "",
  });
  const uploadPending = useRef(false);

  async function upload(file: File, photo = false) {
    if (uploadPending.current) return;
    if (
      (!photo && file.type !== "application/pdf") ||
      file.size === 0 ||
      file.size > MAX_FILE_BYTES
    ) {
      setUploadState({
        busy: false,
        error: true,
        message: photo
          ? t(
              "Choisissez une photo de 4 Mo maximum.",
              "اختر صورة بحجم لا يتجاوز 4 ميغابايت.",
            )
          : t(
              "Choisissez un PDF de 4 Mo maximum.",
              "اختر ملف PDF بحجم لا يتجاوز 4 ميغابايت.",
            ),
      });
      return;
    }
    uploadPending.current = true;
    setUploadState({
      busy: true,
      error: false,
      message: t("Import en cours…", "جارٍ الرفع…"),
    });
    try {
      let document = file;
      if (photo) {
        const { src, width, height } = await prepareImage(file, {
          maxSide: 2000,
          output: "image/jpeg",
        });
        const { buildPhotoPdf } = await import("../contract/contract-pdf");
        const blob = await buildPhotoPdf(src, width, height);
        if (blob.size > MAX_FILE_BYTES) throw Error();
        document = new File([blob], "photo.pdf", { type: "application/pdf" });
      }
      const body = new FormData();
      body.set("file", document);
      body.set("kind", "upload");
      const response = await fetch("/api/documents", { method: "POST", body });
      if (!response.ok) throw Error();
      list.refresh(true);
      setUploadState({
        busy: false,
        error: false,
        message: t("PDF importé.", "تم رفع الملف."),
      });
    } catch {
      setUploadState({
        busy: false,
        error: true,
        message: t(
          "Import indisponible. Réessayez.",
          "الرفع غير متاح. حاول مرة أخرى.",
        ),
      });
    } finally {
      uploadPending.current = false;
    }
  }

  function documentFile(document: DocumentSummary) {
    return {
      name: `Document - ${date.format(new Date(document.created_at))}.pdf`,
      load: (signal: AbortSignal) =>
        fetchPdf(`/api/documents/${document.id}`, signal),
    };
  }

  return (
    <main className="library-page">
      <section
        className="library-banner"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files[0];
          if (file) void upload(file);
        }}
      >
        <div className="shell library-banner-inner">
          <h1>{t("Mes contrats", "عقودي")}</h1>
          <div className="library-banner-actions">
            <button
              type="button"
              className="button"
              disabled={uploadState.busy}
              onClick={() => fileInput.current?.click()}
            >
              <Upload size={17} aria-hidden />
              {t("Importer un scan PDF", "استيراد نسخة ممسوحة بصيغة PDF")}
            </button>
            <button
              type="button"
              className="button secondary"
              disabled={uploadState.busy}
              onClick={() => cameraInput.current?.click()}
            >
              <Camera size={17} aria-hidden />
              {t("Photographier le contrat", "تصوير العقد")}
            </button>
            <input
              ref={fileInput}
              type="file"
              hidden
              accept="application/pdf,.pdf"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void upload(file);
              }}
            />
            <input
              ref={cameraInput}
              type="file"
              hidden
              accept="image/png,image/jpeg,image/webp"
              capture="environment"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void upload(file, true);
              }}
            />
          </div>
          {uploadState.message && (
            <p role="status" className={uploadState.error ? "error" : ""}>
              {uploadState.message}
            </p>
          )}
        </div>
      </section>
      <section className="shell library-content">
        <div className="library-heading">
          <PeriodFilter
            locale={locale}
            label={t("Date d’ajout", "تاريخ الإضافة")}
            value={list.period}
            onChange={list.changePeriod}
          />
        </div>
        <LibraryResults
          locale={locale}
          {...list}
          hasItems={list.items.length > 0}
          empty={
            list.period
              ? t(
                  "Aucun PDF sur cette période.",
                  "لا توجد ملفات في هذه الفترة.",
                )
              : t("Aucun PDF pour le moment.", "لا توجد ملفات بعد.")
          }
          onPage={list.changePage}
          onRetry={() => list.refresh()}
        >
          <ul className="library-grid">
            {list.items.map((document) => (
              <FileTeaser
                key={document.id}
                locale={locale}
                title={title}
                thumbnail={`/api/documents/${document.id}/thumbnail`}
                date={document.created_at}
                dateLabel={date.format(new Date(document.created_at))}
                file={documentFile(document)}
                onPreviewIntent={() => preview.warm(document)}
                onOpen={() =>
                  setSelected({ document, request: preview.take(document) })
                }
              />
            ))}
          </ul>
        </LibraryResults>
      </section>
      {selected && (
        <LibraryModal
          title={title}
          closeLabel={t("Fermer", "إغلاق")}
          sidebarLabel={t("Date d’ajout", "تاريخ الإضافة")}
          sidebar={
            <ol className="history-list">
              <li className="library-revision-row library-revision-current">
                <time dateTime={selected.document.created_at}>
                  {date.format(new Date(selected.document.created_at))}
                </time>
              </li>
            </ol>
          }
          onClose={() => {
            selected.request.abort();
            setSelected(undefined);
          }}
        >
          <PdfPane
            locale={locale}
            file={documentFile(selected.document)}
            initialRequest={selected.request}
          />
        </LibraryModal>
      )}
    </main>
  );
}
