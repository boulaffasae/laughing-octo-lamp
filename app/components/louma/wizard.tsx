"use client";

import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Printer,
  Share2,
  Upload,
} from "lucide-react";
import {
  blockRows,
  headingInk,
  frontPageOrder,
  initialAgreement,
  words,
  type Agreement,
  type BlockId,
} from "@/lib/contract/agreement";
import { isSupportedDocument } from "@/lib/contract/documents";
import { scanDocument } from "@/lib/contract/scan-document";
import { ALLOWED_UPLOAD_TYPES, MAX_FILE_BYTES } from "@/lib/upload-policy";
import type { Locale } from "@/i18n/locales";
import { useAccount } from "./account";

const pdfName = "contrat-location.pdf";
type Patch = (patch: Partial<Agreement>) => void;
type Update = (index: number, values: Record<string, string>) => void;
type FrontBlock = Agreement["order"][number];

function Field({
  label,
  value,
  change,
  type = "text",
  wide = false,
  placeholder,
}: {
  label: string;
  value: string;
  change: (value: string) => void;
  type?: string;
  wide?: boolean;
  placeholder?: string;
}) {
  return (
    <label className={wide ? "field field-wide" : "field"}>
      <span>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => change(e.target.value)}
        maxLength={type === "text" || type === "tel" ? 140 : undefined}
        min={type === "number" ? 0 : undefined}
        step={type === "number" ? ".01" : undefined}
      />
    </label>
  );
}

function download(blob: Blob, name = pdfName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

async function generate(a: Agreement) {
  const { buildContractPdf } = await import("../contract/contract-pdf");
  return buildContractPdf(a);
}

async function prepareLogo(input: File) {
  if (
    !["image/png", "image/jpeg", "image/webp"].includes(input.type) ||
    input.size > MAX_FILE_BYTES
  )
    throw Error();
  const image = await createImageBitmap(input);
  try {
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 640 / Math.max(image.width, image.height));
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    canvas
      .getContext("2d")!
      .drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } finally {
    image.close();
  }
}

