import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
const root = path.join(process.cwd(), "content/actus");
const locales = ["fr", "en", "ar"];
const articles = Object.fromEntries(
  locales.map((locale) => [
    locale,
    fs.readdirSync(path.join(root, locale)).filter((f) => f.endsWith(".md")),
  ]),
);
test("published articles have matching translations, valid dates and unique SEO descriptions", () => {
  const descriptions = new Set();
  for (const locale of locales) {
    assert.deepEqual([...articles[locale]].sort(), [...articles.fr].sort());
    for (const file of articles[locale]) {
      const { data, content } = matter(
        fs.readFileSync(path.join(root, locale, file), "utf8"),
      );
      for (const field of ["title", "description", "author", "category"])
        assert.ok(
          typeof data[field] === "string" && data[field].trim(),
          `${locale}/${file}: ${field}`,
        );
      assert.match(data.date, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(Number.isFinite(Date.parse(data.date)));
      assert.ok(
        !descriptions.has(data.description),
        "Descriptions must be unique",
      );
      descriptions.add(data.description);
      assert.ok(
        content.match(/^## /gm)?.length >= 3,
        `${locale}/${file}: missing article sections`,
      );
    }
  }
});
test("editorial links resolve and widget payloads are valid JSON", () => {
  for (const locale of locales)
    for (const file of articles[locale]) {
      const { content } = matter(
        fs.readFileSync(path.join(root, locale, file), "utf8"),
      );
      for (const [, href] of content.matchAll(/\]\(([^)]+)\)/g)) {
        if (!/^(https:\/\/|\/|#)/.test(href))
          assert.ok(
            articles[locale].includes(href + ".md"),
            `${locale}/${file}: broken link ${href}`,
          );
      }
      for (const [, kind, payload] of content.matchAll(
        /```(warning|chart|cars|agencies|tiktok)\n([\s\S]*?)```/g,
      )) {
        const data = JSON.parse(payload);
        if (kind === "warning") assert.ok(data.title && data.text);
        if (kind === "chart") {
          assert.equal(data.labels.length, data.values.length);
          assert.ok(data.source);
          assert.ok(data.values.every(Number.isFinite));
        }
      }
    }
});
