import test from "node:test";
import assert from "node:assert/strict";
import { resolveSiteUrl } from "../lib/site-url.ts";

test("Vercel production hostname becomes an HTTPS origin", () => {
  assert.equal(
    resolveSiteUrl(undefined, "rental.example"),
    "https://rental.example",
  );
});
test("an explicit origin can override Vercel for custom hosting", () => {
  assert.equal(
    resolveSiteUrl(" https://custom.example/ ", "rental.example"),
    "https://custom.example",
  );
  assert.equal(
    resolveSiteUrl("http://localhost:3100/", undefined),
    "http://localhost:3100",
  );
});
test("empty overrides fall back to Vercel and missing configuration stays unset", () => {
  assert.equal(
    resolveSiteUrl(" ", " rental.example "),
    "https://rental.example",
  );
  assert.equal(resolveSiteUrl(undefined, undefined), undefined);
  assert.equal(resolveSiteUrl("", " "), undefined);
});
