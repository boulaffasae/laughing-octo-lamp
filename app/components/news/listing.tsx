import { newsUrl } from "@/lib/news-routing";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatArticleDate } from "@/lib/news/text";
import { newsCopy } from "@/lib/news/copy";
import { getArticles, ARTICLES_PER_PAGE } from "@/lib/news/articles";
import { type Locale } from "@/i18n/locales";
import { NewsShell } from "./shell";
import { BookOpen, ArrowUpRight } from "lucide-react";
export function NewsListing({
  locale,
  page = 1,
}: {
  locale: Locale;
  page?: number;
}) {
  const articles = getArticles(locale);
  const pageCount = Math.max(1, Math.ceil(articles.length / ARTICLES_PER_PAGE));
  const copy = newsCopy[locale];
  if (!Number.isInteger(page) || page < 1 || page > pageCount) notFound();
  return (
    <NewsShell
      locale={locale}
      route={page === 1 ? "/actus" : `/actus/page/${page}`}
    >
      <main className="news-main">
        <div className="news-intro">
          <span className="eyebrow">LOUMA / {copy.nav}</span>
          <h1>{copy.title}</h1>
          <p>{copy.intro}</p>
        </div>
        <div className="news-grid">
          {articles
            .slice((page - 1) * ARTICLES_PER_PAGE, page * ARTICLES_PER_PAGE)
            .map((article, index) => (
              <article className="news-card" key={article.slug}>
                <Link
                  href={newsUrl(locale, `/${article.slug}`)}
                  className={`news-cover cover-${article.id}`}
                  aria-label={article.title}
                >
                  <BookOpen size={56} strokeWidth={1} />
                  <span>
                    {String(
                      (page - 1) * ARTICLES_PER_PAGE + index + 1,
                    ).padStart(2, "0")}{" "}
                    / LOUMA
                  </span>
                  <ArrowUpRight size={24} />
                </Link>
                <div className="news-card-body">
                  <span className="news-category">{article.category}</span>
                  <h2>
                    <Link href={newsUrl(locale, `/${article.slug}`)}>
                      {article.title}
                    </Link>
                  </h2>
                  <p>{article.description}</p>
                  <div className="news-meta">
                    {article.author} ·{" "}
                    <time dateTime={article.date}>
                      {formatArticleDate(article.date, locale)}
                    </time>
                  </div>
                  <Link
                    className="text-link"
                    href={newsUrl(locale, `/${article.slug}`)}
                  >
                    {copy.read} ↗
                  </Link>
                </div>
              </article>
            ))}
        </div>
        <nav className="news-pagination" aria-label="Pagination">
          {Array.from({ length: pageCount }, (_, index) => (
            <Link
              key={index}
              href={newsUrl(locale, index ? `/page/${index + 1}` : "")}
              aria-label={`${copy.page} ${index + 1}`}
              aria-current={page === index + 1 ? "page" : undefined}
            >
              {index + 1}
            </Link>
          ))}
        </nav>
      </main>
    </NewsShell>
  );
}
