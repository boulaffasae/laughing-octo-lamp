import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);
export default function proxy(request: NextRequest) {
  const response = intlMiddleware(request);
  const rewritten = response.headers.get("x-middleware-rewrite");
  // Metadata resolves the translated article slug; middleware only knows the current slug.
  if (rewritten && /^\/(fr|en|ar)\/actus\//.test(new URL(rewritten).pathname)) {
    response.headers.delete("link");
  }
  return response;
}

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
