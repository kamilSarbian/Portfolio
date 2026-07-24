import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  NOT_FOUND_META,
  OG_IMAGE_PATH,
  ROUTE_META,
  SITE_URL,
  toCanonicalUrl,
} from "../src/seo/routeMeta.js";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const languages = ["en", "pl", "no"];
const allowedSchemaTypes = new Set(["ProfilePage", "CollectionPage", "CreativeWork"]);
const errors = [];
const warnings = [];

function reportError(message) {
  errors.push(message);
}

function reportWarning(message) {
  warnings.push(message);
}

async function readText(relativePath) {
  return readFile(path.join(rootDirectory, relativePath), "utf8");
}

async function readJson(relativePath) {
  return JSON.parse(await readText(relativePath));
}

function validateSeoCopy(language, translations, routeKeys) {
  const seo = translations.seo;

  if (!seo || typeof seo !== "object") {
    reportError(`${language}: missing seo object.`);
    return;
  }

  if (typeof seo.imageAlt !== "string" || !seo.imageAlt.trim()) {
    reportError(`${language}: seo.imageAlt must be a non-empty string.`);
  }

  for (const routeKey of routeKeys) {
    const copy = seo.routes?.[routeKey];
    if (!copy || typeof copy !== "object") {
      reportError(`${language}: missing seo.routes.${routeKey}.`);
      continue;
    }

    for (const field of ["title", "description"]) {
      if (typeof copy[field] !== "string" || !copy[field].trim()) {
        reportError(`${language}: seo.routes.${routeKey}.${field} must be a non-empty string.`);
      }
    }

    if (routeKey === NOT_FOUND_META.key) continue;

    const titleLength = copy.title?.trim().length ?? 0;
    const descriptionLength = copy.description?.trim().length ?? 0;
    if (titleLength && (titleLength < 30 || titleLength > 65)) {
      reportWarning(`${language}: seo.routes.${routeKey}.title has ${titleLength} characters.`);
    }
    if (descriptionLength && (descriptionLength < 110 || descriptionLength > 170)) {
      reportWarning(`${language}: seo.routes.${routeKey}.description has ${descriptionLength} characters.`);
    }
  }
}

function validateRouteConfiguration() {
  const canonicalUrls = new Set();

  for (const [pathname, route] of Object.entries(ROUTE_META)) {
    if (!pathname.startsWith("/")) {
      reportError(`Route path must start with "/": ${pathname}`);
    }
    if (!route.indexable) {
      reportError(`Known route must be indexable: ${pathname}`);
    }
    if (!allowedSchemaTypes.has(route.schemaType)) {
      reportError(`Unsupported schema type for ${pathname}: ${route.schemaType}`);
    }
    if (route.canonicalPath !== pathname) {
      reportError(`Canonical path must match route path for ${pathname}.`);
    }

    const canonicalUrl = toCanonicalUrl(route.canonicalPath);
    if (!canonicalUrl) {
      reportError(`Missing canonical URL for ${pathname}.`);
      continue;
    }

    const parsedUrl = new URL(canonicalUrl);
    if (parsedUrl.protocol !== "https:") {
      reportError(`Canonical URL must use HTTPS: ${canonicalUrl}`);
    }
    if (parsedUrl.origin !== SITE_URL) {
      reportError(`Canonical URL must use ${SITE_URL}: ${canonicalUrl}`);
    }
    if (parsedUrl.search || parsedUrl.hash) {
      reportError(`Canonical URL cannot contain query or hash: ${canonicalUrl}`);
    }
    if (canonicalUrls.has(canonicalUrl)) {
      reportError(`Duplicate canonical URL: ${canonicalUrl}`);
    }
    canonicalUrls.add(canonicalUrl);
  }

  if (NOT_FOUND_META.indexable || NOT_FOUND_META.canonicalPath || NOT_FOUND_META.schemaType) {
    reportError("The not-found route must be non-indexable without canonicalPath or schemaType.");
  }

  return canonicalUrls;
}

function validateSitemap(sitemap, canonicalUrls) {
  const sitemapUrls = [...sitemap.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((match) => match[1]);
  const uniqueSitemapUrls = new Set(sitemapUrls);

  if (sitemapUrls.length !== uniqueSitemapUrls.size) {
    reportError("public/sitemap.xml contains duplicate URLs.");
  }

  for (const url of sitemapUrls) {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "https:" || parsedUrl.search || parsedUrl.hash) {
      reportError(`Invalid sitemap URL: ${url}`);
    }
    if (!canonicalUrls.has(url)) {
      reportError(`Sitemap URL does not match a configured route: ${url}`);
    }
  }

  for (const canonicalUrl of canonicalUrls) {
    if (!uniqueSitemapUrls.has(canonicalUrl)) {
      reportError(`Indexable route is missing from sitemap: ${canonicalUrl}`);
    }
  }
}

async function validateOgImage() {
  const imagePath = path.join(rootDirectory, "public", OG_IMAGE_PATH.replace(/^\//, ""));
  const image = await readFile(imagePath);
  const pngSignature = "89504e470d0a1a0a";

  if (image.subarray(0, 8).toString("hex") !== pngSignature) {
    reportError(`${OG_IMAGE_PATH} must be a PNG file.`);
    return;
  }

  const width = image.readUInt32BE(16);
  const height = image.readUInt32BE(20);
  if (width !== 1200 || height !== 630) {
    reportError(`${OG_IMAGE_PATH} must be 1200x630, received ${width}x${height}.`);
  }
}

function validateIndexFallback(indexHtml) {
  const requiredPatterns = [
    ['name="description"', "description"],
    ['name="robots" content="index,follow"', "robots"],
    ['rel="canonical" href="https://kamilsarbian.dev/"', "canonical"],
    ['property="og:site_name"', "og:site_name"],
    ['property="og:locale" content="en_US"', "og:locale"],
    ['property="og:image" content="https://kamilsarbian.dev/og/portfolio-og.png"', "og:image"],
    ['property="og:image:width" content="1200"', "og:image:width"],
    ['property="og:image:height" content="630"', "og:image:height"],
    ['property="og:image:alt"', "og:image:alt"],
    ['name="twitter:card" content="summary_large_image"', "twitter:card"],
    ['name="twitter:image" content="https://kamilsarbian.dev/og/portfolio-og.png"', "twitter:image"],
    ['name="twitter:image:alt"', "twitter:image:alt"],
    ['id="person-jsonld"', "person-jsonld"],
    ['"@id": "https://kamilsarbian.dev/#person"', "Person @id"],
  ];

  for (const [pattern, label] of requiredPatterns) {
    if (!indexHtml.includes(pattern)) {
      reportError(`index.html is missing the ${label} fallback.`);
    }
  }
}

const routeKeys = new Set([
  ...Object.values(ROUTE_META).map((route) => route.key),
  NOT_FOUND_META.key,
]);

const canonicalUrls = validateRouteConfiguration();
for (const language of languages) {
  validateSeoCopy(language, await readJson(`src/i18n/${language}.json`), routeKeys);
}

validateSitemap(await readText("public/sitemap.xml"), canonicalUrls);
validateIndexFallback(await readText("index.html"));
await validateOgImage();

for (const warning of warnings) console.warn(`SEO warning: ${warning}`);

if (errors.length) {
  for (const error of errors) console.error(`SEO error: ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `SEO validation passed for ${Object.keys(ROUTE_META).length} routes and ${languages.length} languages.`
  );
}
