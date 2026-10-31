"use client";

import { useEffect, useRef, useState } from "react";
import { useCopy } from "@/app/translations";
import {
  createEmptyDocuments,
  isSupportedDocument,
  isValidRental,
  SAMPLE_DOCUMENTS,
  type DocumentFields,
  type RentalDetails,
  type ScanPhase,
} from "@/lib/contract/documents";
import { scanDocument, DocumentScanError } from "@/lib/contract/scan-document";

export function useContractBuilder() {
  const copy = useCopy();
  const [documentIndex, setDocumentIndex] = useState(0);
  const [isScanDialogOpen, setScanDialogOpen] = useState(false);
  const [phase, setPhase] = useState<ScanPhase>("upload");
  const [previewUrl, setPreviewUrl] = useState("");
  const [backPreviewUrl, setBackPreviewUrl] = useState("");
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasConsent, setHasConsent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [documentData, setDocumentData] =
    useState<DocumentFields[]>(createEmptyDocuments);
  const [isDownloading, setDownloading] = useState(false);
  const [rental, setRental] = useState<RentalDetails>({
    agency: "",
    start: "",
    end: "",
  });
  const scanController = useRef<AbortController | null>(null);
  const sampleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );
  useEffect(
    () => () => {
      if (backPreviewUrl) URL.revokeObjectURL(backPreviewUrl);
    },
    [backPreviewUrl],
  );
  useEffect(
    () => () => {
      scanController.current?.abort();
      if (sampleTimer.current) clearTimeout(sampleTimer.current);
    },
    [],
  );

  function selectFile(file: File | undefined) {
    if (!file) return;
    if (!isSupportedDocument(file)) {
      setErrorMessage(copy.fileError);
      return;
    }
    setErrorMessage("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    if (file.type === "application/pdf") {
      setBackFile(null);
      setBackPreviewUrl("");
    }
  }

  function selectBackFile(file: File | undefined) {
    if (!file) return;
    if (!isSupportedDocument(file)) {
      setErrorMessage(copy.fileError);
      return;
    }
    setErrorMessage("");
    setBackFile(file);
    setBackPreviewUrl(URL.createObjectURL(file));
  }

  async function scanSelectedDocument() {
    if (!selectedFile || !hasConsent || scanController.current) return;
    const controller = new AbortController();
    scanController.current = controller;
    setPhase("scanning");
    setErrorMessage("");
    try {
      const fields = await scanDocument(
        selectedFile,
        documentIndex,
        copy.scanError,
        controller.signal,
      );
      if (
        documentIndex === 0 &&
        backFile &&
        selectedFile.type !== "application/pdf"
      ) {
        const backFields = await scanDocument(
          backFile,
          documentIndex,
          copy.scanError,
          controller.signal,
        );
        if (backFields.address.trim()) fields.address = backFields.address;
      }
      setDocumentData((documents) =>
        documents.map((document, index) =>
          index === documentIndex ? { ...document, ...fields } : document,
        ),
      );
      setPhase("review");
    } catch (error) {
      if (controller.signal.aborted) return;
      setErrorMessage(
        error instanceof DocumentScanError ? error.message : copy.scanError,
      );
      setPhase("upload");
    } finally {
      scanController.current = null;
    }
  }

  function loadSampleDocument() {
    setPhase("scanning");
    sampleTimer.current = setTimeout(() => {
      setDocumentData((documents) =>
        documents.map((document, index) =>
          index === documentIndex ? { ...SAMPLE_DOCUMENTS[index] } : document,
        ),
      );
      setPhase("review");
      sampleTimer.current = null;
    }, 1500);
  }

  function openScanDialog() {
    setPhase("upload");
    setPreviewUrl("");
    setBackPreviewUrl("");
    setBackFile(null);
    setSelectedFile(null);
    setErrorMessage("");
    setHasConsent(false);
    setScanDialogOpen(true);
  }

  function updateDocumentField(key: string, value: string) {
    setDocumentData((documents) =>
      documents.map((document, index) =>
        index === documentIndex ? { ...document, [key]: value } : document,
      ),
    );
  }

  function confirmDocument() {
    setDocumentIndex((index) => index + 1);
    setScanDialogOpen(false);
  }

  async function downloadContract() {
    if (!isValidRental(rental) || isDownloading) return;
    setDownloading(true);
    setErrorMessage("");
    try {
      const { downloadContractPdf } = await import("./contract-pdf");
      await downloadContractPdf(documentData, rental);
    } catch {
      setErrorMessage(copy.pdfError);
    } finally {
      setDownloading(false);
    }
  }

  return {
    documentIndex,
    isScanDialogOpen,
    setScanDialogOpen,
    phase,
    previewUrl,
    backPreviewUrl,
    backFile,
    selectBackFile,
    selectedFile,
    hasConsent,
    setHasConsent,
    errorMessage,
    documentData,
    isDownloading,
    rental,
    setRental,
    isRentalValid: isValidRental(rental),
    selectFile,
    scanSelectedDocument,
    loadSampleDocument,
    openScanDialog,
    updateDocumentField,
    confirmDocument,
    downloadContract,
  };
}

export type ContractBuilderState = ReturnType<typeof useContractBuilder>;
