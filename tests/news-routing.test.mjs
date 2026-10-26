import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
// Next.js resolves extensionless package entry points in its bundler; mirror that in Node tests.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/server")
      return nextResolve("next/server.js", context);
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (
        error.code === "ERR_MODULE_NOT_FOUND" &&
        specifier.startsWith(".") &&
        !/\.[a-z]+$/i.test(specifier)
      )
        return nextResolve(`${specifier}.ts`, context);
      throw error;
    }
  },
});
const { default: middleware } = await import("../proxy.ts");
import { NextRequest } from "next/server.js";
import { newsPaths, newsUrl, newsRedirects } from "../lib/news-routing.ts";

test("localized listing, article and pagination URLs rewrite to shared pages", () => {
  for (const locale of Object.keys(newsPaths)) {
    for (const [suffix, internal] of [
      ["", "/actus"],
      ["/article-test", "/actus/article-test"],
      ["/opengraph-image", "/actus/opengraph-image"],
      ["/page/2", "/actus/page/2"],
      ["/دليل-الكراء", "/actus/دليل-الكراء"],
    ]) {
      const response = middleware(
        new NextRequest(
          new URL(newsUrl(locale, suffix), "https://example.com"),
        ),
      );
      const rewritten = response.headers.get("x-middleware-rewrite");
      assert.ok(rewritten, `${locale}${suffix}: expected rewrite`);
      assert.equal(
        decodeURIComponent(new URL(rewritten).pathname),
        `/${locale}${internal}`,
      );
      assert.equal(response.headers.get("location"), null);
      if (suffix)
        assert.equal(
          response.headers.get("link"),
          null,
          "avoid incorrect automatic article hreflang",
        );
    }
  }
});

test("old listing, page-one and paginated URLs have permanent localized redirects", () => {
  const redirects = newsRedirects();
  for (const locale of Object.keys(newsPaths)) {
    const pageOne = redirects.find(
      (r) => r.source === `/${locale}/actus/page/1`,
    );
    assert.equal(pageOne.destination, newsUrl(locale));
    const pagination = redirects.find(
      (r) => r.source === `/${locale}/actus/page/:page`,
    );
    assert.equal(pagination.destination, newsUrl(locale, "/page/:page"));
    const fallback = redirects.find(
      (r) => r.source === `/${locale}/actus/:path*`,
    );
    assert.equal(fallback.destination, `${newsUrl(locale)}/:path*`);
  }
  assert.ok(redirects.every((r) => r.permanent));
});

test("home retains automatic language alternatives", () => {
  const response = middleware(new NextRequest("https://example.com/fr"));
  assert.ok(response.headers.get("link")?.includes('hreflang="en"'));
});
