import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  API_ERROR_KEYS,
  getApiErrorMessage,
  resolveApiErrorKey,
} from "../src/apiErrors.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const languages = ["en", "pl", "no"];

function readTranslation(language) {
  const filePath = path.join(projectRoot, "src", "i18n", `${language}.json`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function valueAtPath(value, keyPath) {
  return keyPath.split(".").reduce((current, key) => current?.[key], value);
}

test("every API error code maps to translated EN, PL, and NO copy", () => {
  for (const language of languages) {
    const translation = readTranslation(language);

    for (const keyPath of Object.values(API_ERROR_KEYS)) {
      const value = valueAtPath(translation, keyPath);
      assert.equal(typeof value, "string", `${language}:${keyPath} must be a string`);
      assert.notEqual(value.trim(), "", `${language}:${keyPath} must not be empty`);
    }
  }
});

test("known error codes resolve without using backend detail", () => {
  const t = (key) => key;
  const message = getApiErrorMessage(
    {
      error_code: "invalid_credentials",
      detail: "Sensitive backend detail",
    },
    t,
    "auth.error",
  );

  assert.equal(message, "apiErrors.invalidCredentials");
});

test("unknown or missing error codes use the local fallback", () => {
  assert.equal(resolveApiErrorKey("future_error", "auth.error"), "auth.error");
  assert.equal(resolveApiErrorKey(undefined, "auth.error"), "auth.error");
});
