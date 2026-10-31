import * as Sentry from "@sentry/nextjs";
import { DatalabError } from "./datalab.ts";
import { UploadError } from "./upload-security.ts";

type OcrStage = "validation" | "provider_request" | "parse_response";

export function createOcrRequestContext() {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  const context = {
    stage: "validation" as OcrStage,
    respond,
    handleError,
    serviceUnavailable,
  };

  function respond(
    body: Record<string, unknown>,
    status: number,
    headers: Record<string, string> = {},
  ) {
    console.info(
      JSON.stringify({
        event: "ocr.request",
        provider: "datalab",
        requestId,
        stage: context.stage,
        status,
        durationMs: Date.now() - startedAt,
      }),
    );
    return Response.json(
      { ...body, requestId },
      {
        status,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
          ...headers,
          "X-Request-ID": requestId,
          "X-OCR-Provider": "datalab",
        },
      },
    );
  }

  function reportError(
    error: Error,
    code: string,
    providerError?: DatalabError,
  ) {
    const details = {
      requestId,
      code,
      stage: context.stage,
      provider: "datalab",
      providerStatus: providerError?.status,
      providerRequestId: providerError?.requestId,
      durationMs: Date.now() - startedAt,
    };
    console.error(JSON.stringify({ event: "ocr.error", ...details }));
    return Sentry.withScope((scope) => {
      scope.setTag("error_code", code);
      scope.setTag("request_id", requestId);
      scope.setContext("ocr", details);
      return Sentry.captureException(error);
    });
  }

  function serviceUnavailable() {
    reportError(
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

  function handleError(error: unknown) {
    if (error instanceof UploadError)
      return respond({ error: error.message }, error.status);
    if (error instanceof DatalabError) {
      const code =
        error.status === 429
          ? "OCR_PROVIDER_RATE_LIMITED"
          : [401, 403].includes(error.status ?? 0)
            ? "OCR_PROVIDER_AUTH_FAILED"
            : "OCR_PROVIDER_FAILED";
      const eventId = reportError(
        new Error(
          `Datalab extraction failed (HTTP ${error.status ?? "unknown"})`,
        ),
        code,
        error,
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

    const timedOut = error instanceof Error && error.name === "TimeoutError";
    const code = timedOut
      ? "OCR_TIMEOUT"
      : context.stage === "parse_response"
        ? "OCR_INVALID_RESPONSE"
        : "OCR_UNEXPECTED_ERROR";
    // Parser and provider messages can contain document text. Keep only stack locations.
    const safeError = new Error(code);
    if (error instanceof Error && error.stack)
      safeError.stack = `${safeError.name}: ${code}\n${error.stack.split("\n").slice(1).join("\n")}`;
    const eventId = reportError(safeError, code);
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
  }

  return context;
}
