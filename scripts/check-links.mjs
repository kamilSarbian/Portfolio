import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ROUTE_META } from "../src/seo/routeMeta.js";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = path.join(rootDirectory, "src");
const sourceExtensions = new Set([".css", ".js", ".jsx"]);
const errors = [];
const warnings = [];

async function listFiles(directory, extensions = null) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath, extensions)));
    } else if (!extensions || extensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function toRelativePath(filePath) {
  return path.relative(rootDirectory, filePath).replaceAll("\\", "/");
}

function stripHashAndQuery(target) {
  return target.split(/[?#]/, 1)[0] || "/";
}

function validateRoutes(appSource, combinedSource) {
  const configuredRoutes = new Set(Object.keys(ROUTE_META));
  const appRoutes = new Set(
    [...appSource.matchAll(/\bpath="([^"]+)"/g)]
      .map((match) => match[1])
      .filter((route) => route !== "*")
  );

  for (const route of configuredRoutes) {
    if (!appRoutes.has(route)) errors.push(`Configured SEO route is missing from App.jsx: ${route}`);
  }
  for (const route of appRoutes) {
    if (!configuredRoutes.has(route)) errors.push(`App.jsx route is missing SEO configuration: ${route}`);
  }

  const navigationTargets = [
    ...appSource.matchAll(/\bgoTo\("([^"]+)"\)/g),
    ...combinedSource.matchAll(/\bhref="(\/[^"]*)"/g),
    ...combinedSource.matchAll(/\bhref="(#[^"]+)"/g),
  ].map((match) => match[1]);

  for (const target of navigationTargets) {
    const pathname = stripHashAndQuery(target);
    if (!configuredRoutes.has(pathname) && !path.extname(pathname)) {
      errors.push(`Internal navigation target does not match a route: ${target}`);
    }

    const hash = target.includes("#") ? target.split("#", 2)[1] : null;
    if (hash && !combinedSource.includes(`id="${hash}"`)) {
      errors.push(`Internal anchor target is missing: ${target}`);
    }
  }

  for (const route of configuredRoutes) {
    if (route === "/" || route === "/projects") continue;
    if (!navigationTargets.some((target) => stripHashAndQuery(target) === route)) {
      errors.push(`Project route has no internal navigation target: ${route}`);
    }
  }
}

async function validateResourceReferences(filesWithSource) {
  const externalHosts = new Set();

  for (const [filePath, source] of filesWithSource) {
    const relativePath = toRelativePath(filePath);
    const attributeMatches = [
      ...source.matchAll(/\b(?:href|src)\s*=\s*["']([^"']*)["']/g),
      ...source.matchAll(/"src"\s*:\s*"([^"]*)"/g),
    ];

    for (const match of attributeMatches) {
      const target = match[1].trim();
      if (!target) {
        errors.push(`${relativePath}: empty href or src attribute.`);
        continue;
      }

      if (/^https?:\/\//i.test(target)) {
        externalHosts.add(new URL(target).host);
        continue;
      }
      if (!target.startsWith("/") || target.startsWith("//")) continue;

      const cleanPath = target.split(/[?#]/, 1)[0];
      if (!path.extname(cleanPath)) continue;

      const targetPath = cleanPath.startsWith("/src/")
        ? path.join(rootDirectory, cleanPath.slice(1))
        : path.join(rootDirectory, "public", cleanPath.slice(1));

      try {
        await readFile(targetPath);
      } catch {
        errors.push(`${relativePath}: referenced file does not exist: ${target}`);
      }
    }

    if (/\b(?:https?:\/\/)?(?:localhost|127\.0\.0\.1)(?::\d+)?/i.test(source)) {
      errors.push(`${relativePath}: production-facing file contains a localhost reference.`);
    }
  }

  if (externalHosts.size) {
    warnings.push(
      `External link availability was not checked without network access (${[...externalHosts].sort().join(", ")}).`
    );
  }
}

try {
  const sourceFiles = await listFiles(sourceDirectory, sourceExtensions);
  const publicTextFiles = (await listFiles(path.join(rootDirectory, "public"))).filter((filePath) =>
    [".json", ".txt", ".xml", ".webmanifest"].includes(path.extname(filePath))
  );
  const files = [
    path.join(rootDirectory, "index.html"),
    ...sourceFiles,
    ...publicTextFiles,
  ];
  const filesWithSource = await Promise.all(
    files.map(async (filePath) => [filePath, await readFile(filePath, "utf8")])
  );
  const appSource = await readFile(path.join(sourceDirectory, "App.jsx"), "utf8");
  const combinedSource = filesWithSource.map(([, source]) => source).join("\n");

  validateRoutes(appSource, combinedSource);
  await validateResourceReferences(filesWithSource);
} catch (error) {
  errors.push(`Link scan could not complete: ${error.message}`);
}

for (const warning of warnings) console.warn(`Link warning: ${warning}`);

if (errors.length) {
  for (const error of errors) console.error(`Link error: ${error}`);
  process.exitCode = 1;
} else {
  console.log("Internal route, anchor, and public asset validation passed.");
}
