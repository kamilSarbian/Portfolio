import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function getTrackedJsonFiles() {
  const output = execFileSync(
    "git",
    [
      "ls-files",
      "-z",
      "--cached",
      "--others",
      "--exclude-standard",
      "--",
      "*.json",
      "public/site.webmanifest",
    ],
    {
      cwd: rootDirectory,
      encoding: "utf8",
    }
  );

  return output
    .split("\0")
    .filter(Boolean)
    .filter((filePath) => !filePath.startsWith("src/i18n/"));
}

const errors = [];
const jsonFiles = getTrackedJsonFiles();

for (const filePath of jsonFiles) {
  try {
    JSON.parse(await readFile(path.join(rootDirectory, filePath), "utf8"));
  } catch (error) {
    errors.push(`${filePath}: ${error.message}`);
  }
}

if (errors.length) {
  for (const error of errors) console.error(`JSON error: ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `JSON validation passed for ${jsonFiles.length} Git-visible non-i18n JSON documents.`
  );
}
