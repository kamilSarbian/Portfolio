import { gzipSync } from "node:zlib";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDirectory = path.join(rootDirectory, "dist");
const baselinePath = path.join(rootDirectory, "qa", "bundle-baseline.json");
const imageWarningThreshold = 500 * 1024;
const growthWarningRatio = 1.15;
const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function toRelativeDistPath(filePath) {
  return path.relative(distDirectory, filePath).replaceAll("\\", "/");
}

function sumByExtension(assets, extension, field) {
  return assets
    .filter((asset) => path.extname(asset.path) === extension)
    .reduce((sum, asset) => sum + asset[field], 0);
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

function buildBaseline(assets) {
  const jsAssets = assets.filter((asset) => path.extname(asset.path) === ".js");
  const largestJsChunk = [...jsAssets].sort((left, right) => right.rawBytes - left.rawBytes)[0] ?? null;
  const largestAssets = [...assets]
    .sort((left, right) => right.rawBytes - left.rawBytes)
    .slice(0, 10)
    .map(({ path: assetPath, rawBytes }) => ({ path: assetPath, rawBytes }));
  const largeImages = assets
    .filter(
      (asset) =>
        imageExtensions.has(path.extname(asset.path)) &&
        asset.rawBytes > imageWarningThreshold
    )
    .sort((left, right) => right.rawBytes - left.rawBytes)
    .map(({ path: assetPath, rawBytes }) => ({ path: assetPath, rawBytes }));

  return {
    version: 1,
    totalBytes: assets.reduce((sum, asset) => sum + asset.rawBytes, 0),
    js: {
      rawBytes: sumByExtension(assets, ".js", "rawBytes"),
      gzipBytes: sumByExtension(assets, ".js", "gzipBytes"),
    },
    css: {
      rawBytes: sumByExtension(assets, ".css", "rawBytes"),
      gzipBytes: sumByExtension(assets, ".css", "gzipBytes"),
    },
    largestJsChunk: largestJsChunk
      ? { path: largestJsChunk.path, rawBytes: largestJsChunk.rawBytes }
      : null,
    largestAssets,
    largeImages,
  };
}

function reportGrowth(current, baseline, warnings) {
  const metrics = [
    ["total dist", current.totalBytes, baseline.totalBytes],
    ["JavaScript raw", current.js.rawBytes, baseline.js.rawBytes],
    ["JavaScript gzip", current.js.gzipBytes, baseline.js.gzipBytes],
    ["CSS raw", current.css.rawBytes, baseline.css.rawBytes],
    ["CSS gzip", current.css.gzipBytes, baseline.css.gzipBytes],
  ];

  for (const [label, currentValue, baselineValue] of metrics) {
    if (baselineValue > 0 && currentValue > baselineValue * growthWarningRatio) {
      const growth = ((currentValue / baselineValue - 1) * 100).toFixed(1);
      warnings.push(`${label} increased by ${growth}% compared with baseline.`);
    }
  }
}

try {
  const assetPaths = await listFiles(distDirectory);
  const assets = await Promise.all(
    assetPaths.map(async (assetPath) => {
      const content = await readFile(assetPath);
      const extension = path.extname(assetPath);
      return {
        path: toRelativeDistPath(assetPath),
        rawBytes: content.length,
        gzipBytes: [".css", ".html", ".js"].includes(extension)
          ? gzipSync(content).length
          : content.length,
      };
    })
  );
  const current = buildBaseline(assets);
  const updateBaseline = process.argv.includes("--update-baseline");
  let baseline = null;

  try {
    baseline = JSON.parse(await readFile(baselinePath, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  if (!baseline || updateBaseline) {
    await mkdir(path.dirname(baselinePath), { recursive: true });
    await writeFile(baselinePath, `${JSON.stringify(current, null, 2)}\n`, "utf8");
    console.log(`${baseline ? "Updated" : "Created"} bundle baseline at qa/bundle-baseline.json.`);
    baseline = current;
  }

  const warnings = [];
  reportGrowth(current, baseline, warnings);
  for (const image of current.largeImages) {
    warnings.push(`Large image: ${image.path} (${formatBytes(image.rawBytes)}).`);
  }

  console.log(
    [
      `Bundle report: total ${formatBytes(current.totalBytes)}`,
      `JS ${formatBytes(current.js.rawBytes)} raw / ${formatBytes(current.js.gzipBytes)} gzip`,
      `CSS ${formatBytes(current.css.rawBytes)} raw / ${formatBytes(current.css.gzipBytes)} gzip`,
      current.largestJsChunk
        ? `largest JS ${current.largestJsChunk.path} (${formatBytes(current.largestJsChunk.rawBytes)})`
        : "no JavaScript chunk",
    ].join(" | ")
  );

  for (const warning of warnings) console.warn(`Bundle warning: ${warning}`);
} catch (error) {
  console.error(`Bundle check failed: ${error.message}`);
  process.exitCode = 1;
}
