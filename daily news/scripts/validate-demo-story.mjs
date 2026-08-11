#!/usr/bin/env node

/* Validate a landscape story's globe/map configuration against the editorial
   globe-map library. This is the schema gate for the demo stories and any
   landscape story that carries mapAnimation/mapData. */

import { readFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { getGlobeMapAnimation } from "../assets/animations/globe-map-library.js";
import { normalizeGlobeMapPlan } from "../assets/animations/globe-map-plan.js";
import {
  isMapDisabled,
  resolveChapterMapAnimation,
} from "../assets/animations/globe-map-selector.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const option = (name, fallback = "") => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const storyArg = option("story");
if (!storyArg) {
  console.error("Usage: npm run validate:demo-story -- --story stories/demo-route-hormuz-reopening.json");
  process.exit(1);
}
const storyPath = isAbsolute(storyArg) ? storyArg : resolve(projectRoot, storyArg);

let story;
try {
  story = JSON.parse(readFileSync(storyPath, "utf8"));
} catch (error) {
  console.error(`✗ invalid story JSON ${storyPath}: ${error.message}`);
  process.exit(1);
}

const failures = [];
const explicit = String(story.mapAnimation || story.visualType || "").trim().toLowerCase();

if (explicit && !isMapDisabled(story)) {
  try {
    getGlobeMapAnimation(explicit);
  } catch (error) {
    failures.push(`mapAnimation is not a registered globe/map animation: ${explicit}`);
  }
}

if (explicit && !isMapDisabled(story) && !String(story.mapSource || story.source || "").trim()) {
  failures.push("mapAnimation requires a verified mapSource (or source) attribution");
}

if (story.mapData !== undefined && (typeof story.mapData !== "object" || Array.isArray(story.mapData))) {
  failures.push("mapData must be a JSON object");
}

const chapters = Array.isArray(story.chapters) ? story.chapters : [];
if (!chapters.length) failures.push("story has no chapters");

const authoredPlans = [story.animationPlan || story.visualPlan, ...chapters.map((chapter) => chapter.animationPlan || chapter.visualPlan)].filter((plan) => plan !== undefined);
authoredPlans.forEach((plan, index) => {
  const result = normalizeGlobeMapPlan(plan, { duration: Number.POSITIVE_INFINITY, requireLibrary: true });
  result.errors.forEach((error) => failures.push(`animation plan ${index + 1}: ${error}`));
});

let resolvedChapters = [];
if (chapters.length) {
  resolvedChapters = chapters.map((chapter, index) => {
    const resolved = resolveChapterMapAnimation(chapter, story, { format: "landscape", mode: "production" });
    if (explicit && !isMapDisabled(story) && !resolved.animationId) {
      failures.push(`chapters[${index}]: selected map could not be satisfied with verified data (${resolved.reason})`);
    }
    return resolved;
  });
}

if (failures.length) {
  console.error("✗ demo story rejected");
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

const summary = resolvedChapters.map((resolved) => resolved.animationId || "none");
console.log(`✓ ${storyPath}`);
console.log(`  mapAnimation: ${explicit || "auto"}`);
console.log(`  chapters resolved: ${summary.join(", ")}`);
