#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const option = (name, fallback = "") => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith("--") ? args[index + 1] : fallback;
};

const tone = option("tone", "").toLowerCase();
const storyList = option("stories")
  .split(",")
  .map((entry) => entry.trim())
  .filter(Boolean);
const historyArg = option("history", "stories/story-history.json");
const historyPath = isAbsolute(historyArg) ? historyArg : resolve(projectRoot, historyArg);
const failures = [];
const normalize = (value) => String(value || "")
  .normalize("NFD")
  .replace(/[̀-ͯ]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

if (storyList.length !== 3) failures.push(`exactly 3 story files are required; received ${storyList.length}`);
if (!/^(good|bad)$/.test(tone)) failures.push("--tone must be good or bad");
if (!existsSync(historyPath)) failures.push(`history ledger not found: ${historyPath}`);

let history = { entries: [] };
if (existsSync(historyPath)) {
  try {
    history = JSON.parse(readFileSync(historyPath, "utf8"));
  } catch (error) {
    failures.push(`history ledger is invalid JSON: ${error.message}`);
  }
}

const historyEntries = Array.isArray(history.entries) ? history.entries : [];
const historyIds = new Set(historyEntries.map((entry) => String(entry.eventId || "").trim()).filter(Boolean));
const historyTitles = new Set(historyEntries.map((entry) => normalize(entry.titleKey || entry.headline)).filter(Boolean));
const historyUrls = new Set(
  historyEntries.flatMap((entry) => Array.isArray(entry.sourceUrls) ? entry.sourceUrls : []).map((url) => String(url).trim()).filter(Boolean),
);
const seenIds = new Set();
const seenTitles = new Set();
const seenUrls = new Set();
const stories = [];

for (const entry of storyList) {
  const storyPath = isAbsolute(entry) ? entry : resolve(projectRoot, entry);
  if (!existsSync(storyPath)) {
    failures.push(`story not found: ${storyPath}`);
    continue;
  }
  let story;
  try {
    story = JSON.parse(readFileSync(storyPath, "utf8"));
  } catch (error) {
    failures.push(`invalid story JSON ${entry}: ${error.message}`);
    continue;
  }
  stories.push({ path: storyPath, data: story });
  const eventId = String(story.eventId || "").trim();
  const titleKey = normalize(story.headline);
  const urls = Array.isArray(story.sources) ? story.sources.map((source) => String(source?.url || "").trim()).filter(Boolean) : [];
  if (!eventId) failures.push(`${entry}: eventId is required for deduplication`);
  if (!titleKey) failures.push(`${entry}: headline is required for deduplication`);
  if (story.tone !== tone) failures.push(`${entry}: tone must be ${tone}`);
  if (!Array.isArray(story.sources) || story.sources.length < 2) failures.push(`${entry}: at least two source records are required`);
  if (!Array.isArray(story.captions) || story.captions.length < 2) failures.push(`${entry}: captions are required`);
  if (seenIds.has(eventId)) failures.push(`${entry}: duplicate eventId in this bundle: ${eventId}`);
  if (seenTitles.has(titleKey)) failures.push(`${entry}: duplicate headline in this bundle`);
  if (historyIds.has(eventId)) failures.push(`${entry}: eventId already exists in story history: ${eventId}`);
  if (historyTitles.has(titleKey)) failures.push(`${entry}: headline already exists in story history`);
  for (const url of urls) {
    if (seenUrls.has(url)) failures.push(`${entry}: source URL is reused within this bundle: ${url}`);
    if (historyUrls.has(url)) failures.push(`${entry}: source URL already exists in story history: ${url}`);
    seenUrls.add(url);
  }
  seenIds.add(eventId);
  seenTitles.add(titleKey);
}

const ranks = stories.map(({ data }) => Number(data.selection?.trendRank));
if (ranks.some((rank) => !Number.isInteger(rank) || rank < 1 || rank > 3) || new Set(ranks).size !== ranks.length) {
  failures.push("selection.trendRank must contain the unique values 1, 2 and 3");
}
const numbers = stories.map(({ data }) => String(data.storyNumber || ""));
if (numbers.length === 3 && numbers.join(",") !== "01,02,03") failures.push("storyNumber must be exactly 01, 02, 03");

if (failures.length) {
  console.error("✗ daily bundle rejected");
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log(`✓ ${tone} daily bundle passes: 3 distinct stories, 3 unique trend ranks, no history/source collision`);
