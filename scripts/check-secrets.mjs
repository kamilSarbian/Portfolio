import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const knownPlaceholderFragments = [
  "change-me",
  "changeme",
  "dev-only",
  "example",
  "password123",
  "postgres",
  "replace-me",
  "test",
  "test-secret",
  "wrong-",
  "your-",
];
const tokenPatterns = [
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g],
  ["OpenAI-style API key", /\bsk-[A-Za-z0-9_-]{20,}\b/g],
  ["GitHub token", /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b/g],
  ["GitHub fine-grained token", /\bgithub_pat_[A-Za-z0-9_]{40,}\b/g],
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/g],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{30,}\b/g],
  ["Slack token", /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/g],
  ["Hugging Face token", /\bhf_[A-Za-z0-9]{30,}\b/g],
  ["JWT", /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g],
  [
    "private network address",
    /\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})\b/g,
  ],
];
const assignmentPattern =
  /["']?(api[_-]?key|access[_-]?token|auth[_-]?token|jwt[_-]?secret|client[_-]?secret|password)["']?(?:\s*:\s*[A-Za-z_][^=,\n]{0,40})?\s*[:=]\s*(["'])([^"'\r\n]+)\2/gi;
const longTokenPattern = /\b[A-Za-z0-9+/_=-]{48,}\b/g;
const deploymentReportPath = "docs/DEPLOYMENT_REPORT.md";
const verifiedPublicVercelDeploymentIds = new Set([
  ["4CNwGN8Q", "s9CrP2b2", "SHbFjMdrNYdW"].join(""),
  ["4YTfam1F", "TVqvoAYL", "caStfmdq2LDX"].join(""),
]);
const verifiedPublicVercelDeploymentUrlPattern =
  /https:\/\/vercel\.com\/kamilsarbians-projects\/portfolio\/([A-Za-z0-9_-]{20,})(?=$|[\s)\]}>.,;])/g;

function getTrackedFiles() {
  return execFileSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
    {
    cwd: rootDirectory,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    }
  )
    .split("\0")
    .filter(Boolean);
}

function isBinary(buffer) {
  return buffer.subarray(0, Math.min(buffer.length, 8192)).includes(0);
}

function lineNumberAt(source, index) {
  return source.slice(0, index).split("\n").length;
}

function looksLikePlaceholder(value) {
  const normalized = value.toLowerCase();
  return knownPlaceholderFragments.some((fragment) => normalized.includes(fragment));
}

function shannonEntropy(value) {
  const counts = new Map();
  for (const character of value) counts.set(character, (counts.get(character) ?? 0) + 1);

  let entropy = 0;
  for (const count of counts.values()) {
    const probability = count / value.length;
    entropy -= probability * Math.log2(probability);
  }
  return entropy;
}

function addFinding(findings, filePath, source, index, label) {
  findings.push(`${filePath}:${lineNumberAt(source, index)} — ${label}`);
}

function isVerifiedPublicVercelDeploymentId(normalizedPath, source, index, value) {
  if (normalizedPath !== deploymentReportPath) return false;

  verifiedPublicVercelDeploymentUrlPattern.lastIndex = 0;
  for (const match of source.matchAll(verifiedPublicVercelDeploymentUrlPattern)) {
    if (!verifiedPublicVercelDeploymentIds.has(match[1])) continue;

    const urlStart = match.index;
    const urlEnd = urlStart + match[0].length;
    const tokenEnd = index + value.length;
    if (index >= urlStart && tokenEnd <= urlEnd) return true;
  }
  return false;
}

export function scanSource(normalizedPath, source) {
  const findings = [];
  const basename = path.posix.basename(normalizedPath);

  if (basename.startsWith(".env") && basename !== ".env.example") {
    findings.push(`${normalizedPath}: tracked environment file.`);
  }

  for (const [label, pattern] of tokenPatterns) {
    pattern.lastIndex = 0;
    for (const match of source.matchAll(pattern)) {
      addFinding(findings, normalizedPath, source, match.index, label);
    }
  }

  if (basename !== ".env.example" && !normalizedPath.startsWith("src/i18n/")) {
    assignmentPattern.lastIndex = 0;
    for (const match of source.matchAll(assignmentPattern)) {
      if (!looksLikePlaceholder(match[3])) {
        addFinding(
          findings,
          normalizedPath,
          source,
          match.index,
          `non-placeholder ${match[1]} assignment`,
        );
      }
    }
  }

  if (basename === "package-lock.json") return findings;

  longTokenPattern.lastIndex = 0;
  for (const match of source.matchAll(longTokenPattern)) {
    const value = match[0];
    const characterClasses = [
      /[a-z]/.test(value),
      /[A-Z]/.test(value),
      /\d/.test(value),
      /[+/_=-]/.test(value),
    ].filter(Boolean).length;

    if (
      characterClasses >= 3 &&
      shannonEntropy(value) >= 4.3 &&
      !looksLikePlaceholder(value) &&
      !isVerifiedPublicVercelDeploymentId(normalizedPath, source, match.index, value)
    ) {
      addFinding(findings, normalizedPath, source, match.index, "high-entropy long string");
    }
  }

  return findings;
}

async function scanGitVisibleFiles() {
  const findings = [];

  for (const filePath of getTrackedFiles()) {
    const normalizedPath = filePath.replaceAll("\\", "/");
    const buffer = await readFile(path.join(rootDirectory, filePath));
    if (isBinary(buffer)) continue;
    findings.push(...scanSource(normalizedPath, buffer.toString("utf8")));
  }

  return findings;
}

const isMainModule =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  const findings = await scanGitVisibleFiles();
  if (findings.length) {
    for (const finding of findings) console.error(`Secret scan finding: ${finding}`);
    process.exitCode = 1;
  } else {
    console.log("Secret scan passed for tracked and non-ignored Git-visible files.");
  }
}
