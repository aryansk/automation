#!/usr/bin/env node
/* ============================================================
   build-globe-tour.mjs — build the continuous globe film.

     node scripts/build-globe-tour.mjs \
       --stories stories/a.json,stories/b.json,stories/c.json \
       --output renders/globe-tour-2026-07-25.mp4

   Steps:
     1. narrate the cold open and each story separately with the selected TTS provider
     2. ffprobe every clip and lay them out on one continuous timeline,
        so the globe arrives at a country exactly as its line starts
     3. concatenate the clips into one narration track
     4. write a temp composition carrying the total duration and the
        audio src, then render it

   Timings are derived from the audio rather than guessed, which is why
   the stops land in sync without hand-tuning.

   Flags:
     --skip-narrate   reuse existing wavs
     --gap            silence between stories, default 0.45s
     --travel         seconds the globe spends rotating, default 2.6
     --lead           seconds the globe settles before the line, default 0.35
     --opener         cold open line
     --provider       kokoro | heygen | elevenlabs (default kokoro)
     --voice          provider-specific voice id
     --speed          narration speed, default 1.0
     --fps            default 30
     --quality        draft | standard | high (default high)
   ============================================================ */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, isAbsolute, parse, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

const option = (name, fallback = "") => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith("--") ? args[index + 1] : fallback;
};
const flag = (name) => args.includes(`--${name}`);
const tryRemove = (path) => {
  try {
    rmSync(path, { force: true });
  } catch {
    /* some mounts refuse unlink; harmless, it gets overwritten */
  }
};
const die = (message) => {
  console.error(`✗ build-globe-tour: ${message}`);
  process.exit(1);
};

const HF = option("hyperframes", "0.7.86");
const PROVIDER = option("provider", "kokoro").toLowerCase();
const VOICE = option("voice", PROVIDER === "kokoro" ? "af_heart" : "");
const SPEED = option("speed", "1.0");
const FPS = option("fps", "30");
const QUALITY = option("quality", "high");
const GAP = Number(option("gap", "0.45"));
const TRAVEL = Number(option("travel", "2.6"));
const LEAD = Number(option("lead", "0.35"));
const OPENER = option("opener", "Good morning, bad news.");
/* Space around the cold open: a beat before it speaks, and a longer
   hold after, so the line lands before the globe starts travelling. */
const OPENER_DELAY = Number(option("opener-delay", "0.45"));
const OPENER_HOLD = Number(option("opener-hold", "1.35"));

function run(command, commandArgs, label) {
  console.log(`\n→ ${label}`);
  const environment = { ...process.env };
  const localPython = resolve(projectRoot, ".venv-tts/bin/python");
  if (!environment.HYPERFRAMES_PYTHON && existsSync(localPython)) {
    environment.HYPERFRAMES_PYTHON = localPython;
  }
  const result = spawnSync(command, commandArgs, { cwd: projectRoot, stdio: "inherit", env: environment });
  if (result.error) die(result.error.message);
  if (result.status !== 0) die(`${label} exited with status ${result.status}`);
}

function probeDuration(filePath) {
  const result = spawnSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", filePath],
    { encoding: "utf8" },
  );
  const value = Number(String(result.stdout || "").trim());
  return Number.isFinite(value) && value > 0 ? value : 0;
}

const round = (value) => Number(value.toFixed(3));

/* ---------------- inputs ---------------- */

const storyList = option("stories")
  .split(",")
  .map((entry) => entry.trim())
  .filter(Boolean);
if (!storyList.length) die("pass --stories a.json,b.json,c.json");

const outputArg = option("output", "renders/globe-tour.mp4");
const outputPath = isAbsolute(outputArg) ? outputArg : resolve(projectRoot, outputArg);
mkdirSync(dirname(outputPath), { recursive: true });

const narrationDir = resolve(projectRoot, "assets/narration/tour");
mkdirSync(narrationDir, { recursive: true });

const cities = (() => {
  const source = readFileSync(resolve(projectRoot, "assets/data/city-data.js"), "utf8");
  const start = source.indexOf("[");
  const end = source.lastIndexOf("]");
  try {
    return JSON.parse(source.slice(start, end + 1));
  } catch {
    return [];
  }
})();

const countries = (() => {
  const source = readFileSync(resolve(projectRoot, "assets/data/world-data.js"), "utf8");
  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");
  try {
    return JSON.parse(source.slice(start, end + 1)).features || [];
  } catch {
    return [];
  }
})();

