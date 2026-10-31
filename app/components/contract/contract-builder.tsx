"use client";
import {
  ArrowRight,
  ArrowUpRight,
  ScanLine,
  CircleCheck,
  LockKeyhole,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useCopy } from "@/app/translations";
import { useContractBuilder } from "./use-contract-builder";
import { DocumentPreview } from "../shared/document-preview";
import { DocumentChecklist } from "./document-checklist";
import { DocumentScanDialog } from "./document-scan-dialog";
import { RentalForm } from "./rental-form";
export function ContractBuilder() {
  const copy = useCopy();
  const builder = useContractBuilder();
  const {
    documentIndex,
    isScanDialogOpen,
    openScanDialog,
    loadSampleDocument,
  } = builder;
  return (
    <main className="workflow">
      <Link className="back-link" href="/">
        ← {copy.back}
      </Link>
      <div className="workflow-heading">
        <div className="eyebrow coral">{copy.workflowEyebrow}</div>
        <h1>{copy.newTitle}</h1>
        <p>{copy.newDesc}</p>
      </div>
      <div className="workflow-layout">
        <DocumentChecklist documentIndex={documentIndex} />
        <div className="work-area">
          {documentIndex < 3 ? (
            <>
              <div className="work-area-label">
                <span>0{documentIndex + 1}</span>
                {copy.docs[documentIndex]}
              </div>
              <div className="document-illustration">
                <DocumentPreview kind={documentIndex} />
                <div className="document-badge">
                  <ScanLine size={22} />
                </div>
              </div>
              <h2>{copy.docs[documentIndex]}</h2>
              <p>
                {copy.detail[documentIndex]}.<br />
                {copy.documentHint}
              </p>
              <button className="button" onClick={openScanDialog}>
                <ScanLine size={18} />
                {copy.scan}
                <ArrowRight size={17} />
              </button>
              <div className="format-note">{copy.fileFormats}</div>
              <button
                className="demo-button"
                onClick={() => {
                  openScanDialog();
                  loadSampleDocument();
                }}
              >
                {copy.demo}
                <ArrowUpRight size={14} />
              </button>
            </>
          ) : (
            <>
              <span className="success-large">
                <CircleCheck size={40} />
              </span>
              <div className="eyebrow coral">3 / 3 · {copy.done}</div>
              <h2>{copy.contract}</h2>
              <p>{copy.rentalHint}</p>
              <RentalForm builder={builder} />
            </>
          )}
        </div>
      </div>
      <div className="workflow-bottom">
        <LockKeyhole size={14} />
        {copy.sessionPrivacy}
      </div>
      {isScanDialogOpen && <DocumentScanDialog builder={builder} />}
    </main>
  );
}
