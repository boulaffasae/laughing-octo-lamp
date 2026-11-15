"use client";

import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  ArrowDownToLine,
  Check,
  FileText,
  Grip,
  Printer,
  ScanLine,
  Share2,
  Upload,
  X,
} from "lucide-react";
import {
  blockRows,
  words,
  type Agreement,
  type BlockId,
} from "@/lib/contract/agreement";
import {
  createEmptyDocuments,
  isSupportedDocument,
} from "@/lib/contract/documents";
import { scanDocument } from "@/lib/contract/scan-document";
import { MAX_FILE_BYTES } from "@/lib/upload-policy";
import type { Locale } from "@/i18n/locales";
import { useAccount } from "./account";

type Stage = 0 | 1 | 2 | 3 | 4;
const pdfName = "contrat-location.pdf";

function initialAgreement(locale: Locale): Agreement {
  const t = words(locale);
  return {
    locale,
    title: t("Contrat de location de voiture", "عقد كراء السيارة"),
    logo: "",
    agency: "",
    documents: createEmptyDocuments(),
    start: "",
    end: "",
    price: "",
    deposit: "",
    terms: t(
      "Le locataire s’engage à restituer le véhicule à la date convenue et à respecter les règles de circulation.",
      "يلتزم المستأجر بإرجاع السيارة في التاريخ المتفق عليه واحترام قواعد السير.",
    ),
    headings: {
      agency: t("Agence", "الوكالة"),
      renter: t("Locataire", "المستأجر"),
      vehicle: t("Véhicule", "السيارة"),
      rental: t("Location", "الكراء"),
      terms: t("Conditions de location", "شروط الكراء"),
    },
    columns: [
      ["agency", "vehicle", "terms"],
      ["renter", "rental"],
    ],
  };
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  min?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        value={value}
        type={type}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        min={min}
        maxLength={200}
        step={type === "number" ? "0.01" : undefined}
      />
    </label>
  );
}

