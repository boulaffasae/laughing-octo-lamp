import { words } from "@/lib/contract/agreement";
import type { Locale } from "@/i18n/locales";

export function LibraryCardsSkeleton({ locale }: { locale: Locale }) {
  const t = words(locale);
  return (
    <div role="status">
      <span className="sr-only">{t("Chargement…", "جارٍ التحميل…")}</span>
      <ul className="library-grid" aria-hidden>
        {[1, 2, 3].map((id) => (
          <li key={id} className="library-card">
            <div className="library-item library-item-skeleton">
              <div className="library-poster">
                <span className="library-skeleton-sheet" />
              </div>
              <div className="library-item-copy">
                <span className="library-skeleton-date" />
              </div>
            </div>
            <div className="library-card-actions library-actions-skeleton">
              <span />
              <span />
              <span />
            </div>
          </li>
        ))}
      </ul>
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
          <div className="library-banner-actions" aria-hidden>
            <span className="library-skeleton-control" />
            {kind === "documents" && (
              <span className="library-skeleton-control" />
            )}
          </div>
        </div>
      </section>
      <section className="shell library-content">
        <div className="library-heading" aria-hidden>
          <span className="library-skeleton-control" />
        </div>
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
