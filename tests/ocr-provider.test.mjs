import assert from "node:assert/strict";
import { test } from "node:test";
import { selectOcrProvider, providerCookie } from "../lib/ocr-provider.ts";

const request = (query = "", cookie = "") =>
  new Request(`https://example.test/api/ocr${query}`, { headers: { cookie } });
test("query overrides cookie; invalid choices fall through to the cookie or default", () => {
  assert.deepEqual(
    selectOcrProvider(request("?ocr=datalab", "ocr_provider=llamacloud")),
    { provider: "datalab", source: "query" },
  );
  assert.equal(
    selectOcrProvider(request("?ocr=unknown", "ocr_provider=datalab")).provider,
    "datalab",
  );
  assert.equal(
    selectOcrProvider(request("?ocr=unknown", "ocr_provider=unknown")).provider,
    "llamacloud",
  );
});
test("random assignment is opt-in and existing assignments remain sticky", () => {
  assert.equal(
    selectOcrProvider(request(), false, () => 0).provider,
    "llamacloud",
  );
  assert.equal(
    selectOcrProvider(request(), true, () => 0.49).provider,
    "datalab",
  );
  assert.equal(
    selectOcrProvider(request(), true, () => 0.5).provider,
    "llamacloud",
  );
  assert.equal(
    selectOcrProvider(request("", "ocr_provider=datalab"), true, () => 1)
      .provider,
    "datalab",
  );
});
test("assignment cookies are HttpOnly, scoped to the site, and secure on HTTPS", () => {
  assert.match(
    providerCookie("datalab", "https://example.test"),
    /Path=\/; Max-Age=2592000; HttpOnly; SameSite=Lax; Secure$/,
  );
  assert.doesNotMatch(
    providerCookie("llamacloud", "http://localhost:3000"),
    /Secure/,
  );
});
