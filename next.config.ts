import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";
import {
  contractTemplatePath,
  contractTemplates,
} from "./lib/contract/templates";

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
    const previousModelNames: Record<string, string> = {
      classic: "classique",
      blue: "carnet",
      banded: "bandeau",
      tabular: "tableau",
    };

    return [
      ...contractTemplates
        .filter(({ id }) => id in previousModelNames)
        .map((template) => ({
          source: `/:locale(fr|ar|en)?/modeles/contrat-location-voiture-${previousModelNames[template.id]}`,
          destination: contractTemplatePath(template),
          permanent: true,
        })),
      {
        source: "/:locale(fr|ar|en)?/:legacy(dashboard|espace)",
        destination: "/contracts",
        permanent: true,
      },
      {
        source: "/:locale(fr|ar|en)?/mes-fichiers",
        destination: "/documents",
        permanent: true,
      },
      {
        source: "/:locale(fr|ar|en)",
        destination: "/",
        permanent: true,
      },
      {
        source: "/:locale(fr|ar|en)/:path+",
        destination: "/:path+",
        permanent: true,
      },
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

export default withSentryConfig(nextConfig, {
  silent: true,
  // Enable uploads only when CI has a Sentry auth token and project settings.
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});
