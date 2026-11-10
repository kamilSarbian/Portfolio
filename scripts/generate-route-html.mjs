import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  OG_IMAGE_PATH,
  ROUTE_META,
  SITE_URL,
  toCanonicalUrl,
} from "../src/seo/routeMeta.js";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDirectory = path.join(rootDirectory, "dist");
const translations = JSON.parse(
  await readFile(path.join(rootDirectory, "src", "i18n", "en.json"), "utf8"),
);

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceRequired(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`Production index is missing ${label}.`);
  return html.replace(pattern, replacement);
}

function setMeta(html, attribute, key, content) {
  const pattern = new RegExp(
    `<meta\\s+${attribute}="${escapeRegExp(key)}"[^>]*>`,
    "i",
  );
  return replaceRequired(
    html,
    pattern,
    `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`,
    `${attribute}="${key}" metadata`,
  );
}

function renderRouteHtml(template, pathname, route) {
  const copy = translations.seo.routes[route.key];
  const canonicalUrl = toCanonicalUrl(route.canonicalPath);
  const imageUrl = new URL(OG_IMAGE_PATH, SITE_URL).href;
  let html = template;

  html = replaceRequired(
    html,
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(copy.title)}</title>`,
    "title",
  );
  html = setMeta(html, "name", "description", copy.description);
  html = setMeta(html, "name", "robots", "index,follow");
  html = replaceRequired(
    html,
    /<link\s+rel="canonical"[^>]*>/i,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    "canonical link",
  );

  html = setMeta(html, "property", "og:type", route.ogType);
  html = setMeta(html, "property", "og:locale", "en_US");
  html = setMeta(html, "property", "og:url", canonicalUrl);
  html = setMeta(html, "property", "og:title", copy.title);
  html = setMeta(html, "property", "og:description", copy.description);
  html = setMeta(html, "property", "og:image", imageUrl);

  html = setMeta(html, "name", "twitter:title", copy.title);
  html = setMeta(html, "name", "twitter:description", copy.description);
  html = setMeta(html, "name", "twitter:image", imageUrl);

  if (!html.includes('<div id="root"></div>')) {
    throw new Error(`Generated HTML for ${pathname} is missing the SPA root.`);
  }

  return html;
}

const template = await readFile(path.join(distDirectory, "index.html"), "utf8");
let generatedCount = 0;

for (const [pathname, route] of Object.entries(ROUTE_META)) {
  if (pathname === "/" || !route.indexable) continue;

  const relativeDirectory = pathname.replace(/^\/+/, "");
  const outputDirectory = path.resolve(distDirectory, relativeDirectory);
  if (!outputDirectory.startsWith(`${distDirectory}${path.sep}`)) {
    throw new Error(`Refusing to write route HTML outside dist: ${pathname}`);
  }

  await mkdir(outputDirectory, { recursive: true });
  await writeFile(
    path.join(outputDirectory, "index.html"),
    renderRouteHtml(template, pathname, route),
    "utf8",
  );
  generatedCount += 1;
}

console.log(`Generated route-specific HTML for ${generatedCount} indexable routes.`);
