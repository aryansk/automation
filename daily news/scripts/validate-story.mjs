#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { animationRegistry } from "../assets/animations/registry.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

function option(name, fallback = "") {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function fail(message) {
  console.error(`✗ ${message}`);
  process.exitCode = 1;
}

const storyArg = option("story") || args.find((arg) => !arg.startsWith("--"));
if (!storyArg) {
  console.error("Usage: npm run validate:story -- --story stories/your-story.json");
  process.exit(1);
}

const storyPath = isAbsolute(storyArg) ? storyArg : resolve(projectRoot, storyArg);
if (!existsSync(storyPath)) {
  console.error(`Story file not found: ${storyPath}`);
  process.exit(1);
}

let story;
try {
  story = JSON.parse(readFileSync(storyPath, "utf8"));
} catch (error) {
  console.error(`Invalid JSON in ${storyPath}: ${error.message}`);
  process.exit(1);
}

const limits = {
  countryName: { words: 5, chars: 32 },
  cityName: { words: 5, chars: 32, optional: true },
  region: { words: 4, chars: 28 },
  kicker: { words: 4, chars: 32 },
  headline: { words: 14, chars: 85 },
  summary: { words: 30, chars: 180 },
  source: { words: 4, chars: 28 },
  edition: { words: 4, chars: 20 },
  script: { words: 42, chars: 300 },
  storyNumber: { words: 1, chars: 2 },
  statLabel: { words: 8, chars: 54, optional: true },
  statDelta: { words: 4, chars: 24, optional: true },
  statPeriod: { words: 6, chars: 40, optional: true },
  comparisonLeftLabel: { words: 5, chars: 32, optional: true },
  comparisonLeftValue: { words: 3, chars: 24, optional: true },
  comparisonRightLabel: { words: 5, chars: 32, optional: true },
  comparisonRightValue: { words: 3, chars: 24, optional: true },
  quoteText: { words: 24, chars: 150, optional: true },
  quoteAttribution: { words: 5, chars: 40, optional: true },
  quoteRole: { words: 6, chars: 42, optional: true },
  marketSymbol: { words: 4, chars: 24, optional: true },
  marketValue: { words: 3, chars: 24, optional: true },
  marketChange: { words: 3, chars: 20, optional: true },
  marketPeriod: { words: 4, chars: 24, optional: true },
};

const countWords = (value) => String(value || "").trim().split(/\s+/).filter(Boolean).length;

for (const [field, limit] of Object.entries(limits)) {
  const value = String(story[field] ?? "").trim();
  if (!value && !limit.optional) {
    fail(`${field} is required`);
    continue;
  }
  if (!value) continue;

  const words = countWords(value);
  const chars = [...value].length;
  if (words > limit.words) fail(`${field}: ${words} words; maximum is ${limit.words}`);
  if (chars > limit.chars) fail(`${field}: ${chars} characters; maximum is ${limit.chars}`);
}

if (!/^[A-Z]{2}$/.test(String(story.countryCode || ""))) {
  fail("countryCode must be a two-letter uppercase ISO alpha-2 code");
}

if (!/^\d{2}$/.test(String(story.storyNumber || ""))) {
  fail("storyNumber must contain exactly two digits");
}

const storyTypes = new Set([
  "auto",
  "geographic",
  "breaking",
  "statistics",
  "comparison",
  "quote",
  "financial",
  "timeline",
  "weather",
  "product",
  "editorial",
]);
const storyType = String(story.storyType || "auto").trim().toLowerCase();
if (!storyTypes.has(storyType)) {
  fail(`storyType must be one of: ${[...storyTypes].join(", ")}`);
}

if (story.visualType && !animationRegistry.has(story.visualType)) {
  fail(`visualType is not registered: ${story.visualType}`);
}

if (story.coordinates) {
  try {
    const coordinates = Array.isArray(story.coordinates)
      ? story.coordinates
      : JSON.parse(story.coordinates);
    if (
      !Array.isArray(coordinates) ||
      coordinates.length !== 2 ||
      !coordinates.every((value) => Number.isFinite(Number(value))) ||
      Math.abs(Number(coordinates[0])) > 180 ||
      Math.abs(Number(coordinates[1])) > 90
    ) {
      fail("coordinates must be [longitude, latitude] within valid geographic bounds");
    }
  } catch {
    fail("coordinates must be valid JSON in [longitude, latitude] form");
  }
}

for (const field of ["chartData", "timelineEvents"]) {
  if (!story[field]) continue;
  try {
    const value = typeof story[field] === "string" ? JSON.parse(story[field]) : story[field];
    if (!Array.isArray(value)) fail(`${field} must contain a JSON array`);
  } catch {
    fail(`${field} must contain valid JSON`);
  }
}

if (storyType === "statistics" && !String(story.statValue || "").trim()) {
  fail("statistics stories require statValue");
}
if (
  storyType === "comparison" &&
  (!String(story.comparisonLeftValue || "").trim() || !String(story.comparisonRightValue || "").trim())
) {
  fail("comparison stories require comparisonLeftValue and comparisonRightValue");
}
if (storyType === "quote" && !String(story.quoteText || "").trim()) {
  fail("quote stories require quoteText");
}
if (
  storyType === "financial" &&
  (!String(story.marketValue || story.statValue || "").trim() || !String(story.marketChange || "").trim())
) {
  fail("financial stories require marketValue (or statValue) and marketChange");
}

for (const field of ["imageOne", "imageTwo", "narrationAudio"]) {
  const value = String(story[field] || "").trim();
  if (!value) {
    fail(`${field} is required`);
    continue;
  }
  if (/^https?:\/\//i.test(value)) {
    fail(`${field} must be a local project asset, not a remote URL`);
    continue;
  }
  const assetPath = isAbsolute(value) ? value : resolve(projectRoot, value);
  if (!existsSync(assetPath)) fail(`${field} does not exist: ${value}`);
}

if (String(story.summary || "").trim().replace(/[.!?]+$/, "") === String(story.headline || "").trim()) {
  fail("summary repeats the headline instead of adding information");
}

if (!process.exitCode) {
  console.log(`✓ ${storyArg} passes the Daily News text and asset limits`);
  console.log(
    `  headline ${countWords(story.headline)}/14 words · summary ${countWords(story.summary)}/30 words · script ${countWords(story.script)}/42 words`,
  );
}
