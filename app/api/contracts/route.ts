import {
  failure,
  logStorageFailure,
  ownerId,
  privateHeaders,
  repository,
} from "@/lib/document-storage";

export async function GET(request: Request) {
  const owner = await ownerId();
  if (!owner) return failure("auth", 401);
  if (!process.env.DATABASE_URL?.trim()) return failure("configuration", 503);

  const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
  if (!Number.isSafeInteger(page) || page < 1 || page > 10000)
    return failure("page", 400);

  try {
    const sql = repository();
    const contracts = await sql`
      SELECT id, draft->>'title' AS title, updated_at,
        concat_ws(' ', nullif(draft #>> '{documents,0,firstName}', ''),
                      nullif(draft #>> '{documents,0,lastName}', '')) AS renter,
        draft #>> '{documents,2,plate}' AS plate
      FROM rental_contracts WHERE owner_id = ${owner}
      ORDER BY updated_at DESC, id DESC LIMIT 25 OFFSET ${(page - 1) * 24}
    `;
    return Response.json(
      { contracts: contracts.slice(0, 24), more: contracts.length > 24 },
      { headers: privateHeaders },
    );
  } catch (error) {
    logStorageFailure("list", error);
    return failure("storage", 503);
  }
}
