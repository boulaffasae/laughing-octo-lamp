# Louma

Mobile-first Moroccan vehicle rental agreement builder, using Next.js 16, React 19, Mistral OCR and React-PDF.

## Run

Install with `pnpm install`, then run `pnpm dev` and open http://localhost:3000.

- `/fr`, `/en`, `/ar`: French, English and Arabic marketing site.
- `/fr/new`, `/en/new`, `/ar/new`: three-document checklist, mobile camera or file upload, animated extraction, editable review and PDF download.

Copy `.env.example` to `.env.local` and set `MISTRAL_API_KEY` to enable real OCR. The key stays on the server. Without a key, use the explicitly labelled sample mode. Real uploads are transmitted to Mistral after consent. Louma processes uploads in memory and does not persist them; review your hosting and Mistral retention settings before production use.

The generated contract template is French in every interface language. Agency, rental dates, daily rate and deposit must be completed before download. Sample data produces a watermarked example. The contract is a starter template: agency terms, insurance, vehicle condition annex and signatures must be completed and reviewed before operational use. OCR transcribes information; it does not verify identity or document authenticity.

`pnpm build` creates a production build. `pnpm exec tsc --noEmit` checks types.

## Translations

Internationalization uses `next-intl`. Routing is centralized in `i18n/routing.ts`; all pages have a locale prefix (`fr`, `en`, `ar`). `proxy.ts` redirects `/` and `/new` to the preferred locale using the locale cookie or browser language, with French as fallback. API routes and static assets are excluded.

UI dictionaries live in `app/translations/fr.json`, `en.json`, and `ar.json` (Arabic, with Moroccan phrasing). Only the current dictionary is passed to the client via `NextIntlClientProvider`. `useCopy()` preserves typed lists and form labels; keep the same keys and shapes in each dictionary. Localized links use `i18n/navigation.ts`. The language selector preserves the current page, query and fragment. The URL determines the locale; there is no localStorage language state. Arabic receives `lang="ar"` and right-to-left layout from the server. The generated contract template remains in French.

## Security

The OCR credential stays in server environment variables; never give it a `NEXT_PUBLIC_` prefix, put it in `public/`, or commit a real `.env` file. Client errors deliberately omit provider and configuration details. Provider branding is removed from marketing; consent and data processing information still identify the external processor.

There is no custom URL blacklist or repeated URL decoding. Production hosting must serve only the Next.js application and its public assets, never the repository directory; secrets must never be placed in `public/`.

