import { isLocale } from "@/i18n/locales";
import { repository } from "@/lib/document-storage";
import {
  addressMaxLength,
  initialAgreement,
  type Agreement,
} from "./agreement";
import type { SavedDraft } from "./saved-contract";

function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function text(value: unknown, limit: number): value is string {
  return (
    typeof value === "string" && value.length <= limit && !value.includes("\0")
  );
}

function textMap(
  value: unknown,
  size: number,
  length: number,
  addressLength = length,
) {
  return (
    record(value) &&
    Object.entries(value).length <= size &&
    Object.entries(value).every(
      ([key, item]) =>
        /^[\w-]{1,40}$/.test(key) &&
        !Object.hasOwn(Object.prototype, key) &&
        text(item, key === "address" ? addressLength : length),
    )
  );
}

const textLimits: Record<string, number> = {
  footerText: 360,
  termsFr: 3500,
  termsAr: 3500,
};

export function isAgreement(value: unknown): value is Agreement {
  if (
    !record(value) ||
    typeof value.locale !== "string" ||
    !isLocale(value.locale)
  )
    return false;
  const defaults = initialAgreement(value.locale);
  const hasBlueFields = Object.hasOwn(value, "blueFields");
  return (
    Object.keys(value).length ===
      Object.keys(defaults).length + Number(hasBlueFields) &&
    (!hasBlueFields || textMap(value.blueFields, 30, 120)) &&
    Object.entries(defaults).every(([key, initial]) => {
      const field = value[key];
      switch (key) {
        case "logo":
          return (
            text(field, 2_300_000) &&
            (!field ||
              /^data:image\/png;base64,iVBORw0KGgo[A-Za-z0-9+/]*={0,2}$/.test(
                field,
              ))
          );
        case "color":
          return typeof field === "string" && /^#[\da-f]{6}$/i.test(field);
        case "conditionNotes":
          return (
            Array.isArray(field) &&
            field.length === defaults.conditionNotes.length &&
            field.every((note) => text(note, 100))
          );
        case "documents":
          return (
            Array.isArray(field) &&
            field.length === defaults.documents.length &&
            field.every((document) =>
              textMap(document, 16, 120, addressMaxLength),
            )
          );
        case "labels":
          return textMap(field, 64, 65);
        case "headings":
        case "termsTitles":
          return (
            record(field) &&
            Object.keys(field).length === Object.keys(initial).length &&
            Object.keys(initial).every((name) => text(field[name], 65))
          );
        default:
          return text(field, textLimits[key] ?? 120);
      }
    })
  );
}

export async function loadDraft(owner: string, id: string) {
  const sql = repository();
  const [row] = await sql`
    SELECT id, draft, edit_version FROM rental_contracts
    WHERE owner_id = ${owner} AND id = ${id}
  `;
  return row as SavedDraft | undefined;
}

export async function saveDraft(
  owner: string,
  id: string,
  base: number,
  operation: string,
  draft: Agreement,
  archive: boolean,
) {
  const sql = repository();
  const payload = JSON.stringify(draft);
  const [saved] = await sql`
    WITH updated AS (
      INSERT INTO rental_contracts (id, owner_id, draft, revision, last_write)
      SELECT ${id}::uuid, ${owner}, ${payload}::jsonb, ${archive}::boolean::int, ${operation}::uuid
      WHERE ${base}::int = 0 OR EXISTS (
        SELECT 1 FROM rental_contracts WHERE id = ${id} AND owner_id = ${owner}
      )
      ON CONFLICT (id) DO UPDATE SET
        draft = EXCLUDED.draft,
        edit_version = rental_contracts.edit_version + 1,
        revision = rental_contracts.revision + CASE WHEN ${archive} AND
          EXCLUDED.draft IS DISTINCT FROM (
            SELECT snapshot FROM rental_contract_revisions
            WHERE contract_id = rental_contracts.id AND revision = rental_contracts.revision
          ) THEN 1 ELSE 0 END,
        updated_at = now(),
        last_write = EXCLUDED.last_write
      WHERE rental_contracts.owner_id = ${owner}
        AND rental_contracts.edit_version = ${base}
      RETURNING id, draft, edit_version, revision
    ), archived AS (
      INSERT INTO rental_contract_revisions (contract_id, revision, snapshot)
      SELECT id, revision, draft FROM updated WHERE ${archive} AND revision > 0
      ON CONFLICT (contract_id, revision) DO NOTHING
    )
    SELECT edit_version FROM updated
  `;
  if (saved) return saved.edit_version as number;
  // The previous response may have been lost after the write committed.
  const [retry] = await sql`
    SELECT edit_version FROM rental_contracts
    WHERE id = ${id} AND owner_id = ${owner} AND last_write = ${operation}
  `;
  return retry?.edit_version as number | undefined;
}
