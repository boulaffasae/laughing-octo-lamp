import {
  failure,
  logStorageFailure,
  ownerId,
  privateHeaders,
  repository,
} from "@/lib/document-storage";
import {
  isAgreement,
  loadDraft,
  saveDraft,
} from "@/lib/contract/contract-storage";
import { uuidPattern } from "@/lib/contract/saved-contract";
import { readLimitedBody, UploadError } from "@/lib/ocr/upload-security";

export async function GET(
  request: Request,
  { params }: RouteContext<"/api/contracts/[id]">,
) {
  const owner = await ownerId();
  if (!owner) return failure("auth", 401);
  if (!process.env.DATABASE_URL?.trim()) return failure("configuration", 503);
  const { id } = await params;
  if (!uuidPattern.test(id)) return failure("missing", 404);

  const search = new URL(request.url).searchParams;
  const revision = Number(search.get("revision") ?? 0);
  const before = Number(search.get("before") ?? 2_147_483_647);
  if (
    !Number.isInteger(revision) ||
    revision < 0 ||
    revision > 2_147_483_647 ||
    !Number.isInteger(before) ||
    before < 1 ||
    before > 2_147_483_647
  ) {
    return failure("revision", 400);
  }

  try {
    if (search.has("draft")) {
      const saved = await loadDraft(owner, id);
      return saved
        ? Response.json(saved, { headers: privateHeaders })
        : failure("missing", 404);
    }
    const sql = repository();
    if (search.has("revision")) {
      const [row] =
        revision === 0
          ? await sql`SELECT draft AS snapshot FROM rental_contracts WHERE id = ${id} AND owner_id = ${owner}`
          : await sql`
          SELECT r.snapshot FROM rental_contract_revisions r
          JOIN rental_contracts c ON c.id = r.contract_id
          WHERE c.id = ${id} AND c.owner_id = ${owner} AND r.revision = ${revision}
        `;
      return row
        ? Response.json(row, { headers: privateHeaders })
        : failure("missing", 404);
    }
    const revisions = await sql`
      SELECT r.revision, r.created_at FROM rental_contract_revisions r
      JOIN rental_contracts c ON c.id = r.contract_id
      WHERE c.id = ${id} AND c.owner_id = ${owner} AND r.revision < ${before}
      ORDER BY r.revision DESC LIMIT 25
    `;
    return Response.json(
      { revisions: revisions.slice(0, 24), more: revisions.length > 24 },
      { headers: privateHeaders },
    );
  } catch (error) {
    logStorageFailure("list", error);
    return failure("storage", 503);
  }
}

export async function PUT(
  request: Request,
  { params }: RouteContext<"/api/contracts/[id]">,
) {
  const owner = await ownerId();
  if (!owner) return failure("auth", 401);
  if (!process.env.DATABASE_URL?.trim()) return failure("configuration", 503);
  const { id } = await params;
  if (!uuidPattern.test(id)) return failure("missing", 404);

  const origin = request.headers.get("origin");
  if (
    request.headers.get("sec-fetch-site") === "cross-site" ||
    (origin && origin !== new URL(request.url).origin)
  )
    return failure("origin", 403);
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json")
    return failure("format", 415);

  try {
    const body = await readLimitedBody(request, 2_400_000);
    let payload;
    try {
      payload = JSON.parse(body.toString());
    } catch {
      return failure("format", 400);
    }
    if (
      !payload ||
      !Number.isInteger(payload.base) ||
      payload.base < 0 ||
      payload.base >= 2_147_483_647 ||
      typeof payload.operation !== "string" ||
      !uuidPattern.test(payload.operation) ||
      typeof payload.archive !== "boolean" ||
      !isAgreement(payload.draft)
    )
      return failure("draft", 400);

    const version = await saveDraft(
      owner,
      id,
      payload.base,
      payload.operation,
      payload.draft,
      payload.archive,
    );
    return version
      ? Response.json({ edit_version: version }, { headers: privateHeaders })
      : failure("conflict", 409);
  } catch (error) {
    if (error instanceof UploadError) return failure("draft", error.status);
    logStorageFailure("save", error);
    return failure("storage", 503);
  }
}
