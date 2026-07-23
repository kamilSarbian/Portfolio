import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const referenceLanguage = "en";
const languages = ["en", "pl", "no"];
const translations = new Map();
const errors = [];

function valueType(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

function interpolationTokens(value) {
  return [...value.matchAll(/{{\s*([^{}]+?)\s*}}/g)]
    .map((match) => match[1])
    .sort();
}

function addEmptyValueErrors(value, currentPath, language) {
  const type = valueType(value);

  if (type === "string" && value.trim() === "") {
    errors.push(`${language}:${currentPath} is an empty string.`);
    return;
  }

  if (type === "null") {
    errors.push(`${language}:${currentPath} is null.`);
    return;
  }

  if (type === "array") {
    if (value.length === 0) {
      errors.push(`${language}:${currentPath} is an empty array.`);
      return;
    }

    value.forEach((item, index) => {
      addEmptyValueErrors(item, `${currentPath}[${index}]`, language);
    });
    return;
  }

  if (type === "object") {
    const keys = Object.keys(value);
    if (keys.length === 0) {
      errors.push(`${language}:${currentPath} is an empty object.`);
      return;
    }

    keys.forEach((key) => {
      addEmptyValueErrors(
        value[key],
        currentPath ? `${currentPath}.${key}` : key,
        language,
      );
    });
  }
}

function compareValues(reference, candidate, currentPath, language) {
  const referenceType = valueType(reference);
  const candidateType = valueType(candidate);

  if (referenceType !== candidateType) {
    errors.push(
      `${language}:${currentPath} has type ${candidateType}; expected ${referenceType}.`,
    );
    return;
  }

  if (referenceType === "string") {
    const referenceTokens = interpolationTokens(reference);
    const candidateTokens = interpolationTokens(candidate);

    if (referenceTokens.join("\u0000") !== candidateTokens.join("\u0000")) {
      errors.push(
        `${language}:${currentPath} has interpolation tokens [${candidateTokens.join(", ")}]; expected [${referenceTokens.join(", ")}].`,
      );
    }
    return;
  }

  if (referenceType === "array") {
    if (reference.length !== candidate.length) {
      errors.push(
        `${language}:${currentPath} has ${candidate.length} items; expected ${reference.length}.`,
      );
    }

    const sharedLength = Math.min(reference.length, candidate.length);
    for (let index = 0; index < sharedLength; index += 1) {
      compareValues(
        reference[index],
        candidate[index],
        `${currentPath}[${index}]`,
        language,
      );
    }
    return;
  }

  if (referenceType === "object") {
    const referenceKeys = Object.keys(reference).sort();
    const candidateKeys = Object.keys(candidate).sort();
    const referenceKeySet = new Set(referenceKeys);
    const candidateKeySet = new Set(candidateKeys);

    referenceKeys
      .filter((key) => !candidateKeySet.has(key))
      .forEach((key) => {
        const missingPath = currentPath ? `${currentPath}.${key}` : key;
        errors.push(`${language}:${missingPath} is missing.`);
      });

    candidateKeys
      .filter((key) => !referenceKeySet.has(key))
      .forEach((key) => {
        const extraPath = currentPath ? `${currentPath}.${key}` : key;
        errors.push(`${language}:${extraPath} does not exist in ${referenceLanguage}.`);
      });

    referenceKeys
      .filter((key) => candidateKeySet.has(key))
      .forEach((key) => {
        compareValues(
          reference[key],
          candidate[key],
          currentPath ? `${currentPath}.${key}` : key,
          language,
        );
      });
  }
}

for (const language of languages) {
  const filePath = path.join(projectRoot, "src", "i18n", `${language}.json`);

  try {
    translations.set(language, JSON.parse(fs.readFileSync(filePath, "utf8")));
  } catch (error) {
    errors.push(`${language}: could not parse ${filePath}: ${error.message}`);
  }
}

const reference = translations.get(referenceLanguage);
if (reference) {
  for (const language of languages) {
    const translation = translations.get(language);
    if (!translation) continue;

    addEmptyValueErrors(translation, "", language);
    if (language !== referenceLanguage) {
      compareValues(reference, translation, "", language);
    }
  }
}

if (errors.length > 0) {
  console.error(`i18n validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(
    `i18n validation passed for ${languages.join(", ")} using ${referenceLanguage} as the reference.`,
  );
}
