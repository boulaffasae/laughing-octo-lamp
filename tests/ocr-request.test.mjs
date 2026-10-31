import assert from "node:assert/strict";
import { test } from "node:test";
import {
  readOcrUpload,
  validateOcrRequestHeaders,
} from "../lib/ocr/request.ts";

function uploadRequest(
  kind = "0",
  file = new File(["%PDF-1.4\n%%EOF"], "personal-name.pdf", {
    type: "application/pdf",
  }),
) {
  const form = new FormData();
  form.set("kind", kind);
  form.set("file", file);
  return new Request("https://example.test/api/ocr", {
    method: "POST",
    body: form,
  });
}

test("upload parsing chooses the schema and replaces the original file name", async () => {
  const request = uploadRequest("1");
  validateOcrRequestHeaders(request);
  const upload = await readOcrUpload(request);
  assert.equal(upload.file.name, "document.pdf");
  assert.equal(upload.file.type, "application/pdf");
  assert.deepEqual(upload.fieldNames, ["licence", "category", "expiry"]);
});

test("headers reject cross-site uploads before consuming the body", () => {
  const request = uploadRequest();
  request.headers.set("origin", "https://other.test");
  assert.throws(() => validateOcrRequestHeaders(request), { status: 403 });
  assert.equal(request.bodyUsed, false);
});

test("invalid document kinds and forged MIME types are rejected", async () => {
  await assert.rejects(readOcrUpload(uploadRequest("3")), { status: 400 });
  await assert.rejects(
    readOcrUpload(
      uploadRequest(
        "0",
        new File(["plain text"], "fake.pdf", { type: "application/pdf" }),
      ),
    ),
    { status: 400 },
  );
});
