"use client";

import { useCopy } from "@/app/translations";
import type { ContractBuilderState } from "./use-contract-builder";
import Image from "next/image";
import {
  X,
  Sparkles,
  CircleCheck,
  ArrowRight,
  FileText,
  Upload,
  Camera,
  ScanLine,
  LockKeyhole,
} from "lucide-react";
import { DocumentPreview } from "../shared/document-preview";

export function DocumentScanDialog({
  builder,
}: {
  builder: ContractBuilderState;
}) {
  const copy = useCopy();
  const labels: Record<string, string> = copy.labels;
  const {
    phase,
    documentIndex,
    setScanDialogOpen,
    documentData,
    selectedFile,
    previewUrl,
    fileInputRef,
    cameraInputRef,
    hasConsent,
    setHasConsent,
    errorMessage,
    selectFile,
    scanSelectedDocument,
    updateDocumentField,
    confirmDocument,
  } = builder;
  return (
    <div className="modal-backdrop">
      <div
        className="scan-modal"
        role="dialog"
        aria-modal="true"
        aria-label={copy.scan}
      >
        <button
          className="modal-close icon-button"
          aria-label={copy.closeLabel}
          onClick={() => phase !== "scanning" && setScanDialogOpen(false)}
          disabled={phase === "scanning"}
        >
          <X />
        </button>
        <div className="eyebrow coral">0{documentIndex + 1} / 03</div>
        <h2>{phase === "review" ? copy.review : copy.docs[documentIndex]}</h2>
        {phase === "scanning" ? (
          <div className="scanning-state">
            <div className="scanning-preview">
              <DocumentPreview kind={documentIndex} />
              <div className="scan-beam" />
            </div>
            <Sparkles className="pulse" />
            <h3>{copy.scanning}</h3>
            <p>{copy.poweredBy}</p>
          </div>
        ) : phase === "review" ? (
          <>
            <div className="review-success">
              <CircleCheck size={18} />
              {copy.extractedTitle}
            </div>
            <div className="review-fields">
              {Object.entries(documentData[documentIndex]).map(
                ([fieldName, value]) => (
                  <label key={fieldName}>
                    {labels[fieldName]}
                    <input
                      value={value}
                      required
                      onChange={(e) =>
                        updateDocumentField(fieldName, e.target.value)
                      }
                    />
                  </label>
                ),
              )}
            </div>
            <button
              className="button full"
              disabled={Object.values(documentData[documentIndex]).some(
                (value) => !value.trim(),
              )}
              onClick={confirmDocument}
            >
              {copy.validate}
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
                selectFile(e.dataTransfer.files[0]);
              }}
            >
              {selectedFile ? (
                <>
                  <div className="file-preview">
                    {selectedFile.type === "application/pdf" ? (
                      <FileText size={55} />
                    ) : (
                      <Image
                        src={previewUrl}
                        alt={copy.documentPreview}
                        width={360}
                        height={220}
                        unoptimized
                      />
                    )}
                  </div>
                  <b>{selectedFile.name}</b>
                  <button
                    className="text-link"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {copy.retry}
                  </button>
                </>
              ) : (
                <>
                  <div className="upload-icon">
                    <Upload size={29} />
                  </div>
                  <h3>{copy.upload}</h3>
                  <p>{copy.fileFormats}</p>
                  <button
                    className="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={16} />
                    {copy.upload}
                  </button>
                  <button
                    className="camera-button"
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <Camera size={17} />
                    {copy.camera}
                  </button>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => selectFile(e.target.files?.[0])}
            />
            <input
              ref={cameraInputRef}
              type="file"
              hidden
              accept="image/*"
              capture="environment"
              onChange={(e) => selectFile(e.target.files?.[0])}
            />
            {selectedFile && (
              <>
                <label className="consent">
                  <input
                    type="checkbox"
                    checked={hasConsent}
                    onChange={(e) => setHasConsent(e.target.checked)}
                  />
                  {copy.consent}
                </label>
                <button
                  className="button full"
                  disabled={!hasConsent}
                  onClick={scanSelectedDocument}
                >
                  <ScanLine size={17} />
                  {copy.scan}
                </button>
              </>
            )}
            {errorMessage && (
              <p className="error" role="alert">
                {errorMessage}
              </p>
            )}
          </>
        )}
        <div className="modal-security">
          <LockKeyhole size={12} />
          {copy.privacy}
        </div>
      </div>
    </div>
  );
}
