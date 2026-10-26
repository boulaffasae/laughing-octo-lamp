# Louma

Mobile-first Moroccan vehicle rental agreement builder, using Next.js 16, React 19, Mistral OCR and React-PDF.

## Run

Install with `pnpm install`, then run `pnpm dev` and open http://localhost:3000.

- `/`: French, English and Arabic marketing site.
- `/new`: three-document checklist, mobile camera or file upload, animated extraction, editable review and PDF download.

Copy `.env.example` to `.env.local` and set `MISTRAL_API_KEY` to enable real OCR. The key stays on the server. Without a key, use the explicitly labelled sample mode. Real uploads are transmitted to Mistral after consent. Louma processes uploads in memory and does not persist them; review your hosting and Mistral retention settings before production use.

The generated contract template is French in every interface language. Agency, rental dates, daily rate and deposit must be completed before download. Sample data produces a watermarked example. The contract is a starter template: agency terms, insurance, vehicle condition annex and signatures must be completed and reviewed before operational use. OCR transcribes information; it does not verify identity or document authenticity.

`pnpm build` creates a production build. `pnpm exec tsc --noEmit` checks types.
