import { Fragment } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  ShieldCheck,
  ScanLine,
  FileText,
  CreditCard,
  CarFront,
  Globe2,
  Sparkles,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getCopy } from "@/app/translations/server";
import { SiteShell } from "../layout/site-shell";
import { CallToAction } from "../layout/call-to-action";
import { FrequentlyAskedQuestions } from "./frequently-asked-questions";
import { HeroIllustration } from "./hero-illustration";

export async function HomePage() {
  const copy = await getCopy();
  return (
    <SiteShell>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot" />
              {copy.badge}
            </div>
            <h1>
              {copy.title.map((line, i) => (
                <Fragment key={line}>
                  {i > 0 && <br />}
                  {i === 2 ? <span>{line}</span> : line}
                </Fragment>
              ))}
            </h1>
            <p className="hero-desc">{copy.desc}</p>
            <Link className="button hero-cta" href="/new">
              {copy.cta}
              <ArrowUpRight size={19} />
            </Link>
            <p className="micro">{copy.free}</p>
            <div className="hero-proof">
              <div className="avatar-stack">
                <span>Y</span>
                <span>S</span>
                <span>A</span>
                <span>M</span>
              </div>
              <div>
                <div className="stars">★★★★★</div>
                <span>{copy.trust}</span>
              </div>
            </div>
          </div>
          <HeroIllustration />
        </section>
        <section className="trust-strip">
          <span>
            <ShieldCheck />
            {copy.dataProtected}
          </span>
          <i />
          <span>
            <ScanLine />
            {copy.poweredBy}
          </span>
          <i />
          <span>
            <FileText />
            {copy.readyPdf}
          </span>
          <i />
          <span className="morocco">
            <span>✳</span>
            {copy.madeForMorocco}
          </span>
        </section>
        <section id="how" className="how section">
          <div className="section-top">
            <div>
              <div className="eyebrow coral">{copy.how}</div>
              <h2>{copy.section}</h2>
            </div>
            <p>
              {copy.howSummary.map((line, i) => (
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
                <h3>{copy.stepTitles[i]}</h3>
                <p>{copy.stepDescriptions[i]}</p>
                <div className="step-foot">
                  {i === 0 ? (
                    <>
                      <span>CNIE</span>
                      <span>{copy.licenceTag}</span>
                      <span>{copy.registrationTag}</span>
                    </>
                  ) : i === 1 ? (
                    <span className="green">
                      <Sparkles size={13} /> {copy.poweredBy}
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
            <div className="eyebrow coral">{copy.whyEyebrow}</div>
            <h2>{copy.features}</h2>
            <p>{copy.whyDescription}</p>
            <Link className="text-link" href="/new">
              {copy.start}
              <ArrowRight size={17} />
            </Link>
          </div>
          <div className="why-features">
            {[ShieldCheck, Globe2, CarFront].map((Icon, i) => (
              <div key={i}>
                <Icon />
                <div>
                  <h3>{copy.featureTitles[i]}</h3>
                  <p>{copy.featureDescriptions[i]}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <FrequentlyAskedQuestions />
        <CallToAction />
      </main>
    </SiteShell>
  );
}