function ScanFields({
  vehicle,
  a,
  update,
}: {
  vehicle: boolean;
  a: Agreement;
  update: Update;
}) {
  const t = words(a.locale);
  const [kind, setKind] = useState(vehicle ? 2 : 0);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);

  async function scan(file: File) {
    if (controller.current) return;
    if (!isSupportedDocument(file)) {
      setStatus(
        t("Image ou PDF · 4 Mo max.", "صورة أو PDF · الحد الأقصى 4 ميغابايت"),
      );
      return;
    }
    const active = new AbortController();
    controller.current = active;
    setBusy(true);
    setStatus(t("Lecture…", "جارٍ القراءة…"));
    try {
      const fields = await scanDocument(file, kind, "OCR", active.signal);
      if (active.signal.aborted) return;
      const values = Object.fromEntries(
        Object.entries(fields)
          .filter(
            ([key, value]) =>
              value.trim() &&
              (key !== "issued" || /^\d{4}-\d{2}-\d{2}$/.test(value)),
          )
          .map(([key, value]) => [key, value.slice(0, 140)]),
      );
      update(kind, values);
      setStatus(
        Object.keys(values).length
          ? t("Vérifiez les champs.", "تحقق من الحقول.")
          : t("Aucun champ détecté.", "لم تُكتشف أي بيانات."),
      );
    } catch {
      if (!active.signal.aborted)
        setStatus(t("Lecture impossible.", "تعذرت القراءة."));
    } finally {
      if (!active.signal.aborted) {
        controller.current = null;
        setBusy(false);
      }
    }
  }

  const field = (
    index: number,
    key: string,
    label: string,
    type?: string,
    wide?: boolean,
  ) => (
    <Field
      label={label}
      value={a.documents[index][key] ?? ""}
      placeholder={
        type === "date"
          ? undefined
          : (
              {
                name: t("Ex. Amal Benali", "مثال: أمل بنعلي"),
                identity: "AB123456",
                licence: "12/345678",
                brand: "Ex. Dacia Sandero",
                plate: "12345-A-6",
              } as Record<string, string>
            )[key]
      }
      change={(value) => update(index, { [key]: value })}
      type={type}
      wide={wide}
    />
  );

  return (
    <>
      <section
        className="quick-import"
        aria-labelledby="scan-title"
        aria-busy={busy}
        data-drag-over={dragOver || undefined}
        onDragOver={(e) => {
          if (!e.dataTransfer.types.includes("Files")) return;
          e.preventDefault();
          if (!busy) setDragOver(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setDragOver(false);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) void scan(file);
        }}
      >
        <div className="scan-intro">
          <span className="scan-symbol" aria-hidden>
            <Upload size={20} />
          </span>
          <div>
            <h2 id="scan-title">
              {t("Importer un document", "استيراد وثيقة")}
            </h2>
            <p>
              {t(
                "Glissez un fichier ici · Image ou PDF, 4 Mo max.",
                "أفلت ملفًا هنا · صورة أو PDF، حتى 4 ميغابايت",
              )}
            </p>
          </div>
        </div>
        {!vehicle && (
          <select
            aria-label={t("Type de document", "نوع الوثيقة")}
            value={kind}
            disabled={busy}
            onChange={(e) => setKind(Number(e.target.value))}
          >
            <option value={0}>{t("CNIE", "البطاقة الوطنية")}</option>
            <option value={1}>{t("Permis", "رخصة السياقة")}</option>
          </select>
        )}
        <span className="sr-only" id="ocr-notice">
          {t(
            "Le document est envoyé à Datalab pour la lecture.",
            "تُرسل الوثيقة إلى Datalab لقراءتها.",
          )}
        </span>
        <div className="scan-sources">
          {([false, true] as const).map((camera) => {
            const label = camera
              ? t("Prendre une photo", "التقاط صورة")
              : t("Parcourir les fichiers", "تصفح الملفات");
            const Icon = camera ? Camera : Upload;
            return (
              <label
                key={String(camera)}
                className="button secondary upload-control"
              >
                <Icon size={17} aria-hidden />
                {label}
                <input
                  aria-label={label}
                  aria-describedby="ocr-notice"
                  type="file"
                  accept={(camera
                    ? ALLOWED_UPLOAD_TYPES.filter((type) =>
                        type.startsWith("image/"),
                      )
                    : ALLOWED_UPLOAD_TYPES
                  ).join(",")}
                  capture={camera ? "environment" : undefined}
                  disabled={busy}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) void scan(file);
                  }}
                />
              </label>
            );
          })}
        </div>
        <p className="status" role="status">
          {status}
        </p>
      </section>
      <div className="divider">{t("ou", "أو")}</div>
      <div className="fields">
        {vehicle ? (
          <>
            {field(
              2,
              "brand",
              t("Marque / Modèle", "الماركة / الطراز"),
              undefined,
              true,
            )}
            {field(2, "plate", t("Immatriculation", "رقم التسجيل"))}
            {field(2, "fuel", t("Carburant", "الوقود"))}
          </>
        ) : (
          <>
            {field(
              0,
              "name",
              t("Nom et prénom", "الاسم الكامل"),
              undefined,
              true,
            )}
            {field(0, "identity", t("CNIE", "البطاقة الوطنية"))}
            {field(
              0,
              "issued",
              t("Délivrée le", "تاريخ إصدار البطاقة"),
              "date",
            )}
            {field(0, "address", t("Adresse", "العنوان"))}
            {field(0, "city", t("Ville", "المدينة"))}
            {field(1, "licence", t("Permis", "رخصة السياقة"))}
            {field(1, "issued", t("Délivré le", "تاريخ إصدار الرخصة"), "date")}
          </>
        )}
      </div>
    </>
  );
}

