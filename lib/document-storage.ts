import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

export const privateHeaders = { "Cache-Control": "private, no-store" };
export const authConfigured = () =>
  Boolean(
    process.env.CLERK_SECRET_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );
type StorageOperation = "list" | "save" | "download";

export function storageConfigured(operation: StorageOperation) {
  const missing = [];
  if (!process.env.DATABASE_URL?.trim()) missing.push("DATABASE_URL");
  // With OIDC, the Blob SDK reads Vercel's request-scoped token automatically.
  if (
    !process.env.BLOB_STORE_ID?.trim() &&
    !process.env.BLOB_READ_WRITE_TOKEN?.trim()
  )
    missing.push("BLOB_STORE_ID or BLOB_READ_WRITE_TOKEN");
  if (missing.length)
    console.error("[documents] storage configuration missing", {
      operation,
      missing,
    });
  return missing.length === 0;
}

export function logStorageFailure(operation: StorageOperation, error: unknown) {
  // Provider messages can contain URLs or database details. Log only safe codes.
  const code =
    error && typeof error === "object" && "code" in error
      ? error.code
      : undefined;
  const name = error instanceof Error ? error.constructor.name : "";
  console.error("[documents] storage request failed", {
    operation,
    provider: name.startsWith("Blob")
      ? "blob"
      : name === "NeonDbError"
        ? "neon"
        : "unknown",
    code:
      typeof code === "string" && /^[A-Z0-9]{5}$/.test(code) ? code : undefined,
  });
}

export async function ownerId() {
  return authConfigured() ? (await auth()).userId : null;
}

export function repository() {
  return neon(process.env.DATABASE_URL!);
}

export function failure(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: privateHeaders });
}

export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "0001-01-01") return false;
  const date = new Date(value);
  return (
    !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
  );
}

export function listFilters(request: Request) {
  const params = new URL(request.url).searchParams;
  const start = params.get("start") || null;
  const end = params.get("end") || null;
  const page = Number(params.get("page") ?? 1);
  if (
    (start && !validDate(start)) ||
    (end && !validDate(end)) ||
    (start && end && start > end) ||
    !Number.isSafeInteger(page) ||
    page < 1 ||
    page > 10000
  )
    return null;
  return { start, end, page };
}
