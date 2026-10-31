import { extractDatalabDocument } from "@/lib/ocr/datalab";
import { readOcrUpload, validateOcrRequestHeaders } from "@/lib/ocr/request";
import { createOcrRequestContext } from "@/lib/ocr/response";
import { normalizeExtractionFields } from "@/lib/ocr/schema";
import { createRequestLimiter } from "@/lib/ocr/upload-security";

const requestLimiter = createRequestLimiter(2);
const EXTRACTION_TIMEOUT_MS = 60_000;

export async function POST(request: Request) {
  const context = createOcrRequestContext();
  let releaseSlot: (() => void) | undefined;

  try {
    validateOcrRequestHeaders(request);
    if (!process.env.DATALAB_API_KEY) return context.serviceUnavailable();

    releaseSlot = requestLimiter.acquire();
    if (!releaseSlot) {
      return context.respond(
        { error: "Le service est occupé. Réessayez dans quelques instants." },
        503,
        { "Retry-After": "5" },
      );
    }

    const { file, fieldNames } = await readOcrUpload(request);
    context.stage = "provider_request";
    const result = await extractDatalabDocument(
      file,
      fieldNames,
      AbortSignal.any([
        request.signal,
        AbortSignal.timeout(EXTRACTION_TIMEOUT_MS),
      ]),
    );
    context.stage = "parse_response";
    const fields = normalizeExtractionFields(result, fieldNames);
    return context.respond({ fields }, 200);
  } catch (error) {
    return context.handleError(error);
  } finally {
    releaseSlot?.();
  }
}
