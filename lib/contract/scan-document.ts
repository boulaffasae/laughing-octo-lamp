import { DOCUMENT_FIELDS, type DocumentFields } from "./documents.ts";

export class DocumentScanError extends Error {}

export async function scanDocument(
  file: File,
  documentIndex: number,
  fallbackMessage: string,
  signal: AbortSignal,
): Promise<DocumentFields> {
  const form = new FormData();
  form.set("file", file);
  form.set("kind", String(documentIndex));
  const response = await fetch("/api/ocr", {
    method: "POST",
    body: form,
    signal,
  });
  const result: unknown = await response.json();
  if (!result || typeof result !== "object")
    throw new DocumentScanError(fallbackMessage);
  if (!response.ok) {
    const message =
      "error" in result && typeof result.error === "string"
        ? result.error
        : fallbackMessage;
    const requestId =
      "requestId" in result && typeof result.requestId === "string"
        ? result.requestId
        : undefined;
    throw new DocumentScanError(
      `${message}${requestId ? ` (Réf. : ${requestId})` : ""}`,
    );
  }
  if (
    !("fields" in result) ||
    !result.fields ||
    typeof result.fields !== "object" ||
    Array.isArray(result.fields)
  )
    throw new DocumentScanError(fallbackMessage);
  const fields = result.fields as Record<string, unknown>;
  const keys = DOCUMENT_FIELDS[documentIndex];
  if (!keys || keys.some((key) => typeof fields[key] !== "string"))
    throw new DocumentScanError(fallbackMessage);
  return Object.fromEntries(keys.map((key) => [key, fields[key] as string]));
}
