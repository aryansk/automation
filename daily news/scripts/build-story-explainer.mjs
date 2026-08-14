#!/usr/bin/env node

/* Build one current story into the dedicated long-form landscape explainer. */

import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { hyperframesPin } from "./hyperframes-version.mjs";
import { spawnSync } from "node:child_process";
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
  console.error(`✗ story explainer: ${message}`);
  process.exit(1);
};

const storyPath = resolveProjectPath(option("story", "stories/longform-2026-08-03-hormuz.json"));
const variablesPath = resolveProjectPath(option("variables-output", "assets/narration/story-explainer-variables.json"));
const outputPath = resolveProjectPath(option("output", "renders/story-explainer-landscape-2026-08-03-hormuz.mp4"));
const transcriptPath = resolve(projectRoot, "assets/narration/transcript.json");
const projectPath = resolve(projectRoot, "story-explainer-landscape");
const compositionPath = resolve(projectPath, "index.html");
const tempCompositionPath = resolve(projectPath, "index.__render.html");

if (!existsSync(storyPath)) die(`story not found: ${storyPath}`);
if (!existsSync(compositionPath)) die(`composition not found: ${compositionPath}`);

const story = JSON.parse(readFileSync(storyPath, "utf8"));
const narrationPath = resolveProjectPath(String(story.narrationAudio || ""));
if (!existsSync(narrationPath)) die(`narration not found: ${narrationPath}; generate the long-form voice track first`);

const durationProbe = spawnSync(
  "ffprobe",
  ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", narrationPath],
  { encoding: "utf8" },
);
const narrationDuration = Number(String(durationProbe.stdout || "").trim());
if (!Number.isFinite(narrationDuration) || narrationDuration <= 0) die(`could not measure narration: ${narrationPath}`);

const duration = Number(narrationDuration.toFixed(3));
const openerEnd = Math.min(6.4, Math.max(5.2, duration * 0.045));
const endCardStart = Math.max(openerEnd + 30, duration - 5.2);
const chapterWindow = Math.max(18, endCardStart - openerEnd);
const chapters = Array.isArray(story.chapters) ? story.chapters : [];
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
const chapterStarts = chapters.map((_, index) => Number((openerEnd + (chapterWindow * index) / Math.max(1, chapters.length)).toFixed(3)));

const transcriptWords = existsSync(transcriptPath)
  ? JSON.parse(readFileSync(transcriptPath, "utf8"))
  : [];
const captionGroups = [];
let currentCaptionWords = [];
const flushCaption = () => {
  if (!currentCaptionWords.length) return;
  const first = currentCaptionWords[0];
  const last = currentCaptionWords[currentCaptionWords.length - 1];
  captionGroups.push({
    start: Number(first.start.toFixed(3)),
    end: Number((last.end + 0.18).toFixed(3)),
    text: currentCaptionWords.map((word) => word.text).join(" "),
  });
  currentCaptionWords = [];
};
transcriptWords.forEach((word, index) => {
  const text = String(word.text || "").trim();
  if (!text) return;
  currentCaptionWords.push({ ...word, text });
  const phrase = currentCaptionWords.map((entry) => entry.text).join(" ");
  const next = transcriptWords[index + 1];
  const sentenceEnd = /[.!?]$/.test(text);
  const maxWords = currentCaptionWords.length >= 6;
  const maxCharacters = phrase.length >= 47;
  const maxDuration = Number(word.end) - Number(currentCaptionWords[0].start) >= 3.2;
  const longPause = next && currentCaptionWords.length >= 3 && Number(next.start) - Number(word.end) >= 0.42;
  if (sentenceEnd || maxWords || maxCharacters || maxDuration || longPause) flushCaption();
});
flushCaption();
captionGroups.forEach((caption, index) => {
  const next = captionGroups[index + 1];
  if (!next || caption.end <= next.start) return;
  caption.end = Number(Math.max(caption.start + 0.12, next.start - 0.03).toFixed(3));
});

const variables = {
  deskName: "IndieHouse.io News",
  edition: story.edition || "03 Aug 2026",
  openerTitle: "Why Hormuz matters",
  openerSub: "One story · a map-led explainer",
  story: JSON.stringify(story),
  chapters: JSON.stringify(chapters),
  routeNodes: JSON.stringify(story.routeNodes || []),
  chapterStarts: JSON.stringify(chapterStarts),
  globeAnimationId: story.mapAnimation || story.animationId || story.animation || story.visualType || "auto",
  globeAnimationPlan: JSON.stringify(story.animationPlan || story.visualPlan || {}),
  globeMapData: JSON.stringify(story.mapData || {}),
  globeMapSource: story.mapSource || "",
  captions: JSON.stringify(captionGroups),
  openerEnd,
  endCardStart,
  endCardReveal: Number((endCardStart + 0.24).toFixed(3)),
  narrationAudio: story.narrationAudio,
  footerNote: "One story / context first",
  ctaLine: "One story. More context tomorrow.",
  ctaSource: "Sources in description · research refreshed 03 Aug 2026",
};
writeFileSync(variablesPath, `${JSON.stringify(variables, null, 2)}\n`);

const sourceHtml = readFileSync(compositionPath, "utf8");
const renderHtml = sourceHtml
  .replace(/(id="root"[\s\S]*?data-duration=")[\d.]+(")/, `$1${duration}$2`)
  .replace(/(id="narration-track"[\s\S]*?data-duration=")[\d.]+(")/, `$1${duration}$2`)
  .replace(/(id="narration-track"[\s\S]*?src=")[^"]*(")/, `$1${story.narrationAudio}$2`);
writeFileSync(tempCompositionPath, renderHtml);

const renderArgs = [
  "--yes",
  hyperframesPin(),
  "render",
  ".",
  "--composition",
  "index.__render.html",
  "--variables-file",
  relative(projectPath, variablesPath),
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

console.log(`✓ story variables: ${variablesPath.slice(projectRoot.length + 1)}`);
console.log(`✓ narration duration: ${duration}s`);
console.log(`✓ chapters: ${chapters.length}`);
if (!flag("skip-render")) console.log(`✓ render: ${outputPath.slice(projectRoot.length + 1)}`);
