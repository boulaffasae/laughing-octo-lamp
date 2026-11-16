"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Card, Link, Spinner } from "@heroui/react";
import { FileText, History, Plus } from "lucide-react";
import { words, type Agreement } from "@/lib/contract/agreement";
import type {
  ContractRevision,
  ContractSummary,
} from "@/lib/contract/saved-contract";
import type { Locale } from "@/i18n/locales";
import { PdfControls } from "./pdf-controls";
import { contractPdfName } from "./pdf-file";
import { LibraryModal } from "./library-modal";
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
  const pdf = (revision: number) => async () => {
    const { snapshot } = await json<{ snapshot: Agreement }>(
      `${base}?revision=${revision}`,
    );
    const { buildContractPdf } = await import("../contract/contract-pdf");
    return buildContractPdf(snapshot);
  };

  return (
    <LibraryModal title={title} open onClose={onClose} wide>
      <div className="history-row">
        <span>{t("Brouillon actuel", "المسودة الحالية")}</span>
        <PdfControls
          locale={locale}
          name={contractPdfName}
          load={pdf(0)}
          preview
        />
      </div>
      <Link href={`/${locale}/contracts/${contract.id}`}>
        {t("Reprendre le contrat", "متابعة تعديل العقد")}
      </Link>
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
        <Spinner aria-label={t("Chargement…", "جارٍ التحميل…")} />
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
        <Button
          variant="secondary"
          isPending={state === "loading"}
          onPress={() => void older()}
        >
          {state === "error"
            ? t("Réessayer", "إعادة المحاولة")
            : t("Versions plus anciennes", "إصدارات أقدم")}
        </Button>
      )}
    </LibraryModal>
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
    <main className="shell library-page">
      <Card className="library-banner" variant="secondary">
        <div className="library-banner-copy">
          <span className="library-mark">
            <FileText size={25} aria-hidden />
          </span>
          <h1>{t("Mes contrats", "عقودي")}</h1>
        </div>
        <Link className="library-create-link" href={`/${locale}/new`}>
          <Plus size={18} aria-hidden />
          {t("Nouveau contrat", "عقد جديد")}
        </Link>
      </Card>
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
            <li key={contract.id}>
              <Card className="library-item">
                <span className="library-item-mark">
                  <FileText size={21} aria-hidden />
                </span>
                <div>
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
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  aria-haspopup="dialog"
                  onPress={() => setSelected(contract)}
                >
                  <History size={16} aria-hidden />
                  {t("Historique et PDF", "السجل وملف PDF")}
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      </LibraryResults>
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