function download(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = pdfName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
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

function Editor({
  agreement,
  change,
}: {
  agreement: Agreement;
  change: (patch: Partial<Agreement>) => void;
}) {
  const t = words(agreement.locale);
  const [preview, setPreview] = useState(false);
  const [dragging, setDragging] = useState<BlockId | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  function move(id: BlockId, column: number, before?: BlockId) {
    if (id === before) return;
    const columns = agreement.columns.map((list) =>
      list.filter((key) => key !== id),
    ) as Agreement["columns"];
    const index = before ? columns[column].indexOf(before) : -1;
    columns[column].splice(
      index === -1 ? columns[column].length : index,
      0,
      id,
    );
    change({ columns });
    setError(false);
    setMessage(t("Bloc déplacé.", "تم نقل الكتلة."));
  }

  return (
    <>
      <div className="wizard-title">
        <h2 tabIndex={-1}>{t("Personnaliser le contrat", "تخصيص العقد")}</h2>
        <div
          className="view-switch"
          aria-label={t("Mode d’affichage", "وضع العرض")}
        >
          <button
            type="button"
            aria-pressed={!preview}
            onClick={() => setPreview(false)}
          >
            {t("Modifier", "تعديل")}
          </button>
          <button
            type="button"
            aria-pressed={preview}
            onClick={() => setPreview(true)}
          >
            {t("Aperçu", "معاينة")}
          </button>
        </div>
      </div>
      <div className="editor">
        <div className="contract-sheet">
          {agreement.logo && (
            // eslint-disable-next-line @next/next/no-img-element -- The user-selected logo stays in this browser.
            <img
              className="contract-logo"
              src={agreement.logo}
              alt={t("Logo de l’agence", "شعار الوكالة")}
            />
          )}
          {!preview && (
            <div className="logo-actions">
              <label className="button subtle upload-control">
                <Upload size={17} aria-hidden />{" "}
                {agreement.logo
                  ? t("Remplacer le logo", "استبدال الشعار")
                  : t("Importer un logo", "رفع الشعار")}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (!file) return;
                    try {
                      change({ logo: await prepareLogo(file) });
                      setMessage("");
                    } catch {
                      setError(true);
                      setMessage(
                        t(
                          "Choisissez une image PNG, JPG ou WebP de 4 Mo maximum.",
                          "اختر صورة PNG أو JPG أو WebP بحجم لا يتجاوز 4 ميغابايت.",
                        ),
                      );
                    }
                  }}
                />
              </label>
              {agreement.logo && (
                <button
                  type="button"
                  className="icon-button"
                  aria-label={t("Retirer le logo", "إزالة الشعار")}
                  onClick={() => change({ logo: "" })}
                >
                  <X size={18} />
                </button>
              )}
            </div>
          )}
          {preview ? (
            <h3>{agreement.title}</h3>
          ) : (
            <input
              className="contract-title editable"
              aria-label={t("Titre du contrat", "عنوان العقد")}
              maxLength={150}
              required
              value={agreement.title}
              onChange={(event) => change({ title: event.target.value })}
            />
          )}
          <div className="contract-columns">
            {agreement.columns.map((column, columnIndex) => (
              <div
                className={
                  target === columnIndex
                    ? "contract-column drop-target"
                    : "contract-column"
                }
                key={columnIndex}
                onDragOver={
                  preview
                    ? undefined
                    : (event) => {
                        if (!dragging) return;
                        event.preventDefault();
                        setTarget(columnIndex);
                      }
                }
                onDrop={
                  preview
                    ? undefined
                    : (event) => {
                        event.preventDefault();
                        if (dragging) move(dragging, columnIndex);
                        setDragging(null);
                        setTarget(null);
                      }
                }
              >
                {column.map((id, position) => (
                  <div
                    className="contract-block"
                    key={id}
                    onDrop={
                      preview
                        ? undefined
                        : (event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            if (dragging) move(dragging, columnIndex, id);
                            setDragging(null);
                            setTarget(null);
                          }
                    }
                  >
                    {preview ? (
                      <h4>{agreement.headings[id]}</h4>
                    ) : (
                      <div className="block-heading">
                        <span
                          className="handle"
                          draggable
                          title={t("Glisser pour déplacer", "اسحب للنقل")}
                          onDragStart={(event) => {
                            event.dataTransfer.setData("text/plain", id);
                            event.dataTransfer.effectAllowed = "move";
                            setDragging(id);
                          }}
                          onDragEnd={() => {
                            setDragging(null);
                            setTarget(null);
                          }}
                        >
                          <Grip size={17} aria-hidden />
                        </span>
                        <input
                          className="editable"
                          aria-label={t("Titre du bloc", "عنوان الكتلة")}
                          value={agreement.headings[id]}
                          maxLength={80}
                          onChange={(event) =>
                            change({
                              headings: {
                                ...agreement.headings,
                                [id]: event.target.value,
                              },
                            })
                          }
                        />
                        <details className="block-menu">
                          <summary
                            aria-label={t("Déplacer le bloc", "نقل الكتلة")}
                          >
                            ⋯
                          </summary>
                          <div>
                            <button
                              type="button"
                              onClick={() => move(id, 1 - columnIndex)}
                            >
                              {t("Changer de colonne", "تغيير العمود")}
                            </button>
                            <button
                              type="button"
                              disabled={position === 0}
                              onClick={() =>
                                move(id, columnIndex, column[position - 1])
                              }
                            >
                              {t("Monter", "تحريك لأعلى")}
                            </button>
                            <button
                              type="button"
                              disabled={position === column.length - 1}
                              onClick={() =>
                                move(id, columnIndex, column[position + 2])
                              }
                            >
                              {t("Descendre", "تحريك لأسفل")}
                            </button>
                          </div>
                        </details>
                      </div>
                    )}
                    {id === "terms" ? (
                      preview ? (
                        <p className="terms-text">{agreement.terms}</p>
                      ) : (
                        <textarea
                          className="editable"
                          rows={4}
                          maxLength={3000}
                          aria-label={t("Texte des conditions", "نص الشروط")}
                          value={agreement.terms}
                          onChange={(event) =>
                            change({ terms: event.target.value })
                          }
                        />
                      )
                    ) : (
                      <dl>
                        {blockRows(agreement, id).map(([label, value]) => (
                          <div key={label}>
                            <dt>{label}</dt>
                            <dd>{value || "—"}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className={error ? "error status" : "status"} aria-live="polite">
        {message}
      </p>
    </>
  );
}

function ScanFields({
  stage,
  agreement,
  change,
  updateDocument,
}: {
  stage: 1 | 2;
  agreement: Agreement;
  change: (patch: Partial<Agreement>) => void;
  updateDocument: (index: number, values: Record<string, string>) => void;
}) {
  const t = words(agreement.locale);
  const [kind, setKind] = useState(stage === 1 ? 0 : 2);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  async function scan(file: File) {
    controller.current?.abort();
    if (file.type !== "application/pdf" || !isSupportedDocument(file)) {
      setError(true);
      setStatus(
        t(
          "Choisissez un PDF de 4 Mo maximum.",
          "اختر ملف PDF بحجم لا يتجاوز 4 ميغابايت.",
        ),
      );
      return;
    }
    const active = new AbortController();
    controller.current = active;
    setPreview(URL.createObjectURL(file));
    setBusy(true);
    setError(false);
    setStatus(t("Lecture du PDF…", "جارٍ قراءة ملف PDF…"));
    try {
      const values = await scanDocument(file, kind, "OCR", active.signal);
      if (active.signal.aborted) return;
      const fields = Object.fromEntries(
        Object.entries(values)
          .filter(([, value]) => value.trim())
          .map(([key, value]) => [key, value.slice(0, 200)]),
      );
      updateDocument(kind, fields);
      if (!Object.keys(fields).length) {
        setError(true);
        setStatus(
          t(
            "Aucun champ détecté. Vous pouvez saisir les données à la main.",
            "لم يتم العثور على بيانات. يمكنك إدخالها يدويًا.",
          ),
        );
      } else
        setStatus(
          t("Vérifiez les champs préremplis.", "تحقق من الحقول المعبأة."),
        );
    } catch {
      if (!active.signal.aborted) {
        setError(true);
        setStatus(
          t(
            "Lecture impossible. Vous pouvez saisir les données à la main.",
            "تعذرت القراءة. يمكنك إدخال البيانات يدويًا.",
          ),
        );
      }
    } finally {
      if (!active.signal.aborted) setBusy(false);
    }
  }

  const docField = (
    index: number,
    key: string,
    label: string,
    required = false,
  ) => (
    <Input
      key={key}
      label={label}
      value={agreement.documents[index][key]}
      required={required}
      onChange={(value) => updateDocument(index, { [key]: value })}
    />
  );
  return (
    <>
      <h2 tabIndex={-1}>
        {stage === 1
          ? t("Agence et locataire", "الوكالة والمستأجر")
          : t("Véhicule", "السيارة")}
      </h2>
      <div className="scan-panel">
        <div className="scan-preview">
          {preview ? (
            <iframe
              src={preview}
              title={t("Aperçu du document", "معاينة الوثيقة")}
            />
          ) : (
            <div className="empty-preview">
              <FileText size={42} aria-hidden />
              <span>{t("Aperçu", "معاينة")}</span>
            </div>
          )}
        </div>
        <div
          className="scan-form"
          dir={agreement.locale === "ar" ? "rtl" : "ltr"}
        >
          <div className="scan-box">
            <ScanLine size={25} aria-hidden />
            <h3>{t("Scanner un document", "مسح وثيقة")}</h3>
            <p className="status" id="ocr-disclosure">
              {t(
                "Le PDF est envoyé à Datalab pour la lecture.",
                "يُرسل ملف PDF إلى Datalab لقراءته.",
              )}
            </p>
            {stage === 1 && (
              <label className="sr-only" htmlFor="document-kind">
                {t("Type de document", "نوع الوثيقة")}
              </label>
            )}
            {stage === 1 && (
              <select
                id="document-kind"
                value={kind}
                disabled={busy}
                onChange={(event) => setKind(Number(event.target.value))}
              >
                <option value={0}>
                  {t("Carte nationale", "البطاقة الوطنية")}
                </option>
                <option value={1}>
                  {t("Permis de conduire", "رخصة السياقة")}
                </option>
              </select>
            )}
            <label className="button upload-control">
              {t("Choisir un PDF", "اختيار ملف PDF")}
              <input
                type="file"
                accept="application/pdf,.pdf"
                aria-describedby="ocr-disclosure"
                disabled={busy}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void scan(file);
                }}
              />
            </label>
            <p className={error ? "status error" : "status"} aria-live="polite">
              {status}
            </p>
          </div>
          <div className="divider">
            {t("ou saisir à la main", "أو الإدخال يدويًا")}
          </div>
          <div className="fields">
            {stage === 1 ? (
              <>
                <Input
                  label={t("Agence", "الوكالة")}
                  value={agreement.agency}
                  required
                  onChange={(agency) => change({ agency })}
                />
                {docField(0, "name", t("Locataire", "المستأجر"), true)}
                {docField(
                  0,
                  "identity",
                  t("Carte nationale", "البطاقة الوطنية"),
                  true,
                )}
                {docField(0, "address", t("Adresse", "العنوان"))}
                {docField(1, "licence", t("Permis", "رخصة السياقة"))}
                {docField(1, "category", t("Catégorie", "الفئة"))}
                {docField(
                  1,
                  "expiry",
                  t("Expiration du permis", "انتهاء الرخصة"),
                )}
              </>
            ) : (
              <>
                {docField(
                  2,
                  "brand",
                  t("Marque et modèle", "الماركة والطراز"),
                  true,
                )}
                {docField(
                  2,
                  "plate",
                  t("Immatriculation", "رقم التسجيل"),
                  true,
                )}
                {docField(2, "vin", t("N° de châssis", "رقم الهيكل"))}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function FinalPdf({ blob, locale }: { blob: Blob; locale: Locale }) {
  const t = words(locale);
  const account = useAccount();
  const pending = useRef(false);
  const sending = useRef(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const pdfUrl = URL.createObjectURL(blob);
    // Defer publishing the object URL until after this effect.
    const task = window.setTimeout(() => setUrl(pdfUrl), 0);
    return () => {
      window.clearTimeout(task);
      URL.revokeObjectURL(pdfUrl);
    };
  }, [blob]);

  async function save() {
    if (sending.current || saved) return;
    sending.current = true;
    pending.current = false;
    setBusy(true);
    setError(false);
    setStatus("");
    try {
      const form = new FormData();
      form.set("file", blob, pdfName);
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
      <h2 tabIndex={-1}>{t("Votre PDF est prêt", "ملف PDF جاهز")}</h2>
      <div className="final-grid">
        <div className="final-preview">
          {url && (
            <iframe
              title={t("Aperçu du contrat PDF", "معاينة العقد بصيغة PDF")}
              src={url}
            />
          )}
        </div>
        <div className="final-actions">
          <button
            className="button"
            type="button"
            onClick={() => download(blob)}
          >
            <ArrowDownToLine size={18} aria-hidden />
            {t("Télécharger", "تنزيل")}
          </button>
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
                const file = new File([blob], pdfName, {
                  type: "application/pdf",
                });
                if (navigator.canShare?.({ files: [file] })) {
                  try {
                    await navigator.share({ files: [file] });
                    return;
                  } catch (err) {
                    if (
                      err instanceof DOMException &&
                      err.name === "AbortError"
                    )
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
            {url && (
              <a
                className="icon-button"
                aria-label={t(
                  "Ouvrir le PDF pour l’imprimer",
                  "فتح الملف لطباعته",
                )}
                title={t("Ouvrir le PDF pour l’imprimer", "فتح الملف لطباعته")}
                href={url}
                target="_blank"
                rel="noreferrer"
              >
                <Printer size={18} />
              </a>
            )}
          </div>
          <p className={error ? "error status" : "status"} aria-live="polite">
            {status}
          </p>
        </div>
      </div>
    </>
  );
}

export function Wizard({ locale }: { locale: Locale }) {
  const t = words(locale);
  const [stage, setStage] = useState<Stage>(0);
  const [agreement, setAgreement] = useState(() => initialAgreement(locale));
  const [blob, setBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const section = useRef<HTMLElement>(null);
  const generating = useRef(false);
  const change = (patch: Partial<Agreement>) =>
    setAgreement((current) => ({ ...current, ...patch }));
  const updateDocument = (index: number, values: Record<string, string>) =>
    setAgreement((current) => ({
      ...current,
      documents: current.documents.map((doc, i) =>
        i === index ? { ...doc, ...values } : doc,
      ),
    }));
  const steps = [
    t("Modèle", "النموذج"),
    t("Identité", "الهوية"),
    t("Véhicule", "السيارة"),
    t("Location", "الكراء"),
    "PDF",
  ];
  function go(next: Stage) {
    setError("");
    setStage(next);
    requestAnimationFrame(() => {
      section.current
        ?.querySelector<HTMLElement>("h2")
        ?.focus({ preventScroll: true });
      section.current?.scrollIntoView({ block: "start" });
    });
  }
  async function advance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (stage === 0 && !agreement.title.trim()) {
      setError(t("Saisissez un titre.", "أدخل عنوان العقد."));
      return;
    }
    if (stage < 3) {
      go((stage + 1) as Stage);
      return;
    }
    if (stage !== 3 || generating.current) return;
    if (!agreement.start || !agreement.end || agreement.end < agreement.start) {
      setError(t("Vérifiez les dates.", "تحقق من التواريخ."));
      return;
    }
    generating.current = true;
    setBusy(true);
    setError("");
    try {
      const { buildContractPdf } = await import("../contract/contract-pdf");
      setBlob(await buildContractPdf(agreement));
      go(4);
    } catch {
      setError(
        t(
          "Le PDF n’a pas pu être généré. Réessayez.",
          "تعذر إنشاء ملف PDF. حاول مرة أخرى.",
        ),
      );
    } finally {
      generating.current = false;
      setBusy(false);
    }
  }
  return (
    <section
      id="contrat"
      className="shell wizard"
      ref={section}
      aria-label={t("Créer un contrat", "إنشاء عقد")}
    >
      <ol className="steps" aria-label={t("Progression", "التقدم")}>
        {steps.map((label, i) => (
          <li
            key={label}
            aria-current={i === stage ? "step" : undefined}
            className={i <= stage ? "reached" : undefined}
          >
            <span className="step-number" aria-hidden>
              {i < stage ? <Check size={17} /> : i + 1}
            </span>
            <span>{label}</span>
          </li>
        ))}
      </ol>
      <form className="wizard-card" onSubmit={advance}>
        {stage === 0 && <Editor agreement={agreement} change={change} />}
        {(stage === 1 || stage === 2) && (
          <ScanFields
            key={stage}
            stage={stage}
            agreement={agreement}
            change={change}
            updateDocument={updateDocument}
          />
        )}
        {stage === 3 && (
          <>
            <h2 tabIndex={-1}>{t("Dates et tarifs", "التواريخ والأسعار")}</h2>
            <div className="fields rental-fields">
              <Input
                label={t("Début", "البداية")}
                type="date"
                required
                value={agreement.start}
                onChange={(start) => change({ start })}
              />
              <Input
                label={t("Fin", "النهاية")}
                type="date"
                required
                min={agreement.start}
                value={agreement.end}
                onChange={(end) => change({ end })}
              />
              <Input
                label={t("Prix total (MAD)", "السعر الإجمالي (درهم)")}
                type="number"
                min="0"
                value={agreement.price}
                onChange={(price) => change({ price })}
              />
              <Input
                label={t("Caution (MAD)", "الضمان (درهم)")}
                type="number"
                min="0"
                value={agreement.deposit}
                onChange={(deposit) => change({ deposit })}
              />
            </div>
          </>
        )}
        {stage === 4 && blob && <FinalPdf blob={blob} locale={locale} />}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {stage !== 4 && (
          <div className="wizard-actions">
            {stage > 0 && (
              <button
                className="button secondary"
                type="button"
                disabled={busy}
                onClick={() => go((stage - 1) as Stage)}
              >
                {t("Précédent", "السابق")}
              </button>
            )}
            <button className="button" type="submit" disabled={busy}>
              {busy
                ? t("Création…", "جارٍ الإنشاء…")
                : stage === 3
                  ? t("Créer le PDF", "إنشاء PDF")
                  : t("Continuer", "متابعة")}
            </button>
          </div>
        )}
      </form>
    </section>
  );
}
