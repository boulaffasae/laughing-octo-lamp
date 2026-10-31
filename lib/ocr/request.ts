import { DOCUMENT_FIELDS, isSupportedDocument } from "../contract/documents.ts";
import { MAX_BODY_BYTES } from "../upload-policy.ts";
import {
  readLimitedBody,
  UploadError,
  validateUploadType,
} from "./upload-security.ts";
import { ALLOWED_UPLOAD_TYPES } from "../upload-policy.ts";

export function validateOcrRequestHeaders(request: Request) {
  // Origin checks protect browsers; they do not authenticate direct API clients.
  const origin = request.headers.get("origin");
  if (
    request.headers.get("sec-fetch-site") === "cross-site" ||
    (origin && origin !== new URL(request.url).origin)
  ) {
    throw new UploadError("Requête non autorisée.", 403);
  }
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("multipart/form-data;")
  ) {
    throw new UploadError("Format de requête invalide.", 415);
  }
  const contentLength = request.headers.get("content-length");
  if (
    contentLength &&
    (!/^\d+$/.test(contentLength) || Number(contentLength) > MAX_BODY_BYTES)
  ) {
    throw new UploadError("Document trop volumineux.", 413);
  }
}

export async function readOcrUpload(request: Request) {
  const body = await readLimitedBody(request, MAX_BODY_BYTES);
  let form: FormData;
  try {
    form = await new Request(request.url, {
      method: "POST",
      headers: { "Content-Type": request.headers.get("content-type")! },
      body,
    }).formData();
  } catch {
    throw new UploadError("Document invalide.", 400);
  }

  const file = form.get("file");
  const rawKind = form.get("kind");
  const documentIndex =
    typeof rawKind === "string" && /^[012]$/.test(rawKind)
      ? Number(rawKind)
      : -1;
  const fieldNames = DOCUMENT_FIELDS[documentIndex];
  if (!(file instanceof File) || !fieldNames || !isSupportedDocument(file)) {
    throw new UploadError(
      "Document invalide (JPG, PNG, WebP, PDF ; 4 Mo maximum).",
      400,
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const mimeType = await validateUploadType(
    bytes,
    file.type,
    ALLOWED_UPLOAD_TYPES,
  );
  const extension =
    mimeType === "application/pdf" ? "pdf" : mimeType.split("/")[1];
  return {
    file: new File([bytes], `document.${extension}`, { type: mimeType }),
    fieldNames,
  };
}
