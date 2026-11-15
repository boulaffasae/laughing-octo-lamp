import { get } from "@vercel/blob";
import {
  failure,
  ownerId,
  privateHeaders,
  repository,
  storageConfigured,
} from "@/lib/document-storage";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/documents/[id]">,
) {
  const owner = await ownerId();
  if (!owner) return failure("auth", 401);
  if (!storageConfigured()) return failure("configuration", 503);
  const { id } = await params;
  if (!/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(id))
    return failure("missing", 404);

  try {
    const sql = repository();
    const rows =
      await sql`SELECT blob_path FROM documents WHERE id = ${id} AND owner_id = ${owner}`;
    if (!rows.length) return failure("missing", 404);
    const blob = await get(rows[0].blob_path, { access: "private" });
    if (blob?.statusCode !== 200) return failure("missing", 404);
    return new Response(blob.stream, {
      headers: {
        ...privateHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="louma.pdf"',
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return failure("storage", 503);
  }
}