const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/* The globe rotates to a point, so each stop needs a coordinate. Prefer
   the story's city, fall back to the country centroid. */
function resolveCoordinates(story) {
  const code = String(story.countryCode || "US").toUpperCase();
  const wanted = normalize(story.cityName);
  if (wanted) {
    const matches = cities.filter(
      (city) => city[2] === code && (normalize(city[0]) === wanted || normalize(city[1]) === wanted),
    );
    const best = matches.sort((a, b) => b[5] - a[5])[0];
    if (best) return [Number(best[4]), Number(best[3])];
  }
  const country = countries.find((feature) => feature.properties?.code === code);
  const latlng = country?.properties?.latlng;
  if (latlng) return [Number(latlng[1]), Number(latlng[0])];
  return [0, 0];
}

/* ---------------- narrate ---------------- */

const clips = [];

const openerPath = resolve(narrationDir, "00-opener.wav");
if (!flag("skip-narrate") || !existsSync(openerPath)) {
  const openerStory = resolve(narrationDir, "00-opener.json");
  writeFileSync(openerStory, JSON.stringify({ script: OPENER, narrationAudio: `assets/narration/tour/00-opener.wav` }, null, 2));
  const openerNarrationArgs = [
    "run", "narrate", "--", "--story", openerStory,
    "--provider", PROVIDER, "--speed", SPEED,
  ];
  if (VOICE) openerNarrationArgs.push("--voice", VOICE);
  openerNarrationArgs.push("--output", "assets/narration/tour/00-opener.wav");
  run(
    "npm",
    openerNarrationArgs,
    `narrate cold open (${PROVIDER})`,
  );
}
if (!existsSync(openerPath)) die(`cold open narration missing: ${openerPath}`);
clips.push(openerPath);

const stories = storyList.map((entry) => {
  const storyPath = isAbsolute(entry) ? entry : resolve(projectRoot, entry);
  if (!existsSync(storyPath)) die(`story not found: ${storyPath}`);
  return { path: storyPath, slug: parse(storyPath).name, data: JSON.parse(readFileSync(storyPath, "utf8")) };
});

for (const story of stories) {
  const target = resolve(narrationDir, `${story.slug}.wav`);
  if (!flag("skip-narrate") || !existsSync(target)) {
    const scratch = resolve(narrationDir, `${story.slug}.json`);
    writeFileSync(
      scratch,
      JSON.stringify({ script: story.data.script, narrationAudio: `assets/narration/tour/${story.slug}.wav` }, null, 2),
    );
    const storyNarrationArgs = [
      "run", "narrate", "--", "--story", scratch,
      "--provider", PROVIDER, "--speed", SPEED,
    ];
    if (VOICE) storyNarrationArgs.push("--voice", VOICE);
    storyNarrationArgs.push("--output", `assets/narration/tour/${story.slug}.wav`);
    run(
      "npm",
      storyNarrationArgs,
      `narrate ${story.slug} (${PROVIDER})`,
    );
  }
  if (!existsSync(target)) die(`narration missing: ${target}`);
  story.audio = target;
  story.length = probeDuration(target);
  clips.push(target);
}

/* ---------------- lay out the timeline ---------------- */

const openerLength = probeDuration(openerPath);
const openerSpeaksUntil = OPENER_DELAY + openerLength;
let cursor = openerSpeaksUntil + OPENER_HOLD;
const openerEnd = round(openerSpeaksUntil + 0.75);

const tour = stories.map((story, index) => {
  /* The globe starts turning early enough to be settled LEAD seconds
     before the line begins. The first leg gets a longer run-up because
     it also has to travel out of the cold open. */
  const speakAt = cursor;
  const travelTime = index === 0 ? TRAVEL + 0.6 : TRAVEL;
  const arrive = Math.max(0.8, speakAt - LEAD);
  const travelStart = Math.max(index === 0 ? 0.9 : 0, arrive - travelTime);

  cursor = speakAt + story.length + GAP;

  return {
    countryCode: String(story.data.countryCode || "US").toUpperCase(),
    countryName: story.data.countryName || "",
    locationName: story.data.cityName || story.data.countryName || "",
    kicker: story.data.kicker || "",
    headline: story.data.headline || "",
    source: story.data.source || "",
    imagePath: story.data.imageOne || "",
    imageAlt: story.data.imageAlt || "",
    imageCredit: story.data.imageCredit || story.data.source || "",
    focusZoom: Number(story.data.focusZoom || 14.9),
    coordinates: resolveCoordinates(story.data),
    travelStart: round(travelStart),
    speakAt: round(speakAt),
    arrive: round(arrive),
    holdUntil: round(speakAt + story.length + GAP * 0.6),
  };
});

