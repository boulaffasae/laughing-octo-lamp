# Code organization

Organize by feature and keep the Next.js route files as entry points. Prefer a few clearly named functions over classes, registries, or generic service layers.

## Where code belongs

- `app/[locale]/`: route parameters, redirects, metadata entry points, and page composition.
- `app/api/ocr/route.ts`: HTTP orchestration for OCR.
- `app/components/marketing/`: home page and FAQ.
- `app/components/contract/`: document workflow, scan dialog, rental form, and PDF rendering.
- `app/components/news/`: article views, Markdown, and widgets.
- `app/components/layout/`: shared navigation, footer, and page shell.
- `app/components/install/`: installation prompt and its browser lifecycle.
- `app/components/shared/`: UI used by more than one feature.
- `lib/contract/`: document models and browser OCR requests.
- `lib/news/`: article loading, copy, text formatting, metadata, and widget parsing.
- `lib/ocr/`: server upload validation, provider integration, and HTTP responses.
- `i18n/`: supported locales and localized routing. Translation dictionaries stay in `app/translations/`.

Keep stable URLs and content paths independent of internal module names. The existing `actus` route and content folder are intentional.

## Names and responsibilities

Use kebab-case file names, PascalCase component names, camelCase functions, and uppercase module constants. Use domain names such as `documentIndex`, `previewUrl`, and `downloadContractPdf`. Boolean names should explain their meaning: `hasConsent`, `isDownloading`.

Keep each state declaration separate. Use `import type` for type-only dependencies; ESLint enforces both conventions. Use `@/` imports between application features and relative imports within a feature. Explicit `.ts` imports in library modules let the same code run in Node tests without a separate transpiler.

A route composes steps. A component renders a view. A hook manages interactive state and cleanup. A provider module handles its external protocol. Extract a helper when it gives a meaningful operation a name; avoid splitting every expression into a function.

## Server and client boundaries

Render static page content on the server. Add `"use client"` only where browser APIs, event handlers, or hooks are needed. Server components use `getCopy()`; client components use `useCopy()`. Pass server-rendered content into interactive layout components as children when needed.

Provider credentials and filesystem access belong in server modules. The browser calls `/api/ocr`; it never imports a provider implementation. Datalab is the only active provider. LlamaCloud remains isolated for possible future reuse.

## Error handling

Validate unknown data at boundaries: uploads, OCR JSON, and article widgets. Display expected errors near the affected UI. Keep support request IDs in scan errors and return stable HTTP error codes. Unexpected provider text, documents, and extracted fields must not enter logs or monitoring events.

Preserve useful fallbacks: invalid widgets render their source; charts retain an accessible table if loading fails. Cancel requests, timers, listeners, and object URLs when their owner is finished. Do not swallow failures without an intentional fallback or a safe error report.

## Verification

Run `npm run check` for lint, TypeScript, and tests. Format changed files with Prettier. Test boundary behavior, failures, and user workflows; avoid tests that merely repeat implementation details. Use synthetic documents for live provider checks.

Run `npm run build` before delivery. If the environment blocks Turbopack worker creation, `npm run build -- --webpack` can verify a production build without changing project configuration.

For local production checks, use `npm run start -- --hostname localhost`. Matching the named loopback host used by locale rewrites avoids the production redirect loop observed with a numeric loopback bind.
