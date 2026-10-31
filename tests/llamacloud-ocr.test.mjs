import assert from "node:assert/strict";
import { test } from "node:test";
import { extractDocument } from "../lib/ocr/llamacloud.ts";

test("LlamaCloud extracts schema fields and deletes the job and file", async (t) => {
  const previousKey = process.env.LLAMA_CLOUD_API_KEY;
  process.env.LLAMA_CLOUD_API_KEY = "test-only";
  t.after(() => {
    if (previousKey === undefined) delete process.env.LLAMA_CLOUD_API_KEY;
    else process.env.LLAMA_CLOUD_API_KEY = previousKey;
  });
  const calls = [];
  t.mock.method(globalThis, "fetch", async (input, init) => {
    const request = new Request(input, init);
    calls.push([request.method, new URL(request.url).pathname]);
    assert.equal(
      new URL(request.url).origin,
      "https://api.cloud.eu.llamaindex.ai",
    );
    if (request.method === "DELETE") return new Response(null, { status: 204 });
    if (request.url.endsWith("/extract")) {
      const body = await request.json();
      assert.equal(body.file_input, "test-file");
      assert.deepEqual(body.configuration.data_schema.required, ["identity"]);
      assert.equal(body.configuration.disable_cache, true);
      return Response.json({
        id: "test-job",
        status: "COMPLETED",
        extract_result: { identity: "TEST123" },
      });
    }
    return Response.json({ id: "test-file" });
  });
  assert.deepEqual(
    await extractDocument(
      new File(["test"], "test.pdf"),
      ["identity"],
      AbortSignal.timeout(5000),
    ),
    { identity: "TEST123" },
  );
  assert.deepEqual(calls.slice(-2), [
    ["DELETE", "/api/v2/extract/test-job"],
    ["DELETE", "/api/v1/beta/files/test-file"],
  ]);
});

test("failed extraction deletes remote resources without exposing provider error text", async (t) => {
  const previousKey = process.env.LLAMA_CLOUD_API_KEY;
  process.env.LLAMA_CLOUD_API_KEY = "test-only";
  t.after(() => {
    if (previousKey === undefined) delete process.env.LLAMA_CLOUD_API_KEY;
    else process.env.LLAMA_CLOUD_API_KEY = previousKey;
  });
  const deleted = [];
  t.mock.method(globalThis, "fetch", async (input, init) => {
    const request = new Request(input, init);
    if (request.method === "DELETE") {
      deleted.push(request.url);
      return new Response(null, { status: 204 });
    }
    return Response.json(
      request.url.endsWith("/extract")
        ? {
            id: "test-job",
            status: "FAILED",
            error_message: "private document contents",
          }
        : { id: "test-file" },
    );
  });
  await assert.rejects(
    extractDocument(
      new File(["test"], "test.pdf"),
      ["identity"],
      AbortSignal.timeout(5000),
    ),
    { message: "OCR_PROVIDER_JOB_FAILED" },
  );
  assert.equal(deleted.length, 2);
});
