import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["pdfjs-dist", "@napi-rs/canvas"],
  outputFileTracingIncludes: {
    "/api/documents{,/**}": [
      "./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
      "./node_modules/pdfjs-dist/{cmaps,iccs,standard_fonts,wasm}/**/*",
    ],
  },
  async redirects() {
    return [
      {
        source: "/:legacy(dashboard|espace)",
        destination: "/contracts",
        permanent: true,
      },
      {
        source: "/:locale(fr|ar)/:legacy(dashboard|espace)",
        destination: "/fr/contracts",
        permanent: true,
      },
      { source: "/mes-fichiers", destination: "/documents", permanent: true },
      {
        source: "/:locale(fr|ar)/mes-fichiers",
        destination: "/fr/documents",
        permanent: true,
      },
      { source: "/ar/:path*", destination: "/fr/:path*", permanent: true },
      { source: "/en", destination: "/fr", permanent: true },
      { source: "/en/new", destination: "/fr#contrat", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
          },
        ],
      },
    ];
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
};

export default withSentryConfig(withNextIntl(nextConfig), {
  silent: true,
  // Enable uploads only when CI has a Sentry auth token and project settings.
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});
