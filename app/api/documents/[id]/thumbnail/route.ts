import { get } from "@vercel/blob";
import {
  failure,
  logStorageFailure,
  ownerId,
  privateHeaders,
  repository,
  storageConfigured,
} from "@/lib/document-storage";
import {
  documentThumbnailPath,
  saveDocumentThumbnail,
} from "@/lib/document-thumbnail";
import { uuidPattern } from "@/lib/contract/saved-contract";

const imageHeaders = {
  ...privateHeaders,
  "Content-Type": "image/webp",
  "X-Content-Type-Options": "nosniff",
};

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/documents/[id]/thumbnail">,
) {
  const owner = await ownerId();
  if (!owner) return failure("auth", 401);
  const { id } = await params;
  if (!uuidPattern.test(id)) return failure("missing", 404);
  if (!storageConfigured("thumbnail")) return failure("configuration", 503);

  try {
    const sql = repository();
    const [document] = await sql`
      SELECT id, blob_path FROM documents WHERE id = ${id} AND owner_id = ${owner}
    `;
    if (!document) return failure("missing", 404);

    const thumbnail = await get(documentThumbnailPath(document.id), {
      access: "private",
    });
    if (thumbnail?.statusCode === 200) {
      return new Response(thumbnail.stream, { headers: imageHeaders });
    }

    const generated = await saveDocumentThumbnail(
      document.id,
      document.blob_path,
    );
    return generated
      ? new Response(new Uint8Array(generated), { headers: imageHeaders })
      : failure("thumbnail", 404);
  } catch (error) {
    logStorageFailure("thumbnail", error);
    return failure("storage", 503);
  }
}
