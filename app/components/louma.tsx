"use client";

import { MAX_FILE_BYTES } from "@/lib/upload-policy";
import { Link } from "../../i18n/navigation";
import { useLocale } from "next-intl";
import { SiteHeader, SiteFooter, BottomCTA } from "./site-chrome";
import { Fragment, useState, useRef, useEffect } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  ShieldCheck,
  ScanLine,
  FileText,
  CreditCard,
  CarFront,
  Camera,
  Upload,
  X,
  LockKeyhole,
  Globe2,
  CircleCheck,
  Sparkles,
  Download,
  Plus,
  Minus,
} from "lucide-react";
import { RentalDates } from "./rental-dates";
import { useCopy } from "../translations";

function MiniCard({ kind = 0 }: { kind?: number }) {
  return (
    <div className={`mini-id id-${kind}`}>
      <div className="id-top">
        <span>المملكة المغربية</span>
        <span>✳</span>
      </div>
      <small>
        {kind === 2 ? "CERTIFICAT D’IMMATRICULATION" : "ROYAUME DU MAROC"}
      </small>
      <div className="id-content">
        <div className="id-photo">
          {kind === 2 ? <CarFront size={28} /> : <div className="silhouette" />}
        </div>
        <div className="id-lines">
          <b>{kind === 2 ? "DACIA · CLIO" : "AMINE EL MANSOURI"}</b>
          <span />
          <span />
          <span />
          <strong>{kind === 2 ? "12345 · أ · 6" : "BK 123456"}</strong>
        </div>
      </div>
      <div className="id-bottom">
        {kind === 0
          ? "CARTE NATIONALE D’IDENTITÉ"
          : kind === 1
            ? "PERMIS DE CONDUIRE"
            : "CARTE GRISE"}
        <span>MAR</span>
      </div>
    </div>
  );
}
export default function Louma({ workflow = false }: { workflow?: boolean }) {
  const lang = useLocale();
  const [faq, setFaq] = useState<number | null>(0);
  const t = useCopy();
  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"}>
      <SiteHeader />
      {workflow ? (
        <Workflow />
      ) : (
        <>
          <main>
            <section className="hero">
              <div className="hero-copy">
                <div className="eyebrow">
                  <span className="status-dot" />
                  {t.badge}
                </div>
                <h1>
                  {t.title.map((line, i) => (
                    <Fragment key={line}>
                      {i > 0 && <br />}
                      {i === 2 ? <span>{line}</span> : line}
                    </Fragment>
                  ))}
                </h1>
                <p className="hero-desc">{t.desc}</p>
                <Link className="button hero-cta" href="/new">
                  {t.cta}
                  <ArrowUpRight size={19} />
                </Link>
                <p className="micro">{t.free}</p>
                <div className="hero-proof">
                  <div className="avatar-stack">
                    <span>Y</span>
                    <span>S</span>
                    <span>A</span>
                    <span>M</span>
                  </div>
                  <div>
                    <div className="stars">★★★★★</div>
                    <span>{t.trust}</span>
                  </div>
                </div>
              </div>
              <HeroArt />
            </section>
            <section className="trust-strip">
              <span>
                <ShieldCheck />
                {t.dataProtected}
              </span>
              <i />
              <span>
                <ScanLine />
                {t.poweredBy}
              </span>
              <i />
              <span>
                <FileText />
                {t.readyPdf}
              </span>
              <i />
              <span className="morocco">
                <span>✳</span>
                {t.madeForMorocco}
              </span>
            </section>
            <section id="how" className="how section">
              <div className="section-top">
                <div>
                  <div className="eyebrow coral">{t.how}</div>
                  <h2>{t.section}</h2>
                </div>
                <p>
                  {t.howSummary.map((line, i) => (
                    <Fragment key={line}>
                      {i > 0 && <br />}
                      {line}
                    </Fragment>
                  ))}
                </p>
              </div>
              <div className="steps-grid">
                {[CreditCard, ScanLine, FileText].map((Icon, i) => (
                  <div className="step-card" key={i}>
                    <div className="step-card-top">
                      <div className="feature-icon">
                        <Icon size={24} />
                      </div>
                      <span>0{i + 1}</span>
                    </div>
                    <h3>{t.stepTitles[i]}</h3>
                    <p>{t.stepDescriptions[i]}</p>
                    <div className="step-foot">
                      {i === 0 ? (
                        <>
                          <span>CNIE</span>
                          <span>{t.licenceTag}</span>
                          <span>{t.registrationTag}</span>
                        </>
                      ) : i === 1 ? (
                        <span className="green">
                          <Sparkles size={13} /> {t.poweredBy}
                        </span>
                      ) : (
                        <span>
                          <FileText size={13} /> PDF <Check size={13} />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section id="why" className="why section">
              <div className="why-heading">
                <div className="eyebrow coral">{t.whyEyebrow}</div>
                <h2>{t.features}</h2>
                <p>{t.whyDescription}</p>
                <Link className="text-link" href="/new">
                  {t.start}
                  <ArrowRight size={17} />
                </Link>
              </div>
              <div className="why-features">
                {[ShieldCheck, Globe2, CarFront].map((Icon, i) => (
                  <div key={i}>
                    <Icon />
                    <div>
                      <h3>{t.featureTitles[i]}</h3>
                      <p>{t.featureDescriptions[i]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section id="faq" className="faq section">
              <div>
                <div className="eyebrow coral">FAQ</div>
                <h2>{t.faq}</h2>
              </div>
              <div>
                {t.faqQuestions.map((q, i) => (
                  <div className="faq-item" key={q}>
                    <button
                      aria-expanded={faq === i}
                      onClick={() => setFaq(faq === i ? null : i)}
                    >
                      {q}
                      {faq === i ? <Minus size={18} /> : <Plus size={18} />}
                    </button>
                    {faq === i && <p>{t.faqAnswers[i]}</p>}
                  </div>
                ))}
              </div>
            </section>
            <BottomCTA />
          </main>
        </>
      )}
      <SiteFooter />
    </div>
  );
}
function HeroArt() {
  const t = useCopy();
  return (
    <div className="hero-art" aria-label={t.heroPreview}>
      <div className="art-grid" />
      <div className="art-orbit" />
      <div className="floating-tag">
        <span className="tiny-spark">✦</span>
        {t.paperworkTag}
      </div>
      <div className="back-id">
        <MiniCard kind={1} />
      </div>
      <div className="scan-card">
        <div className="scan-header">
          <span className="scan-icon">
            <ScanLine size={17} />
          </span>
          <b>{t.scanTag}</b>
          <span className="live-dot" />
        </div>
        <div className="scan-frame">
          <i className="corner tl" />
          <i className="corner tr" />
          <i className="corner bl" />
          <i className="corner br" />
          <MiniCard />
          <div className="scan-beam" />
        </div>
        <div className="extracted">
          <span className="check-round">
            <Check size={13} />
          </span>
          <div>
            <b>{t.extractedTitle}</b>
            <small>{t.extractedDescription}</small>
          </div>
          <span className="scan-symbol">
            <ScanLine size={18} />
          </span>
        </div>
      </div>
      <div className="contract-float">
        <div className="pdf-icon">
          <FileText size={22} />
          <span>PDF</span>
        </div>
        <div>
          <b>{t.readyTag}</b>
          <small>
            contrat_location.pdf <span>· 128 Ko</span>
          </small>
        </div>
        <span className="download-round">
          <ArrowRight size={17} />
        </span>
      </div>
      <div className="art-caption">
        <LockKeyhole size={12} />
        {t.privacy}
      </div>
      <span className="art-plus plus-one">+</span>
      <span className="art-plus plus-two">+</span>
    </div>
  );
}
const initialFields: Record<string, string>[] = [
  { name: "", identity: "", address: "" },
  { licence: "", category: "", expiry: "" },
  { brand: "", plate: "", vin: "" },
];
const examples: Record<string, string>[] = [
  {
    name: "Amine El Mansouri",
    identity: "BK123456",
    address: "24, avenue Hassan II, Casablanca",
  },
  { licence: "123456/06", category: "B", expiry: "2030-06-15" },
  { brand: "Dacia Sandero", plate: "12345-A-6", vin: "VF1B5220X12345678" },
];
function Workflow() {
  const t = useCopy(),
    [step, setStep] = useState(0),
    [modal, setModal] = useState(false),
    [phase, setPhase] = useState("upload"),
    [preview, setPreview] = useState(""),
    [file, setFile] = useState<File | null>(null),
    [consent, setConsent] = useState(false),
    [error, setError] = useState(""),
    [data, setData] = useState<Record<string, string>[]>(initialFields),
    [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null),
    camera = useRef<HTMLInputElement>(null);
  const [rental, setRental] = useState({
    agency: "",
    start: "",
    end: "",
  });
  const labels: Record<string, string> = t.labels;
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  function choose(f: File | undefined) {
    if (!f) return;
    if (
      !["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(
        f.type,
      ) ||
      f.size === 0 ||
      f.size > MAX_FILE_BYTES
    ) {
      setError(t.fileError);
      return;
    }
    setError("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }
  async function scan() {
    if (!file || !consent) return;
    setPhase("scanning");
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", String(step));
      const res = await fetch("/api/ocr", { method: "POST", body: form });
      const result = await res.json();
      if (!res.ok)
        throw new Error(
          `${result.error || t.scanError}${result.requestId ? ` (Réf. : ${result.requestId})` : ""}`,
        );
      setData((d) =>
        d.map((v, i) => (i === step ? { ...v, ...result.fields } : v)),
      );
      setPhase("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : t.scanError);
      setPhase("upload");
    }
  }
  function sample() {
    setPhase("scanning");
    setTimeout(() => {
      setData((d) => d.map((v, i) => (i === step ? examples[i] : v)));
      setPhase("review");
    }, 1500);
  }
  function open() {
    setPhase("upload");
    setPreview("");
    setFile(null);
    setError("");
    setConsent(false);
    setModal(true);
  }
  async function download() {
    setBusy(true);
    setError("");
    try {
      const { makeContract } = await import("./pdf");
      await makeContract(data, rental);
    } catch {
      setError(t.pdfError);
    } finally {
      setBusy(false);
    }
  }
  const valid =
    Object.values(rental).every(Boolean) &&
    new Date(rental.end) > new Date(rental.start);
  return (
    <main className="workflow">
      <Link className="back-link" href="/">
        ← {t.back}
      </Link>
      <div className="workflow-heading">
        <div className="eyebrow coral">{t.workflowEyebrow}</div>
        <h1>{t.newTitle}</h1>
        <p>{t.newDesc}</p>
      </div>
      <div className="workflow-layout">
        <div className="checklist-panel">
          <div className="progress-title">
            <b>{t.documentsLabel}</b>
            <span>{Math.min(step, 3)} / 3</span>
          </div>
          <div className="progress-track">
            <span style={{ width: `${(step / 3) * 100}%` }} />
          </div>
          {t.docs.map((name, i) => {
            const Icon = [CreditCard, CreditCard, CarFront][i];
            return (
              <div
                className={`checklist-row ${i === step ? "active" : ""} ${i < step ? "complete" : ""}`}
                key={name}
              >
                <div className="step-number">
                  {i < step ? <Check size={17} /> : i + 1}
                </div>
                <div className="document-name">
                  <h3>{name}</h3>
                  <p>{t.detail[i]}</p>
                  <span>
                    {i < step ? t.checked : i === step ? t.current : t.next}
                  </span>
                </div>
                <Icon size={21} />
              </div>
            );
          })}
          <div className="checklist-security">
            <ShieldCheck size={18} />
            <span>{t.privacy}</span>
          </div>
        </div>
        <div className="work-area">
          {step < 3 ? (
            <>
              <div className="work-area-label">
                <span>0{step + 1}</span>
                {t.docs[step]}
              </div>
              <div className="document-illustration">
                <MiniCard kind={step} />
                <div className="document-badge">
                  <ScanLine size={22} />
                </div>
              </div>
              <h2>{t.docs[step]}</h2>
              <p>
                {t.detail[step]}.<br />
                {t.documentHint}
              </p>
              <button className="button" onClick={open}>
                <ScanLine size={18} />
                {t.scan}
                <ArrowRight size={17} />
              </button>
              <div className="format-note">{t.fileFormats}</div>
              <button
                className="demo-button"
                onClick={() => {
                  open();
                  sample();
                }}
              >
                {t.demo}
                <ArrowUpRight size={14} />
              </button>
            </>
          ) : (
            <>
              <span className="success-large">
                <CircleCheck size={40} />
              </span>
              <div className="eyebrow coral">3 / 3 · {t.done}</div>
              <h2>{t.contract}</h2>
              <p>{t.rentalHint}</p>
              <form
                className="rental-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  download();
                }}
              >
                <label className="agency-field">
                  {labels.agency}
                  <input
                    required
                    value={rental.agency}
                    onChange={(e) =>
                      setRental({ ...rental, agency: e.target.value })
                    }
                  />
                </label>
                <RentalDates
                  start={rental.start}
                  end={rental.end}
                  onChange={(start, end) =>
                    setRental({ ...rental, start, end })
                  }
                />
                <p className="contract-note">{t.pdfNote}</p>
                <button
                  type="submit"
                  className="button"
                  disabled={!valid || busy}
                >
                  <Download size={17} />
                  {busy ? "…" : t.download}
                </button>
                {error && (
                  <p role="alert" className="error">
                    {error}
                  </p>
                )}
              </form>
            </>
          )}
        </div>
      </div>
      <div className="workflow-bottom">
        <LockKeyhole size={14} />
        {t.sessionPrivacy}
      </div>
      {modal && (
        <div className="modal-backdrop">
          <div
            className="scan-modal"
            role="dialog"
            aria-modal="true"
            aria-label={t.scan}
          >
            <button
              className="modal-close icon-button"
              aria-label={t.closeLabel}
              onClick={() => phase !== "scanning" && setModal(false)}
              disabled={phase === "scanning"}
            >
              <X />
            </button>
            <div className="eyebrow coral">0{step + 1} / 03</div>
            <h2>{phase === "review" ? t.review : t.docs[step]}</h2>
            {phase === "scanning" ? (
              <div className="scanning-state">
                <div className="scanning-preview">
                  <MiniCard kind={step} />
                  <div className="scan-beam" />
                </div>
                <Sparkles className="pulse" />
                <h3>{t.scanning}</h3>
                <p>{t.poweredBy}</p>
              </div>
            ) : phase === "review" ? (
              <>
                <div className="review-success">
                  <CircleCheck size={18} />
                  {t.extractedTitle}
                </div>
                <div className="review-fields">
                  {Object.entries(data[step]).map(([k, v]) => (
                    <label key={k}>
                      {labels[k]}
                      <input
                        value={v}
                        required
                        onChange={(e) =>
                          setData((d) =>
                            d.map((o, i) =>
                              i === step ? { ...o, [k]: e.target.value } : o,
                            ),
                          )
                        }
                      />
                    </label>
                  ))}
                </div>
                <button
                  className="button full"
                  disabled={Object.values(data[step]).some((v) => !v.trim())}
                  onClick={() => {
                    setStep(step + 1);
                    setModal(false);
                  }}
                >
                  {t.validate}
                  <ArrowRight size={17} />
                </button>
              </>
            ) : (
              <>
                <div
                  className="upload-zone"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    choose(e.dataTransfer.files[0]);
                  }}
                >
                  {file ? (
                    <>
                      <div className="file-preview">
                        {file.type === "application/pdf" ? (
                          <FileText size={55} />
                        ) : (
                          <img src={preview} alt={t.documentPreview} />
                        )}
                      </div>
                      <b>{file.name}</b>
                      <button
                        className="text-link"
                        onClick={() => input.current?.click()}
                      >
                        {t.retry}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="upload-icon">
                        <Upload size={29} />
                      </div>
                      <h3>{t.upload}</h3>
                      <p>{t.fileFormats}</p>
                      <button
                        className="button"
                        onClick={() => input.current?.click()}
                      >
                        <Upload size={16} />
                        {t.upload}
                      </button>
                      <button
                        className="camera-button"
                        onClick={() => camera.current?.click()}
                      >
                        <Camera size={17} />
                        {t.camera}
                      </button>
                    </>
                  )}
                </div>
                <input
                  ref={input}
                  type="file"
                  hidden
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => choose(e.target.files?.[0])}
                />
                <input
                  ref={camera}
                  type="file"
                  hidden
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => choose(e.target.files?.[0])}
                />
                {file && (
                  <>
                    <label className="consent">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                      />
                      {t.consent}
                    </label>
                    <button
                      className="button full"
                      disabled={!consent}
                      onClick={scan}
                    >
                      <ScanLine size={17} />
                      {t.scan}
                    </button>
                  </>
                )}
                {error && (
                  <p className="error" role="alert">
                    {error}
                  </p>
                )}
              </>
            )}
            <div className="modal-security">
              <LockKeyhole size={12} />
              {t.privacy}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
