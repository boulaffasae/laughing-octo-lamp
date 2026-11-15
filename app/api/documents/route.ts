import { createHash, randomUUID } from "node:crypto";
import { del, put } from "@vercel/blob";
import {
  failure,
  ownerId,
  logStorageFailure,
  privateHeaders,
  repository,
  storageConfigured,
  validDate,
} from "@/lib/document-storage";
import {
  readLimitedBody,
  UploadError,
  validateUploadType,
} from "@/lib/ocr/upload-security";
import { validateOcrRequestHeaders } from "@/lib/ocr/request";
import { MAX_BODY_BYTES, MAX_FILE_BYTES } from "@/lib/upload-policy";

export async function GET(request: Request) {
  const owner = await ownerId();
  if (!owner) return failure("auth", 401);
  if (!storageConfigured("list")) return failure("configuration", 503);

  const params = new URL(request.url).searchParams;
  const start = params.get("start");
  const end = params.get("end");
  const page = Number(params.get("page") ?? "1");
  if (
    (start && !validDate(start)) ||
    (end && !validDate(end)) ||
    (start && end && start > end) ||
    !Number.isSafeInteger(page) ||
    page < 1 ||
    page > 10000
  )
    return failure("dates", 400);

  try {
    const sql = repository();
    const documents = await sql`
      SELECT id, created_at FROM documents
      WHERE owner_id = ${owner}
        AND (${start}::date IS NULL OR created_at >= (${start}::date::timestamp AT TIME ZONE 'Africa/Casablanca'))
        AND (${end}::date IS NULL OR created_at < ((${end}::date + 1)::timestamp AT TIME ZONE 'Africa/Casablanca'))
      ORDER BY created_at DESC, id DESC LIMIT 25 OFFSET ${(page - 1) * 24}
    `;
    return Response.json(
      { documents: documents.slice(0, 24), more: documents.length > 24 },
      { headers: privateHeaders },
    );
  } catch (error) {
    logStorageFailure("list", error);
    return failure("storage", 503);
  }
}

export async function POST(request: Request) {
  const owner = await ownerId();
  if (!owner) return failure("auth", 401);
  if (!storageConfigured("save")) return failure("configuration", 503);

  try {
    validateOcrRequestHeaders(request);
    const body = await readLimitedBody(request, MAX_BODY_BYTES);
    const form = await new Request(request.url, {
      method: "POST",
      headers: { "Content-Type": request.headers.get("content-type")! },
      body,
    })
      .formData()
      .catch(() => null);
    const file = form?.get("file");
    const kind = form?.get("kind");
    if (
      !(file instanceof File) ||
      file.size === 0 ||
      file.size > MAX_FILE_BYTES ||
      (kind !== "contract" && kind !== "upload")
    ) {
      return failure("file", 400);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    await validateUploadType(bytes, file.type, ["application/pdf"]);
    const hash = createHash("sha256").update(bytes).digest("hex");
    const id = randomUUID();
    const sql = repository();
    const existing =
      await sql`SELECT id FROM documents WHERE owner_id = ${owner} AND kind = ${kind} AND content_hash = ${hash}`;
    if (existing.length)
      return Response.json({ id: existing[0].id }, { headers: privateHeaders });
    const { pathname } = await put(`pdf/${id}.pdf`, file, {
      access: "private",
      contentType: "application/pdf",
    });

    try {
      const rows = await sql`
        INSERT INTO documents (id, owner_id, blob_path, kind, byte_size, content_hash)
        VALUES (${id}, ${owner}, ${pathname}, ${kind}, ${file.size}, ${hash})
        ON CONFLICT (owner_id, kind, content_hash) DO NOTHING RETURNING id
      `;
      if (rows.length)
        return Response.json({ id }, { status: 201, headers: privateHeaders });
    } catch (error) {
      // A failed response can arrive after Neon committed. Check before deleting.
      const saved =
        await sql`SELECT id FROM documents WHERE id = ${id} AND owner_id = ${owner}`;
      if (saved.length)
        return Response.json({ id }, { headers: privateHeaders });
      await del(pathname).catch(() => undefined);
      throw error;
    }

    await del(pathname).catch(() => undefined);
    const winner =
      await sql`SELECT id FROM documents WHERE owner_id = ${owner} AND kind = ${kind} AND content_hash = ${hash}`;
    return Response.json({ id: winner[0].id }, { headers: privateHeaders });
  } catch (error) {
    if (error instanceof UploadError) return failure("file", error.status);
    logStorageFailure("save", error);
    return failure("storage", 503);
  }
}
