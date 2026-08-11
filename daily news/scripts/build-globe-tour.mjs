#!/usr/bin/env node
/* ============================================================
   build-globe-tour.mjs — build the continuous globe film.

     node scripts/build-globe-tour.mjs \
       --stories stories/a.json,stories/b.json,stories/c.json \
       --output renders/globe-tour-2026-07-25.mp4

   Steps:
     1. narrate the cold open and each story separately with the selected TTS provider
     2. ffprobe every clip and lay them out on one continuous timeline,
        so the visual handoff starts exactly as the next line starts
     3. concatenate the clips into one narration track
     4. write a temp composition carrying the total duration and the
        audio src, then render it

   Timings are derived from the audio rather than guessed, which is why
   the stops land in sync without hand-tuning.

   Flags:
     --skip-narrate   reuse existing wavs
   --gap            silence between stories, default 0.45s
     --travel         seconds the globe spends rotating, default 2.6
     --tone           good | bad; selects the default opener
     --opener         cold open line
     --opener-title      visual title shown on the opening page
     --cta            spoken end-card line
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
import { normalizeGlobeMapPlan } from "../assets/animations/globe-map-plan.js";
import { resolveMapPlanForScene } from "../assets/animations/globe-map-runtime.js";

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

const HF = option("hyperframes", "0.7.88");
const PROVIDER = option("provider", "kokoro").toLowerCase();
const VOICE = option("voice", PROVIDER === "kokoro" ? "af_heart" : "");
const SPEED = option("speed", "1.0");
const FPS = option("fps", "30");
const QUALITY = option("quality", "high");
const GAP = Number(option("gap", "0.45"));
const TRAVEL = Number(option("travel", "2.6"));
const TONE = option("tone", "bad").toLowerCase();
const OPENER = option(
  "opener",
  TONE === "good" ? "Good morning, good news" : "Good morning, bad news",
);
const requestedOpenerTitle = option(
  "opener-title",
  TONE === "good" ? "Good morning, good news" : "Good morning, bad news",
).trim();
/* Keep the visible title tied to the selected tone even when an old batch
   command accidentally carries the opposite title override. */
const OPENER_TITLE = TONE === "good"
  ? (/good morning,\s*bad news/i.test(requestedOpenerTitle) ? "Good morning, good news" : requestedOpenerTitle)
  : (/good morning,\s*good news/i.test(requestedOpenerTitle) ? "Good morning, bad news" : requestedOpenerTitle);
const CTA = option("cta", "Follow for tomorrow's global brief.").trim();
const ALLOW_HISTORY = flag("allow-history");
/* Keep the first spoken fact close to frame one. Branding is already present
   in the top rail, so the cold open only needs a short landing beat. */
const OPENER_DELAY = Number(option("opener-delay", "0.18"));
const OPENER_HOLD = Number(option("opener-hold", "0.22"));

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
if (storyList.length !== 3) die("pass exactly three stories with --stories a.json,b.json,c.json");

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
  if (
    Array.isArray(story.coordinates)
    && story.coordinates.length === 2
    && story.coordinates.every((value) => Number.isFinite(Number(value)))
  ) {
    return story.coordinates.map(Number);
  }
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

/* Keep good and bad openers in separate files so --skip-narrate can never
   reuse the other edition's voice track. */
