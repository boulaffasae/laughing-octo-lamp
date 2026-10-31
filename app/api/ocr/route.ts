import { extractDatalabDocument, DatalabError } from "@/lib/datalab-ocr";
import { selectOcrProvider, providerCookie } from "@/lib/ocr-provider";
import LlamaCloud from "@llamaindex/llama-cloud";
import { extractDocument } from "@/lib/llama-ocr";
import * as Sentry from "@sentry/nextjs";
import {
  ALLOWED_UPLOAD_TYPES,
  MAX_BODY_BYTES,
  MAX_FILE_BYTES,
} from "@/lib/upload-policy";
import {
  createRequestLimiter,
  readLimitedBody,
  UploadError,
  validateUploadType,
} from "@/lib/ocr-security";

const requests = createRequestLimiter(2);

function reply(
  body: unknown,
  status: number,
  headers: Record<string, string> = {},
) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}

export async function POST(request: Request) {
  const { provider, source } = selectOcrProvider(
    request,
    process.env.OCR_AB_TEST === "true",
  );
  let rememberProvider = false;
  const requestId = crypto.randomUUID();
  const started = Date.now();
  let stage = "validation";
  let providerStatus: number | undefined;
  let providerRequestId: string | undefined;
  function respond(
    body: Record<string, unknown>,
    status: number,
    headers: Record<string, string> = {},
  ) {
    console.info(
      JSON.stringify({
        event: "ocr.request",
        provider,
        assignmentSource: source,
        requestId,
        stage,
        status,
        durationMs: Date.now() - started,
      }),
    );
    return reply({ ...body, requestId }, status, {
      ...headers,
      "X-Request-ID": requestId,
      "X-OCR-Provider": provider,
      ...(rememberProvider
        ? { "Set-Cookie": providerCookie(provider, request.url) }
        : {}),
    });
  }
  function report(error: unknown, code: string) {
    const context = {
      requestId,
      code,
      stage,
      provider,
      providerStatus,
      providerRequestId,
      durationMs: Date.now() - started,
    };
    console.error(JSON.stringify({ event: "ocr.error", ...context }));
    return Sentry.withScope((scope) => {
      scope.setTag("error_code", code);
      scope.setTag("request_id", requestId);
      scope.setContext("ocr", context);
      return Sentry.captureException(error);
    });
  }
  let release: (() => void) | undefined;
  try {
    // Browser protection only: scripts can forge Origin. This is not authentication.
    const origin = request.headers.get("origin");
    if (
      request.headers.get("sec-fetch-site") === "cross-site" ||
      (origin && origin !== new URL(request.url).origin)
    )
      return respond({ error: "Requête non autorisée." }, 403);
    if (
      !request.headers
        .get("content-type")
        ?.toLowerCase()
        .startsWith("multipart/form-data;")
    )
      return respond({ error: "Format de requête invalide." }, 415);
    const length = request.headers.get("content-length");
    if (length && (!/^\d+$/.test(length) || Number(length) > MAX_BODY_BYTES))
      return respond({ error: "Document trop volumineux." }, 413);
    rememberProvider = true;
    const apiKey =
      provider === "datalab"
        ? process.env.DATALAB_API_KEY
        : process.env.LLAMA_CLOUD_API_KEY;
    if (!apiKey) {
      report(
        new Error("OCR provider API key is missing"),
        "OCR_NOT_CONFIGURED",
      );
      return respond(
        {
          error:
            "Le service de lecture est temporairement indisponible. Utilisez le mode exemple ou réessayez plus tard.",
        },
        503,
      );
    }
    release = requests.acquire();
    if (!release)
      return respond(
        { error: "Le service est occupé. Réessayez dans quelques instants." },
        503,
        { "Retry-After": "5" },
      );
    const body = await readLimitedBody(request, MAX_BODY_BYTES);
    let form: FormData;
    try {
      form = await new Request(request.url, {
        method: "POST",
        headers: { "Content-Type": request.headers.get("content-type")! },
        body,
      }).formData();
    } catch {
      return respond({ error: "Document invalide." }, 400);
    }
    const file = form.get("file");
    const rawKind = form.get("kind");
    const kind =
      typeof rawKind === "string" && /^[012]$/.test(rawKind)
        ? Number(rawKind)
        : -1;
    if (
      !(file instanceof File) ||
      ![0, 1, 2].includes(kind) ||
      !ALLOWED_UPLOAD_TYPES.some((type) => type === file.type) ||
      file.size === 0 ||
      file.size > MAX_FILE_BYTES
    )
      return respond(
        { error: "Document invalide (JPG, PNG, WebP, PDF ; 4 Mo maximum)." },
        400,
      );
    const keys = [
      ["name", "identity", "address"],
      ["licence", "category", "expiry"],
      ["brand", "plate", "vin"],
    ][kind];
    const bytes = Buffer.from(await file.arrayBuffer());
    const mime = await validateUploadType(
      bytes,
      file.type,
      ALLOWED_UPLOAD_TYPES,
    );
    stage = "provider_request";
    const extract =
      provider === "datalab" ? extractDatalabDocument : extractDocument;
    const parsed = await extract(
      new File(
        [new Uint8Array(bytes)],
        `document.${mime === "application/pdf" ? "pdf" : mime.split("/")[1]}`,
        { type: mime },
      ),
      keys,
      AbortSignal.any([request.signal, AbortSignal.timeout(60000)]),
    );
    stage = "parse_response";
    if (!parsed || typeof parsed !== "object")
      throw new Error("Invalid extraction");
    return respond(
      {
        fields: Object.fromEntries(
          keys.map((k) => [k, typeof parsed[k] === "string" ? parsed[k] : ""]),
        ),
      },
      200,
    );
  } catch (error) {
    if (error instanceof LlamaCloud.APIError || error instanceof DatalabError) {
      providerStatus = error.status;
      providerRequestId =
        error instanceof DatalabError
          ? error.requestId
          : (error.headers?.get("x-request-id") ?? undefined);
      const code =
        error.status === 429
          ? "OCR_PROVIDER_RATE_LIMITED"
          : [401, 403].includes(error.status ?? 0)
            ? "OCR_PROVIDER_AUTH_FAILED"
            : "OCR_PROVIDER_FAILED";
      const eventId = report(
        new Error(
          `${provider} extraction failed (HTTP ${error.status ?? "unknown"})`,
        ),
        code,
      );
      return respond(
        {
          error: "La lecture du document a échoué. Réessayez plus tard.",
          code,
          eventId,
        },
        502,
      );
    }
    if (error instanceof UploadError)
      return respond({ error: error.message }, error.status);
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    const code = timedOut
      ? "OCR_TIMEOUT"
      : stage === "parse_response"
        ? "OCR_INVALID_RESPONSE"
        : "OCR_UNEXPECTED_ERROR";
    // Parser errors can include extracted text; report a safe error with the original stack location.
    const safeError = new Error(code);
    if (error instanceof Error && error.stack)
      safeError.stack = `${safeError.name}: ${code}\n${error.stack.split("\n").slice(1).join("\n")}`;
    const eventId = report(safeError, code);
    return respond(
      {
        error: timedOut
          ? "Le service de lecture a mis trop de temps à répondre. Réessayez."
          : "Impossible de lire le document. Réessayez plus tard.",
        code,
        eventId,
      },
      timedOut ? 504 : 500,
    );
  } finally {
    release?.();
  }
}
