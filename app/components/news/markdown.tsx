import { newsUrl } from "@/lib/news-routing";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createHeadingId } from "@/lib/news/text";
import { getArticles } from "@/lib/news/articles";
import { type Locale } from "@/i18n/locales";
import { ArticleWidget } from "./article-widget";

export function ArticleMarkdown({
  body,
  locale,
}: {
  body: string;
  locale: Locale;
}) {
  const articleLinks = new Map(
    getArticles(locale).map((article) => [
      article.id,
      newsUrl(locale, `/${article.slug}`),
    ]),
  );
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: ({ children }) => (
          <h2 id={createHeadingId(String(children))}>{children}</h2>
        ),
        table: ({ children }) => (
          <div className="article-table">
            <table>{children}</table>
          </div>
        ),
        a: ({ href, children }) => {
          const articleUrl = href ? articleLinks.get(href) : undefined;
          return (
            <a
              href={articleUrl ?? href}
              rel={
                href?.startsWith("https://") ? "noopener noreferrer" : undefined
              }
            >
              {children}
            </a>
          );
        },
        img: ({ src, alt }) =>
          typeof src === "string" ? (
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={alt ?? ""} loading="lazy" />
            </figure>
          ) : null,
        pre: ({ children }) => <>{children}</>,
        code: ({ className, children }) => {
          const type = className?.replace("language-", "");
          if (
            type &&
            ["warning", "agencies", "tiktok", "chart", "cars"].includes(type)
          )
            return <ArticleWidget type={type} source={String(children)} />;
          return <code className={className}>{children}</code>;
        },
      }}
    >
      {body}
    </Markdown>
  );
}
