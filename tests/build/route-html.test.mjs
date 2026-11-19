import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { ROUTE_META, SITE_URL, toCanonicalUrl } from "../../src/seo/routeMeta.js";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const expectedSiteUrl = "https://www.kamilsarbian.dev";
const expectedOgImageUrl = `${expectedSiteUrl}/og/portfolio-og.png`;
const translations = JSON.parse(
  await readFile(path.join(rootDirectory, "src", "i18n", "en.json"), "utf8"),
);
const vercelConfig = JSON.parse(
  await readFile(path.join(rootDirectory, "vercel.json"), "utf8"),
);

function decodeHtml(value) {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

function metaContent(html, attribute, key) {
  const pattern = new RegExp(`<meta\\s+${attribute}="${key}"\\s+content="([^"]*)"\\s*/?>`, "i");
  const match = html.match(pattern);
  assert.ok(match, `Missing ${attribute}="${key}" metadata.`);
  return decodeHtml(match[1]);
}

function jsonLd(html, id) {
  const pattern = new RegExp(
    `<script\\s+id="${id}"\\s+type="application/ld\\+json">([\\s\\S]*?)<\\/script>`,
    "i",
  );
  const match = html.match(pattern);
  assert.ok(match, `Missing ${id} JSON-LD.`);
  return JSON.parse(match[1]);
}

test("portfolio metadata uses the canonical www host", () => {
  assert.equal(SITE_URL, expectedSiteUrl);
  assert.equal(toCanonicalUrl("/"), `${expectedSiteUrl}/`);
});

for (const pathname of [
  "/projects/auth-api",
  "/projects/nova-market",
  "/projects/nordic-hearth",
]) {
  test(`production HTML contains route metadata for ${pathname}`, async () => {
    const route = ROUTE_META[pathname];
    const copy = translations.seo.routes[route.key];
    const htmlPath = path.join(
      rootDirectory,
      "dist",
      pathname.replace(/^\/+/, ""),
      "index.html",
    );
    const html = await readFile(htmlPath, "utf8");
    const expectedCanonicalUrl = new URL(pathname, `${expectedSiteUrl}/`).href;
    const personSchema = jsonLd(html, "person-jsonld");

    assert.equal(decodeHtml(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? ""), copy.title);
    assert.equal(metaContent(html, "name", "description"), copy.description);
    assert.equal(metaContent(html, "property", "og:type"), route.ogType);
    assert.equal(metaContent(html, "property", "og:title"), copy.title);
    assert.equal(metaContent(html, "property", "og:description"), copy.description);
    assert.equal(metaContent(html, "property", "og:url"), expectedCanonicalUrl);
    assert.equal(metaContent(html, "property", "og:image"), expectedOgImageUrl);
    assert.equal(metaContent(html, "name", "twitter:image"), expectedOgImageUrl);
    assert.ok(
      html.includes(`<link rel="canonical" href="${expectedCanonicalUrl}" />`),
      "Missing route canonical URL.",
    );
    assert.equal(toCanonicalUrl(pathname), expectedCanonicalUrl);
    assert.equal(personSchema["@id"], `${expectedSiteUrl}/#person`);
    assert.equal(personSchema.url, `${expectedSiteUrl}/`);
    assert.equal(personSchema.image, `${expectedSiteUrl}/avatar_new.png`);
    assert.ok(html.includes('<div id="root"></div>'), "Generated page must retain the SPA root.");
    assert.match(html, /<script type="module" crossorigin src="\/assets\/[^"]+\.js"><\/script>/);

    assert.ok(
      vercelConfig.rewrites.some(
        (rewrite) =>
          rewrite.source === pathname && rewrite.destination === `${pathname}/index.html`,
      ),
      `Missing Vercel rewrite for ${pathname}.`,
    );
    assert.equal(new URL(metaContent(html, "property", "og:url")).origin, expectedSiteUrl);
  });
}
