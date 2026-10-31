"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { DayPicker, type DateRange } from "react-day-picker";
import { fr, enUS, arMA } from "react-day-picker/locale";
import "react-day-picker/style.css";
import { useCopy } from "@/app/translations";

const parseDateInput = (value: string) =>
  value ? new Date(`${value}T12:00:00`) : undefined;
const formatDateInput = (date?: Date) =>
  date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    : "";

export function RentalDatePicker({
  start,
  end,
  onChange,
}: {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
}) {
  const copy = useCopy();
  const locale = useLocale();
  const [visibleMonths, setVisibleMonths] = useState(1);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1100px)");
    const update = () => setVisibleMonths(media.matches ? 2 : 1);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const selected: DateRange | undefined = start
    ? { from: parseDateInput(start), to: parseDateInput(end) }
    : undefined;
  const formatSummaryDate = (value: string) =>
    value
      ? parseDateInput(value)!.toLocaleDateString(locale, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : copy.selectDate;
  return (
    <div className="rental-dates">
      <div className="date-summary" aria-live="polite">
        <div className={start && !end ? "" : "date-active"}>
          <span>{copy.labels.start}</span>
          <strong>{formatSummaryDate(start)}</strong>
        </div>
        <div className={start && !end ? "date-active" : ""}>
          <span>{copy.labels.end}</span>
          <strong>{formatSummaryDate(end)}</strong>
        </div>
      </div>
      <p className="date-hint">{copy.dateHint}</p>
      <DayPicker
        mode="range"
        min={1}
        resetOnSelect
        selected={selected}
        onSelect={(range) =>
          onChange(formatDateInput(range?.from), formatDateInput(range?.to))
        }
        numberOfMonths={visibleMonths}
        locale={locale === "fr" ? fr : locale === "ar" ? arMA : enUS}
        dir={locale === "ar" ? "rtl" : "ltr"}
      />
      {start && (
        <button
          type="button"
          className="clear-dates"
          onClick={() => onChange("", "")}
        >
          {copy.clearDates}
        </button>
      )}
    </div>
  );
}
