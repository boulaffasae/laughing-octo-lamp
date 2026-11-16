"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { DayPicker, TZDate, type DateRange } from "react-day-picker";
import { arMA, fr } from "react-day-picker/locale";
import "react-day-picker/style.css";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { words } from "@/lib/contract/agreement";
import type { Locale } from "@/i18n/locales";

export const libraryTimeZone = "Africa/Casablanca";
type Period = { start: string; end: string };

function dateKey(date: Date) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: libraryTimeZone }).format(
    date,
  );
}

function calendarDate(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new TZDate(year, month - 1, day, libraryTimeZone);
}
type PageResult<K extends string, Item> = { more: boolean } & Record<K, Item[]>;

export function useLibraryList<K extends "contracts" | "documents", Item>(
  kind: K,
) {
  const [period, setPeriod] = useState<Period | null>(null);
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<PageResult<K, Item>>();
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page) });
    if (period) {
      params.set("start", period.start);
      params.set("end", period.end);
    }
    fetch(`/api/${kind}?${params}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw Error(body?.error ?? "storage");
        }
        const data = (await response.json()) as PageResult<K, Item>;
        if (controller.signal.aborted) return;
        setResult(data);
        setStatus("ready");
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : "storage");
        setStatus("error");
      });
    return () => controller.abort();
  }, [kind, page, period, attempt]);

  function changePeriod(next: Period | null) {
    if (
      next &&
      period &&
      next.start === period.start &&
      next.end === period.end
    )
      return;
    if (!next && !period) return;
    setPeriod(next);
    setPage(1);
    setStatus("loading");
  }

  function refresh(resetFilters = false) {
    setStatus("loading");
    if (resetFilters) {
      setPeriod(null);
      setPage(1);
    }
    setAttempt((n) => n + 1);
  }

  return {
    period,
    changePeriod,
    page,
    refresh,
    status,
    error,
    items: result?.[kind] ?? [],
    more: Boolean(result?.more),
    changePage: (next: number) => {
      setStatus("loading");
      setPage(next);
    },
  };
}

export function PeriodFilter({
  locale,
  label,
  value,
  onChange,
}: {
  locale: Locale;
  label: string;
  value: Period | null;
  onChange: (value: Period | null) => void;
}) {
  const t = words(locale);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<DateRange>();
  const [today, setToday] = useState<Date>();
  const wrapper = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const dateFormat = new Intl.DateTimeFormat(
    locale === "ar" ? "ar-MA" : "fr-FR",
    {
      dateStyle: "medium",
      timeZone: libraryTimeZone,
    },
  );

  useEffect(() => {
    if (!open) return;
    function closeOutside(event: Event) {
      if (
        event.target instanceof Node &&
        !wrapper.current?.contains(event.target)
      )
        setOpen(false);
    }
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("focusin", closeOutside);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("focusin", closeOutside);
    };
  }, [open]);

  function commit(range: Period | null) {
    onChange(range);
    setOpen(false);
    trigger.current?.focus();
  }

  return (
    <div
      className="library-filter"
      ref={wrapper}
      onKeyDown={(event) => {
        if (open && event.key === "Escape") {
          event.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <span className="library-filter-label">{label}</span>
      <button
        type="button"
        className="button secondary date-filter"
        aria-expanded={open}
        ref={trigger}
        onClick={() => {
          if (!open) {
            setToday(new TZDate(Date.now(), libraryTimeZone));
            setSelected(
              value
                ? {
                    from: calendarDate(value.start),
                    to: calendarDate(value.end),
                  }
                : undefined,
            );
          }
          setOpen(!open);
        }}
      >
        <CalendarDays size={17} aria-hidden />
        {value
          ? dateFormat.formatRange(
              calendarDate(value.start),
              calendarDate(value.end),
            )
          : t("Choisir une période", "اختر فترة")}
        <ChevronDown size={15} aria-hidden />
      </button>
      {open && (
        <div className="library-calendar" aria-label={label} role="region">
          <div className="library-date-summary">
            <span>
              {t("Début", "البداية")}{" "}
              <strong>
                {selected?.from ? dateFormat.format(selected.from) : "—"}
              </strong>
            </span>
            <span>
              {t("Fin", "النهاية")}{" "}
              <strong>
                {selected?.to ? dateFormat.format(selected.to) : "—"}
              </strong>
            </span>
          </div>
          <DayPicker
            mode="range"
            timeZone={libraryTimeZone}
            locale={locale === "ar" ? arMA : fr}
            dir={locale === "ar" ? "rtl" : "ltr"}
            selected={selected}
            onSelect={setSelected}
            defaultMonth={selected?.from}
            disabled={today && { after: today }}
            resetOnSelect
          />
          <div className="library-calendar-actions">
            <button
              type="button"
              className="button secondary"
              onClick={() => commit(null)}
            >
              {t("Effacer", "مسح")}
            </button>
            <button
              type="button"
              className="button"
              disabled={!selected?.from}
              onClick={() => {
                if (selected?.from)
                  commit({
                    start: dateKey(selected.from),
                    end: dateKey(selected.to ?? selected.from),
                  });
              }}
            >
              {t("Appliquer", "تطبيق")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function LibraryResults({
  locale,
  status,
  error,
  empty,
  hasItems,
  page,
  more,
  onPage,
  onRetry,
  children,
}: {
  locale: Locale;
  status: "loading" | "ready" | "error";
  error: string;
  empty: string;
  hasItems: boolean;
  page: number;
  more: boolean;
  onPage: (page: number) => void;
  onRetry: () => void;
  children: ReactNode;
}) {
  const t = words(locale);
  const Previous = locale === "ar" ? ChevronRight : ChevronLeft;
  const Next = locale === "ar" ? ChevronLeft : ChevronRight;
  if (status === "loading") {
    return (
      <div role="status">
        <span className="sr-only">{t("Chargement…", "جارٍ التحميل…")}</span>
        <div className="library-grid" aria-hidden>
          {[1, 2, 3].map((id) => (
            <div key={id} className="library-card-skeleton" />
          ))}
        </div>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="library-empty">
        <p role="alert">
          {error === "configuration"
            ? t(
                "Le stockage privé n’est pas encore configuré.",
                "التخزين الخاص غير مهيأ بعد.",
              )
            : t("Impossible de charger la liste.", "تعذر تحميل القائمة.")}
        </p>
        <button type="button" className="button secondary" onClick={onRetry}>
          {t("Réessayer", "إعادة المحاولة")}
        </button>
      </div>
    );
  }

  return (
    <>
      {hasItems ? (
        children
      ) : (
        <div className="library-empty">
          <p role="status">{empty}</p>
        </div>
      )}
      {(page > 1 || more) && (
        <nav className="library-pagination" aria-label={t("Pages", "الصفحات")}>
          <button
            type="button"
            className="button secondary"
            disabled={page === 1}
            onClick={() => onPage(page - 1)}
          >
            <Previous size={16} />
            {t("Précédent", "السابق")}
          </button>
          <button
            type="button"
            className="button secondary"
            disabled={!more}
            onClick={() => onPage(page + 1)}
          >
            {t("Suivant", "التالي")}
            <Next size={16} />
          </button>
        </nav>
      )}
    </>
  );
}
