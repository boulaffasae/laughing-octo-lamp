"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, History, X } from "lucide-react";
import { words, type Agreement } from "@/lib/contract/agreement";
import type {
  ContractRevision,
  ContractSummary,
} from "@/lib/contract/saved-contract";
import type { Locale } from "@/i18n/locales";
import { PdfControls } from "./pdf-controls";
import { contractPdfName } from "./pdf-file";

type ContractPage = { contracts: ContractSummary[]; more: boolean };
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
  const dialog = useRef<HTMLDialogElement>(null);
  const [history, setHistory] = useState<HistoryPage>({
    revisions: [],
    more: false,
  });
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const pending = useRef(false);
  const fetched = useRef<AbortController>(null);
  const base = `/api/contracts/${contract.id}`;

  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal();
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
  const pdf = (revision: number) => async () => {
    const { snapshot } = await json<{ snapshot: Agreement }>(
      `${base}?revision=${revision}`,
    );
    const { buildContractPdf } = await import("../contract/contract-pdf");
    return buildContractPdf(snapshot);
  };

  return (
    <dialog
      className="workspace-dialog contract-history"
      ref={dialog}
      aria-labelledby="contract-history-title"
      onClose={onClose}
    >
      <div className="dialog-header">
        <h2 id="contract-history-title">{title}</h2>
        <button
          type="button"
          className="icon-button"
          aria-label={t("Fermer", "إغلاق")}
          onClick={() => dialog.current?.close()}
        >
          <X size={18} aria-hidden />
        </button>
      </div>
      <div className="history-row">
        <span>{t("Brouillon actuel", "المسودة الحالية")}</span>
        <PdfControls
          locale={locale}
          name={contractPdfName}
          load={pdf(0)}
          preview
        />
      </div>
      <a className="button" href={`/${locale}/contracts/${contract.id}`}>
        {t("Reprendre le contrat", "متابعة تعديل العقد")}
      </a>
      <h3>{t("Historique des versions", "سجل الإصدارات")}</h3>
      {history.revisions.length > 0 && (
        <ol className="history-list">
          {history.revisions.map(({ revision, created_at }) => (
            <li className="history-row" key={revision}>
              <div>
                <strong>
                  {t("Version", "الإصدار")} {revision}
                </strong>
                <time dateTime={created_at}>
                  {date.format(new Date(created_at))}
                </time>
              </div>
              <PdfControls
                locale={locale}
                name={`Contrat - v${revision}.pdf`}
                load={pdf(revision)}
                preview
              />
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
          {t("Impossible de charger les versions.", "تعذر تحميل الإصدارات.")}
        </p>
      )}
      {(state === "error" || history.more) && (
        <button
          className="button secondary"
          type="button"
          disabled={state === "loading"}
          onClick={() => void older()}
        >
          {state === "error"
            ? t("Réessayer", "إعادة المحاولة")
            : t("Versions plus anciennes", "إصدارات أقدم")}
        </button>
      )}
    </dialog>
  );
}

export function ContractLibrary({ locale }: { locale: Locale }) {
  const t = words(locale);
  const date = new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<ContractPage>();
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [selected, setSelected] = useState<ContractSummary>();

  useEffect(() => {
    const controller = new AbortController();
    json<ContractPage>(`/api/contracts?page=${page}`, controller.signal).then(
      (data) => {
        setResult(data);
        setStatus("ready");
      },
      () => {
        if (!controller.signal.aborted) setStatus("error");
      },
    );
    return () => controller.abort();
  }, [page, attempt]);

  function changePage(next: number) {
    setStatus("loading");
    setPage(next);
  }

  return (
    <section
      className="contract-library"
      aria-labelledby="saved-contracts-title"
    >
      <div className="files-heading">
        <h3 id="saved-contracts-title">{t("Contrats", "العقود")}</h3>
        <a className="button secondary" href={`/${locale}/new`}>
          {t("Nouveau contrat", "عقد جديد")}
        </a>
      </div>
      {status === "loading" && (
        <p role="status">
          {t("Chargement des contrats…", "جارٍ تحميل العقود…")}
        </p>
      )}
      {status === "error" && (
        <div className="files-empty" role="status">
          <p>
            {t("Impossible de charger les contrats.", "تعذر تحميل العقود.")}
          </p>
          <button
            className="button secondary"
            type="button"
            onClick={() => {
              setStatus("loading");
              setAttempt((value) => value + 1);
            }}
          >
            {t("Réessayer", "إعادة المحاولة")}
          </button>
        </div>
      )}
      {status === "ready" && result && (
        <>
          {result.contracts.length ? (
            <ul className="file-grid">
              {result.contracts.map((contract) => (
                <li key={contract.id} className="file-card">
                  <button
                    className="contract-card"
                    type="button"
                    aria-haspopup="dialog"
                    onClick={() => setSelected(contract)}
                  >
                    <FileText size={23} aria-hidden />
                    <span>
                      <strong>
                        {contract.title ||
                          t("Contrat de location", "عقد كراء السيارة")}
                      </strong>
                      {(contract.renter || contract.plate) && (
                        <small>
                          {[contract.renter, contract.plate]
                            .filter(Boolean)
                            .join(" · ")}
                        </small>
                      )}
                      <time dateTime={contract.updated_at}>
                        {date.format(new Date(contract.updated_at))}
                      </time>
                    </span>
                    <History size={18} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>{t("Aucun contrat enregistré.", "لا توجد عقود محفوظة.")}</p>
          )}
          {(page > 1 || result.more) && (
            <nav
              className="pagination"
              aria-label={t("Pages des contrats", "صفحات العقود")}
            >
              <button
                className="button secondary"
                type="button"
                disabled={page === 1}
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
        </>
      )}
      {selected && (
        <ContractDetails
          contract={selected}
          locale={locale}
          date={date}
          onClose={() => setSelected(undefined)}
        />
      )}
    </section>
  );
}
