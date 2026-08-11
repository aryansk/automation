#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = resolve(projectRoot, "stories/hook-test-2026-08-10");
const outputDir = resolve(projectRoot, "stories/globe-zoom-opener-2026-08-10");
const focusZoom = 9.8;

const storyFiles = process.argv.slice(2);
if (!storyFiles.length) {
  console.error("Pass one or more story JSON filenames.");
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });

for (const filename of storyFiles) {
  const sourcePath = resolve(sourceDir, filename);
  const outputPath = resolve(outputDir, filename);
  const story = JSON.parse(readFileSync(sourcePath, "utf8"));

  delete story.openingStyle;
  delete story.openingText;
  delete story.openingSub;
  story.focusZoom = focusZoom;

  writeFileSync(outputPath, `${JSON.stringify(story, null, 2)}\n`);
  console.log(`created ${outputPath}`);
}
