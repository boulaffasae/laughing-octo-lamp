"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { DayPicker, type DateRange } from "react-day-picker";
import { fr, enUS, arMA } from "react-day-picker/locale";
import "react-day-picker/style.css";
import { useCopy } from "../translations";

const parseDate = (value: string) =>
  value ? new Date(`${value}T12:00:00`) : undefined;
const dateValue = (date?: Date) =>
  date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    : "";

export function RentalDates({
  start,
  end,
  onChange,
}: {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
}) {
  const t = useCopy();
  const locale = useLocale();
  const [months, setMonths] = useState(1);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1100px)");
    const update = () => setMonths(media.matches ? 2 : 1);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const selected: DateRange | undefined = start
    ? { from: parseDate(start), to: parseDate(end) }
    : undefined;
  const display = (value: string) =>
    value
      ? parseDate(value)!.toLocaleDateString(locale, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : t.selectDate;
  return (
    <div className="rental-dates">
      <div className="date-summary" aria-live="polite">
        <div className={start && !end ? "" : "date-active"}>
          <span>{t.labels.start}</span>
          <strong>{display(start)}</strong>
        </div>
        <div className={start && !end ? "date-active" : ""}>
          <span>{t.labels.end}</span>
          <strong>{display(end)}</strong>
        </div>
      </div>
      <p className="date-hint">{t.dateHint}</p>
      <DayPicker
        mode="range"
        min={1}
        resetOnSelect
        selected={selected}
        onSelect={(range) =>
          onChange(dateValue(range?.from), dateValue(range?.to))
        }
        numberOfMonths={months}
        locale={locale === "fr" ? fr : locale === "ar" ? arMA : enUS}
        dir={locale === "ar" ? "rtl" : "ltr"}
      />
      {start && (
        <button
          type="button"
          className="clear-dates"
          onClick={() => onChange("", "")}
        >
          {t.clearDates}
        </button>
      )}
    </div>
  );
}
