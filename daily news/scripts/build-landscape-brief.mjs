#!/usr/bin/env node

/* Build the 16:9 companion edition from an existing continuous globe-tour
 * narration track. Story JSON supplies the longer on-screen deck while the
 * measured local narration remains the source of truth for duration. */

import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { hyperframesPin } from "./hyperframes-version.mjs";
import { normalizeGlobeMapPlan } from "../assets/animations/globe-map-plan.js";
import { resolveMapPlanForScene } from "../assets/animations/globe-map-runtime.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

const option = (name, fallback = "") => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith("--")
    ? args[index + 1]
    : fallback;
};

const flag = (name) => args.includes(`--${name}`);

const die = (message) => {
  console.error(`✗ landscape brief: ${message}`);
  process.exit(1);
};

const relativeOrAbsolute = (value) => (isAbsolute(value) ? value : resolve(projectRoot, value));

const defaultStories = [
  "stories/top3-2026-08-02-01-iran-hormuz.json",
  "stories/top3-2026-08-02-02-ceuta-border.json",
  "stories/top3-2026-08-02-03-japan-quake.json",
];
const storyPaths = option("stories", defaultStories.join(","))
  .split(",")
  .map((entry) => entry.trim())
  .filter(Boolean)
  .map(relativeOrAbsolute);

const sourceVariablesPath = relativeOrAbsolute(
  option("source-variables", "assets/narration/tour/tour-variables.json"),
);
const variablesPath = relativeOrAbsolute(
  option("variables-output", "assets/narration/landscape-tour-variables.json"),
);
const outputPath = relativeOrAbsolute(
  option("output", "renders/world-brief-landscape-2026-08-02.mp4"),
);
const landscapeProjectRoot = resolve(projectRoot, "world-brief-landscape");
const compositionPath = resolve(landscapeProjectRoot, "index.html");
const tempCompositionPath = resolve(landscapeProjectRoot, "index.__render.html");

if (!existsSync(sourceVariablesPath)) die(`source variables not found: ${sourceVariablesPath}`);
if (!existsSync(compositionPath)) die(`composition not found: ${compositionPath}`);

const sourceVariables = JSON.parse(readFileSync(sourceVariablesPath, "utf8"));
let sourceTour;
try {
  sourceTour = JSON.parse(String(sourceVariables.tour || "[]"));
} catch {
  die(`tour is not valid JSON in ${sourceVariablesPath}`);
}
if (!Array.isArray(sourceTour) || !sourceTour.length) die("source tour has no stops");

const stories = storyPaths.map((storyPath) => {
  if (!existsSync(storyPath)) die(`story not found: ${storyPath}`);
  return JSON.parse(readFileSync(storyPath, "utf8"));
});

stories.forEach((story, index) => {
  const plan = normalizeGlobeMapPlan(story.animationPlan || story.visualPlan, {
    duration: Number.POSITIVE_INFINITY,
    requireLibrary: true,
  });
  if (!plan.valid) die(`story ${index + 1}: ${plan.errors.join("; ")}`);
  const resolvedPlan = resolveMapPlanForScene({
    story,
    format: "landscape",
    mode: "production",
    requireLibrary: true,
  });
  if (!resolvedPlan.valid) die(`story ${index + 1}: ${resolvedPlan.errors.join("; ")}`);
});

if (stories.length !== sourceTour.length) {
  die(`expected ${sourceTour.length} story JSON files to match the source tour, received ${stories.length}`);
}

const tour = sourceTour.map((stop, index) => ({
  ...stop,
  deck: String(stories[index]?.summary || "").trim(),
  mapAnimation: stories[index]?.mapAnimation || stories[index]?.animationId || stories[index]?.animation || stories[index]?.visualType || stop.mapAnimation || "",
  mapData: stories[index]?.mapData || stop.mapData || null,
  mapSource: stories[index]?.mapSource || stories[index]?.source || stop.mapSource || stop.source || "",
  animationPlan: stories[index]?.animationPlan || stories[index]?.visualPlan || stop.animationPlan || stop.visualPlan || null,
}));

const variables = {
  ...sourceVariables,
  tour: JSON.stringify(tour),
};
writeFileSync(variablesPath, `${JSON.stringify(variables, null, 2)}\n`);

const narrationPath = relativeOrAbsolute(String(variables.narrationAudio || ""));
if (!existsSync(narrationPath)) die(`narration not found: ${narrationPath}`);

const durationProbe = spawnSync(
  "ffprobe",
  ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", narrationPath],
  { encoding: "utf8" },
);
const duration = Number(String(durationProbe.stdout || "").trim());
if (!Number.isFinite(duration) || duration <= 0) die(`could not measure narration: ${narrationPath}`);
const durationValue = Number(duration.toFixed(3));

const sourceHtml = readFileSync(compositionPath, "utf8");
const renderHtml = sourceHtml
  .replace(/(id="root"[\s\S]*?data-duration=")[\d.]+(")/, `$1${durationValue}$2`)
  .replace(/(id="narration-track"[\s\S]*?data-duration=")[\d.]+(")/, `$1${durationValue}$2`)
  .replace(/(id="narration-track"[\s\S]*?src=")[^"]*(")/, `$1${variables.narrationAudio}$2`);
writeFileSync(tempCompositionPath, renderHtml);

const quality = option("quality", "high");
const fps = option("fps", "30");
const renderArgs = [
  "--yes",
  hyperframesPin(),
  "render",
  ".",
  "--composition",
  "index.__render.html",
  "--variables-file",
  relative(landscapeProjectRoot, variablesPath),
  "--output",
  relative(landscapeProjectRoot, outputPath),
  "--fps",
  fps,
  "--quality",
  quality,
  "-w",
  "1",
];

if (!flag("skip-render")) {
  const result = spawnSync("npx", renderArgs, { cwd: landscapeProjectRoot, stdio: "inherit" });
  if (result.error) die(result.error.message);
  if (result.status !== 0) die(`render exited with status ${result.status}`);
}

rmSync(tempCompositionPath, { force: true });
console.log(`✓ landscape variables: ${variablesPath.slice(projectRoot.length + 1)}`);
console.log(`✓ duration: ${durationValue}s at ${fps} fps`);
if (!flag("skip-render")) console.log(`✓ render: ${outputPath.slice(projectRoot.length + 1)}`);
