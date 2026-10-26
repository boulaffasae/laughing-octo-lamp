# Louma

Mobile-first Moroccan vehicle rental agreement builder, using Next.js 16, React 19, Mistral OCR and React-PDF.

## Run

Install with `pnpm install`, then run `pnpm dev` and open http://localhost:3000.

- `/`: French, English and Arabic marketing site.
- `/new`: three-document checklist, mobile camera or file upload, animated extraction, editable review and PDF download.

Copy `.env.example` to `.env.local` and set `MISTRAL_API_KEY` to enable real OCR. The key stays on the server. Without a key, use the explicitly labelled sample mode. Real uploads are transmitted to Mistral after consent. Louma processes uploads in memory and does not persist them; review your hosting and Mistral retention settings before production use.

The generated contract template is French in every interface language. Agency, rental dates, daily rate and deposit must be completed before download. Sample data produces a watermarked example. The contract is a starter template: agency terms, insurance, vehicle condition annex and signatures must be completed and reviewed before operational use. OCR transcribes information; it does not verify identity or document authenticity.

`pnpm build` creates a production build. `pnpm exec tsc --noEmit` checks types.

## Translations

UI translations live in `app/translations/fr.json`, `en.json`, and `ary.json` (Moroccan Darija in Arabic script). Keep the same keys in each dictionary; `app/translations/index.ts` checks their TypeScript shape. Darija uses right-to-left layout and the `ary` language tag. Existing saved `AR` preferences resolve to Darija. The generated contract template remains in French.

## Security

The OCR credential stays in server environment variables; never give it a `NEXT_PUBLIC_` prefix, put it in `public/`, or commit a real `.env` file. Client errors deliberately omit provider and configuration details. Provider branding is removed from marketing; consent and data processing information still identify the external processor.

There is no custom URL blacklist or repeated URL decoding. Production hosting must serve only the Next.js application and its public assets, never the repository directory; secrets must never be placed in `public/`.

OCR rejects cross-site browser requests, malformed multipart uploads and oversized bodies, and disables response caching. The body byte limit is enforced while reading, even when `Content-Length` is missing. These checks do not authenticate clients or stop direct scripts. Browser origin checks follow the defense-in-depth approach documented in the [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html). Security response headers are configured through Next.js `headers()`.

Before public production use, configure shared rate limits and upload size/time limits at the hosting gateway, plus authentication or bot protection for `/api/ocr` and a spending cap with the provider. In-memory limits alone would not cover multiple instances. If a credential has previously leaked, revoke and replace it; hiding its name does not invalidate a stolen key.
