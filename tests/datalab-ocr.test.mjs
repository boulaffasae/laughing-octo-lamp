import assert from "node:assert/strict";
import { test, beforeEach, afterEach } from "node:test";

let previousKey;
beforeEach(() => {
  previousKey = process.env.DATALAB_API_KEY;
  process.env.DATALAB_API_KEY = "test-only";
});
afterEach(() => {
  if (previousKey === undefined) delete process.env.DATALAB_API_KEY;
  else process.env.DATALAB_API_KEY = previousKey;
});
import { extractDatalabDocument, DatalabError } from "../lib/ocr/datalab.ts";

test("Datalab submits a schema and polls a local URL, ignoring untrusted check URLs", async (t) => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, init) => {
    calls.push(String(url));
    if (init.method === "POST") {
      assert.deepEqual(JSON.parse(init.body.get("page_schema")).required, [
        "identity",
      ]);
      assert.equal(init.body.get("extraction_mode"), "balanced");
      return Response.json({
        success: true,
        request_id: "test-job",
        request_check_url: "https://untrusted.test",
      });
    }
    return Response.json({
      status: "complete",
      success: true,
      extraction_schema_json: '{"identity":"TEST123"}',
    });
  });
  assert.deepEqual(
    await extractDatalabDocument(
      new File(["test"], "test.pdf"),
      ["identity"],
      AbortSignal.timeout(5000),
    ),
    { identity: "TEST123" },
  );
  assert.equal(calls[1], "https://www.datalab.to/api/v1/extract/test-job");
});
test("Datalab does not expose provider error bodies", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    Response.json({ error: "sensitive contents" }, { status: 429 }),
  );
  await assert.rejects(
    extractDatalabDocument(
      new File(["test"], "test.pdf"),
      ["identity"],
      AbortSignal.timeout(5000),
    ),
    (error) =>
      error instanceof DatalabError &&
      error.status === 429 &&
      !error.message.includes("sensitive"),
  );
});
test("Datalab polling respects the shared request deadline", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    Response.json({ success: true, request_id: "test-job" }),
  );
  await assert.rejects(
    extractDatalabDocument(
      new File(["test"], "test.pdf"),
      ["identity"],
      AbortSignal.timeout(10),
    ),
    (error) => error.name === "TimeoutError",
  );
});

test("regional signed result downloads never receive the API key", async (t) => {
  t.mock.method(globalThis, "fetch", async (url, init) => {
    if (init.method === "POST")
      return Response.json({ success: true, request_id: "regional-job" });
    if (String(url).startsWith("https://www.datalab.to/")) {
      return Response.json({
        status: "complete",
        result_url: "https://storage.example.test/signed-result",
      });
    }
    assert.equal(init.headers, undefined);
    assert.equal(init.redirect, "error");
    return Response.json({
      success: true,
      extraction_schema_json: '{"identity":"TEST123"}',
    });
  });
  assert.deepEqual(
    await extractDatalabDocument(
      new File(["test"], "test.pdf"),
      ["identity"],
      AbortSignal.timeout(5000),
    ),
    { identity: "TEST123" },
  );
});
