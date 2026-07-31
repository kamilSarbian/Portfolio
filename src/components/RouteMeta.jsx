import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import {
  getRouteMeta,
  OG_IMAGE_PATH,
  SITE_URL,
  toCanonicalUrl,
} from "../seo/routeMeta";

const OG_IMAGE_URL = new URL(OG_IMAGE_PATH, SITE_URL).href;
const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

function ensureMeta(selector, attributes) {
  const matches = [...document.head.querySelectorAll(selector)];
  const meta = matches.shift() ?? document.createElement("meta");

  for (const duplicate of matches) duplicate.remove();
  for (const [name, value] of Object.entries(attributes)) meta.setAttribute(name, value);
  if (!meta.parentNode) document.head.append(meta);

  return meta;
}

function setMeta(selector, attributes, content) {
  ensureMeta(selector, attributes).setAttribute("content", content);
}

function setCanonical(canonicalUrl) {
  const matches = [...document.head.querySelectorAll('link[rel="canonical"]')];

  if (!canonicalUrl) {
    for (const link of matches) link.remove();
    return;
  }

  const canonical = matches.shift() ?? document.createElement("link");
  for (const duplicate of matches) duplicate.remove();
  canonical.setAttribute("rel", "canonical");
  canonical.setAttribute("href", canonicalUrl);
  if (!canonical.parentNode) document.head.append(canonical);
}

function setRouteJsonLd(route, title, description, url, language) {
  const scripts = [...document.head.querySelectorAll("#route-jsonld")];
  const script = scripts.shift() ?? document.createElement("script");

  for (const duplicate of scripts) duplicate.remove();

  if (!route.schemaType) {
    script.remove();
    return;
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": route.schemaType,
    name: route.schemaName ?? title,
    description,
    url,
    inLanguage: language,
    isPartOf: {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: "Kamil Sarbian Portfolio",
      url: `${SITE_URL}/`,
    },
  };

  if (["CreativeWork", "SoftwareApplication"].includes(route.schemaType)) {
    schema.author = {
      "@type": "Person",
      "@id": PERSON_ID,
      name: "Kamil Sarbian",
    };
  }

  if (route.schemaType === "SoftwareApplication") {
    schema.applicationCategory = route.applicationCategory;
    schema.operatingSystem = route.operatingSystem;
    schema.url = route.applicationUrl;
    schema.codeRepository = route.codeRepository;
    schema.datePublished = route.datePublished;
    schema.isAccessibleForFree = true;
    schema.programmingLanguage = ["Python", "JavaScript", "HTML", "CSS", "SQL"];
    schema.image = new URL(route.imagePath, SITE_URL).href;
  }

  if (route.schemaType === "ProfilePage") {
    schema.mainEntity = {
      "@type": "Person",
      "@id": PERSON_ID,
      name: "Kamil Sarbian",
    };
  }

  script.id = "route-jsonld";
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(schema);
  if (!script.parentNode) document.head.append(script);
}

function toSchemaLanguage(language) {
  return language === "no" ? "nb" : language;
}

function toOgLocale(language) {
  if (language === "pl") return "pl_PL";
  if (language === "no") return "nb_NO";
  return "en_US";
}

export default function RouteMeta() {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const route = getRouteMeta(location.pathname);
  const language = (i18n.resolvedLanguage || i18n.language || "en").slice(0, 2);
  const title = t(`seo.routes.${route.key}.title`);
  const description = t(`seo.routes.${route.key}.description`);
  const imageAlt = t("seo.imageAlt");

  useEffect(() => {
    const canonicalUrl = toCanonicalUrl(route.canonicalPath);
    const routeUrl = canonicalUrl ?? new URL(location.pathname, SITE_URL).href;
    const routeLanguage = route.language ?? language;
    const schemaLanguage = toSchemaLanguage(routeLanguage);

    document.title = title;
    setMeta('meta[name="description"]', { name: "description" }, description);
    setMeta('meta[name="robots"]', { name: "robots" }, route.indexable ? "index,follow" : "noindex,follow");
    setCanonical(canonicalUrl);

    setMeta('meta[property="og:type"]', { property: "og:type" }, route.ogType);
    setMeta('meta[property="og:site_name"]', { property: "og:site_name" }, "Kamil Sarbian Portfolio");
    setMeta('meta[property="og:locale"]', { property: "og:locale" }, toOgLocale(routeLanguage));
    setMeta('meta[property="og:title"]', { property: "og:title" }, title);
    setMeta('meta[property="og:description"]', { property: "og:description" }, description);
    setMeta('meta[property="og:url"]', { property: "og:url" }, routeUrl);
    setMeta('meta[property="og:image"]', { property: "og:image" }, OG_IMAGE_URL);
    setMeta('meta[property="og:image:width"]', { property: "og:image:width" }, "1200");
    setMeta('meta[property="og:image:height"]', { property: "og:image:height" }, "630");
    setMeta('meta[property="og:image:alt"]', { property: "og:image:alt" }, imageAlt);

    setMeta('meta[name="twitter:card"]', { name: "twitter:card" }, "summary_large_image");
    setMeta('meta[name="twitter:title"]', { name: "twitter:title" }, title);
    setMeta('meta[name="twitter:description"]', { name: "twitter:description" }, description);
    setMeta('meta[name="twitter:image"]', { name: "twitter:image" }, OG_IMAGE_URL);
    setMeta('meta[name="twitter:image:alt"]', { name: "twitter:image:alt" }, imageAlt);

    setRouteJsonLd(route, title, description, routeUrl, schemaLanguage);
  }, [description, imageAlt, language, location.pathname, route, title]);

  return null;
}
