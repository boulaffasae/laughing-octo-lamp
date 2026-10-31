import { parseArticleWidget } from "@/lib/news/widgets";
import ArticleChart from "./chart";

export function ArticleWidget({
  type,
  source,
}: {
  type: string;
  source: string;
}) {
  const widget = parseArticleWidget(type, source);
  if (!widget) return <pre>{source}</pre>;

  switch (widget.type) {
    case "warning":
      return (
        <aside className="article-warning" role="note">
          <strong>⊘ {widget.title}</strong>
          <p>{widget.text}</p>
        </aside>
      );
    case "agencies":
      return (
        <aside className="article-widget">
          <h3>{widget.title}</h3>
          {widget.items.map((agency) => (
            <p key={agency.phone}>
              <strong>{agency.name}</strong> · {agency.city}{" "}
              <a href={`tel:${agency.phone.replace(/[^+\d]/g, "")}`}>
                {agency.phone}
              </a>
            </p>
          ))}
        </aside>
      );
    case "cars":
      return (
        <div className="article-cars">
          {widget.items.map((car) => (
            <figure className="article-widget" key={car.model}>
              {car.image && (
                // Editorial image sizes and external hosts are supplied by the article.
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
          ))}
        </div>
      );
    case "tiktok":
      return (
        <figure className="article-widget">
          <iframe
            loading="lazy"
            title={widget.title}
            src={`https://www.tiktok.com/player/v1/${widget.id}`}
            allow="fullscreen"
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
          <figcaption>{widget.title}</figcaption>
        </figure>
      );
    case "chart":
      return (
        <ArticleChart
          title={widget.title}
          labels={widget.labels}
          values={widget.values}
          source={widget.source}
        />
      );
  }
}
