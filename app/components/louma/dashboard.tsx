"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Camera, FileText, Upload, X } from "lucide-react";
import { DayPicker, type DateRange } from "react-day-picker";
import { arMA, fr } from "react-day-picker/locale";
import "react-day-picker/style.css";
import { prepareImage } from "@/lib/contract/prepare-image";
import { words } from "@/lib/contract/agreement";
import { MAX_FILE_BYTES } from "@/lib/upload-policy";
import type { Locale } from "@/i18n/locales";
import { ContractLibrary } from "./contract-library";
import { PdfControls } from "./pdf-controls";

type DocumentSummary = { id: string; created_at: string };
type Result = { documents: DocumentSummary[]; more: boolean };
const empty: Result = { documents: [], more: false };

function dateKey(date: Date) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, i) => String(part).padStart(i ? 2 : 4, "0"))
    .join("-");
}

export function Dashboard({ locale }: { locale: Locale }) {
  const t = words(locale);
  const arabic = locale === "ar";
  const date = new Intl.DateTimeFormat(arabic ? "ar-MA" : "fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Africa/Casablanca",
  });
  const filterDate = new Intl.DateTimeFormat(arabic ? "ar-MA" : "fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const calendar = useRef<HTMLDialogElement>(null);
  const [filter, setFilter] = useState<DateRange>();
  const [selected, setSelected] = useState<DateRange>();
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [result, setResult] = useState<Result>(empty);
  const [loadState, setLoadState] = useState({ loading: true, error: "" });
  const [uploadState, setUploadState] = useState({
    busy: false,
    error: false,
    message: "",
  });
  const uploadPending = useRef(false);

  useEffect(() => {
    const signal = new AbortController();
    const params = new URLSearchParams({ page: String(page) });
    if (filter?.from) params.set("start", dateKey(filter.from));
    if (filter?.to) params.set("end", dateKey(filter.to));
    fetch(`/api/documents?${params}`, { signal: signal.signal })
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw Error(body?.error ?? "storage");
        }
        const data = (await response.json()) as Result;
        if (signal.signal.aborted) return;
        setResult(data);
        setLoadState({ loading: false, error: "" });
      })
      .catch((error: unknown) => {
        if (signal.signal.aborted) return;
        setResult(empty);
        setLoadState({
          loading: false,
          error: error instanceof Error ? error.message : "storage",
        });
      });
    return () => signal.abort();
  }, [filter, page, reload]);

  function refresh() {
    setLoadState({ loading: true, error: "" });
    setPage(1);
    setReload((n) => n + 1);
  }

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
      setFilter(undefined);
      refresh();
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

  const changePage = (next: number) => {
    setLoadState({ loading: true, error: "" });
    setPage(next);
  };
  const filterLabel =
    filter?.from && filter.to
      ? filterDate.formatRange(filter.from, filter.to)
      : t("Choisir une période", "اختر فترة");

  return (
    <main>
      <section
        className="upload-hero"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files[0];
          if (file) void upload(file);
        }}
      >
        <span className="upload-symbol">
          <Upload size={28} aria-hidden />
        </span>
        <h1>{t("Importez vos PDF", "ارفع ملفات PDF")}</h1>
        <div className="storage-sources">
          <label className="button upload-control">
            {t("Importer un PDF", "رفع ملف PDF")}
            <input
              type="file"
              accept="application/pdf,.pdf"
              disabled={uploadState.busy}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void upload(file);
              }}
            />
          </label>
          <label className="button secondary upload-control">
            <Camera size={17} aria-hidden />
            {t("Photographier en PDF", "التقاط صورة كملف PDF")}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              capture="environment"
              disabled={uploadState.busy}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void upload(file, true);
              }}
            />
          </label>
        </div>
        <p
          className={uploadState.error ? "error status" : "status"}
          aria-live="polite"
        >
          {uploadState.message}
        </p>
      </section>
      <section className="shell files">
        <h2>{t("Mon espace", "مساحتي")}</h2>
        <ContractLibrary locale={locale} />
        <div className="files-heading">
          <h3>{t("Documents PDF", "مستندات PDF")}</h3>
          <button
            className="date-filter"
            type="button"
            aria-haspopup="dialog"
            onClick={() => {
              setSelected(filter);
              calendar.current?.showModal();
            }}
          >
            <CalendarDays size={20} aria-hidden />
            <span>{filterLabel}</span>
          </button>
        </div>
        <dialog
          ref={calendar}
          className="calendar"
          aria-labelledby="calendar-title"
        >
          <div className="calendar-header">
            <h3 id="calendar-title">{t("Date d’ajout", "تاريخ الإضافة")}</h3>
            <button
              className="icon-button"
              type="button"
              aria-label={t("Fermer", "إغلاق")}
              onClick={() => calendar.current?.close()}
            >
              <X size={18} />
            </button>
          </div>
          <DayPicker
            mode="range"
            locale={arabic ? arMA : fr}
            dir={arabic ? "rtl" : "ltr"}
            selected={selected}
            onSelect={setSelected}
            resetOnSelect
            defaultMonth={filter?.from}
            numberOfMonths={2}
            disabled={{ after: new Date() }}
            autoFocus
          />
          <button
            className="button"
            type="button"
            onClick={() => {
              const range = selected?.from
                ? { from: selected.from, to: selected.to ?? selected.from }
                : undefined;
              setFilter(range);
              refresh();
              calendar.current?.close();
            }}
          >
            {t("Appliquer", "تطبيق")}
          </button>
        </dialog>
        {loadState.loading ? (
          <div role="status">
            <span className="sr-only">{t("Chargement…", "جارٍ التحميل…")}</span>
            <ul className="file-grid file-skeletons" aria-hidden="true">
              {Array.from({ length: 3 }, (_, index) => (
                <li className="file-card" key={index}>
                  <div className="file-thumb">
                    <div className="paper" />
                  </div>
                  <div className="file-meta">
                    <span />
                    <span />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : loadState.error ? (
          <div className="files-empty" role="status">
            <p>
              {loadState.error === "configuration"
                ? t(
                    "Le stockage privé n’est pas encore configuré.",
                    "التخزين الخاص غير مهيأ بعد.",
                  )
                : t("Impossible de charger les PDF.", "تعذر تحميل الملفات.")}
            </p>
            <button
              className="button secondary"
              type="button"
              onClick={refresh}
            >
              {t("Réessayer", "إعادة المحاولة")}
            </button>
          </div>
        ) : result.documents.length === 0 ? (
          <div className="files-empty">
            <FileText size={32} aria-hidden />
            <p>
              {filter
                ? t(
                    "Aucun PDF sur cette période.",
                    "لا توجد ملفات في هذه الفترة.",
                  )
                : t("Aucun PDF pour le moment.", "لا توجد ملفات بعد.")}
            </p>
          </div>
        ) : (
          <ul className="file-grid">
            {result.documents.map(({ id, created_at }) => (
              <li className="file-card" key={id}>
                <div className="file-thumb" aria-hidden>
                  <div className="paper">
                    <FileText size={28} />
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
                <div className="file-meta">
                  <time dateTime={created_at}>
                    {date.format(new Date(created_at))}
                  </time>
                  <PdfControls
                    locale={locale}
                    name={`Document - ${dateKey(new Date(created_at))}.pdf`}
                    href={`/api/documents/${id}`}
                    load={async () => {
                      const response = await fetch(`/api/documents/${id}`);
                      if (!response.ok) throw Error();
                      return response.blob();
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
        {!loadState.loading && (page > 1 || result.more) && (
          <nav className="pagination" aria-label={t("Pages", "الصفحات")}>
            <button
              className="button secondary"
              type="button"
              disabled={page < 2}
              onClick={() => changePage(page - 1)}
            >
              {t("Précédent", "السابق")}
            </button>
            <button
              className="button secondary"
              type="button"
              disabled={!result.more}
              onClick={() => changePage(page + 1)}
            >
              {t("Suivant", "التالي")}
            </button>
          </nav>
        )}
      </section>
    </main>
  );
}