function ContractPreview({
  a,
  change,
  edit,
  activeBlock,
}: {
  a: Agreement;
  change: Patch;
  edit: boolean;
  activeBlock?: BlockId;
}) {
  const t = words(a.locale);
  const [dragging, setDragging] = useState<FrontBlock | null>(null);
  const [over, setOver] = useState<FrontBlock | null>(null);
  const [message, setMessage] = useState("");
  function move(id: FrontBlock, index: number) {
    const order = a.order.filter((item) => item !== id);
    order.splice(index, 0, id);
    change({ order });
    setMessage(t("Section déplacée.", "تم نقل القسم."));
  }
  const heading = (id: BlockId) => (
    <h3>
      {edit ? (
        <input
          aria-label={
            t("Titre de section", "عنوان القسم") +
            " · " +
            initialAgreement(a.locale).headings[id]
          }
          maxLength={80}
          value={a.headings[id]}
          onChange={(e) =>
            change({ headings: { ...a.headings, [id]: e.target.value } })
          }
        />
      ) : (
        a.headings[id]
      )}
    </h3>
  );

  const section = (id: "agency" | FrontBlock) => {
    const movable = edit && id !== "agency";
    return (
      <section
        key={id}
        className="paper-block"
        data-active={activeBlock === id || undefined}
        data-drop={over === id && dragging !== id ? "" : undefined}
        onDragOver={
          movable
            ? (e) => {
                if (dragging) {
                  e.preventDefault();
                  setOver(id);
                }
              }
            : undefined
        }
        onDrop={
          movable
            ? (e) => {
                e.preventDefault();
                if (dragging && dragging !== id)
                  move(dragging, a.order.indexOf(id));
                setDragging(null);
                setOver(null);
              }
            : undefined
        }
      >
        <div className="paper-band">{heading(id)}</div>
        <dl
          className="paper-rows"
          draggable={movable}
          onDragStart={
            movable
              ? (e) => {
                  setDragging(id);
                  e.dataTransfer.setData("text/plain", id);
                  e.dataTransfer.effectAllowed = "move";
                }
              : undefined
          }
          onDragEnd={() => {
            setDragging(null);
            setOver(null);
          }}
        >
          {blockRows(a, id).map(([label, value], index) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd
                dir={
                  value && !(edit && id === "vehicle" && index === 3)
                    ? "auto"
                    : undefined
                }
              >
                {edit && id === "vehicle" && index === 3 ? (
                  <input
                    aria-label={label}
                    placeholder="……………………"
                    maxLength={120}
                    value={a.condition}
                    onChange={(e) => change({ condition: e.target.value })}
                  />
                ) : (
                  value || "……………………"
                )}
              </dd>
            </div>
          ))}
        </dl>
        {movable && (
          <div className="paper-reorder">
            {a.order.indexOf(id) > 0 && (
              <button
                type="button"
                onClick={() => move(id, a.order.indexOf(id) - 1)}
              >
                {t("Monter", "أعلى")}
              </button>
            )}
            {a.order.indexOf(id) < a.order.length - 1 && (
              <button
                type="button"
                onClick={() => move(id, a.order.indexOf(id) + 1)}
              >
                {t("Descendre", "أسفل")}
              </button>
            )}
          </div>
        )}
      </section>
    );
  };

  return (
    <aside
      className="live-preview"
      aria-label={t("Aperçu du contrat", "معاينة العقد")}
      style={
        {
          "--paper-color": a.color,
          "--paper-ink": headingInk(a.color),
        } as CSSProperties
      }
    >
      <div
        className="paper-scroll"
        tabIndex={0}
        aria-label={t("Pages du contrat", "صفحات العقد")}
      >
        <article className="paper">
          <header className="paper-header">
            {/* eslint-disable-next-line @next/next/no-img-element -- the replacement is a data URL */}
            <img
              src={a.logo || "/louma.svg"}
              alt={a.logo ? t("Logo de l’agence", "شعار الوكالة") : "Louma"}
              width={34}
              height={34}
            />
            <h2>
              {edit ? (
                <input
                  aria-label={t("Titre du contrat", "عنوان العقد")}
                  maxLength={120}
                  value={a.title}
                  onChange={(e) => change({ title: e.target.value })}
                />
              ) : (
                a.title
              )}
            </h2>
          </header>
          <div className="paper-sections">{frontPageOrder(a).map(section)}</div>
          <div className="paper-place">
            {t("Fait à / le", "حرر في / بتاريخ")} :{" "}
            {edit ? (
              <input
                aria-label={t(
                  "Lieu et date de signature",
                  "مكان وتاريخ التوقيع",
                )}
                placeholder="……………………"
                maxLength={100}
                value={a.place}
                onChange={(e) => change({ place: e.target.value })}
              />
            ) : (
              a.place || "……………………"
            )}
          </div>
          <div className="paper-signatures">
            <span>
              {t("Cachet et signature de l’agence", "ختم وتوقيع الوكالة")}
            </span>
            <span>{t("Signature du locataire", "توقيع المستأجر")}</span>
          </div>
        </article>
        <article className="paper">
          <div className="paper-terms-grid" dir="ltr">
            {(["fr", "ar"] as const).map((lang) => {
              const key = lang === "fr" ? "termsFr" : "termsAr";
              const label =
                lang === "fr" ? "Conditions de location" : "شروط الكراء";
              return (
                <section
                  key={lang}
                  lang={lang}
                  dir={lang === "ar" ? "rtl" : "ltr"}
                >
                  <header className="paper-header">
                    {a.locale === lang ? heading("terms") : <h3>{label}</h3>}
                  </header>
                  {edit ? (
                    <textarea
                      aria-label={label}
                      maxLength={3500}
                      value={a[key]}
                      placeholder={label}
                      onChange={(e) => change({ [key]: e.target.value })}
                    />
                  ) : (
                    <div className="paper-terms">
                      {(a[key].trim() || "……………………")
                        .split(/\n\s*\n/)
                        .map((clause, index) => {
                          const [title, ...body] = clause.split("\n");
                          return (
                            <p key={index}>
                              <strong>{title}</strong>
                              {body.length > 0 && (
                                <>
                                  <br />
                                  {body.join("\n")}
                                </>
                              )}
                            </p>
                          );
                        })}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </article>
      </div>
      <p className="sr-only" aria-live="polite">
        {message}
      </p>
    </aside>
  );
}
function FinalPdf({
  getPdf,
  locale,
}: {
  getPdf: () => Promise<Blob>;
  locale: Locale;
}) {
  const t = words(locale);
  const account = useAccount();
  const pending = useRef(false);
  const sending = useRef(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);
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
      setSaved(true);
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
      <div className="final-actions">
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
          {status}
        </p>
      </div>
    </>
  );
}

export function Wizard({ locale }: { locale: Locale }) {
  const t = words(locale);
  const [stage, setStage] = useState(0);
  const [a, setAgreement] = useState(() => initialAgreement(locale));
  const [completed, setCompleted] = useState<Set<number>>(() => new Set());
  const pdfCache = useRef<{ agreement: Agreement; result: Promise<Blob> }>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [logoBusy, setLogoBusy] = useState(false);
  const [error, setError] = useState("");
  const section = useRef<HTMLElement>(null);
  const stepButtons = useRef<(HTMLButtonElement | null)[]>([]);

  const change: Patch = (patch) =>
    setAgreement((current) => ({ ...current, ...patch }));
  const update: Update = (index, fields) =>
    setAgreement((current) => ({
      ...current,
      documents: current.documents.map((doc, i) =>
        i === index ? { ...doc, ...fields } : doc,
      ),
    }));
  const steps = [
    t("Modèle", "النموذج"),
    t("Identité", "الهوية"),
    t("Véhicule", "السيارة"),
    t("Dates", "التواريخ"),
    t("Tarif", "التعرفة"),
    "PDF",
  ];
  const Next = locale === "ar" ? ArrowLeft : ArrowRight;
  const Back = locale === "ar" ? ArrowRight : ArrowLeft;

  function complete(index: number) {
    setCompleted((previous) => new Set(previous).add(index));
  }

  function go(next: number, completeCurrent = false) {
    if (next === stage) return;
    if (completeCurrent) complete(stage);
    setError("");
    setStage(next);
    section.current?.scrollIntoView({ block: "start" });
    requestAnimationFrame(() =>
      stepButtons.current[next]?.focus({ preventScroll: true }),
    );
  }

  function getPdf() {
    if (pdfCache.current?.agreement === a) return pdfCache.current.result;
    const result = generate(a).catch((error) => {
      if (pdfCache.current?.agreement === a) pdfCache.current = null;
      throw error;
    });
    pdfCache.current = { agreement: a, result };
    return result;
  }

  async function exportPdf() {
    setBusy(true);
    setError("");
    try {
      download(await getPdf());
      if (stage === steps.length - 1) complete(stage);
    } catch {
      setError(t("Création du PDF impossible.", "تعذّر إنشاء ملف PDF."));
    } finally {
      setBusy(false);
    }
  }
  const placeholders: Partial<Record<keyof Agreement, string>> = {
    agency: t("Ex. Atlas Location", "مثال: أطلس للكراء"),
    company: t("Ex. Atlas Location SARL", "مثال: أطلس للكراء ش.ذ.م.م"),
    agencyAddress: t(
      "Ex. 12, rue Atlas, Casablanca",
      "مثال: 12 شارع الأطلس، الدار البيضاء",
    ),
    registration: "123456 / 001234567000012",
    phone: "+212 6 XX XX XX XX",
    price: "1 200",
    deposit: "3 000",
  };
  const activeBlock = (
    ["agency", "renter", "vehicle", "rental", "rental"] as const
  )[stage];
  const field = (
    key: Exclude<
      keyof Agreement,
      "locale" | "documents" | "headings" | "order"
    >,
    label: string,
    type?: string,
    wide?: boolean,
  ) => (
    <Field
      label={label}
      value={a[key]}
      placeholder={placeholders[key]}
      change={(value) => change({ [key]: value })}
      type={type}
      wide={wide}
    />
  );
  return (
    <section
      ref={section}
      id="contrat"
      className="shell wizard workspace"
      aria-label={t("Créer un contrat", "إنشاء عقد")}
    >
      <ol
        className="steps"
        aria-label={t("Progression", "التقدم")}
        style={
          {
            "--progress": `${(stage / (steps.length - 1)) * 100}%`,
          } as CSSProperties
        }
      >
        {steps.map((label, i) => (
          <li key={label}>
            <button
              ref={(element) => {
                stepButtons.current[i] = element;
              }}
              className="step-button"
              type="button"
              aria-current={i === stage ? "step" : undefined}
              data-completed={completed.has(i) || undefined}
              disabled={busy || logoBusy}
              onClick={() => go(i)}
            >
              <span className="step-dot" aria-hidden>
                {completed.has(i) && <Check size={12} strokeWidth={3} />}
              </span>
              {label}
              {completed.has(i) && (
                <span className="sr-only"> · {t("Terminé", "مكتمل")}</span>
              )}
            </button>
          </li>
        ))}
      </ol>
      <div className="preview-label">
        <button
          className="button secondary pdf-download"
          type="button"
          disabled={busy || logoBusy}
          onClick={() => void exportPdf()}
        >
          <ArrowDownToLine size={17} aria-hidden />
          {busy
            ? t("Création…", "جارٍ الإنشاء…")
            : t("Télécharger le PDF", "تنزيل PDF")}
        </button>
        <label className="color-control">
          {t("Couleur du contrat", "لون العقد")}
          <input
            type="color"
            value={a.color}
            disabled={busy}
            onChange={(e) => change({ color: e.target.value })}
          />
        </label>
      </div>
      <div className="work-grid">
        <div className="work-form" key={stage}>
          {stage === 0 && (
            <div className="fields">
              <div className="model-tools">
                <span>{t("Logo", "الشعار")}</span>
                <label className="button secondary upload-control">
                  {t("Choisir", "اختيار")}
                  <input
                    type="file"
                    aria-label={t("Remplacer le logo", "استبدال الشعار")}
                    accept="image/png,image/jpeg,image/webp"
                    disabled={logoBusy}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (!file) return;
                      setLogoBusy(true);
                      setError("");
                      try {
                        change({ logo: await prepareLogo(file) });
                      } catch {
                        setError(
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
                {a.logo && (
                  <button
                    className="button secondary"
                    type="button"
                    onClick={() => change({ logo: "" })}
                  >
                    {t("Logo Louma", "شعار Louma")}
                  </button>
                )}
              </div>
              {field("agency", t("Nom de l’agence", "اسم الوكالة"))}
              {field("phone", t("Téléphone", "الهاتف"), "tel", true)}
              {field("agencyAddress", t("Adresse", "العنوان"), undefined, true)}
              {field("company", t("Raison sociale", "اسم الشركة"))}
              {field("registration", "RC / ICE")}
            </div>
          )}
          {(stage === 1 || stage === 2) && (
            <ScanFields vehicle={stage === 2} a={a} update={update} />
          )}
          {stage === 3 && (
            <div className="date-fields">
              <fieldset>
                <legend>{t("Départ", "التسليم")}</legend>
                <div className="fields">
                  {field("start", t("Date", "التاريخ"), "date")}
                  {field("startTime", t("Heure", "الوقت"), "time")}
                </div>
              </fieldset>
              <fieldset>
                <legend>{t("Retour", "الإرجاع")}</legend>
                <div className="fields">
                  {field("end", t("Date", "التاريخ"), "date")}
                  {field("endTime", t("Heure", "الوقت"), "time")}
                </div>
              </fieldset>
            </div>
          )}
          {stage === 4 && (
            <div className="fields">
              {field("price", t("Total (MAD)", "المجموع (درهم)"), "number")}
              {field("deposit", t("Caution (MAD)", "الضمان (درهم)"), "number")}
            </div>
          )}
          {stage === 5 && (
            <FinalPdf key={a.color} getPdf={getPdf} locale={locale} />
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="work-dock">
            {stage > 0 && (
              <button
                className="button secondary"
                type="button"
                disabled={busy}
                onClick={() => go(stage - 1)}
                aria-label={t("Précédent", "السابق")}
              >
                <Back size={18} />
              </button>
            )}
            {stage < 5 && (
              <button
                className="button"
                type="button"
                disabled={busy || logoBusy}
                onClick={() => go(stage + 1, true)}
              >
                {stage === 4
                  ? t("Voir le PDF", "عرض PDF")
                  : t("Suivant", "التالي")}
                <Next size={18} aria-hidden />
              </button>
            )}
          </div>
        </div>
        <ContractPreview
          a={a}
          change={change}
          edit={stage === 0}
          activeBlock={activeBlock}
        />
      </div>
    </section>
  );
}
