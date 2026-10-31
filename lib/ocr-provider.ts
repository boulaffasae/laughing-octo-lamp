export type OcrProvider = "llamacloud" | "datalab";

function valid(value: string | null | undefined): value is OcrProvider {
  return value === "llamacloud" || value === "datalab";
}

export function selectOcrProvider(
  request: Request,
  split = false,
  random = Math.random,
) {
  const override = new URL(request.url).searchParams.get("ocr");
  if (valid(override)) return { provider: override, source: "query" } as const;
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("ocr_provider="))
    ?.slice("ocr_provider=".length);
  if (valid(cookie)) return { provider: cookie, source: "cookie" } as const;
  return {
    provider: split && random() < 0.5 ? "datalab" : "llamacloud",
    source: split ? "random" : "default",
  } as const;
}

export function providerCookie(provider: OcrProvider, url: string) {
  return `ocr_provider=${provider}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax${new URL(url).protocol === "https:" ? "; Secure" : ""}`;
}
