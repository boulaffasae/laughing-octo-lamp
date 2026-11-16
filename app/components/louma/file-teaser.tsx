import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import type { Locale } from "@/i18n/locales";

export function FileTeaser({
  locale,
  title,
  details,
  date,
  dateLabel,
  onOpen,
}: {
  locale: Locale;
  title: string;
  details?: string;
  date: string;
  dateLabel: string;
  onOpen: () => void;
}) {
  const Arrow = locale === "ar" ? ChevronLeft : ChevronRight;
  return (
    <li>
      <button
        type="button"
        className="library-item"
        aria-haspopup="dialog"
        onClick={onOpen}
      >
        <span className="library-item-mark">
          <FileText size={21} aria-hidden />
        </span>
        <span className="library-item-copy">
          <strong>{title}</strong>
          {details && <small>{details}</small>}
          <time dateTime={date}>{dateLabel}</time>
        </span>
        <Arrow className="library-item-arrow" size={17} aria-hidden />
      </button>
    </li>
  );
}
