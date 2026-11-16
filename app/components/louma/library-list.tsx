"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Button,
  Card,
  DateField,
  DateRangePicker,
  Label,
  RangeCalendar,
  Skeleton,
} from "@heroui/react";
import { type CalendarDate, today } from "@internationalized/date";
import { I18nProvider } from "react-aria-components";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { words } from "@/lib/contract/agreement";
import type { Locale } from "@/i18n/locales";

export const libraryTimeZone = "Africa/Casablanca";
type Period = { start: CalendarDate; end: CalendarDate };
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
      params.set("start", period.start.toString());
      params.set("end", period.end.toString());
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
      next.start.compare(period.start) === 0 &&
      next.end.compare(period.end) === 0
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
  return (
    <I18nProvider locale={locale === "ar" ? "ar-MA-u-ca-gregory" : "fr-FR"}>
      <div className="library-filter">
        <DateRangePicker<CalendarDate>
          value={value}
          onChange={onChange}
          isOpen={open}
          onOpenChange={setOpen}
          maxValue={today(libraryTimeZone)}
        >
          <Label>{label}</Label>
          <DateField.Group>
            <DateField.InputContainer>
              <DateField.Input slot="start">
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
              <DateRangePicker.RangeSeparator />
              <DateField.Input slot="end">
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
            </DateField.InputContainer>
            <DateField.Suffix>
              <DateRangePicker.Trigger
                aria-label={t("Choisir une période", "اختر فترة")}
              >
                <DateRangePicker.TriggerIndicator />
              </DateRangePicker.Trigger>
            </DateField.Suffix>
          </DateField.Group>
          <DateRangePicker.Popover
            placement="bottom start"
            className="library-calendar"
          >
            <RangeCalendar aria-label={label}>
              <RangeCalendar.Header>
                <RangeCalendar.Heading />
                <RangeCalendar.NavButton slot="previous" />
                <RangeCalendar.NavButton slot="next" />
              </RangeCalendar.Header>
              <RangeCalendar.Grid>
                <RangeCalendar.GridHeader>
                  {(day) => (
                    <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>
                  )}
                </RangeCalendar.GridHeader>
                <RangeCalendar.GridBody>
                  {(date) => <RangeCalendar.Cell date={date} />}
                </RangeCalendar.GridBody>
              </RangeCalendar.Grid>
            </RangeCalendar>
          </DateRangePicker.Popover>
        </DateRangePicker>
        {value && (
          <Button size="sm" variant="ghost" onPress={() => onChange(null)}>
            {t("Effacer", "مسح")}
          </Button>
        )}
      </div>
    </I18nProvider>
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
            <Skeleton key={id} className="library-card-skeleton" />
          ))}
        </div>
      </div>
    );
  }
  if (status === "error") {
    return (
      <Card variant="secondary" className="library-empty">
        <p role="alert">
          {error === "configuration"
            ? t(
                "Le stockage privé n’est pas encore configuré.",
                "التخزين الخاص غير مهيأ بعد.",
              )
            : t("Impossible de charger la liste.", "تعذر تحميل القائمة.")}
        </p>
        <Button variant="secondary" onPress={onRetry}>
          {t("Réessayer", "إعادة المحاولة")}
        </Button>
      </Card>
    );
  }

  return (
    <>
      {hasItems ? (
        children
      ) : (
        <Card variant="secondary" className="library-empty">
          <p role="status">{empty}</p>
        </Card>
      )}
      {(page > 1 || more) && (
        <nav className="library-pagination" aria-label={t("Pages", "الصفحات")}>
          <Button
            variant="secondary"
            isDisabled={page === 1}
            onPress={() => onPage(page - 1)}
          >
            <Previous size={16} />
            {t("Précédent", "السابق")}
          </Button>
          <Button
            variant="secondary"
            isDisabled={!more}
            onPress={() => onPage(page + 1)}
          >
            {t("Suivant", "التالي")}
            <Next size={16} />
          </Button>
        </nav>
      )}
    </>
  );
}
