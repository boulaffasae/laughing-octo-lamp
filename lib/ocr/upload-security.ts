import { fileTypeFromBuffer } from "file-type";

export class UploadError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Per-process backpressure only. This does not impose a cross-instance quota.
export function createRequestLimiter(maximum: number) {
  let active = 0;
  return {
    acquire(): (() => void) | undefined {
      if (active >= maximum) return undefined;
      active++;
      let released = false;
      return () => {
        if (!released) {
          released = true;
          active--;
        }
      };
    },
  };
}

export async function readLimitedBody(
  request: Request,
  maximum: number,
  timeoutMs = 30_000,
) {
  if (!request.body) throw new UploadError("Document manquant.", 400);
  const reader = request.body.getReader();
  const deadline = new AbortController();
  const timer = setTimeout(() => deadline.abort(), timeoutMs);
  const signal = AbortSignal.any([request.signal, deadline.signal]);
  const cancel = () => {
    // Do not await cancellation: an untrusted source may never acknowledge it.
    void reader.cancel().catch(() => {});
  };
  signal.addEventListener("abort", cancel, { once: true });
  if (signal.aborted) cancel();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      signal.throwIfAborted();
      const { done, value } = await reader.read();
      signal.throwIfAborted();
      if (done) break;
      total += value.byteLength;
      if (total > maximum) {
        cancel();
        throw new UploadError("Document trop volumineux.", 413);
      }
      chunks.push(value);
    }
    return Buffer.concat(chunks, total);
  } catch (error) {
    if (request.signal.aborted)
      throw new UploadError("Envoi du document interrompu.", 408);
    if (deadline.signal.aborted)
      throw new UploadError("Délai d’envoi du document dépassé.", 408);
    throw error;
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", cancel);
    reader.releaseLock();
  }
}

export async function validateUploadType(
  bytes: Uint8Array,
  declaredType: string,
  allowedTypes: readonly string[],
) {
  let detected;
  try {
    detected = await fileTypeFromBuffer(bytes);
  } catch {
    throw new UploadError("Document invalide ou tronqué.", 400);
  }
  if (
    !detected ||
    !allowedTypes.includes(detected.mime) ||
    detected.mime !== declaredType
  ) {
    throw new UploadError(
      "Le contenu du fichier ne correspond pas au format annoncé.",
      400,
    );
  }
  return detected.mime;
}
