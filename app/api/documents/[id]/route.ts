import { get } from "@vercel/blob";
import {
  failure,
  ownerId,
  logStorageFailure,
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
  if (!storageConfigured("download")) return failure("configuration", 503);
  const { id } = await params;
  if (!/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(id))
    return failure("missing", 404);

  try {
    const sql = repository();
    const [document] = await sql`
      SELECT blob_path,
        to_char(created_at AT TIME ZONE 'Africa/Casablanca', 'DD-MM-YYYY') AS creation_date
      FROM documents WHERE id = ${id} AND owner_id = ${owner}
    `;
    if (!document) return failure("missing", 404);
    const blob = await get(document.blob_path, { access: "private" });
    if (blob?.statusCode !== 200) return failure("missing", 404);
    return new Response(blob.stream, {
      headers: {
        ...privateHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Document - ${document.creation_date}.pdf"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    logStorageFailure("download", error);
    return failure("storage", 503);
  }
}
