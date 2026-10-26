import {
  ALLOWED_UPLOAD_TYPES,
  MAX_BODY_BYTES,
  MAX_FILE_BYTES,
} from "@/lib/upload-policy";
import {
  createRequestLimiter,
  readLimitedBody,
  UploadError,
  validateUploadType,
} from "@/lib/ocr-security";

const requests = createRequestLimiter(2);

function reply(
  body: unknown,
  status: number,
  headers: Record<string, string> = {},
) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}

export async function POST(request: Request) {
  let release: (() => void) | undefined;
  try {
    // Browser protection only: scripts can forge Origin. This is not authentication.
    const origin = request.headers.get("origin");
    if (
      request.headers.get("sec-fetch-site") === "cross-site" ||
      (origin && origin !== new URL(request.url).origin)
    )
      return reply({ error: "Requête non autorisée." }, 403);
    if (
      !request.headers
        .get("content-type")
        ?.toLowerCase()
        .startsWith("multipart/form-data;")
    )
      return reply({ error: "Format de requête invalide." }, 415);
    const length = request.headers.get("content-length");
    if (length && (!/^\d+$/.test(length) || Number(length) > MAX_BODY_BYTES))
      return reply({ error: "Document trop volumineux." }, 413);
    if (!process.env.MISTRAL_API_KEY)
      return reply(
        {
          error:
            "Le service de lecture est temporairement indisponible. Utilisez le mode exemple ou réessayez plus tard.",
        },
        503,
      );
    release = requests.acquire();
    if (!release)
      return reply(
        { error: "Le service est occupé. Réessayez dans quelques instants." },
        503,
        { "Retry-After": "5" },
      );
    const body = await readLimitedBody(request, MAX_BODY_BYTES);
    let form: FormData;
    try {
      form = await new Request(request.url, {
        method: "POST",
        headers: { "Content-Type": request.headers.get("content-type")! },
        body,
      }).formData();
    } catch {
      return reply({ error: "Document invalide." }, 400);
    }
    const file = form.get("file");
    const rawKind = form.get("kind");
    const kind =
      typeof rawKind === "string" && /^[012]$/.test(rawKind)
        ? Number(rawKind)
        : -1;
    if (
      !(file instanceof File) ||
      ![0, 1, 2].includes(kind) ||
      !ALLOWED_UPLOAD_TYPES.some((type) => type === file.type) ||
      file.size === 0 ||
      file.size > MAX_FILE_BYTES
    )
      return reply(
        { error: "Document invalide (JPG, PNG, WebP, PDF ; 4 Mo maximum)." },
        400,
      );
    const keys = [
      ["name", "identity", "address"],
      ["licence", "category", "expiry"],
      ["brand", "plate", "vin"],
    ][kind];
    const bytes = Buffer.from(await file.arrayBuffer());
    const mime = await validateUploadType(
      bytes,
      file.type,
      ALLOWED_UPLOAD_TYPES,
    );
    const encoded = `data:${mime};base64,${bytes.toString("base64")}`;
    const document =
      mime === "application/pdf"
        ? { type: "document_url", document_url: encoded }
        : { type: "image_url", image_url: encoded };
    const result = await fetch("https://api.mistral.ai/v1/ocr", {
      method: "POST",
      redirect: "error",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-ocr-latest",
        document,
        include_image_base64: false,
        document_annotation_format: {
          type: "json_schema",
          json_schema: {
            name: "rental_document",
            strict: true,
            schema: {
              type: "object",
              properties: Object.fromEntries(
                keys.map((k) => [k, { type: "string" }]),
              ),
              required: keys,
              additionalProperties: false,
            },
          },
        },
        document_annotation_prompt:
          "Extract the requested fields from this Moroccan document. Transcribe Latin script where available. name=full name; identity=CNIE number; address=address; licence=driving licence number; category=licence category; expiry=expiry date YYYY-MM-DD; brand=vehicle make and model; plate=registration number; vin=chassis number. Return empty string for absent or unreadable fields. Never invent values.",
      }),
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(60000)]),
    });
    if (!result.ok)
      return reply(
        {
          error: "La lecture du document a échoué. Réessayez plus tard.",
        },
        502,
      );
    const json = await result.json();
    const parsed =
      typeof json.document_annotation === "string"
        ? JSON.parse(json.document_annotation)
        : json.document_annotation;
    if (!parsed || typeof parsed !== "object")
      throw new Error("Invalid extraction");
    return reply(
      {
        fields: Object.fromEntries(
          keys.map((k) => [k, typeof parsed[k] === "string" ? parsed[k] : ""]),
        ),
      },
      200,
    );
  } catch (error) {
    if (error instanceof UploadError)
      return reply({ error: error.message }, error.status);
    return reply(
      {
        error:
          "Impossible de lire le document. Réessayez avec une image plus nette.",
      },
      500,
    );
  } finally {
    release?.();
  }
}
