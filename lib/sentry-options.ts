import type { init, ErrorEvent } from "@sentry/nextjs";

// DSNs identify an ingestion endpoint and are safe to include in browser bundles.
export const sentryDsn =
  process.env.NEXT_PUBLIC_SENTRY_DSN ||
  "https://695fb9779956b1bedfed218d9e622f7a@o4512345550159872.ingest.de.sentry.io/4512345563856976";

export function scrubEvent(event: ErrorEvent): ErrorEvent {
  // OCR requests contain identity documents. Never send request payloads or headers.
  if (event.request) {
    delete event.request.data;
    delete event.request.cookies;
    delete event.request.headers;
    delete event.request.query_string;
    if (event.request.url) event.request.url = event.request.url.split("?")[0];
  }
  delete event.user;
  // UI breadcrumbs can contain typed text, filenames, or document previews.
  event.breadcrumbs = event.breadcrumbs?.filter(
    (crumb) =>
      !crumb.category?.startsWith("ui.") && crumb.category !== "console",
  );
  return event;
}

export const dataCollection: NonNullable<
  Parameters<typeof init>[0]
>["dataCollection"] = {
  userInfo: false,
  cookies: false,
  httpHeaders: false,
  httpBodies: [],
  urlQueryParams: false,
  genAI: { inputs: false, outputs: false },
  stackFrameVariables: false,
};
