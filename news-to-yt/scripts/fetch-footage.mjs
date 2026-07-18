#!/usr/bin/env node
// Download stock footage clips from Pexels for given search keywords.
// Requires PEXELS_API_KEY in the environment.
// Usage: node fetch-footage.mjs <outDir> <orientation> "kw1" "kw2" ...
//   PEXELS_API_KEY=xxx node fetch-footage.mjs runs/2026-06-19/technology landscape "smart glasses" "ai servers"
// Downloads one HD clip per keyword into <outDir>/footage/ and writes footage.json.

import { mkdirSync, writeFileSync, createWriteStream } from "node:fs";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const KEY = process.env.PEXELS_API_KEY;
if (!KEY) {
  console.error("ERROR: PEXELS_API_KEY not set. Get a free key at https://www.pexels.com/api/");
  process.exit(1);
}

const [, , outDir, orientation = "landscape", ...keywords] = process.argv;
if (!outDir || keywords.length === 0) {
  console.error('Usage: node fetch-footage.mjs <outDir> <landscape|portrait> "kw1" "kw2" ...');
  process.exit(1);
}

const footDir = join(outDir, "footage");
mkdirSync(footDir, { recursive: true });

// Pick the best progressive MP4 file at/under target width for the orientation.
function pickFile(files, orientation) {
  const targetW = orientation === "portrait" ? 1080 : 1920;
  const mp4s = files
    .filter((f) => f.file_type === "video/mp4" && f.width && f.height)
    .filter((f) => (orientation === "portrait" ? f.height >= f.width : f.width >= f.height))
    .sort((a, b) => a.width - b.width);
  return mp4s.find((f) => f.width >= targetW) || mp4s[mp4s.length - 1] || files[0];
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download HTTP ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

const manifest = [];
for (let i = 0; i < keywords.length; i++) {
  const kw = keywords[i];
  const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(kw)}&orientation=${orientation}&per_page=5&size=medium`;
  const res = await fetch(url, { headers: { Authorization: KEY } });
  if (!res.ok) {
    console.error(`WARN: search "${kw}" -> HTTP ${res.status}`);
    continue;
  }
  const data = await res.json();
  const video = data.videos?.[0];
  if (!video) {
    console.error(`WARN: no results for "${kw}"`);
    continue;
  }
  const file = pickFile(video.video_files, orientation);
  const name = `clip_${String(i + 1).padStart(2, "0")}.mp4`;
  const dest = join(footDir, name);
  process.stderr.write(`Downloading "${kw}" -> ${name} (${file.width}x${file.height}) ... `);
  await download(file.link, dest);
  console.error("done");
  manifest.push({
    keyword: kw,
    file: `footage/${name}`,
    width: file.width,
    height: file.height,
    pexelsUrl: video.url,
    photographer: video.user?.name,
  });
}

writeFileSync(join(outDir, "footage.json"), JSON.stringify({ orientation, clips: manifest }, null, 2));
console.error(`\nSaved ${manifest.length} clips -> ${outDir}/footage.json`);
console.log(JSON.stringify({ orientation, clips: manifest }, null, 2));
