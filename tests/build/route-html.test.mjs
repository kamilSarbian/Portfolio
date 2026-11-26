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

const generatedRoutes = Object.entries(ROUTE_META).filter(
  ([pathname, route]) => pathname !== "/" && route.indexable,
);

for (const [pathname, route] of generatedRoutes) {
  test(`production HTML contains route metadata for ${pathname}`, async () => {
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
    assert.equal(new URL(metaContent(html, "property", "og:url")).origin, expectedSiteUrl);
  });
}

test("Vercel rewrites every generated route to its HTML before the SPA fallback", () => {
  const { rewrites } = vercelConfig;
  const fallbackIndex = rewrites.findIndex(({ destination }) => destination === "/index.html");
  assert.notEqual(fallbackIndex, -1, "Missing SPA fallback rewrite.");

  for (const [pathname] of generatedRoutes) {
    const rewriteIndex = rewrites.findIndex(({ source }) => source === pathname);
    assert.notEqual(rewriteIndex, -1, `Missing Vercel rewrite for ${pathname}.`);
    assert.equal(
      rewrites[rewriteIndex].destination,
      `${pathname}/index.html`,
      `Incorrect Vercel rewrite destination for ${pathname}.`,
    );
    assert.ok(rewriteIndex < fallbackIndex, `Vercel rewrite for ${pathname} must precede the SPA fallback.`);
  }
});

test("Hand Tracking is a desktop case study without a web application or download URL", () => {
  const route = ROUTE_META["/projects/hand-tracking"];
  assert.equal(route.schemaType, "CreativeWork");
  assert.ok(!Object.hasOwn(route, "applicationUrl"));
  assert.ok(!Object.hasOwn(route, "downloadUrl"));
});

test("the hospitality prototype is a CreativeWork without deployment or repository metadata", () => {
  const route = ROUTE_META["/projects/hospitality-wordpress"];
  assert.equal(route.schemaType, "CreativeWork");
  for (const field of ["applicationUrl", "codeRepository", "downloadUrl", "imagePath"]) {
    assert.ok(!Object.hasOwn(route, field), `Unexpected hospitality prototype field: ${field}`);
  }
});
