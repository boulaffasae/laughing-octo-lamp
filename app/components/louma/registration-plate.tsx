import { useState, type ClipboardEvent } from "react";
import { blank, words } from "@/lib/contract/agreement";
import type { Locale } from "@/i18n/locales";
import styles from "./registration-plate.module.css";

type Format = "standard" | "bilingual" | "ww" | "other";

const latinSeries: Record<string, string> = {
  أ: "A",
  ا: "A",
  ب: "B",
  د: "D",
  ه: "H",
  و: "E",
  ط: "T",
  ي: "Y",
  ك: "K",
  ل: "L",
  م: "M",
  ن: "N",
  ص: "C",
  ف: "F",
  ر: "R",
  س: "S",
};

function normalizeDigits(value: string) {
  return value.replace(/[٠-٩۰-۹]/g, (digit) =>
    String(digit.charCodeAt(0) & 15),
  );
}

function readPlate(value: string) {
  const text = normalizeDigits(value.trim());
  const ww = /^(\d{1,6}|\d{3} \d{3})[\s-]*WW$/i.exec(text);
  const standard =
    /^(\d{0,5})\s*[-|│]\s*([\p{Script=Arabic}A-Z]{0,2})(?:\s*\/\s*([A-Z]{1,2}))?\s*[-|│]\s*(\d{0,2})(\s+MA)?$/iu.exec(
      text,
    ) ??
    /^(\d{1,5})\s+([\p{Script=Arabic}A-Z]{1,2})(?:\/([A-Z]{1,2}))?\s+(\d{1,2})(\s+MA)?$/iu.exec(
      text,
    );
  return {
    ww: ww?.[1].replace(/ /g, ""),
    standard,
    format: (ww
      ? "ww"
      : standard?.[3] || standard?.[5]
        ? "bilingual"
        : standard || !text
          ? "standard"
          : "other") as Format,
  };
}

export function RegistrationPlate({
  label,
  locale,
  value,
  change,
}: {
  label: string;
  locale: Locale;
  value: string;
  change: (value: string) => void;
}) {
  const t = words(locale);
  const plate = readPlate(value);
  const [choice, setChoice] = useState<{ format: Format; value: string }>();
  const format = choice?.value === value ? choice.format : plate.format;
  const isStandard = format === "standard" || format === "bilingual";
  const bilingual = format === "bilingual";
  const [, serial = "", series = "", explicitLatin = "", province = ""] =
    plate.standard ?? [];
  const latin =
    explicitLatin ||
    [...series.replace(/ـ/g, "")]
      .map((letter) => latinSeries[letter] ?? "")
      .join("");

  function edit(next: string, nextFormat = format) {
    setChoice({ format: nextFormat, value: next });
    change(next);
  }

  function editStandard(
    nextSerial: string,
    nextSeries: string,
    nextProvince: string,
  ) {
    const suffix = bilingual ? " MA" : "";
    const seriesText =
      explicitLatin && nextSeries === series
        ? nextSeries + "/" + explicitLatin
        : nextSeries;
    edit(
      nextSerial || nextSeries || nextProvince
        ? [nextSerial, seriesText, nextProvince].join("-") + suffix
        : "",
    );
  }

  function pastePlate(event: ClipboardEvent<HTMLDivElement>) {
    const pasted = event.clipboardData.getData("text").trim();
    const parsed = readPlate(pasted);
    if (
      !pasted ||
      parsed.format === "other" ||
      (parsed.ww?.length !== 6 && !parsed.standard?.[4])
    )
      return;

    event.preventDefault();
    edit(pasted, parsed.format);
  }

  function digits(text: string, length: number) {
    return normalizeDigits(text)
      .replace(/[^0-9]/g, "")
      .slice(0, length);
  }

  return (
    <div className={styles.field}>
      <div className={styles.editor} role="group" aria-label={label}>
        <select
          className={styles.format}
          aria-label={t("Format d’immatriculation", "صيغة رقم التسجيل")}
          value={format}
          onChange={(event) =>
            setChoice({ format: event.target.value as Format, value })
          }
        >
          <option value="standard">
            {t("Maroc · Série normale", "المغرب · سلسلة عادية")}
          </option>
          <option value="bilingual">
            {t("Maroc · Modèle MA", "المغرب · نموذج MA")}
          </option>
          <option value="ww">
            {t("Maroc · Provisoire WW", "المغرب · تسجيل مؤقت WW")}
          </option>
          <option value="other">{t("Autre format", "صيغة أخرى")}</option>
        </select>
        <div
          className={styles.plate}
          dir="ltr"
          data-format={format}
          onPaste={format === "other" ? undefined : pastePlate}
        >
          {isStandard && (plate.standard || !value) ? (
            <>
              <input
                aria-label={t("Numéro d’ordre", "الرقم الترتيبي")}
                inputMode="numeric"
                placeholder="84921"
                value={serial}
                onChange={(event) =>
                  editStandard(digits(event.target.value, 5), series, province)
                }
              />
              <div className={styles.series}>
                <input
                  aria-label={t("Lettre de série", "حرف السلسلة")}
                  placeholder="أ"
                  value={series}
                  onChange={(event) =>
                    editStandard(
                      serial,
                      event.target.value
                        .toUpperCase()
                        .replace(/[^\p{Script=Arabic}A-Z]/gu, "")
                        .slice(0, 2),
                      province,
                    )
                  }
                />
                {bilingual && (
                  <span className={styles.latin}>{latin || "–"}</span>
                )}
              </div>
              <input
                aria-label={t(
                  "Code de préfecture ou de province",
                  "رمز العمالة أو الإقليم",
                )}
                inputMode="numeric"
                placeholder="6"
                value={province}
                onChange={(event) =>
                  editStandard(serial, series, digits(event.target.value, 2))
                }
              />
              {bilingual && <span className={styles.mark}>MA</span>}
            </>
          ) : format === "ww" && (plate.ww !== undefined || !value) ? (
            <>
              <input
                aria-label={t("Numéro provisoire", "رقم التسجيل المؤقت")}
                inputMode="numeric"
                placeholder="012345"
                value={plate.ww ?? ""}
                onChange={(event) => {
                  const number = digits(event.target.value, 6);
                  edit(number ? number + " WW" : "");
                }}
              />
              <span className={styles.mark}>WW</span>
            </>
          ) : (
            <input
              className={styles.free}
              aria-label={label}
              dir="auto"
              placeholder="AB-123-CD"
              maxLength={120}
              value={value}
              onChange={(event) => edit(event.target.value, "other")}
            />
          )}
        </div>
      </div>
      <span className={styles.print} dir="auto">
        {value || blank}
      </span>
    </div>
  );
}
