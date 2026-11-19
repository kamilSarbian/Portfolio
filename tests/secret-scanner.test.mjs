import assert from "node:assert/strict";
import test from "node:test";

import { scanSource } from "../scripts/check-secrets.mjs";

const deploymentReportPath = "docs/DEPLOYMENT_REPORT.md";
const nordicHearthContentPath = "src/content/nordicHearth.js";
const nordicHearthActionsUrlPrefix = [
  "https://github.com/kamilSarbian/",
  "Restaurant_Ordering_Analytics/actions/",
  "runs/",
].join("");

function hasEntropyFinding(filePath, source) {
  return scanSource(filePath, source).some((finding) =>
    finding.includes("high-entropy long string"),
  );
}

test("verified deployment report URLs do not trigger the entropy rule", () => {
  const currentDeploymentId = ["4CNwGN8Q", "s9CrP2b2", "SHbFjMdrNYdW"].join("");
  const previousDeploymentId = ["4YTfam1F", "TVqvoAYL", "caStfmdq2LDX"].join("");
  const source = [
    `Vercel deployment: https://vercel.com/kamilsarbians-projects/portfolio/${currentDeploymentId}`,
    `Previous deployment: https://vercel.com/kamilsarbians-projects/portfolio/${previousDeploymentId}`,
  ].join("\n");

  assert.deepEqual(scanSource(deploymentReportPath, source), []);
});

test("a verified Vercel URL in another file cannot hide entropy", () => {
  const deploymentId = ["4CNwGN8Q", "s9CrP2b2", "SHbFjMdrNYdW"].join("");
  const source =
    `Vercel deployment: https://vercel.com/kamilsarbians-projects/portfolio/${deploymentId}`;

  assert.ok(hasEntropyFinding("docs/another-report.md", source));
});

test("an unknown Vercel deployment URL cannot hide entropy", () => {
  const unknownDeploymentId = ["9Zx7Qp2L", "mN4vR8sT", "kD6wY3aB"].join("");
  const source =
    `Vercel deployment: https://vercel.com/kamilsarbians-projects/portfolio/${unknownDeploymentId}`;

  assert.ok(hasEntropyFinding(deploymentReportPath, source));
});

test("the verified Nordic Hearth GitHub Actions URL does not trigger entropy", () => {
  const runUrl = [nordicHearthActionsUrlPrefix, "44132315284"].join("");

  assert.deepEqual(scanSource(nordicHearthContentPath, `e2eRunUrl: "${runUrl}"`), []);
});

test("the verified GitHub Actions URL cannot hide entropy in another file", () => {
  const runUrl = [nordicHearthActionsUrlPrefix, "44132315284"].join("");

  assert.ok(hasEntropyFinding("src/content/anotherProject.js", `runUrl: "${runUrl}"`));
});

test("an unknown GitHub Actions run cannot hide entropy", () => {
  const unknownRunUrl = [nordicHearthActionsUrlPrefix, "98765432109"].join("");

  assert.ok(hasEntropyFinding(nordicHearthContentPath, `runUrl: "${unknownRunUrl}"`));
});

test("a constructed GitHub token is still detected", () => {
  const sampleSecret = ["ghp", "A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6"].join("_");
  const findings = scanSource("fixture.txt", `token=${sampleSecret}`);

  assert.ok(findings.some((finding) => finding.includes("GitHub token")));
});
