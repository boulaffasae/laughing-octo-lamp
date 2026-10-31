import { setTimeout } from "node:timers/promises";
import { createExtractionSchema } from "./schema.ts";

const EXTRACT_URL = "https://www.datalab.to/api/v1/extract";

interface DatalabResponse {
  success?: boolean;
  status?: string;
  request_id?: string;
  result_url?: string;
  extraction_schema_json?: string | Record<string, unknown>;
}

export class DatalabError extends Error {
  status?: number;
  requestId?: string;
  constructor(status?: number, requestId?: string) {
    super("Datalab extraction failed");
    this.status = status;
    this.requestId = requestId;
  }
}

export async function extractDatalabDocument(
  file: File,
  keys: string[],
  signal: AbortSignal,
) {
  if (!process.env.DATALAB_API_KEY) throw new DatalabError();
  const headers = { "X-Api-Key": process.env.DATALAB_API_KEY ?? "" };
  async function read(url: string, init: RequestInit) {
    const response = await fetch(url, {
      ...init,
      signal,
      cache: "no-store",
      redirect: "error",
    });
    if (!response.ok)
      throw new DatalabError(
        response.status,
        response.headers.get("x-request-id") ?? undefined,
      );
    const body: unknown = await response.json();
    if (!body || typeof body !== "object" || Array.isArray(body))
      throw new DatalabError();
    return body as DatalabResponse;
  }
  const form = new FormData();
  form.set("file", file);
  form.set("mode", "accurate");
  form.set("extraction_mode", "balanced");
  form.set("save_checkpoint", "false");
  form.set("skip_cache", "true");
  form.set("page_schema", JSON.stringify(createExtractionSchema(keys)));
  const job = await read(EXTRACT_URL, { method: "POST", headers, body: form });
  if (job.success === false || typeof job.request_id !== "string")
    throw new DatalabError();
  // Construct the polling URL locally; never forward the API key to a returned URL.
  let result;
  do {
    try {
      await setTimeout(1000, undefined, { signal });
    } catch (error) {
      // Preserve TimeoutError so the HTTP route returns 504 for deadline expiry.
      signal.throwIfAborted();
      throw error;
    }
    result = await read(
      `${EXTRACT_URL}/${encodeURIComponent(job.request_id)}`,
      {
        headers,
      },
    );
    if (
      result.success === false ||
      ["failed", "error", "cancelled"].includes(result.status ?? "")
    )
      throw new DatalabError(undefined, job.request_id);
  } while (result.status !== "complete");
  if (result.result_url) {
    // Regional downloads are signed; no API credential is sent to storage.
    const url = new URL(result.result_url);
    if (url.protocol !== "https:" || url.username || url.password)
      throw new DatalabError();
    result = await read(url.href, {});
  }
  if (result.success === false)
    throw new DatalabError(undefined, job.request_id);
  const fields =
    typeof result.extraction_schema_json === "string"
      ? JSON.parse(result.extraction_schema_json)
      : result.extraction_schema_json;
  if (!fields || Array.isArray(fields) || typeof fields !== "object")
    throw new DatalabError(undefined, job.request_id);
  return fields as Record<string, unknown>;
}
