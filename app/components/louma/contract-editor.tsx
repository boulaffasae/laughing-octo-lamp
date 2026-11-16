"use client";

import { useRef, useState, type CSSProperties } from "react";
import { ArrowDownToLine, Check, ImagePlus, Save, X } from "lucide-react";
import Image from "next/image";
import {
  blank,
  conditionDiagram,
  conditionNoteGroups,
  contractFields,
  fieldId,
  fieldValue,
  headingInk,
  initialAgreement,
  words,
  type Agreement,
  type BlockId,
  type FieldKey,
} from "@/lib/contract/agreement";
import { prepareImage } from "@/lib/contract/prepare-image";
import type { Locale } from "@/i18n/locales";
import type { SavedDraft } from "@/lib/contract/saved-contract";
import { useAccount } from "./account";
import { contractPdfName, downloadPdf } from "./pdf-file";
import { useContractSave } from "./use-contract-save";

const themes = [
  ["#235346", "Vert", "أخضر"],
  ["#254e9a", "Bleu", "أزرق"],
  ["#543b75", "Violet", "بنفسجي"],
  ["#903d43", "Bordeaux", "عنابي"],
  ["#25323e", "Ardoise", "رمادي داكن"],
] as const;

function Inline({
  label,
  value,
  change,
  placeholder = blank,
  maxLength = 120,
  type = "text",
  multiline = false,
  describedBy,
}: {
  label: string;
  value: string;
  change: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  type?: "text" | "date" | "time";
  multiline?: boolean;
  describedBy?: string;
}) {
  return (
    <span
      className={multiline ? "inline-field inline-multiline" : "inline-field"}
    >
      <span aria-hidden className="inline-copy">
        {value || placeholder}
        {multiline ? " " : ""}
      </span>
      {multiline ? (
        <textarea
          rows={1}
          aria-label={label}
          aria-describedby={describedBy}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(e) => change(e.target.value)}
        />
      ) : (
        <input
          aria-label={label}
          aria-describedby={describedBy}
          type={type}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(e) => change(e.target.value)}
        />
      )}
    </span>
  );
}

