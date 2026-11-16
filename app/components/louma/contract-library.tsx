"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { words, type Agreement } from "@/lib/contract/agreement";
import type {
  ContractRevision,
  ContractSummary,
  SavedDraft,
} from "@/lib/contract/saved-contract";
import type { Locale } from "@/i18n/locales";
import { PdfPane } from "./pdf-preview";
import { LibraryModal } from "./library-modal";
import { ContractEditor } from "./contract-editor";
import { FileTeaser } from "./file-teaser";
import { contractPdfName } from "./pdf-file";
import {
  LibraryResults,
  PeriodFilter,
  libraryTimeZone,
  useLibraryList,
} from "./library-list";

type HistoryPage = { revisions: ContractRevision[]; more: boolean };

async function json<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw Error();
  return response.json();
}

function contractFile(id: string, revision = 0) {
  return {
    name: revision ? `Contrat - v${revision}.pdf` : contractPdfName,
    load: async (signal: AbortSignal) => {
      const { snapshot } = await json<{ snapshot: Agreement }>(
        `/api/contracts/${id}?revision=${revision}`,
        signal,
      );
      const { buildContractPdf } = await import("../contract/contract-pdf");
      signal.throwIfAborted();
      return buildContractPdf(snapshot);
    },
  };
}

function ContractDetails({
  contract,
  locale,
  date,
  onClose,
  onSaved,
}: {
  contract: ContractSummary;
  locale: Locale;
  date: Intl.DateTimeFormat;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = words(locale);
  const [history, setHistory] = useState<HistoryPage>({
    revisions: [],
    more: false,
  });
  const [historyState, setHistoryState] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [draft, setDraft] = useState<SavedDraft>();
  const [draftFailed, setDraftFailed] = useState(false);
  const [draftAttempt, setDraftAttempt] = useState(0);
  const [revision, setRevision] = useState(0);
  const fetched = useRef<AbortController>(null);
  const closed = useRef(false);
  const changed = useRef(false);
  const base = `/api/contracts/${contract.id}`;

  useEffect(() => {
    const request = new AbortController();
    json<SavedDraft>(`${base}?draft`, request.signal).then(
      (data) => {
        if (!request.signal.aborted) setDraft(data);
      },
      () => {
        if (!request.signal.aborted) setDraftFailed(true);
      },
    );
    return () => request.abort();
  }, [base, draftAttempt]);

  useEffect(() => {
    const request = new AbortController();
    fetched.current = request;
    json<HistoryPage>(base, request.signal).then(
      (page) => {
        if (request.signal.aborted) return;
        setHistory(page);
        setHistoryState("ready");
      },
      () => {
        if (!request.signal.aborted) setHistoryState("error");
      },
    );
    return () => {
      request.abort();
      fetched.current?.abort();
    };
  }, [base]);

  async function loadHistory(before?: number) {
    fetched.current?.abort();
    const request = new AbortController();
    fetched.current = request;
    setHistoryState("loading");
    try {
      const page = await json<HistoryPage>(
        before ? `${base}?before=${before}` : base,
        request.signal,
      );
      if (request.signal.aborted) return;
      setHistory((current) => {
        if (before) {
          return {
            revisions: [...current.revisions, ...page.revisions],
            more: page.more,
          };
        }
        const last = page.revisions.at(-1)?.revision;
        if (last === undefined) return page;
        const older = current.revisions.filter((item) => item.revision < last);
        const overlaps = current.revisions.some(
          (item) => item.revision === last,
        );
        return overlaps && older.length
          ? { revisions: [...page.revisions, ...older], more: current.more }
          : page;
      });
      setHistoryState("ready");
    } catch {
      if (!request.signal.aborted) setHistoryState("error");
    }
  }

  const title = contract.title || t("Contrat de location", "عقد كراء السيارة");
  return (
    <LibraryModal
      title={title}
      closeLabel={t("Fermer", "إغلاق")}
      onClose={() => {
        closed.current = true;
        onClose();
        if (changed.current) onSaved();
      }}
    >
      <div className="library-preview-with-sidebar">
        <aside
          className="library-preview-sidebar"
          aria-label={t("Versions", "الإصدارات")}
        >
          <ol className="history-list">
            <li>
              <button
                type="button"
                className="library-revision"
                aria-pressed={revision === 0}
                onClick={() => setRevision(0)}
              >
                <strong>{t("Brouillon actuel", "المسودة الحالية")}</strong>
              </button>
            </li>
            {history.revisions.map((item) => (
              <li key={item.revision}>
                <button
                  type="button"
                  className="library-revision"
                  aria-pressed={revision === item.revision}
                  onClick={() => setRevision(item.revision)}
                >
                  <strong>
                    {t("Version", "الإصدار")} {item.revision}
                  </strong>
                  <time dateTime={item.created_at}>
                    {date.format(new Date(item.created_at))}
                  </time>
                </button>
              </li>
            ))}
          </ol>
          {historyState === "loading" && (
            <span className="sr-only" role="status">
              {t("Chargement…", "جارٍ التحميل…")}
            </span>
          )}
          {historyState === "error" && (
            <p className="error" role="alert">
              {t(
                "Impossible de charger les versions.",
                "تعذر تحميل الإصدارات.",
              )}
            </p>
          )}
          {(historyState === "error" || history.more) && (
            <button
              type="button"
              className="library-more-revisions"
              disabled={historyState === "loading"}
              onClick={() =>
                void loadHistory(
                  historyState === "error"
                    ? undefined
                    : history.revisions.at(-1)?.revision,
                )
              }
            >
              {historyState === "error"
                ? t("Réessayer", "إعادة المحاولة")
                : t("Versions plus anciennes", "إصدارات أقدم")}
            </button>
          )}
        </aside>
        <div className="library-contract-pane">
          <div hidden={revision !== 0}>
            {draft ? (
              <ContractEditor
                locale={locale}
                saved={draft}
                onSaved={() => {
                  changed.current = true;
                  if (closed.current) onSaved();
                  else void loadHistory();
                }}
              />
            ) : draftFailed ? (
              <div className="library-empty">
                <p role="alert">
                  {t("Impossible de charger le contrat.", "تعذر تحميل العقد.")}
                </p>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => {
                    setDraftFailed(false);
                    setDraftAttempt((value) => value + 1);
                  }}
                >
                  {t("Réessayer", "إعادة المحاولة")}
                </button>
              </div>
            ) : (
              <div className="library-empty" role="status">
                {t("Chargement…", "جارٍ التحميل…")}
              </div>
            )}
          </div>
          {revision !== 0 && (
            <PdfPane
              key={revision}
              locale={locale}
              file={contractFile(contract.id, revision)}
            />
          )}
        </div>
      </div>
    </LibraryModal>
  );
}

