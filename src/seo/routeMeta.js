export const SITE_URL = "https://kamilsarbian.dev";
export const OG_IMAGE_PATH = "/og/portfolio-og.png";

export const ROUTE_META = Object.freeze({
  "/": {
    key: "home",
    canonicalPath: "/",
    indexable: true,
    schemaType: "ProfilePage",
    ogType: "website",
  },
  "/projects": {
    key: "projects",
    canonicalPath: "/projects",
    indexable: true,
    schemaType: "CollectionPage",
    ogType: "website",
  },
  "/projects/auth-api": {
    key: "auth",
    canonicalPath: "/projects/auth-api",
    indexable: true,
    schemaType: "CreativeWork",
    ogType: "article",
  },
  "/projects/jarvis-ai-environment": {
    key: "jarvis",
    canonicalPath: "/projects/jarvis-ai-environment",
    indexable: true,
    schemaType: "CreativeWork",
    ogType: "article",
  },
  "/projects/living-startpakke": {
    key: "living",
    canonicalPath: "/projects/living-startpakke",
    indexable: true,
    schemaType: "CreativeWork",
    ogType: "article",
  },
  "/projects/password-checker": {
    key: "passwordChecker",
    canonicalPath: "/projects/password-checker",
    indexable: true,
    schemaType: "CreativeWork",
    ogType: "article",
  },
  "/projects/image-editor": {
    key: "imageEditor",
    canonicalPath: "/projects/image-editor",
    indexable: true,
    schemaType: "CreativeWork",
    ogType: "article",
  },
  "/projects/image-classifier": {
    key: "imageClassifier",
    canonicalPath: "/projects/image-classifier",
    indexable: true,
    schemaType: "CreativeWork",
    ogType: "article",
  },
});

export const NOT_FOUND_META = Object.freeze({
  key: "notFound",
  canonicalPath: null,
  indexable: false,
  schemaType: null,
  ogType: "website",
});

export function getRouteMeta(pathname) {
  return ROUTE_META[pathname] ?? NOT_FOUND_META;
}

export function toCanonicalUrl(canonicalPath) {
  return canonicalPath ? new URL(canonicalPath, SITE_URL).href : null;
}
