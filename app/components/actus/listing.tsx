import { newsUrl } from "@/lib/news-routing";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  articleDate,
  copy,
  getArticles,
  pageSize,
  type Locale,
} from "@/lib/actus";
import { NewsShell } from "./shell";
import { BookOpen, ArrowUpRight } from "lucide-react";
export function NewsListing({
  locale,
  page = 1,
}: {
  locale: Locale;
  page?: number;
}) {
  const articles = getArticles(locale),
    count = Math.max(1, Math.ceil(articles.length / pageSize)),
    t = copy[locale];
  if (!Number.isInteger(page) || page < 1 || page > count) notFound();
  return (
    <NewsShell
      locale={locale}
      route={page === 1 ? "/actus" : `/actus/page/${page}`}
    >
      <main className="news-main">
        <div className="news-intro">
          <span className="eyebrow">LOUMA / {t.nav}</span>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
        </div>
        <div className="news-grid">
          {articles
            .slice((page - 1) * pageSize, page * pageSize)
            .map((a, i) => (
              <article className="news-card" key={a.slug}>
                <Link
                  href={newsUrl(locale, `/${a.slug}`)}
                  className={`news-cover cover-${a.id}`}
                  aria-label={a.title}
                >
                  <BookOpen size={56} strokeWidth={1} />
                  <span>
                    {String((page - 1) * pageSize + i + 1).padStart(2, "0")} /
                    LOUMA
                  </span>
                  <ArrowUpRight size={24} />
                </Link>
                <div className="news-card-body">
                  <span className="news-category">{a.category}</span>
                  <h2>
                    <Link href={newsUrl(locale, `/${a.slug}`)}>{a.title}</Link>
                  </h2>
                  <p>{a.description}</p>
                  <div className="news-meta">
                    {a.author} ·{" "}
                    <time dateTime={a.date}>{articleDate(a.date, locale)}</time>
                  </div>
                  <Link
                    className="text-link"
                    href={newsUrl(locale, `/${a.slug}`)}
                  >
                    {t.read} ↗
                  </Link>
                </div>
              </article>
            ))}
        </div>
        <nav className="news-pagination" aria-label="Pagination">
          {Array.from({ length: count }, (_, i) => (
            <Link
              key={i}
              href={newsUrl(locale, i ? `/page/${i + 1}` : "")}
              aria-label={`${t.page} ${i + 1}`}
              aria-current={page === i + 1 ? "page" : undefined}
            >
              {i + 1}
            </Link>
          ))}
        </nav>
      </main>
    </NewsShell>
  );
}
