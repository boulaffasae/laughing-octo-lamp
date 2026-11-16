import { get, put } from "@vercel/blob";
import { logStorageFailure } from "@/lib/document-storage";
import { renderPdfThumbnail } from "@/lib/pdf-thumbnail";

const pending = new Map<string, Promise<Buffer | null>>();

export function documentThumbnailPath(id: string) {
  return `pdf-thumbnails/v1/${id}.webp`;
}

export async function saveDocumentThumbnail(
  id: string,
  pdfPath: string,
  bytes?: Uint8Array,
) {
  const existing = pending.get(id);
  if (existing) return existing;

  const work = (async () => {
    if (!bytes) {
      const pdf = await get(pdfPath, { access: "private" });
      if (pdf?.statusCode !== 200) return null;
      bytes = new Uint8Array(await new Response(pdf.stream).arrayBuffer());
    }

    const thumbnail = await renderPdfThumbnail(bytes);
    await put(documentThumbnailPath(id), thumbnail, {
      access: "private",
      contentType: "image/webp",
      // Upload and first view can overlap across instances for the same PDF.
      allowOverwrite: true,
    });
    return thumbnail;
  })().catch((error: unknown) => {
    logStorageFailure("thumbnail", error);
    return null;
  });

  pending.set(id, work);
  try {
    return await work;
  } finally {
    pending.delete(id);
  }
}
