import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

export const privateHeaders = { "Cache-Control": "private, no-store" };
export const authConfigured = () =>
  Boolean(
    process.env.CLERK_SECRET_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );
export const storageConfigured = () =>
  Boolean(process.env.DATABASE_URL && process.env.BLOB_READ_WRITE_TOKEN);

export async function ownerId() {
  return authConfigured() ? (await auth()).userId : null;
}

export function repository() {
  return neon(process.env.DATABASE_URL!);
}

export function failure(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: privateHeaders });
}

export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "0001-01-01") return false;
  const date = new Date(value);
  return (
    !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
  );
}
