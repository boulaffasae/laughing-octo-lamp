"use client";

import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  ArrowDownToLine,
  Check,
  CircleHelp,
  ImagePlus,
  PencilLine,
  Printer,
  Share2,
  X,
} from "lucide-react";
import {
  blank,
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
import { useAccount } from "./account";

const pdfName = "Modèle de contrat de location.pdf";
const themes = [
  ["#235346", "Vert", "أخضر"],
  ["#254e9a", "Bleu", "أزرق"],
  ["#543b75", "Violet", "بنفسجي"],
  ["#903d43", "Bordeaux", "عنابي"],
  ["#25323e", "Ardoise", "رمادي داكن"],
] as const;

function download(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = pdfName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function Inline({
  label,
  value,
  change,
  placeholder = blank,
  maxLength = 120,
  type = "text",
  multiline = false,
}: {
  label: string;
  value: string;
  change: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  type?: "text" | "date" | "time" | "tel";
  multiline?: boolean;
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
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(e) => change(e.target.value)}
        />
      ) : (
        <input
          aria-label={label}
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

function PdfActions({
  agreement,
  getPdf,
  locale,
}: {
  agreement: Agreement;
  getPdf: () => Promise<Blob>;
  locale: Locale;
}) {
  const t = words(locale);
  const account = useAccount();
  const pending = useRef(false);
  const sending = useRef(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState(false);
  const [savedAgreement, setSavedAgreement] = useState<Agreement>();
  const saved = savedAgreement === agreement;
  const [busy, setBusy] = useState(false);
  async function save() {
    if (sending.current || saved) return;
    sending.current = true;
    pending.current = false;
    setBusy(true);
    setError(false);
    setStatus("");
    try {
      const form = new FormData();
      form.set("file", await getPdf(), pdfName);
      form.set("kind", "contract");
      const result = await fetch("/api/documents", {
        method: "POST",
        body: form,
      });
      if (!result.ok) throw Error();
      setSavedAgreement(agreement);
      setStatus(t("PDF enregistré.", "تم حفظ الملف."));
    } catch {
      setError(true);
      setStatus(
        t(
          "Enregistrement indisponible. Votre PDF reste téléchargeable.",
          "الحفظ غير متاح. يمكنك تنزيل الملف.",
        ),
      );
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  const resume = useEffectEvent(() => {
    if (pending.current) void save();
  });
  useEffect(() => {
    if (account.signedIn) resume();
  }, [account.signedIn]);

  return (
    <>
      <div className="editor-actions">
        <button
          className="button secondary"
          type="button"
          disabled={busy || saved || !account.ready || !account.available}
          onClick={() => {
            if (account.signedIn) void save();
            else {
              pending.current = true;
              account.signUp();
            }
          }}
        >
          {saved
            ? t("Enregistré", "تم الحفظ")
            : busy
              ? t("Enregistrement…", "جارٍ الحفظ…")
              : account.signedIn
                ? t("Enregistrer", "حفظ")
                : t("S’inscrire pour enregistrer", "إنشاء حساب لحفظ العقد")}
        </button>
        <div className="pdf-tools">
          <button
            className="icon-button"
            aria-label={t("Partager le PDF", "مشاركة PDF")}
            title={t("Partager le PDF", "مشاركة PDF")}
            type="button"
            onClick={async () => {
              let blob: Blob;
              try {
                blob = await getPdf();
              } catch {
                setError(true);
                setStatus(
                  t("Création du PDF impossible.", "تعذّر إنشاء ملف PDF."),
                );
                return;
              }
              const file = new File([blob], pdfName, {
                type: "application/pdf",
              });
              if (navigator.canShare?.({ files: [file] })) {
                try {
                  await navigator.share({ files: [file] });
                  return;
                } catch (err) {
                  if (err instanceof DOMException && err.name === "AbortError")
                    return;
                }
              }
              download(blob);
              setError(false);
              setStatus(
                t(
                  "PDF téléchargé. Joignez-le dans votre application de partage.",
                  "تم تنزيل الملف. أرفقه في تطبيق المشاركة.",
                ),
              );
            }}
          >
            <Share2 size={18} />
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label={t("Imprimer", "طباعة")}
            title={t("Imprimer", "طباعة")}
            onClick={() => window.print()}
          >
            <Printer size={18} />
          </button>
        </div>
        <p className={error ? "error status" : "status"} aria-live="polite">
          {status && (!savedAgreement || saved || error) ? status : ""}
        </p>
      </div>
    </>
  );
}

export function ContractEditor({ locale }: { locale: Locale }) {
  const t = words(locale);
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [a, setAgreement] = useState(() => initialAgreement(locale));
  const [guide, setGuide] = useState(true);
  const [logoBusy, setLogoBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [logoError, setLogoError] = useState("");
  const [exportError, setExportError] = useState("");
  const pdfCache = useRef<{ agreement: Agreement; result: Promise<Blob> }>(
    null,
  );
  const fields = contractFields(locale);

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
      download(await getPdf());
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
    type?: "date" | "time" | "tel",
  ) => (
    <Inline
      label={label}
      value={fieldValue(a, key)}
      type={type}
      multiline={!type}
      change={(value) => update(key, value)}
    />
  );

  const rows = (id: BlockId | "footer") =>
    fields[id].map(({ key, label, type }) => (
      <div className="paper-row" key={fieldId(key)}>
        <div className="paper-row-label">{caption(fieldId(key), label)}</div>
        {input(key, label, type)}
      </div>
    ));

  const block = (id: BlockId) => (
    <section
      id={id === "renter" ? "contract-renter" : undefined}
      className={`paper-block paper-${id}`}
      dir={dir}
    >
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
      <div className="paper-rows">{rows(id)}</div>
    </section>
  );

  const footer = (id?: string) => (
    <footer
      className="paper-footer"
      id={id}
      aria-label={t("Coordonnées de l’agence", "بيانات الوكالة")}
    >
      {rows("footer")}
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

  function guideLink(target: string, label: ReactNode) {
    const selector =
      target === "contract-agency"
        ? ".paper-agency-name input"
        : target === "contract-terms"
          ? `section[lang="${locale}"] > .inline-field textarea`
          : ".paper-row > .inline-field :is(input, textarea)";
    return (
      <a
        href={`#${target}`}
        onClick={(event) => {
          const field = document
            .getElementById(target)
            ?.querySelector<HTMLElement>(selector);
          if (field) {
            event.preventDefault();
            field.focus();
            field.scrollIntoView({ block: "center" });
          }
        }}
      >
        {label}
      </a>
    );
  }

  return (
    <section
      id="contrat"
      className="shell workspace contract-editor"
      aria-label={t("Modifier le contrat", "تعديل العقد")}
    >
      <div className="editor-guide">
        {guide ? (
          <>
            <PencilLine aria-hidden size={20} />
            <div id="contract-guide">
              <strong>
                {t(
                  "Modifiez directement sur les pages",
                  "عدّل العقد مباشرة على الصفحات",
                )}
              </strong>
              <p>
                {t(
                  "Cliquez sur un texte ou sur les pointillés pour écrire.",
                  "انقر على النص أو النقاط للكتابة.",
                )}
              </p>
              <nav aria-label={t("Accès aux champs", "الوصول إلى الحقول")}>
                {guideLink(
                  "contract-agency",
                  t("Logo et nom", "الشعار والاسم"),
                )}
                {guideLink(
                  "contract-renter",
                  t("Champs du contrat", "حقول العقد"),
                )}
                {guideLink("contract-footer", t("Pied de page", "التذييل"))}
                {guideLink("contract-terms", t("Conditions", "الشروط"))}
              </nav>
            </div>
            <button
              className="icon-button guide-close"
              type="button"
              aria-label={t("Masquer l’aide", "إخفاء المساعدة")}
              onClick={() => setGuide(false)}
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <button
            className="button secondary"
            type="button"
            onClick={() => setGuide(true)}
          >
            <CircleHelp size={16} aria-hidden />{" "}
            {t("Aide à la modification", "مساعدة في التعديل")}
          </button>
        )}
      </div>

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
          <article className="paper">
            <header className="paper-header">
              <div className="paper-brand" id="contract-agency">
                <label
                  className="paper-logo upload-control"
                  title={t("Changer le logo", "تغيير الشعار")}
                >
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
                <div className="paper-agency-name">
                  <Inline
                    label={t("Nom de l’agence", "اسم الوكالة")}
                    value={a.agency}
                    placeholder={t("Nom de l’agence", "اسم الوكالة")}
                    change={(agency) => change({ agency })}
                  />
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
            <div className="paper-place">
              {caption("place", t("Fait à / le", "حرر في / بتاريخ"))}
              {input(
                "place",
                t("Lieu et date de signature", "مكان وتاريخ التوقيع"),
              )}
            </div>
            <div className="paper-signatures">
              <div>
                {caption(
                  "stamp",
                  t("Cachet et signature de l’agence", "ختم وتوقيع الوكالة"),
                )}
              </div>
              <div>
                {caption(
                  "signature",
                  t("Signature du locataire", "توقيع المستأجر"),
                )}
              </div>
            </div>
            {footer("contract-footer")}
          </article>

          <article className="paper">
            <div className="paper-terms-grid" id="contract-terms">
              {(["fr", "ar"] as const).map(term)}
            </div>
            {footer()}
          </article>
        </div>

        <div
          className="editor-toolbar"
          role="group"
          aria-label={t("Couleurs et téléchargement", "الألوان والتنزيل")}
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
      <PdfActions agreement={a} getPdf={getPdf} locale={locale} />
    </section>
  );
}