export function ContractEditor({
  locale,
  saved,
}: {
  locale: Locale;
  saved?: SavedDraft;
}) {
  const t = words(locale);
  const account = useAccount();
  const [a, setAgreement] = useState(
    () => saved?.draft ?? initialAgreement(locale),
  );
  const dir = a.locale === "ar" ? "rtl" : "ltr";
  const paperText = words(a.locale);
  const persistence = useContractSave(a, account.signedIn, saved);
  const [logoBusy, setLogoBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [logoError, setLogoError] = useState("");
  const [exportError, setExportError] = useState("");
  const pdfCache = useRef<{ agreement: Agreement; result: Promise<Blob> }>(
    null,
  );
  const fields = contractFields(a.locale);

  function change(patch: Partial<Agreement>) {
    setAgreement((current) => ({ ...current, ...patch }));
  }

  function update(key: FieldKey, value: string) {
    if (typeof key === "string") change({ [key]: value });
    else {
      setAgreement((current) => ({
        ...current,
        documents: current.documents.map((doc, i) =>
          i === key[0] ? { ...doc, [key[1]]: value } : doc,
        ),
      }));
    }
  }

  function getPdf() {
    if (pdfCache.current?.agreement === a) return pdfCache.current.result;
    const result = import("../contract/contract-pdf")
      .then(({ buildContractPdf }) => buildContractPdf(a))
      .catch((error: unknown) => {
        if (pdfCache.current?.agreement === a) pdfCache.current = null;
        throw error;
      });
    pdfCache.current = { agreement: a, result };
    return result;
  }

  async function exportPdf() {
    setExporting(true);
    setExportError("");
    try {
      const result = getPdf();
      persistence.save(a, true, result);
      const url = URL.createObjectURL(await result);
      downloadPdf(url, contractPdfName);
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setExportError(t("Création du PDF impossible.", "تعذّر إنشاء ملف PDF."));
    } finally {
      setExporting(false);
    }
  }

  const caption = (key: string, label: string) => (
    <Inline
      label={t("Libellé", "التسمية") + " · " + label}
      placeholder={label}
      value={a.labels[key] ?? label}
      maxLength={65}
      multiline
      change={(value) =>
        setAgreement((current) => ({
          ...current,
          labels: { ...current.labels, [key]: value },
        }))
      }
    />
  );

  const input = (key: FieldKey, label: string, type?: "date" | "time") => (
    <Inline
      label={label}
      value={fieldValue(a, key)}
      type={type}
      multiline={!type}
      change={(value) => update(key, value)}
    />
  );

  const rows = (id: keyof typeof fields) =>
    fields[id].map(({ key, label, type, fullWidth }) => (
      <div
        className={fullWidth ? "paper-row paper-row-wide" : "paper-row"}
        key={fieldId(key)}
      >
        <div className="paper-row-label">{caption(fieldId(key), label)}</div>
        {input(key, label, type)}
      </div>
    ));

  const band = (id: BlockId) => (
    <h3 className="paper-band">
      <Inline
        label={t("Titre de section", "عنوان القسم") + " · " + id}
        value={a.headings[id]}
        maxLength={65}
        change={(value) =>
          setAgreement((current) => ({
            ...current,
            headings: { ...current.headings, [id]: value },
          }))
        }
      />
    </h3>
  );

  const block = (id: Exclude<BlockId, "condition">) => (
    <section className={`paper-block paper-${id}`} dir={dir}>
      {band(id)}
      <div className="paper-rows">{rows(id)}</div>
    </section>
  );

  const footer = () => (
    <footer
      className="paper-footer"
      aria-label={t("Coordonnées de l’agence", "بيانات الوكالة")}
    >
      <Inline
        label={t("Texte du pied de page", "نص التذييل")}
        value={a.footerText}
        placeholder=""
        maxLength={360}
        multiline
        change={(footerText) =>
          change({ footerText: footerText.replace(/\n/g, " ") })
        }
      />
    </footer>
  );

  const term = (lang: Locale) => {
    const key = lang === "fr" ? "termsFr" : "termsAr";
    return (
      <section key={lang} lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
        <h3 className="paper-header">
          <Inline
            label={lang === "fr" ? "Titre des conditions" : "عنوان الشروط"}
            value={a.termsTitles[lang]}
            maxLength={65}
            change={(value) =>
              setAgreement((current) => ({
                ...current,
                termsTitles: { ...current.termsTitles, [lang]: value },
              }))
            }
          />
        </h3>
        <Inline
          label={lang === "fr" ? "Texte des conditions" : "نص الشروط"}
          value={a[key]}
          maxLength={3500}
          multiline
          change={(value) => change({ [key]: value })}
        />
      </section>
    );
  };

  return (
    <section
      id="contrat"
      className="shell workspace contract-editor"
      aria-label={t("Modifier le contrat", "تعديل العقد")}
    >
      <div
        className="editor-canvas"
        style={
          {
            "--paper-color": a.color,
            "--paper-ink": headingInk(a.color),
          } as CSSProperties
        }
      >
        <div className="paper-scroll">
          <article className="paper" lang={a.locale} dir={dir}>
            <header className="paper-header">
              <div className="paper-brand">
                <div className="paper-help">
                  <label className="paper-logo upload-control">
                    {/* eslint-disable-next-line @next/next/no-img-element -- The agency logo is a local data URL. */}
                    <img
                      src={a.logo || "/louma.svg"}
                      alt=""
                      width={52}
                      height={40}
                    />
                    <ImagePlus size={15} aria-hidden />
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      aria-label={t("Changer le logo", "تغيير الشعار")}
                      aria-describedby="contract-logo-help"
                      disabled={logoBusy}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file) return;
                        setLogoBusy(true);
                        setLogoError("");
                        try {
                          change({
                            logo: (
                              await prepareImage(file, {
                                maxSide: 640,
                                output: "image/png",
                              })
                            ).src,
                          });
                        } catch {
                          setLogoError(
                            t(
                              "Logo : PNG, JPG ou WebP · 4 Mo max.",
                              "الشعار: PNG أو JPG أو WebP · حتى 4 ميغابايت",
                            ),
                          );
                        } finally {
                          setLogoBusy(false);
                        }
                      }}
                    />
                  </label>
                  <span
                    className="paper-tooltip"
                    id="contract-logo-help"
                    role="tooltip"
                  >
                    {t("1. Changer le logo", "١. تغيير الشعار")}
                  </span>
                </div>
                <div className="paper-agency-name paper-help">
                  <Inline
                    label={t("Nom de l’agence", "اسم الوكالة")}
                    value={a.agency}
                    describedBy="contract-agency-help"
                    placeholder={t("Nom de l’agence", "اسم الوكالة")}
                    change={(agency) => change({ agency })}
                  />
                  <span
                    className="paper-tooltip"
                    id="contract-agency-help"
                    role="tooltip"
                  >
                    {t("2. Ajouter le nom de l’agence", "٢. إضافة اسم الوكالة")}
                  </span>
                </div>
                {a.logo && (
                  <button
                    type="button"
                    className="paper-logo-reset"
                    title={t("Rétablir le logo Louma", "استعادة شعار Louma")}
                    aria-label={t(
                      "Rétablir le logo Louma",
                      "استعادة شعار Louma",
                    )}
                    disabled={logoBusy}
                    onClick={() => change({ logo: "" })}
                  >
                    <X size={15} aria-hidden />
                  </button>
                )}
              </div>
              {logoError && (
                <p className="editor-error error" role="alert">
                  {logoError}
                </p>
              )}
              <h2>{input("title", t("Titre du contrat", "عنوان العقد"))}</h2>
            </header>
            <div className="paper-sections">
              {block("renter")}
              {block("vehicle")}
              {block("rental")}
            </div>
            <section className="paper-block paper-condition" dir={dir}>
              {band("condition")}
              <div className="paper-inspection">
                {conditionNoteGroups.map((group, side) => (
                  <div
                    className={`paper-notes paper-notes-${side}`}
                    key={side}
                    dir={dir}
                  >
                    {group.map((index) => (
                      <Inline
                        key={index}
                        label={`${side === 0 ? t("Observation à gauche", "ملاحظة على اليسار") : t("Observation à droite", "ملاحظة على اليمين")} ${(index % 3) + 1}`}
                        value={a.conditionNotes[index]}
                        placeholder=""
                        maxLength={100}
                        multiline
                        change={(value) =>
                          setAgreement((current) => ({
                            ...current,
                            conditionNotes: current.conditionNotes.map(
                              (note, i) => (i === index ? value : note),
                            ),
                          }))
                        }
                      />
                    ))}
                  </div>
                ))}
                <Image
                  src={conditionDiagram}
                  alt={t(
                    "Schéma du véhicule vu de dessus",
                    "رسم السيارة من الأعلى",
                  )}
                  width={78}
                  height={110}
                  unoptimized
                />
              </div>
            </section>
            <div className="paper-rows paper-amounts" dir={dir}>
              {rows("amounts")}
            </div>
            <div className="paper-place">
              {caption("place", paperText("Fait à / le", "حرر في / بتاريخ"))}
              {input(
                "place",
                t("Lieu et date de signature", "مكان وتاريخ التوقيع"),
              )}
            </div>
            <div className="paper-signatures">
              <div>
                {caption(
                  "stamp",
                  paperText(
                    "Cachet et signature de l’agence",
                    "ختم وتوقيع الوكالة",
                  ),
                )}
              </div>
              <div>
                {caption(
                  "signature",
                  paperText("Signature du locataire", "توقيع المستأجر"),
                )}
              </div>
            </div>
            {footer()}
          </article>

          <article className="paper" lang={a.locale} dir={dir}>
            <div className="paper-terms-grid">
              {(["fr", "ar"] as const).map(term)}
            </div>
            {footer()}
          </article>
        </div>

        <div
          className="editor-toolbar"
          role="group"
          aria-label={t(
            "Couleurs, versions et téléchargement",
            "الألوان والإصدارات والتنزيل",
          )}
          dir="ltr"
        >
          {themes.map(([color, fr, ar]) => (
            <button
              key={color}
              type="button"
              className="theme-swatch"
              style={{ "--swatch": color } as CSSProperties}
              aria-label={t(fr, ar)}
              title={t(fr, ar)}
              aria-pressed={a.color === color}
              onClick={() => change({ color })}
            >
              {a.color === color && <Check size={16} aria-hidden />}
            </button>
          ))}
          <span className="toolbar-divider" aria-hidden />
          {account.signedIn && (
            <button
              type="button"
              className="icon-button"
              aria-label={t("Enregistrer une version", "حفظ إصدار")}
              title={t("Enregistrer une version", "حفظ إصدار")}
              disabled={logoBusy || persistence.status === "conflict"}
              onClick={() => persistence.save(a, true)}
            >
              <Save size={19} aria-hidden />
            </button>
          )}
          <button
            type="button"
            className="editor-download"
            aria-label={t("Télécharger le PDF", "تنزيل PDF")}
            title={t("Télécharger le PDF", "تنزيل PDF")}
            disabled={exporting || logoBusy}
            aria-busy={exporting}
            onClick={() => void exportPdf()}
          >
            <ArrowDownToLine size={21} aria-hidden />
          </button>
        </div>
        {exportError && (
          <p className="editor-error error" role="alert">
            {exportError}
          </p>
        )}
      </div>
      {account.signedIn && (
        <div className="contract-save">
          <label>
            <input
              type="checkbox"
              checked={persistence.autoSave}
              onChange={(event) =>
                persistence.setAutoSave(event.target.checked)
              }
            />
            {t(
              "Enregistrer automatiquement le brouillon",
              "حفظ المسودة تلقائيًا",
            )}
          </label>
          <p
            role="status"
            className={
              persistence.status === "error" ||
              persistence.status === "conflict"
                ? "error"
                : ""
            }
          >
            {
              {
                idle: "",
                saving: t("Enregistrement…", "جارٍ الحفظ…"),
                saved: t("Brouillon enregistré.", "تم حفظ المسودة."),
                archived: t("Version enregistrée.", "تم حفظ الإصدار."),
                error: t(
                  "Enregistrement indisponible. Réessayez avec le bouton d’enregistrement.",
                  "الحفظ غير متاح. حاول مرة أخرى باستخدام زر الحفظ.",
                ),
                conflict: t(
                  "Ce contrat a changé ailleurs. Téléchargez vos modifications, puis rouvrez le contrat depuis Mon espace.",
                  "تم تعديل هذا العقد في مكان آخر. نزّل تعديلاتك ثم أعد فتح العقد من مساحتي.",
                ),
              }[persistence.status]
            }
            {persistence.hasSaved && (
              <>
                {" "}
                <a href={`/${locale}/dashboard`}>{t("Mon espace", "مساحتي")}</a>
              </>
            )}
          </p>
        </div>
      )}
    </section>
  );
}
