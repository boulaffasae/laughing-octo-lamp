import test from "node:test";
import assert from "node:assert/strict";
import { scrubEvent } from "../lib/sentry-options.ts";

test("Sentry strips OCR payloads and identifying request metadata", () => {
  const event = scrubEvent({
    request: {
      data: "document",
      headers: { authorization: "secret" },
      cookies: "session",
      query_string: "name=person",
      url: "https://example.com/api/ocr?name=person",
    },
    user: { email: "person@example.com" },
    breadcrumbs: [
      { category: "ui.input", message: "identity" },
      { category: "console", message: "document" },
      { category: "fetch", message: "POST /api/ocr" },
    ],
    contexts: { ocr: { requestId: "test", providerStatus: 429 } },
  });
  assert.deepEqual(event.request, { url: "https://example.com/api/ocr" });
  assert.equal(event.user, undefined);
  assert.deepEqual(event.breadcrumbs, [
    { category: "fetch", message: "POST /api/ocr" },
  ]);
  assert.equal(event.contexts.ocr.providerStatus, 429);
});
