import Link from "next/link";
import { newsUrl } from "@/lib/news-routing";
import {
  getArticleLanguageRoutes,
  getArticles,
  type Article,
} from "@/lib/news/articles";
import { formatArticleDate, createHeadingId } from "@/lib/news/text";
import { newsCopy } from "@/lib/news/copy";
import { createArticleStructuredData } from "@/lib/news/metadata";
import { ArticleMarkdown } from "./markdown";
import { NewsShell } from "./shell";

export function ArticlePage({ article }: { article: Article }) {
  const { locale } = article;
  const copy = newsCopy[locale];
  const headings = Array.from(
    article.body.matchAll(/^## (.+)$/gm),
    (match) => match[1],
  );
  return (
    <NewsShell
      locale={locale}
      languageRoutes={getArticleLanguageRoutes(article.id)}
    >
      <main className="article-main">
        <nav className="news-breadcrumb" aria-label={copy.home}>
          <Link href={`/${locale}`}>{copy.home}</Link> /{" "}
          <Link href={newsUrl(locale)}>{copy.nav}</Link>
        </nav>
        <article>
          <div className="article-heading">
            <span className="eyebrow">{article.category}</span>
            <h1>{article.title}</h1>
            <p>{article.description}</p>
            <div className="news-meta">
              {copy.by} {article.author} ·{" "}
              <time dateTime={article.date}>
                {formatArticleDate(article.date, locale)}
              </time>
            </div>
          </div>
          <div className="article-layout">
            <aside className="article-toc">
              <strong>{copy.contents}</strong>
              {headings.map((heading) => (
                <a key={heading} href={`#${createHeadingId(heading)}`}>
                  {heading}
                </a>
              ))}
            </aside>
            <div className="article-prose">
              <ArticleMarkdown body={article.body} locale={locale} />
              <Link className="button" href={`/${locale}/new`}>
                {copy.cta} ↗
              </Link>
            </div>
          </div>
        </article>
        <section className="article-related">
          <h2>{copy.related}</h2>
          {getArticles(locale)
            .filter((relatedArticle) => relatedArticle.slug !== article.slug)
            .slice(0, 3)
            .map((relatedArticle) => (
              <Link
                key={relatedArticle.slug}
                href={newsUrl(locale, `/${relatedArticle.slug}`)}
              >
                {relatedArticle.title} ↗
              </Link>
            ))}
        </section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              createArticleStructuredData(article),
            ).replace(/</g, "\\u003c"),
          }}
        />
      </main>
    </NewsShell>
  );
}
