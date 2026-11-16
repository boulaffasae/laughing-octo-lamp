"use client";

import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  FileSignature,
  FileText,
} from "lucide-react";
import type { Locale } from "@/i18n/locales";

export function FileTeaser({
  locale,
  title,
  details,
  thumbnail,
  date,
  dateLabel,
  onOpen,
}: {
  locale: Locale;
  title: string;
  details?: string;
  thumbnail?: string;
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
        <span
          className={
            thumbnail
              ? "library-poster"
              : "library-poster library-poster-contract"
          }
          aria-hidden
        >
          {thumbnail ? (
            <>
              <FileText size={21} />
              <Image
                src={thumbnail}
                alt=""
                fill
                unoptimized
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.hidden = true;
                }}
              />
            </>
          ) : (
            <span className="library-poster-paper">
              <FileSignature size={18} />
            </span>
          )}
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
