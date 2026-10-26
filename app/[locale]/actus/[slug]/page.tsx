import { notFound } from "next/navigation";
import Link from "next/link";
import {
  absolute,
  articleDate,
  copy,
  getArticles,
  headingId,
  isLocale,
  locales,
  seo,
} from "@/lib/actus";
import { ArticleMarkdown } from "@/app/components/actus/markdown";
import { NewsShell } from "@/app/components/actus/shell";
type Props = { params: Promise<{ locale: string; slug: string }> };
export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getArticles(locale).map((a) => ({ locale, slug: a.slug })),
  );
}
async function resolve(params: Props["params"]) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const article = getArticles(locale).find((a) => a.slug === slug);
  if (!article) notFound();
  return { locale, article };
}
export async function generateMetadata({ params }: Props) {
  const { locale, article: a } = await resolve(params);
  const metadata = seo(locale, `/actus/${a.slug}`, a.title, a.description);
  return {
    ...metadata,
    authors: [{ name: a.author }],
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: a.date,
      authors: [a.author],
    },
  };
}
export default async function Page({ params }: Props) {
  const { locale, article: a } = await resolve(params),
    t = copy[locale];
  const headings = Array.from(a.body.matchAll(/^## (.+)$/gm), (m) => m[1]);
  const json = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: a.title,
      description: a.description,
      datePublished: a.date,
      author: { "@type": "Organization", name: a.author },
      publisher: { "@type": "Organization", name: "Louma" },
      inLanguage: locale,
      mainEntityOfPage: absolute(`/${locale}/actus/${a.slug}`),
    },
    ...(absolute(`/${locale}/actus`)
      ? [
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: t.home,
                item: absolute(`/${locale}`),
              },
              {
                "@type": "ListItem",
                position: 2,
                name: t.nav,
                item: absolute(`/${locale}/actus`),
              },
              {
                "@type": "ListItem",
                position: 3,
                name: a.title,
                item: absolute(`/${locale}/actus/${a.slug}`),
              },
            ],
          },
        ]
      : []),
  ];
  return (
    <NewsShell locale={locale} route={`/actus/${a.slug}`}>
      <main className="article-main">
        <nav className="news-breadcrumb" aria-label={t.home}>
          <Link href={`/${locale}`}>{t.home}</Link> /{" "}
          <Link href={`/${locale}/actus`}>{t.nav}</Link>
        </nav>
        <article>
          <div className="article-heading">
            <span className="eyebrow">{a.category}</span>
            <h1>{a.title}</h1>
            <p>{a.description}</p>
            <div className="news-meta">
              {t.by} {a.author} ·{" "}
              <time dateTime={a.date}>{articleDate(a.date, locale)}</time>
            </div>
          </div>
          <div className="article-layout">
            <aside className="article-toc">
              <strong>{t.contents}</strong>
              {headings.map((h) => (
                <a key={h} href={`#${headingId(h)}`}>
                  {h}
                </a>
              ))}
            </aside>
            <div className="article-prose">
              <ArticleMarkdown body={a.body} />
              <Link className="button" href={`/${locale}/new`}>
                {t.cta} ↗
              </Link>
            </div>
          </div>
        </article>
        <section className="article-related">
          <h2>{t.related}</h2>
          {getArticles(locale)
            .filter((b) => b.slug !== a.slug)
            .slice(0, 3)
            .map((b) => (
              <Link key={b.slug} href={`/${locale}/actus/${b.slug}`}>
                {b.title} ↗
              </Link>
            ))}
        </section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(json).replace(/</g, "\\u003c"),
          }}
        />
      </main>
    </NewsShell>
  );
}
