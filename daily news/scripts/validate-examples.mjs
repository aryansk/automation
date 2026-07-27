#!/usr/bin/env node

import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const examplesDirectory = resolve("stories/examples");
const examples = readdirSync(examplesDirectory)
  .filter((file) => file.endsWith(".json"))
  .sort();

let failed = false;
for (const example of examples) {
  const storyPath = `stories/examples/${example}`;
  const result = spawnSync(process.execPath, ["scripts/validate-story.mjs", "--story", storyPath], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  if (result.status !== 0) failed = true;
}

if (examples.length < 5) {
  console.error(`✗ Expected at least five example stories; found ${examples.length}`);
  failed = true;
}

if (failed) process.exit(1);
console.log(`✓ ${examples.length} example stories passed reusable metadata validation`);