OCR rejects cross-site browser requests, malformed multipart uploads and oversized bodies, and disables response caching. Files are limited to 4 MiB, with 64 KiB reserved for multipart overhead, below the [Vercel Functions 4.5 MB request limit](https://vercel.com/docs/functions/limitations#request-body-size). The byte limit is enforced while reading, even when `Content-Length` is missing. Upload reading has a 30-second deadline and is cancelled on disconnect. Binary signatures are checked with `file-type` and must match an allowed declared MIME type; signature detection is not malware scanning or proof that a document is well formed. At most two requests may upload/process documents per server instance; excess requests receive 503 with `Retry-After: 5`, and slots are released on success or failure. Mistral calls retain a 60-second timeout and are cancelled on client disconnect. These checks do not authenticate clients or stop direct scripts. Browser origin checks follow the defense-in-depth approach documented in the [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html). Security response headers are configured through Next.js `headers()`.

Bot challenges and hosting/firewall configuration are intentionally deferred. The local concurrency limit is backpressure, not rate limiting: Vercel can start additional instances and requests can continue sequentially. Shared quotas and a provider spending cap remain necessary to bound paid OCR usage. If a credential has previously leaked, revoke and replace it; hiding its name does not invalidate a stolen key.

## Security checks

Use Node.js 22.18+ or 24+ and run `npm test` for upload boundary, deadline, disconnect, concurrency and signature-validation tests. Tests make no external OCR requests.

## TikTok demo video (Remotion)

`npm run video:studio` opens the editable `LoumaTikTok` composition. `npm run video:render` exports `output/video/louma-tiktok.mp4`; `npm run video:still` exports the cover image. Remotion downloads Chrome Headless Shell on first use. To use an installed Chrome instead, append `-- --browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"` to either render script.

The French promotional demo runs for 27 seconds at 30 fps, 1080 × 1920 (9:16), with H.264 video and an original instrumental soundtrack. Five scenes cover the paperwork hook, three-document upload, extraction and review, PDF download, and a call to try Louma. It uses animated product illustrations and fictional data, with no external media or OCR requests. Edit copy, timing and artwork in `remotion/louma-demo.tsx`; composition settings live in `remotion/index.tsx`.

Regenerate the original audio with `python3 scripts/create-video-audio.py`. The soundtrack has no third-party samples. Add your actual destination link to the TikTok post/profile when publishing; the video does not invent a production URL.

## Actualités / editorial workflow

The journal lives at `/{fr,en,ar}/actus`, with three articles per page and crawlable `/actus/page/2` pagination. The home menu links to it; articles do not appear on the home page. Articles live in `content/actus/{locale}/{slug}.md`. Use the same slug in all three languages so language switching and hreflang point to matching translations. All published files are shown; add all three translations together.

Each file begins with `---`, a YAML metadata object (JSON flow syntax is also accepted), and `---`, followed by Markdown. Required fields: `title`, `description`, `category`, `author`, `date` (ISO date). Use `##` for sections (automatic table of contents), `###` for subsections, GFM tables and `- [ ]` for checklists. Local article links can use the sibling slug. HTML and executable MDX are not enabled. Dates and author names must reflect real editorial publication.

Supported fenced blocks (language after the opening triple backticks):

- `warning`: `{"title":"Attention","text":"Do not sign a blank cheque."}`
- `agencies`: `{"title":"Contacts vérifiés","items":[{"name":"Agency name","city":"City","phone":"Verified phone"}]}`. Publish only verified numbers with permission where needed.
- `tiktok`: `{"id":"NUMERIC_VIDEO_ID","title":"Descriptive video title"}`. Lazy iframe; third-party content loads only on articles using this block.
- `chart`: `{"title":"Chart title","labels":["A","B"],"values":[12,8],"source":"Source, date and methodology"}`. Chart.js loads only for charts; an HTML data table remains available. Do not present sample data as rental or market statistics.
- `cars`: `{"items":[{"brand":"Opel","model":"Corsa","transmission":"Manuelle","image":"/images/licensed-car-image.jpg","alt":"Descriptive alternative text"}]}`. Images and logos must be supplied with publication rights; standard Markdown images are also supported.

On Vercel, `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL` automatically supplies the production domain (the application adds `https://`), including in preview deployments. No manually managed URL variable is needed. Optionally set `NEXT_PUBLIC_SITE_URL` to override it or configure another hosting provider. The shared origin enables absolute canonicals, language alternates, sitemap entries, social image URLs and the sitemap reference in robots.txt. Without either variable, no production domain is invented. Metadata includes article author/date, Open Graph, Twitter cards, a shared social preview, BlogPosting JSON-LD and breadcrumbs (when the origin is configured).

The initial prices are editorial budget examples, not live agency quotes. Two years of driving experience is described as a condition to verify, not a universal law. Deposit and agreement articles link to Moroccan rental companies’ published terms; review facts and sources before updating legal or financial claims.

### Vidéo caution sans chèque / Louma Partner

La composition `LoumaSansCheque` propose une vidéo française de 42 secondes, 1080 × 1920, avec animation et musique originale. Exporter avec `npm run video:trust:render`, ou la couverture avec `npm run video:trust:still`. Le script, la légende, la source juridique et le positionnement proposé du futur programme partenaire sont documentés dans [remotion/louma-sans-cheque.md](remotion/louma-sans-cheque.md). Le programme y est présenté comme en préparation, sans agence ni certification existante inventée.
