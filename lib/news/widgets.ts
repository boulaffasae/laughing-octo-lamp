type Agency = { name: string; phone: string; city: string };
type Car = {
  brand: string;
  model: string;
  transmission: string;
  image?: string;
  alt?: string;
};
export type ArticleChartData = {
  title: string;
  labels: string[];
  values: number[];
  source: string;
};
export type ArticleWidgetData =
  | { type: "warning"; title: string; text: string }
  | { type: "agencies"; title: string; items: Agency[] }
  | { type: "cars"; items: Car[] }
  | { type: "tiktok"; id: string; title: string }
  | ({ type: "chart" } & ArticleChartData);

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function hasStrings<Key extends string>(
  value: unknown,
  keys: Key[],
): value is Record<Key, string> & Record<string, unknown> {
  return isRecord(value) && keys.every((key) => typeof value[key] === "string");
}

// Invalid editorial widgets remain readable code blocks instead of crashing a page.
export function parseArticleWidget(
  type: string,
  source: string,
): ArticleWidgetData | null {
  let data: unknown;
  try {
    data = JSON.parse(source);
  } catch {
    return null;
  }
  if (!isRecord(data)) return null;
  if (type === "warning" && hasStrings(data, ["title", "text"]))
    return { type, title: data.title, text: data.text };
  if (
    type === "agencies" &&
    typeof data.title === "string" &&
    Array.isArray(data.items) &&
    data.items.every((item) => hasStrings(item, ["name", "phone", "city"]))
  ) {
    return { type, title: data.title, items: data.items as Agency[] };
  }
  if (
    type === "cars" &&
    Array.isArray(data.items) &&
    data.items.every(
      (item) =>
        hasStrings(item, ["brand", "model", "transmission"]) &&
        (item.image === undefined || typeof item.image === "string") &&
        (item.alt === undefined || typeof item.alt === "string"),
    )
  ) {
    return { type, items: data.items as Car[] };
  }
  if (
    type === "tiktok" &&
    hasStrings(data, ["id", "title"]) &&
    /^\d{10,25}$/.test(data.id)
  )
    return { type, id: data.id, title: data.title };
  if (
    type === "chart" &&
    typeof data.title === "string" &&
    typeof data.source === "string" &&
    Array.isArray(data.labels) &&
    data.labels.every((label) => typeof label === "string") &&
    Array.isArray(data.values) &&
    data.values.length === data.labels.length &&
    data.values.every(
      (value) => typeof value === "number" && Number.isFinite(value),
    )
  ) {
    return {
      type,
      title: data.title,
      source: data.source,
      labels: data.labels as string[],
      values: data.values as number[],
    };
  }
  return null;
}
