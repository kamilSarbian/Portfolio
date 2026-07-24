import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = path.join(rootDirectory, "src");
const translationPath = path.join(sourceDirectory, "i18n", "en.json");
const reviewPath = path.join(rootDirectory, "qa", "unused-i18n-review.json");
const sourceExtensions = new Set([".js", ".jsx"]);
const dynamicPrefixes = [
  "apiErrors.",
  "home.stackSection.",
  "projects.caseLabels.",
  "projects.caseStudies.",
  "seo.routes.",
];

async function listSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "i18n") files.push(...(await listSourceFiles(fullPath)));
    } else if (sourceExtensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function flattenLeaves(value, prefix = "", result = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => flattenLeaves(item, `${prefix}.${index}`, result));
    return result;
  }

  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      flattenLeaves(child, prefix ? `${prefix}.${key}` : key, result);
    }
    return result;
  }

  result.push(prefix);
  return result;
}

function collectLiteralKeys(source) {
  const keys = new Set();
  const callPattern = /\b(?:i18n\.)?t\(\s*(["'`])([^"'`$]+)\1/g;
  const stringPattern = /(["'`])([A-Za-z][A-Za-z0-9_.-]+)\1/g;

  for (const match of source.matchAll(callPattern)) keys.add(match[2]);
  for (const match of source.matchAll(stringPattern)) {
    if (match[2].includes(".")) keys.add(match[2]);
  }

  return keys;
}

function collectTemplatePrefixes(source) {
  const prefixes = new Set();
  const templatePattern = /\bt\(\s*`([^`]*?)\$\{/g;

  for (const match of source.matchAll(templatePattern)) {
    if (match[1]) prefixes.add(match[1]);
  }

  return prefixes;
}

function isCovered(key, literalKeys, prefixes) {
  for (const literalKey of literalKeys) {
    if (
      key === literalKey ||
      key.startsWith(`${literalKey}.`) ||
      key.startsWith(`${literalKey}_`)
    ) {
      return true;
    }
  }

  return prefixes.some((prefix) => key.startsWith(prefix));
}

try {
  const translations = JSON.parse(await readFile(translationPath, "utf8"));
  const review = JSON.parse(await readFile(reviewPath, "utf8"));
  const translationKeys = flattenLeaves(translations);
  const literalKeys = new Set();
  const detectedPrefixes = new Set(dynamicPrefixes);

  for (const filePath of await listSourceFiles(sourceDirectory)) {
    const source = await readFile(filePath, "utf8");
    for (const key of collectLiteralKeys(source)) literalKeys.add(key);
    for (const prefix of collectTemplatePrefixes(source)) detectedPrefixes.add(prefix);
  }

  const unusedKeys = translationKeys.filter(
    (key) => !isCovered(key, literalKeys, [...detectedPrefixes])
  );
  const intentionallyRetained = new Set(review.intentionallyRetained ?? []);
  const obsoleteLegacy = new Set(review.obsoleteLegacy ?? []);
  const reviewedKeys = new Set([...intentionallyRetained, ...obsoleteLegacy]);
  const unclassifiedKeys = unusedKeys.filter((key) => !reviewedKeys.has(key));
  const staleReviewKeys = [...reviewedKeys].filter((key) => !unusedKeys.includes(key));

  if (unclassifiedKeys.length) {
    console.warn(
      `i18n warning: ${unclassifiedKeys.length} unclassified potentially unused keys:`
    );
    for (const key of unclassifiedKeys) console.warn(`  - ${key}`);
  } else {
    console.log("All potentially unused i18n keys have been classified.");
  }

  if (staleReviewKeys.length) {
    console.warn(`i18n warning: ${staleReviewKeys.length} stale review entries:`);
    for (const key of staleReviewKeys) console.warn(`  - ${key}`);
  }

  console.log(
    [
      `Unused i18n scan completed in warning-only mode across ${translationKeys.length} leaf keys.`,
      `${intentionallyRetained.size} intentionally retained.`,
      `${obsoleteLegacy.size} classified as legacy cleanup candidates.`,
    ].join(" ")
  );
} catch (error) {
  console.error(`Unused i18n scan failed: ${error.message}`);
  process.exitCode = 1;
}
