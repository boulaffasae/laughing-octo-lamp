import { clerkMiddleware } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);
const route = (request: NextRequest) => {
  const path = request.nextUrl.pathname;
  if (path.startsWith("/api/") || path.startsWith("/__clerk/"))
    return NextResponse.next();
  return intl(request);
};

function privateLocale(request: NextRequest) {
  return /^\/(fr|ar)\/(?:dashboard|contracts\/[^/]+)\/?$/.exec(
    request.nextUrl.pathname,
  )?.[1];
}

export default process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
process.env.CLERK_SECRET_KEY
  ? clerkMiddleware(async (auth, request) => {
      const locale = privateLocale(request);
      if (locale && !(await auth()).userId)
        return NextResponse.redirect(new URL(`/${locale}`, request.url));
      return route(request);
    })
  : (request: NextRequest) => {
      const locale = privateLocale(request);
      return locale
        ? NextResponse.redirect(new URL(`/${locale}`, request.url))
        : route(request);
    };

export const config = {
  matcher: [
    "/((?!_next|_vercel|.*\\..*).*)",
    "/api/documents/:path*",
    "/api/contracts/:path*",
    "/__clerk/:path*",
  ],
};
