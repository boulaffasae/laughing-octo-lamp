import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

function isPrivatePage(request: NextRequest) {
  return /^\/(?:documents|contracts(?:\/[^/]+)?)\/?$/.test(
    request.nextUrl.pathname,
  );
}

export default process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
process.env.CLERK_SECRET_KEY
  ? clerkMiddleware(async (auth, request) => {
      if (isPrivatePage(request) && !(await auth()).userId)
        return NextResponse.redirect(new URL("/", request.url));
      return NextResponse.next();
    })
  : (request: NextRequest) =>
      isPrivatePage(request)
        ? NextResponse.redirect(new URL("/", request.url))
        : NextResponse.next();

export const config = {
  matcher: [
    "/((?!_next|_vercel|.*\\..*).*)",
    "/api/documents/:path*",
    "/api/contracts/:path*",
    "/__clerk/:path*",
  ],
};
