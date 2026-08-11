#!/usr/bin/env node

/* Build a researched current-affairs episode into the reusable 16:9 AI
 * electricity landscape composition. Mirrors build-rare-earth-topic.mjs but
 * targets the ai-electricity-explainer project. */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, parse, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
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
const resolveProjectPath = (value) => (isAbsolute(value) ? value : resolve(projectRoot, value));
const die = (message) => {
  console.error(`✗ ai-electricity topic: ${message}`);
  process.exit(1);
};

function probeDuration(audioPath) {
  const result = spawnSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", audioPath],
    { encoding: "utf8" },
  );
  const duration = Number(String(result.stdout || "").trim());
  if (!Number.isFinite(duration) || duration <= 0) die(`could not measure narration: ${audioPath}`);
  return Number(duration.toFixed(3));
}

function parseVttTimestamp(value) {
  const parts = String(value).trim().replace(",", ".").split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return Number(parts[0]);
}

function readVtt(filePath) {
  if (!existsSync(filePath)) return [];
  return readFileSync(filePath, "utf8")
    .split(/\r?\n\r?\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .flatMap((block) => {
      const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const timingIndex = lines.findIndex((line) => line.includes(" --> "));
      if (timingIndex < 0) return [];
      const [start, end] = lines[timingIndex].split(" --> ");
      const text = lines
        .slice(timingIndex + 1)
        .join(" ")
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim();
      if (!text) return [];
      return [{ start: Number(parseVttTimestamp(start).toFixed(3)), end: Number(parseVttTimestamp(end).toFixed(3)), text }];
    });
}

const storyPath = resolveProjectPath(option("story", "stories/landscape-2026-08-06-ai-electricity.json"));
const projectPath = resolve(projectRoot, "ai-electricity-explainer");
const compositionPath = resolve(projectPath, "index.html");
const tempCompositionPath = resolve(projectPath, "index.__render.html");
const storyVariablesPath = resolveProjectPath(option("variables-output", "assets/narration/ai-electricity-explainer-variables.json"));
const outputPath = resolveProjectPath(option("output", "renders/landscape-2026-08-06-ai-electricity.mp4"));

if (!existsSync(storyPath)) die(`story not found: ${storyPath}`);
if (!existsSync(compositionPath)) die(`composition not found: ${compositionPath}`);

const story = JSON.parse(readFileSync(storyPath, "utf8"));
const chapters = Array.isArray(story.chapters) ? story.chapters : [];
if (!chapters.length) die("story has no chapters");
const authoredPlans = [story.animationPlan || story.visualPlan, ...chapters.map((chapter) => chapter.animationPlan || chapter.visualPlan)].filter((plan) => plan !== undefined);
authoredPlans.forEach((plan, index) => {
  const result = normalizeGlobeMapPlan(plan, { duration: Number.POSITIVE_INFINITY, requireLibrary: true });
  if (!result.valid) die(`animation plan ${index + 1}: ${result.errors.join("; ")}`);
});
chapters.forEach((chapter, index) => {
  const result = resolveMapPlanForScene({
    chapter,
    story,
    format: "landscape",
    mode: "production",
    requireLibrary: true,
  });
  if (!result.valid) die(`chapter ${index + 1}: ${result.errors.join("; ")}`);
});

const narrationPath = resolveProjectPath(String(story.narrationAudio || ""));
if (!existsSync(narrationPath)) die(`narration not found: ${narrationPath}; generate the voice track first`);
const captionPath = resolveProjectPath(String(story.captionFile || ""));
const duration = probeDuration(narrationPath);

const openerEnd = Math.min(7.2, Math.max(5.6, duration * 0.045));
const endCardStart = Math.max(openerEnd + 42, duration - 7.2);
const chapterWindow = Math.max(24, endCardStart - openerEnd);
const chapterStarts = chapters.map((_, index) => Number((openerEnd + (chapterWindow * index) / chapters.length).toFixed(3)));
const captionGroups = readVtt(captionPath);
const audioSource = String(story.narrationAudio);
const slug = story.slug || parse(storyPath).name;

mkdirSync(dirname(storyVariablesPath), { recursive: true });
writeFileSync(
  storyVariablesPath,
  `${JSON.stringify({
    deskName: story.deskName || "godandbaddaily / Landscape Desk",
    edition: story.edition || "Current edition",
    openerTop: String(story.openerTitle || "ONE QUESTION").split("/")[0].trim(),
    openerBottom: String(story.openerTitle || "CONTEXT FIRST").split("/").slice(1).join("/").trim() || "CONTEXT FIRST",
    openerSub: story.openerSub || "One question · context first",
    story: JSON.stringify(story),
    chapters: JSON.stringify(chapters),
    chapterStarts: JSON.stringify(chapterStarts),
    globeAnimationId: story.mapAnimation || "auto",
    globeAnimationPlan: JSON.stringify(story.animationPlan || story.visualPlan || {}),
    globeMapData: JSON.stringify(story.mapData || {}),
    globeMapSource: story.mapSource || "",
    captions: JSON.stringify(captionGroups),
    openerEnd,
    endCardStart,
    endCardReveal: Number((endCardStart + 0.25).toFixed(3)),
    narrationAudio: story.narrationAudio,
    footerNote: "One question / context first",
    ctaLine: "The grid is the story.",
    ctaSource: `Sources in description · research refreshed ${story.edition || "today"}`,
  }, null, 2)}\n`,
);

const sourceHtml = readFileSync(compositionPath, "utf8");
const renderHtml = sourceHtml
  .replace(/(id="root"[\s\S]*?data-duration=")[\d.]+(")/, `$1${duration}$2`)
  .replace(/(id="narration-track"[\s\S]*?data-duration=")[\d.]+(")/, `$1${duration}$2`)
  .replace(/(id="narration-track"[\s\S]*?src=")[^"]*(")/, `$1${audioSource}$2`);
writeFileSync(tempCompositionPath, renderHtml);

const renderArgs = [
  "--yes",
  "hyperframes@0.7.90",
  "render",
  ".",
  "--composition",
  "index.__render.html",
  "--variables-file",
  relative(projectPath, storyVariablesPath),
  "--output",
  relative(projectPath, outputPath),
  "--fps",
  option("fps", "30"),
  "--quality",
  option("quality", "high"),
  "-w",
  "1",
];

try {
  if (!flag("skip-render")) {
    const result = spawnSync("npx", renderArgs, { cwd: projectPath, stdio: "inherit" });
    if (result.error) die(result.error.message);
    if (result.status !== 0) die(`render exited with status ${result.status}`);
  }
} finally {
  rmSync(tempCompositionPath, { force: true });
}

console.log(`✓ topic variables: ${relative(projectRoot, storyVariablesPath)}`);
console.log(`✓ narration duration: ${duration}s`);
console.log(`✓ chapters: ${chapters.length}`);
console.log(`✓ captions: ${captionGroups.length}`);
if (!flag("skip-render")) console.log(`✓ render: ${relative(projectRoot, outputPath)}`);
console.log(`✓ slug: ${slug}`);
