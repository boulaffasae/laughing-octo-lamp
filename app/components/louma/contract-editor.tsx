"use client";

import { useRef, useState, type CSSProperties } from "react";
import {
  ArrowDownToLine,
  Check,
  Cloud,
  CloudCheck,
  CloudOff,
  CircleHelp,
  ImagePlus,
  LoaderCircle,
  Redo2,
  Undo2,
  X,
} from "lucide-react";
import Image from "next/image";
import {
  addressMaxLength,
  agencyFooterText,
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
import { contractTemplates, templateForColor } from "@/lib/contract/templates";
import { prepareImage } from "@/lib/contract/prepare-image";
import type { Locale } from "@/i18n/locales";
import type { SavedDraft } from "@/lib/contract/saved-contract";
import { useAccount } from "./account";
import { contractPdfName, downloadPdf } from "./pdf-file";
import { useContractTour } from "./contract-tour";
import { useAgreementHistory } from "./use-agreement-history";
import { useContractSave } from "./use-contract-save";

function Inline({
  label,
  value,
  change,
  placeholder = blank,
  maxLength = 120,
  type = "text",
  multiline = false,
  lines = 1,
  describedBy,
}: {
  label: string;
  value: string;
  change: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  type?: "text" | "date" | "time";
  multiline?: boolean;
  lines?: number;
  describedBy?: string;
}) {
  return (
    <span
      className={multiline ? "inline-field inline-multiline" : "inline-field"}
      style={lines > 1 ? { minHeight: `calc(${lines}lh + 8px)` } : undefined}
    >
      <span aria-hidden className="inline-copy">
        {value || placeholder}
        {multiline ? " " : ""}
      </span>
      {multiline ? (
        <textarea
          rows={lines}
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
  const history = useAgreementHistory(
    () => saved?.draft ?? initialAgreement(locale),
  );
  const { agreement: a, setAgreement } = history;
  const tour = useContractTour(locale, !saved);
  const dir = a.locale === "ar" ? "rtl" : "ltr";
  const paperText = words(a.locale);
  const persistence = useContractSave(a, account.signedIn, saved);
  const [SyncIcon, syncLabel] = {
    idle: [
      Cloud,
      t("Enregistrement automatique actif", "الحفظ التلقائي مفعّل"),
    ],
    saving: [LoaderCircle, t("Synchronisation…", "جارٍ المزامنة…")],
    saved: [CloudCheck, t("Contrat synchronisé", "تمت مزامنة العقد")],
    error: [CloudOff, t("Synchronisation indisponible", "المزامنة غير متاحة")],
    conflict: [CloudOff, t("Conflit de synchronisation", "تعارض في المزامنة")],
  }[persistence.status] as [typeof Cloud, string];
  const [logoBusy, setLogoBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [logoError, setLogoError] = useState("");
  const [exportError, setExportError] = useState("");
  const pdfCache = useRef<{ agreement: Agreement; result: Promise<Blob> }>(
    null,
  );
  const fields = contractFields(a.locale);
  const template = templateForColor(a.color);

  function change(patch: Partial<Agreement>, group = true) {
    setAgreement((current) => ({ ...current, ...patch }), group);
  }

  function update(key: FieldKey, value: string) {
    if (typeof key === "string") change({ [key]: value });
    else {
      setAgreement((current) => ({
        ...current,
        documents: current.documents.map((doc, i) =>
          i === key[0]
            ? {
                ...doc,
                ...(i === 0 && key[1] === "address" ? { city: "" } : {}),
                [key[1]]: value,
              }
            : doc,
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
      persistence.save(a, result);
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

  const input = (
    key: FieldKey,
    label: string,
    type?: "date" | "time",
    lines = 1,
  ) => (
    <Inline
      label={label}
      value={fieldValue(a, key)}
      type={type}
      multiline={!type}
      lines={lines}
      placeholder={Array<string>(lines).fill(blank).join("\n")}
      maxLength={lines > 1 ? addressMaxLength : 120}
      change={(value) => update(key, value)}
    />
  );

  const rows = (id: keyof typeof fields) =>
    fields[id].map(({ key, label, type, fullWidth, lines }) => (
      <div
        className={fullWidth ? "paper-row paper-row-wide" : "paper-row"}
        key={fieldId(key)}
      >
        <div className="paper-row-label">{caption(fieldId(key), label)}</div>
        {input(key, label, type, lines)}
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

  const block = (id: Exclude<BlockId, "condition">) => {
    const step = { renter: 3, vehicle: 4, rental: 5 }[id];
    return (
      <section
        className={`paper-block paper-${id}`}
        dir={dir}
        data-tour-step={step}
        aria-describedby={tour.describedBy(step)}
      >
        {tour.hint(step)}
        {band(id)}
        <div
          className={
            template.wideFields?.includes(id)
              ? "paper-rows paper-rows-wide"
              : "paper-rows"
          }
        >
          {rows(id)}
        </div>
      </section>
    );
  };

  const footer = (front = false) => (
    <footer
      className="paper-footer"
      data-tour-step={front ? 9 : undefined}
      aria-label={t("Coordonnées de l’agence", "بيانات الوكالة")}
    >
      {front && tour.hint(9)}
      <Inline
        label={t("Texte du pied de page", "نص التذييل")}
        describedBy={front ? tour.describedBy(9) : undefined}
        value={agencyFooterText(a)}
        lines={4}
        placeholder=""
        maxLength={360}
        multiline
        change={(footerText) => change({ footerText })}
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
      onChangeCapture={tour.onChange}
      onBlurCapture={(event) => {
        history.finishEdit();
        tour.onBlur(event);
      }}
      id="contrat"
      className="shell workspace contract-editor"
      aria-label={t("Modifier le contrat", "تعديل العقد")}
    >
      <div
        className="editor-canvas"
        data-template={template.id}
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
              {tour.hint(1)}
              {tour.hint(2)}
              <div className="paper-brand">
                <div data-tour-step={1} data-tour-active={tour.step === 1}>
                  <label
                    className={
                      a.logo
                        ? "paper-logo upload-control"
                        : "paper-logo paper-logo-placeholder upload-control"
                    }
                  >
                    {a.logo ? (
                      /* eslint-disable-next-line @next/next/no-img-element -- The agency logo is a local data URL. */
                      <img src={a.logo} alt="" width={75} height={44} />
                    ) : (
                      <>
                        <ImagePlus size={19} aria-hidden />
                        <span>{t("Importer un logo", "رفع شعار")}</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      aria-label={t("Changer le logo", "تغيير الشعار")}
                      aria-describedby={tour.describedBy(1)}
                      disabled={logoBusy}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file) return;
                        setLogoBusy(true);
                        setLogoError("");
                        try {
                          change(
                            {
                              logo: (
                                await prepareImage(file, {
                                  maxSide: 640,
                                  output: "image/png",
                                })
                              ).src,
                            },
                            false,
                          );
                          tour.logoUploaded();
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
                </div>
                <div
                  className="paper-agency-name"
                  data-tour-step={2}
                  data-tour-active={tour.step === 2}
                >
                  <Inline
                    label={t("Nom de l’agence", "اسم الوكالة")}
                    value={a.agency}
                    describedBy={tour.describedBy(2)}
                    placeholder={t("Nom de l’agence", "اسم الوكالة")}
                    change={(agency) => change({ agency })}
                  />
                </div>
                {a.logo && (
                  <button
                    type="button"
                    className="paper-logo-reset"
                    title={t("Retirer le logo", "إزالة الشعار")}
                    aria-label={t("Retirer le logo", "إزالة الشعار")}
                    disabled={logoBusy}
                    onClick={() => change({ logo: "" }, false)}
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
              {template.rows.map((row) => (
                <div className="paper-section-row" key={row[0].blocks[0]}>
                  {row.map(({ blocks, weight }) => (
                    <div
                      className="paper-section-column"
                      key={blocks[0]}
                      style={{ flexGrow: weight }}
                    >
                      {blocks.map((id) => (
                        <div className="paper-section-slot" key={id}>
                          {block(id)}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <section
              className="paper-block paper-condition"
              dir={dir}
              data-tour-step={6}
              aria-describedby={tour.describedBy(6)}
            >
              {tour.hint(6)}
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
            <div data-tour-step={7} aria-describedby={tour.describedBy(7)}>
              {tour.hint(7)}
              <div className="paper-rows paper-amounts" dir={dir}>
                {rows("amounts")}
              </div>
            </div>
            <div data-tour-step={8} aria-describedby={tour.describedBy(8)}>
              {tour.hint(8)}
              <div className="paper-place">
                {caption("place", paperText("Fait à / le", "حرر في / بتاريخ"))}
                {input(
                  "place",
                  t("Lieu et date de signature", "مكان وتاريخ التوقيع"),
                )}
              </div>
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
            {footer(true)}
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
          {contractTemplates.map(({ color, fr, ar }) => (
            <button
              key={color}
              type="button"
              className="theme-swatch"
              style={{ "--swatch": color } as CSSProperties}
              aria-label={t(fr, ar)}
              title={t(fr, ar)}
              aria-pressed={template.color === color}
              onClick={() => {
                if (a.color !== color) change({ color }, false);
              }}
            >
              {template.color === color && <Check size={16} aria-hidden />}
            </button>
          ))}
          <span className="toolbar-divider" aria-hidden />
          <button
            type="button"
            className="icon-button editor-tool"
            aria-label={t("Ouvrir le guide", "فتح الدليل")}
            title={t("Ouvrir le guide", "فتح الدليل")}
            onClick={tour.start}
          >
            <CircleHelp size={18} aria-hidden />
          </button>
          <button
            type="button"
            className="icon-button editor-tool"
            aria-label={t("Annuler", "تراجع")}
            title={t("Annuler", "تراجع")}
            disabled={!history.canUndo || logoBusy}
            onClick={history.undo}
          >
            <Undo2 size={18} aria-hidden />
          </button>
          <button
            type="button"
            className="icon-button editor-tool"
            aria-label={t("Rétablir", "إعادة")}
            title={t("Rétablir", "إعادة")}
            disabled={!history.canRedo || logoBusy}
            onClick={history.redo}
          >
            <Redo2 size={18} aria-hidden />
          </button>
          {account.signedIn &&
            (persistence.status === "error" ? (
              <button
                type="button"
                className="icon-button editor-tool"
                aria-label={t(
                  "Réessayer la synchronisation",
                  "إعادة محاولة المزامنة",
                )}
                title={t(
                  "Réessayer la synchronisation",
                  "إعادة محاولة المزامنة",
                )}
                onClick={() => persistence.save(a)}
              >
                <CloudOff size={19} aria-hidden />
              </button>
            ) : (
              <span className="editor-sync" role="status" title={syncLabel}>
                <span className="sr-only">{syncLabel}</span>
                <SyncIcon
                  className={
                    persistence.status === "saving" ? "sync-spinner" : undefined
                  }
                  size={19}
                  aria-hidden
                />
              </span>
            ))}
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
      {account.signedIn &&
        (persistence.status === "error" ||
          persistence.status === "conflict") && (
          <p className="contract-save error" role="alert">
            {persistence.status === "error"
              ? t(
                  "Synchronisation indisponible. Cliquez sur l’icône pour réessayer.",
                  "المزامنة غير متاحة. انقر على الأيقونة لإعادة المحاولة.",
                )
              : t(
                  "Ce contrat a changé ailleurs. Téléchargez vos modifications, puis rouvrez le contrat depuis Mes contrats.",
                  "تم تعديل هذا العقد في مكان آخر. نزّل تعديلاتك ثم أعد فتح العقد من عقودي.",
                )}
          </p>
        )}
    </section>
  );
}