export function ContractLibrary({ locale }: { locale: Locale }) {
  const t = words(locale);
  const date = new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    dateStyle: "medium",
    timeZone: libraryTimeZone,
  });
  const revisionDate = new Intl.DateTimeFormat(
    locale === "ar" ? "ar-MA" : "fr-FR",
    {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: libraryTimeZone,
    },
  );
  const list = useLibraryList<"contracts", ContractSummary>("contracts");
  const [selected, setSelected] = useState<ContractSummary>();

  return (
    <main className="library-page">
      <section className="library-banner">
        <div className="shell library-banner-inner">
          <h1>{t("Mes contrats", "عقودي")}</h1>
          <a className="button" href={`/${locale}/new`}>
            <Plus size={18} aria-hidden />
            {t("Nouveau contrat", "عقد جديد")}
          </a>
        </div>
      </section>
      <section className="shell library-content">
        <div className="library-heading">
          <h2>{t("Contrats enregistrés", "العقود المحفوظة")}</h2>
          <PeriodFilter
            locale={locale}
            label={t("Dernière modification", "آخر تعديل")}
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
                  "Aucun contrat sur cette période.",
                  "لا توجد عقود في هذه الفترة.",
                )
              : t("Aucun contrat enregistré.", "لا توجد عقود محفوظة.")
          }
          onPage={list.changePage}
          onRetry={() => list.refresh()}
        >
          <ul className="library-grid">
            {list.items.map((contract) => (
              <FileTeaser
                key={contract.id}
                locale={locale}
                title={
                  contract.title || t("Contrat de location", "عقد كراء السيارة")
                }
                details={[contract.renter, contract.plate]
                  .filter(Boolean)
                  .join(" · ")}
                date={contract.updated_at}
                dateLabel={date.format(new Date(contract.updated_at))}
                file={contractFile(contract.id)}
                onOpen={() => setSelected(contract)}
              />
            ))}
          </ul>
        </LibraryResults>
      </section>
      {selected && (
        <ContractDetails
          contract={selected}
          locale={locale}
          date={revisionDate}
          onSaved={() => list.refresh()}
          onClose={() => setSelected(undefined)}
        />
      )}
    </main>
  );
}
