import { newsUrl } from "@/lib/news-routing";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { headingId, getArticles, type Locale } from "@/lib/actus";
import ArticleChart from "./chart";
// Fenced JSON widgets keep articles plain Markdown; no executable MDX or raw HTML.
function Widget({ type, text }: { type: string; text: string }) {
  const data = JSON.parse(text);
  if (type === "warning")
    return (
      <aside className="article-warning" role="note">
        <strong>⊘ {data.title}</strong>
        <p>{data.text}</p>
      </aside>
    );
  if (type === "agencies")
    return (
      <aside className="article-widget">
        <h3>{data.title}</h3>
        {data.items.map((a: { name: string; phone: string; city: string }) => (
          <p key={a.phone}>
            <strong>{a.name}</strong> · {a.city}{" "}
            <a href={`tel:${a.phone.replace(/[^+\d]/g, "")}`}>{a.phone}</a>
          </p>
        ))}
      </aside>
    );
  if (type === "cars")
    return (
      <div className="article-cars">
        {data.items.map(
          (car: {
            brand: string;
            model: string;
            transmission: string;
            image?: string;
            alt?: string;
          }) => (
            <figure className="article-widget" key={car.model}>
              {car.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={car.image}
                  alt={car.alt || `${car.brand} ${car.model}`}
                  loading="lazy"
                />
              )}
              <figcaption>
                {car.brand} {car.model} · {car.transmission}
              </figcaption>
            </figure>
          ),
        )}
      </div>
    );
  if (type === "tiktok" && /^\d{10,25}$/.test(data.id))
    return (
      <figure className="article-widget">
        <iframe
          loading="lazy"
          title={data.title}
          src={`https://www.tiktok.com/player/v1/${data.id}`}
          allow="fullscreen"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
        <figcaption>{data.title}</figcaption>
      </figure>
    );
  if (
    type === "chart" &&
    Array.isArray(data.labels) &&
    Array.isArray(data.values) &&
    data.labels.length === data.values.length &&
    data.values.every(
      (n: unknown) => typeof n === "number" && Number.isFinite(n),
    )
  )
    return <ArticleChart {...data} />;
  return <pre>{text}</pre>;
}
export function ArticleMarkdown({
  body,
  locale,
}: {
  body: string;
  locale: Locale;
}) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: ({ children }) => (
          <h2 id={headingId(String(children))}>{children}</h2>
        ),
        table: ({ children }) => (
          <div className="article-table">
            <table>{children}</table>
          </div>
        ),
        a: ({ href, children }) => {
          const article = getArticles(locale).find((a) => a.id === href);
          return (
            <a
              href={article ? newsUrl(locale, `/${article.slug}`) : href}
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
            return <Widget type={type} text={String(children)} />;
          return <code className={className}>{children}</code>;
        },
      }}
    >
      {body}
    </Markdown>
  );
}
