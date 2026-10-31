import {
  Check,
  ScanLine,
  FileText,
  ArrowRight,
  LockKeyhole,
} from "lucide-react";
import { getCopy } from "@/app/translations/server";
import { DocumentPreview } from "../shared/document-preview";

export async function HeroIllustration() {
  const copy = await getCopy();
  return (
    <div className="hero-art" aria-label={copy.heroPreview}>
      <div className="art-grid" />
      <div className="art-orbit" />
      <div className="floating-tag">
        <span className="tiny-spark">✦</span>
        {copy.paperworkTag}
      </div>
      <div className="back-id">
        <DocumentPreview kind={1} />
      </div>
      <div className="scan-card">
        <div className="scan-header">
          <span className="scan-icon">
            <ScanLine size={17} />
          </span>
          <b>{copy.scanTag}</b>
          <span className="live-dot" />
        </div>
        <div className="scan-frame">
          <i className="corner tl" />
          <i className="corner tr" />
          <i className="corner bl" />
          <i className="corner br" />
          <DocumentPreview />
          <div className="scan-beam" />
        </div>
        <div className="extracted">
          <span className="check-round">
            <Check size={13} />
          </span>
          <div>
            <b>{copy.extractedTitle}</b>
            <small>{copy.extractedDescription}</small>
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
          <b>{copy.readyTag}</b>
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
        {copy.privacy}
      </div>
      <span className="art-plus plus-one">+</span>
      <span className="art-plus plus-two">+</span>
    </div>
  );
}
