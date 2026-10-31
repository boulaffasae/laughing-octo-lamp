import assert from "node:assert/strict";
import { test } from "node:test";
import {
  scanDocument,
  DocumentScanError,
} from "../lib/contract/scan-document.ts";
import { createEmptyDocuments } from "../lib/contract/documents.ts";

const file = new File(["test"], "document.pdf", { type: "application/pdf" });

test("OCR responses keep only the expected document fields", async (t) => {
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "/api/ocr");
    assert.equal(options.body.get("kind"), "0");
    return Response.json({
      fields: {
        name: "TEST",
        identity: "TEST123",
        address: "Rabat",
        unexpected: "discard",
      },
    });
  });
  assert.deepEqual(
    await scanDocument(file, 0, "Fallback", AbortSignal.timeout(1000)),
    { name: "TEST", identity: "TEST123", address: "Rabat" },
  );
});

test("scan errors preserve a safe server message and its support reference", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    Response.json(
      { error: "Service busy", requestId: "test-reference" },
      { status: 503 },
    ),
  );
  await assert.rejects(
    scanDocument(file, 0, "Fallback", AbortSignal.timeout(1000)),
    (error) =>
      error instanceof DocumentScanError &&
      error.message === "Service busy (Réf. : test-reference)",
  );
});

test("invalid provider fields cannot be merged into the document form", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    Response.json({ fields: { name: { unsafe: true } } }),
  );
  await assert.rejects(
    scanDocument(file, 0, "Fallback", AbortSignal.timeout(1000)),
    { message: "Fallback" },
  );
});

test("new contract sessions never share mutable field objects", () => {
  const firstSession = createEmptyDocuments();
  firstSession[0].name = "Previous session";
  assert.equal(createEmptyDocuments()[0].name, "");
});
