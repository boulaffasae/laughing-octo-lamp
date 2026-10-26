/** Vercel supplies a hostname, while an explicit override includes its scheme. */
export function resolveSiteUrl(
  explicitUrl: string | undefined,
  vercelProductionHost: string | undefined,
): string | undefined {
  const explicit = explicitUrl?.trim();
  const host = vercelProductionHost?.trim();
  if (!explicit && !host) return undefined;
  return new URL(explicit || `https://${host}`).origin;
}

// Always use the production domain, including when building preview deployments.
export const siteUrl = resolveSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
);