const openerSlug = TONE === "good" ? "00-opener-good" : "00-opener-bad";
const openerPath = resolve(narrationDir, `${openerSlug}.wav`);
if (!flag("skip-narrate") || !existsSync(openerPath)) {
  const openerStory = resolve(narrationDir, `${openerSlug}.json`);
  writeFileSync(openerStory, JSON.stringify({ script: OPENER, narrationAudio: `assets/narration/tour/${openerSlug}.wav` }, null, 2));
  const openerNarrationArgs = [
    "run", "narrate", "--", "--story", openerStory,
    "--provider", PROVIDER, "--speed", SPEED,
  ];
  if (VOICE) openerNarrationArgs.push("--voice", VOICE);
  openerNarrationArgs.push("--output", `assets/narration/tour/${openerSlug}.wav`);
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

/* A render is also the point at which a story becomes consumed. Require
   explicit event metadata and reject event/headline/source collisions before
   any narration or rendering work begins. */
const historyArg = option("history", "stories/story-history.json");
const historyPath = isAbsolute(historyArg) ? historyArg : resolve(projectRoot, historyArg);
let history = { version: 1, entries: [] };
if (existsSync(historyPath)) {
  try {
    history = JSON.parse(readFileSync(historyPath, "utf8"));
  } catch (error) {
    die(`history ledger is invalid JSON: ${error.message}`);
  }
}
const historyEntries = Array.isArray(history.entries) ? history.entries : [];
const normalizeKey = (value) => String(value || "")
  .normalize("NFD")
  .replace(/[̀-ͯ]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .trim();
const historyIds = new Set(historyEntries.map((entry) => String(entry.eventId || "").trim()).filter(Boolean));
const historyTitles = new Set(historyEntries.map((entry) => normalizeKey(entry.titleKey || entry.headline)).filter(Boolean));
const historyUrls = new Set(
  historyEntries.flatMap((entry) => Array.isArray(entry.sourceUrls) ? entry.sourceUrls : []).map((url) => String(url).trim()).filter(Boolean),
);
const seenIds = new Set();
const seenTitles = new Set();
const seenUrls = new Set();
const ranks = [];
stories.forEach((story) => {
  const eventId = String(story.data.eventId || "").trim();
  const titleKey = normalizeKey(story.data.headline);
  const sourceUrls = Array.isArray(story.data.sources)
    ? story.data.sources.map((source) => String(source?.url || "").trim()).filter(Boolean)
    : [];
  if (!eventId) die(`${story.slug}: eventId is required for deduplication`);
  if (story.data.tone !== TONE) die(`${story.slug}: tone must be ${TONE}`);
  if (!ALLOW_HISTORY && historyIds.has(eventId)) die(`${story.slug}: eventId already exists in story history`);
  if (!ALLOW_HISTORY && historyTitles.has(titleKey)) die(`${story.slug}: headline already exists in story history`);
  if (seenIds.has(eventId)) die(`${story.slug}: duplicate eventId in this bundle`);
  if (seenTitles.has(titleKey)) die(`${story.slug}: duplicate headline in this bundle`);
  if (!Array.isArray(story.data.sources) || story.data.sources.length < 2) die(`${story.slug}: at least two sources are required`);
  if (!Array.isArray(story.data.captions) || story.data.captions.length < 2) die(`${story.slug}: captions are required`);
  if (!Number.isInteger(Number(story.data.selection?.trendRank)) || Number(story.data.selection.trendRank) < 1 || Number(story.data.selection.trendRank) > 3) {
    die(`${story.slug}: selection.trendRank must be 1, 2 or 3`);
  }
  ranks.push(Number(story.data.selection.trendRank));
  for (const url of sourceUrls) {
    if (!ALLOW_HISTORY && historyUrls.has(url)) die(`${story.slug}: source URL already exists in story history`);
    if (seenUrls.has(url)) die(`${story.slug}: source URL is reused within this bundle`);
    seenUrls.add(url);
  }
  seenIds.add(eventId);
  seenTitles.add(titleKey);
});

stories.forEach((story) => {
  const authoredPlan = story.data.animationPlan || story.data.visualPlan;
  const plan = normalizeGlobeMapPlan(authoredPlan, { duration: 18, requireLibrary: true });
  if (!plan.valid) die(`${story.slug}: ${plan.errors.join("; ")}`);
  const resolvedPlan = resolveMapPlanForScene({
    story: story.data,
    format: "portrait",
    mode: "production",
    duration: 18,
    requireLibrary: true,
  });
  if (!resolvedPlan.valid) die(`${story.slug}: ${resolvedPlan.errors.join("; ")}`);
});
if (new Set(ranks).size !== 3) die("selection.trendRank must contain unique values 1, 2 and 3");

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

const endCtaPath = resolve(narrationDir, "99-end-cta.wav");
if (!flag("skip-narrate") || !existsSync(endCtaPath)) {
  const endCtaStory = resolve(narrationDir, "99-end-cta.json");
  writeFileSync(
    endCtaStory,
    JSON.stringify({ script: CTA, narrationAudio: "assets/narration/tour/99-end-cta.wav" }, null, 2),
  );
  const endCtaNarrationArgs = [
    "run", "narrate", "--", "--story", endCtaStory,
    "--provider", PROVIDER, "--speed", SPEED,
  ];
  if (VOICE) endCtaNarrationArgs.push("--voice", VOICE);
  endCtaNarrationArgs.push("--output", "assets/narration/tour/99-end-cta.wav");
  run("npm", endCtaNarrationArgs, `narrate end-card CTA (${PROVIDER})`);
}
if (!existsSync(endCtaPath)) die(`end-card narration missing: ${endCtaPath}`);
const endCtaLength = probeDuration(endCtaPath);
if (!endCtaLength) die(`end-card narration has no measurable duration: ${endCtaPath}`);
clips.push(endCtaPath);

/* ---------------- lay out the timeline ---------------- */

const openerLength = probeDuration(openerPath);
const openerSpeaksUntil = OPENER_DELAY + openerLength;
let cursor = openerSpeaksUntil + OPENER_HOLD;
const openerEnd = round(openerSpeaksUntil + 0.35);

const tour = stories.map((story, index) => {
  /* The first leg can use the hook as its run-up. Later legs begin at the
     exact narration handoff so the outgoing story remains on screen until
     the next line says its place name. */
  const speakAt = cursor;
  const travelTime = index === 0 ? TRAVEL + 0.6 : TRAVEL;
  const arrive = index === 0 ? speakAt : speakAt + travelTime;
  const travelStart = index === 0
    ? Math.max(0.8, arrive - travelTime)
    : speakAt;

  cursor = speakAt + story.length + GAP;

  return {
    countryCode: String(story.data.countryCode || "US").toUpperCase(),
    countryName: story.data.countryName || "",
    locationName: story.data.cityName || story.data.countryName || "",
    kicker: story.data.kicker || "",
    headline: story.data.headline || "",
    deck: story.data.summary || "",
    source: story.data.source || "",
    imagePath: story.data.imageOne || "",
    imagePathTwo: story.data.imageTwo || story.data.imageOne || "",
    imageAlt: story.data.imageAlt || "",
    imageAltTwo: story.data.imageAltTwo || story.data.imageAlt || "",
    imageCredit: story.data.imageCredit || story.data.source || "",
    imageCreditTwo: story.data.imageCreditTwo || story.data.imageCredit || story.data.source || "",
    routeLabel: story.data.routeLabel || "",
    mapAnimation: story.data.mapAnimation || story.data.animationId || story.data.animation || story.data.visualType || "",
    mapData: story.data.mapData || null,
    mapSource: story.data.mapSource || story.data.source || "",
    animationPlan: story.data.animationPlan || story.data.visualPlan || null,
    routePoints: Array.isArray(story.data.routePoints)
      ? story.data.routePoints.map((point) => ({
          label: String(point.label || ""),
          coordinates: Array.isArray(point.coordinates)
            ? point.coordinates.map((value) => Number(value))
            : [0, 0],
        }))
      : [],
    mentionedCountryCodes: Array.isArray(story.data.mentionedCountryCodes)
      ? story.data.mentionedCountryCodes.map((code) => String(code || "").toUpperCase())
      : [],
    affectedCountryCodes: Array.isArray(story.data.affectedCountryCodes)
      ? story.data.affectedCountryCodes.map((code) => String(code || "").toUpperCase())
      : String(story.data.affectedCountryCodes || "")
          .split(/\s+/)
          .map((code) => code.toUpperCase())
          .filter(Boolean),
    locatorInset: Boolean(story.data.locatorInset),
    focusZoom: Number(story.data.focusZoom || 14.9),
    coordinates: resolveCoordinates(story.data),
    travelStart: round(travelStart),
    speakAt: round(speakAt),
    arrive: round(arrive),
    holdUntil: round(speakAt + story.length + GAP * 0.6),
  };
});

const ctaStart = round(cursor);
const endCardStart = round(Math.max(0, ctaStart - 0.18));
const endCardReveal = round(endCardStart + 0.22);
const totalDuration = Math.ceil((ctaStart + endCtaLength + 0.55) * 10) / 10;

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

const clipStarts = [OPENER_DELAY, ...tour.map((stop) => stop.speakAt), ctaStart];
const delayFilters = clips
  .map((_, index) => {
    const startAt = clipStarts[index] * 1000;
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

const compositionPath = resolve(projectRoot, "index.html");
if (!existsSync(compositionPath)) die("index.html not found");

let html = readFileSync(compositionPath, "utf8");
html = html.replace(/(id="root"[\s\S]*?data-duration=")[\d.]+(")/, `$1${totalDuration}$2`);
html = html.replace(/(id="narration-track"[\s\S]*?data-duration=")[\d.]+(")/, `$1${totalDuration}$2`);
html = html.replace(/(id="narration-track"[\s\S]*?src=")[^"]*(")/, `$1assets/narration/globe-tour.wav$2`);
stories.forEach((story, index) => {
  const imagePaths = [
    ["primary", String(story.data.imageOne || "").trim()],
    ["secondary", String(story.data.imageTwo || story.data.imageOne || "").trim()],
  ];
  imagePaths.forEach(([variant, imagePath]) => {
    if (!imagePath) return;
    const slot = new RegExp(`(data-story-image-slot="${index}-${variant}"[^>]*\\ssrc=")[^"]*(")`);
    html = html.replace(slot, `$1${imagePath}$2`);
  });
});

const renderComposition = "index.__render.html";
const renderCompositionPath = resolve(projectRoot, renderComposition);
writeFileSync(renderCompositionPath, html);

const variablesPath = resolve(narrationDir, "tour-variables.json");
writeFileSync(
  variablesPath,
  JSON.stringify(
    {
      deskName: "IndieHouse.io News",
      edition: stories[0]?.data.edition || "",
      openerTitle: OPENER_TITLE,
      openerLine: OPENER,
      openerSub: `Global brief · ${stories[0]?.data.edition || ""}`,
      openerEnd,
      endCardStart,
      endCardReveal,
      tour: JSON.stringify(tour),
      narrationAudio: "assets/narration/globe-tour.wav",
      footerNote: "Context first",
      ctaLine: "Follow for tomorrow’s global brief.",
      ctaSource: "Sources in description.",
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
  const recordedAt = new Date().toISOString();
  const nextHistory = {
    ...history,
    version: Number(history.version || 1),
    entries: [
      ...historyEntries,
      ...stories.filter((story) => !historyIds.has(story.data.eventId)).map((story) => ({
        eventId: story.data.eventId,
        titleKey: story.data.headline,
        sourceUrls: Array.isArray(story.data.sources) ? story.data.sources.map((source) => source.url).filter(Boolean) : [],
        file: story.path,
        tone: TONE,
        edition: story.data.edition || "",
        output: outputPath,
        recordedAt,
      })),
    ],
  };
  writeFileSync(historyPath, `${JSON.stringify(nextHistory, null, 2)}\n`);
  console.log(`  recorded ${nextHistory.entries.length - historyEntries.length} new stories in ${historyPath}`);
  console.log(`\n✓ ${outputPath}  ${probeDuration(outputPath).toFixed(1)}s`);
} else {
  console.log(`\n✓ timings and narration ready; composition at ${renderComposition}`);
}
