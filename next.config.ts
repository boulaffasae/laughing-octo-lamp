import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/:legacy(espace|mes-fichiers)",
        destination: "/dashboard",
        permanent: true,
      },
      {
        source: "/:locale(fr|ar)/:legacy(espace|mes-fichiers)",
        destination: "/:locale/dashboard",
        permanent: true,
      },
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
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  silent: true,
  // Enable uploads only when CI has a Sentry auth token and project settings.
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});