const totalDuration = Math.ceil((cursor + 0.9) * 10) / 10;

console.log("\n── tour ──");
console.log(`  cold open  speaks ${OPENER_DELAY}s, clears ${openerEnd}s  ("${OPENER}")`);
tour.forEach((stop, index) => {
  console.log(
    `  ${index + 1}. ${stop.locationName.padEnd(14)} travel ${stop.travelStart}s → arrive ${stop.arrive}s, speaks ${stop.speakAt}s, holds to ${stop.holdUntil}s`,
  );
});
console.log(`  total ${totalDuration}s`);

/* ---------------- one continuous narration track ---------------- */

const trackPath = resolve(projectRoot, "assets/narration/globe-tour.wav");
/* Each clip is delayed to its own start time rather than butted end to
   end, so the pauses between stories are real silence and the audio
   lines up with the globe arriving. */
const padded = [];
clips.forEach((clip) => padded.push("-i", clip));

const delayFilters = clips
  .map((_, index) => {
    const startAt = (index === 0 ? OPENER_DELAY : tour[index - 1].speakAt) * 1000;
    return `[${index}:a]aresample=24000,adelay=${Math.round(startAt)}|${Math.round(startAt)}[d${index}]`;
  })
  .join(";");
const mixInputs = clips.map((_, index) => `[d${index}]`).join("");
run(
  "ffmpeg",
  [
    "-y", "-loglevel", "error",
    ...padded,
    "-filter_complex",
    `${delayFilters};${mixInputs}amix=inputs=${clips.length}:normalize=0[mixed];[mixed]apad=whole_dur=${totalDuration}[out]`,
    "-map", "[out]",
    trackPath,
  ],
  "place narration on the timeline",
);

/* ---------------- render ---------------- */

const compositionPath = resolve(projectRoot, "index-globe.html");
if (!existsSync(compositionPath)) die("index-globe.html not found");

let html = readFileSync(compositionPath, "utf8");
html = html.replace(/(id="root"[\s\S]*?data-duration=")[\d.]+(")/, `$1${totalDuration}$2`);
html = html.replace(/(id="narration-track"[\s\S]*?data-duration=")[\d.]+(")/, `$1${totalDuration}$2`);
html = html.replace(/(id="narration-track"[\s\S]*?src=")[^"]*(")/, `$1assets/narration/globe-tour.wav$2`);
stories.forEach((story, index) => {
  const imagePath = String(story.data.imageOne || "").trim();
  if (!imagePath) return;
  const slot = new RegExp(`(data-story-image-slot="${index}"[^>]*\\ssrc=")[^"]*(")`);
  html = html.replace(slot, `$1${imagePath}$2`);
});

const renderComposition = "index-globe.__render.html";
const renderCompositionPath = resolve(projectRoot, renderComposition);
writeFileSync(renderCompositionPath, html);

const variablesPath = resolve(narrationDir, "tour-variables.json");
writeFileSync(
  variablesPath,
  JSON.stringify(
    {
      deskName: "IndieHouse.io News",
      edition: stories[0]?.data.edition || "",
      openerLine: OPENER,
      openerSub: `${stories.length} stories · ${stories[0]?.data.edition || ""}`,
      openerEnd,
      tour: JSON.stringify(tour),
      narrationAudio: "assets/narration/globe-tour.wav",
      footerNote: "Context first",
    },
    null,
    2,
  ),
);

if (!flag("skip-render")) {
  run(
    "npx",
    [
      "--yes", `hyperframes@${HF}`, "render", ".",
      "--composition", renderComposition,
      "--variables-file", variablesPath,
      "--output", outputPath,
      "--fps", FPS,
      "--quality", QUALITY,
      "-w", "1",
    ],
    `render globe tour (${totalDuration}s)`,
  );
  tryRemove(renderCompositionPath);
  console.log(`\n✓ ${outputPath}  ${probeDuration(outputPath).toFixed(1)}s`);
} else {
  console.log(`\n✓ timings and narration ready; composition at ${renderComposition}`);
}
