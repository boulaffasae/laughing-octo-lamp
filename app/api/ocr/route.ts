const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_BODY_BYTES = MAX_FILE_BYTES + 64 * 1024;

function reply(body: unknown, status: number) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(request: Request) {
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
    // Count actual bytes too: Content-Length may be absent or untrusted.
    if (!request.body) return reply({ error: "Document manquant." }, 400);
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > MAX_BODY_BYTES) {
          await reader.cancel();
          return reply({ error: "Document trop volumineux." }, 413);
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    let form: FormData;
    try {
      form = await new Request(request.url, {
        method: "POST",
        headers: { "Content-Type": request.headers.get("content-type")! },
        body: Buffer.concat(chunks),
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
      !["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(
        file.type,
      ) ||
      file.size === 0 ||
      file.size > MAX_FILE_BYTES
    )
      return reply(
        { error: "Document invalide (JPG, PNG, WebP, PDF ; 10 Mo maximum)." },
        400,
      );
    const keys = [
      ["name", "identity", "address"],
      ["licence", "category", "expiry"],
      ["brand", "plate", "vin"],
    ][kind];
    const encoded = `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString("base64")}`;
    const document =
      file.type === "application/pdf"
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
      signal: AbortSignal.timeout(60000),
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
  } catch {
    return reply(
      {
        error:
          "Impossible de lire le document. Réessayez avec une image plus nette.",
      },
      500,
    );
  }
}
