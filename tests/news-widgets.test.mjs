import assert from "node:assert/strict";
import { test } from "node:test";
import { parseArticleWidget } from "../lib/news/widgets.ts";
import { getArticles, getArticleLanguageRoutes } from "../lib/news/articles.ts";

test("malformed editorial widgets fall back without crashing the article", () => {
  assert.equal(parseArticleWidget("chart", "not json"), null);
  assert.equal(parseArticleWidget("warning", "null"), null);
  assert.equal(
    parseArticleWidget("agencies", '{"title":"Test","items":[null]}'),
    null,
  );
  assert.equal(
    parseArticleWidget(
      "chart",
      '{"title":"Test","source":"Test","labels":["A"],"values":["not a number"]}',
    ),
    null,
  );
  assert.equal(
    parseArticleWidget("tiktok", '{"title":"Test","id":"invalid/id"}'),
    null,
  );
});

test("all published widgets pass the production widget parser", () => {
  for (const locale of ["fr", "en", "ar"]) {
    for (const article of getArticles(locale)) {
      for (const [, type, source] of article.body.matchAll(
        /```(warning|chart|cars|agencies|tiktok)\n([\s\S]*?)```/g,
      )) {
        assert.ok(
          parseArticleWidget(type, source),
          `${locale}/${article.id}: ${type}`,
        );
      }
    }
  }
});

test("translated articles retain their published language routes", () => {
  const article = getArticles("fr")[0];
  const routes = getArticleLanguageRoutes(article.id);
  assert.ok(routes.fr.startsWith("/conseils-location-voiture/"));
  assert.ok(routes.en.startsWith("/car-rental-guides/"));
  assert.ok(routes.ar.startsWith("/دليل-كراء-السيارات/"));
});
