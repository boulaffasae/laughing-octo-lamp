"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Plus } from "lucide-react";
import { words, type Agreement } from "@/lib/contract/agreement";
import type {
  ContractRevision,
  ContractSummary,
} from "@/lib/contract/saved-contract";
import type { Locale } from "@/i18n/locales";
import { PdfPreview } from "./pdf-preview";
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

function ContractDetails({
  contract,
  locale,
  date,
  onClose,
}: {
  contract: ContractSummary;
  locale: Locale;
  date: Intl.DateTimeFormat;
  onClose: () => void;
}) {
  const t = words(locale);
  const [history, setHistory] = useState<HistoryPage>({
    revisions: [],
    more: false,
  });
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [revision, setRevision] = useState(0);
  const pending = useRef(false);
  const fetched = useRef<AbortController>(null);
  const base = `/api/contracts/${contract.id}`;

  useEffect(() => {
    const request = new AbortController();
    json<HistoryPage>(base, request.signal).then(
      (data) => {
        setHistory(data);
        setState("ready");
      },
      () => {
        if (!request.signal.aborted) setState("error");
      },
    );
    return () => {
      request.abort();
      fetched.current?.abort();
    };
  }, [base]);

  async function older() {
    if (pending.current) return;
    const before = history.revisions.at(-1)?.revision;
    pending.current = true;
    setState("loading");
    const request = new AbortController();
    fetched.current = request;
    try {
      const page = await json<HistoryPage>(
        before ? `${base}?before=${before}` : base,
        request.signal,
      );
      setHistory((current) => ({
        revisions: [...current.revisions, ...page.revisions],
        more: page.more,
      }));
      setState("ready");
    } catch {
      if (!request.signal.aborted) setState("error");
    } finally {
      pending.current = false;
    }
  }

  const title = contract.title || t("Contrat de location", "عقد كراء السيارة");
  async function load(signal: AbortSignal) {
    const { snapshot } = await json<{ snapshot: Agreement }>(
      `${base}?revision=${revision}`,
      signal,
    );
    const { buildContractPdf } = await import("../contract/contract-pdf");
    signal.throwIfAborted();
    return buildContractPdf(snapshot);
  }

  return (
    <PdfPreview
      locale={locale}
      title={title}
      fileKey={revision}
      file={{
        name: revision ? `Contrat - v${revision}.pdf` : contractPdfName,
        load,
      }}
      onClose={onClose}
      sidebar={
        <>
          <h3>{t("Historique des versions", "سجل الإصدارات")}</h3>
          <button
            type="button"
            className="library-revision"
            aria-pressed={revision === 0}
            onClick={() => setRevision(0)}
          >
            {t("Brouillon actuel", "المسودة الحالية")}
          </button>
          <a
            className="button secondary"
            href={`/${locale}/contracts/${contract.id}`}
          >
            {t("Reprendre le contrat", "متابعة تعديل العقد")}
          </a>
          {history.revisions.length > 0 && (
            <ol className="history-list">
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
          )}
          {state === "loading" && (
            <p role="status">{t("Chargement…", "جارٍ التحميل…")}</p>
          )}
          {state === "ready" && !history.revisions.length && (
            <p>{t("Aucune version enregistrée.", "لا توجد إصدارات محفوظة.")}</p>
          )}
          {state === "error" && (
            <p className="error" role="alert">
              {t(
                "Impossible de charger les versions.",
                "تعذر تحميل الإصدارات.",
              )}
            </p>
          )}
          {(state === "error" || history.more) && (
            <button
              type="button"
              className="button secondary"
              disabled={state === "loading"}
              onClick={() => void older()}
            >
              {state === "error"
                ? t("Réessayer", "إعادة المحاولة")
                : t("Versions plus anciennes", "إصدارات أقدم")}
            </button>
          )}
        </>
      }
    />
  );
}

export function ContractLibrary({ locale }: { locale: Locale }) {
  const t = words(locale);
  const date = new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: libraryTimeZone,
  });
  const list = useLibraryList<"contracts", ContractSummary>("contracts");
  const [selected, setSelected] = useState<ContractSummary>();

  return (
    <main className="library-page">
      <section className="library-banner">
        <div className="shell library-banner-inner">
          <div className="library-banner-copy">
            <span className="library-mark">
              <FileText size={25} aria-hidden />
            </span>
            <h1>{t("Mes contrats", "عقودي")}</h1>
          </div>
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
          date={date}
          onClose={() => setSelected(undefined)}
        />
      )}
    </main>
  );
}
