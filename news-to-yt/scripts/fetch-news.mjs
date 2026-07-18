#!/usr/bin/env node
// Fetch top news stories for a topic from RSS feeds (no dependencies).
// Usage: node fetch-news.mjs <topic> [count]
//   node fetch-news.mjs technology 5
// Writes JSON to stdout and to runs/<date>/<topic>/news.json

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const config = JSON.parse(readFileSync(join(ROOT, "config.json"), "utf8"));

const topicKey = (process.argv[2] || "world").toLowerCase();
const count = parseInt(process.argv[3] || config.defaultStoriesPerVideo, 10);

const topic = config.topics[topicKey];
if (!topic) {
  console.error(`Unknown topic "${topicKey}". Available: ${Object.keys(config.topics).join(", ")}`);
  process.exit(1);
}

function decode(s = "") {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'")
    .replace(/<[^>]+>/g, "").trim();
}

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decode(m[1]) : "";
}

async function parseFeed(url) {
  const res = await fetch(url, { headers: { "User-Agent": "news-to-yt/1.0" } });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  const xml = await res.text();
  const items = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map((m) => m[0]);
  return items.map((b) => ({
    title: tag(b, "title"),
    description: tag(b, "description"),
    link: tag(b, "link"),
    pubDate: tag(b, "pubDate"),
  }));
}

const all = [];
for (const feed of topic.feeds) {
  try {
    all.push(...(await parseFeed(feed)));
  } catch (e) {
    console.error(`WARN: ${e.message}`);
  }
}

// Dedupe by title, keep order, take top N
const seen = new Set();
const stories = [];
for (const s of all) {
  const key = s.title.toLowerCase();
  if (!s.title || seen.has(key)) continue;
  seen.add(key);
  stories.push(s);
  if (stories.length >= count) break;
}

const date = new Date().toISOString().slice(0, 10);
const out = {
  topic: topicKey,
  topicLabel: topic.label,
  date,
  generatedAt: new Date().toISOString(),
  stories,
};

const outDir = join(ROOT, "runs", date, topicKey);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "news.json"), JSON.stringify(out, null, 2));

console.log(JSON.stringify(out, null, 2));
console.error(`\nSaved ${stories.length} stories -> runs/${date}/${topicKey}/news.json`);
