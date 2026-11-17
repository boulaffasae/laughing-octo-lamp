import { words } from "@/lib/contract/agreement";
import type { Locale } from "@/i18n/locales";

export function LibraryCardsSkeleton({ locale }: { locale: Locale }) {
  const t = words(locale);
  return (
    <div role="status">
      <span className="sr-only">{t("Chargement…", "جارٍ التحميل…")}</span>
      <div className="library-grid" aria-hidden>
        {[1, 2, 3].map((id) => (
          <div key={id} className="library-card-skeleton" />
        ))}
      </div>
    </div>
  );
}

export function LibraryPageSkeleton({
  locale,
  kind,
}: {
  locale: Locale;
  kind: "contracts" | "documents";
}) {
  const t = words(locale);
  return (
    <main className="library-page">
      <section className="library-banner">
        <div className="shell library-banner-inner">
          <h1>
            {kind === "contracts"
              ? t("Mes modèles", "قوالبي")
              : t("Mes contrats", "عقودي")}
          </h1>
        </div>
      </section>
      <section className="shell library-content">
        <LibraryCardsSkeleton locale={locale} />
      </section>
    </main>
  );
}

export function PreviewSkeleton({
  label,
  editor = false,
}: {
  label: string;
  editor?: boolean;
}) {
  return (
    <div className="library-preview-skeleton" role="status">
      <span className="sr-only">{label}</span>
      <div aria-hidden className="library-skeleton-layout">
        {editor && <div className="library-skeleton-toolbar" />}
        <div className="library-skeleton-paper">
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
