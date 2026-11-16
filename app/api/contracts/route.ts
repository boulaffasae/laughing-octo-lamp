import {
  failure,
  listFilters,
  logStorageFailure,
  ownerId,
  privateHeaders,
  repository,
} from "@/lib/document-storage";

export async function GET(request: Request) {
  const owner = await ownerId();
  if (!owner) return failure("auth", 401);
  if (!process.env.DATABASE_URL?.trim()) return failure("configuration", 503);

  const filters = listFilters(request);
  if (!filters) return failure("dates", 400);
  const { start, end, page } = filters;

  try {
    const sql = repository();
    const contracts = await sql`
      SELECT id, draft->>'title' AS title, updated_at,
        concat_ws(' ', nullif(draft #>> '{documents,0,firstName}', ''),
                      nullif(draft #>> '{documents,0,lastName}', '')) AS renter,
        draft #>> '{documents,2,plate}' AS plate
      FROM rental_contracts WHERE owner_id = ${owner}
        AND (${start}::date IS NULL OR updated_at >= (${start}::date::timestamp AT TIME ZONE 'Africa/Casablanca'))
        AND (${end}::date IS NULL OR updated_at < ((${end}::date + 1)::timestamp AT TIME ZONE 'Africa/Casablanca'))
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
