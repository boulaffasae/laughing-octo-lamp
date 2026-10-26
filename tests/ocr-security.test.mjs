import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  createRequestLimiter,
  readLimitedBody,
  UploadError,
  validateUploadType,
} from "../lib/ocr-security.ts";
import {
  ALLOWED_UPLOAD_TYPES,
  MAX_BODY_BYTES,
  MAX_FILE_BYTES,
} from "../lib/upload-policy.ts";

const upload = (body, signal) =>
  new Request("https://example.test/api/ocr", {
    method: "POST",
    body,
    signal,
    duplex: "half",
  });

const statusIs = (status) => (error) =>
  error instanceof UploadError && error.status === status;

test("multipart allowance stays below Vercel's 4.5 MB payload ceiling", () => {
  assert.ok(MAX_BODY_BYTES > MAX_FILE_BYTES);
  assert.ok(MAX_BODY_BYTES < 4_500_000);
});

test("reads bodies at the exact byte limit", async () => {
  assert.equal((await readLimitedBody(upload("hello"), 5)).toString(), "hello");
});

test("counts chunked bytes without trusting Content-Length", async () => {
  let cancelled = false;
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(3));
      controller.enqueue(new Uint8Array(3));
    },
    cancel() {
      cancelled = true;
    },
  });
  await assert.rejects(readLimitedBody(upload(body), 5), statusIs(413));
  assert.ok(cancelled);
  assert.equal(body.locked, false);
});

test("rejects a missing body", async () => {
  await assert.rejects(readLimitedBody(upload(undefined), 5), statusIs(400));
});

test("deadline cancels a stalled upload even if cancellation never settles", async () => {
  let cancelled = false;
  const body = new ReadableStream({
    cancel() {
      cancelled = true;
      return new Promise(() => {});
    },
  });
  await assert.rejects(readLimitedBody(upload(body), 5, 20), statusIs(408));
  assert.ok(cancelled);
  assert.equal(body.locked, false);
});

test("client disconnect interrupts a pending read", async () => {
  const controller = new AbortController();
  const pending = readLimitedBody(
    upload(new ReadableStream(), controller.signal),
    5,
  );
  controller.abort();
  await assert.rejects(pending, statusIs(408));
});

test("limits active requests and releases slots idempotently", () => {
  const limiter = createRequestLimiter(2);
  const first = limiter.acquire();
  const second = limiter.acquire();
  assert.equal(typeof first, "function");
  assert.equal(typeof second, "function");
  assert.equal(limiter.acquire(), undefined);
  first();
  first();
  const third = limiter.acquire();
  assert.equal(typeof third, "function");
  assert.equal(limiter.acquire(), undefined);
  second();
  third();
});

test("accepts a real PNG with matching MIME type", async () => {
  const bytes = await readFile(new URL("../app/icon1.png", import.meta.url));
  assert.equal(
    await validateUploadType(bytes, "image/png", ALLOWED_UPLOAD_TYPES),
    "image/png",
  );
});

test("accepts a PDF signature", async () => {
  assert.equal(
    await validateUploadType(
      Buffer.from("%PDF-1.7\n"),
      "application/pdf",
      ALLOWED_UPLOAD_TYPES,
    ),
    "application/pdf",
  );
});

test("rejects a real image labelled as PDF", async () => {
  const bytes = await readFile(new URL("../app/icon1.png", import.meta.url));
  await assert.rejects(
    validateUploadType(bytes, "application/pdf", ALLOWED_UPLOAD_TYPES),
    statusIs(400),
  );
});

test("rejects unsupported types and text disguised as an image", async () => {
  for (const bytes of [Buffer.from("GIF89a"), Buffer.from("not an image")]) {
    await assert.rejects(
      validateUploadType(bytes, "image/png", ALLOWED_UPLOAD_TYPES),
      statusIs(400),
    );
  }
});
