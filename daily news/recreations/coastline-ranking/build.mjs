#!/usr/bin/env node

/* Build the coastline countdown as a separate, source-led green-globe
 * recreation. It does not alter the normal three-story daily bundle. */

import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveMapPlanForScene } from "../../assets/animations/globe-map-runtime.js";
import { TOPIC, NARRATION_SEGMENTS } from "./topic-data.js";

const recreationRoot = resolve(dirname(fileURLToPath(import.meta.url)));
const projectRoot = resolve(recreationRoot, "../..");
const args = process.argv.slice(2);

function option(name, fallback = "") {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith("--")
    ? args[index + 1]
    : fallback;
}

function flag(name) {
  return args.includes(`--${name}`);
}

function die(message) {
  console.error(`✗ coastline recreation: ${message}`);
  process.exit(1);
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: options.stdio || "inherit",
  });
  if (result.error) die(result.error.message);
  if (result.status !== 0) die(`${command} exited with status ${result.status}`);
  return result;
}

function probeDuration(audioPath) {
  const result = spawnSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", audioPath],
    { cwd: projectRoot, encoding: "utf8" },
  );
  const duration = Number(String(result.stdout || "").trim());
  if (!Number.isFinite(duration) || duration <= 0) die(`could not measure narration: ${audioPath}`);
  return Number(duration.toFixed(3));
}

function storyForStop(stop) {
  return {
    countryCode: stop.countryCode,
    countryName: stop.countryName,
    coordinates: stop.coordinates,
    mapAnimation: "country-outline",
    mapData: {
      target: {
        code: stop.countryCode,
        name: stop.countryName,
        country: stop.countryName,
        coordinates: stop.coordinates,
      },
    },
    mapSource: stop.mapSource,
    source: stop.mapSource,
  };
}

function validateMapPlans(stops) {
  stops.forEach((stop, index) => {
    const plan = resolveMapPlanForScene({
      story: storyForStop(stop),
      format: "portrait",
      mode: "production",
      duration: Math.max(0.1, Number(stop.holdUntil) - Number(stop.arrive)),
      requireLibrary: true,
    });
    if (!plan.valid) die(`map plan ${index + 1}: ${plan.errors.join("; ")}`);
  });
}

const outputPath = isAbsolute(option("output"))
  ? option("output")
  : resolve(projectRoot, option("output", "renders/recreations/coastline-ranking-2026-08-12.mp4"));
const quality = option("quality", "high");
const ttsSpeed = option("tts-speed", "1.12");
/* Leave a visible breathing space after every country line. The globe uses
 * this measured gap to pull back to the full Earth before the next lock. */
const narrationGap = 1.0;
const audioDir = resolve(projectRoot, "assets/narration");
const workDir = resolve(recreationRoot, ".work");
const mixPath = resolve(audioDir, "recreation-coastline-mix.wav");
const variablesPath = resolve(workDir, "variables.json");
const compositionPath = resolve(recreationRoot, "index.html");

if (!existsSync(compositionPath)) die(`composition not found: ${compositionPath}`);
mkdirSync(audioDir, { recursive: true });
mkdirSync(workDir, { recursive: true });
mkdirSync(dirname(outputPath), { recursive: true });

const segmentAudio = [];
NARRATION_SEGMENTS.forEach((segment, index) => {
  const slug = `recreation-coastline-${segment.id}`;
  const scratchStoryPath = resolve(workDir, `${slug}.json`);
  const audioPath = resolve(audioDir, `${slug}.wav`);
  writeFileSync(
    scratchStoryPath,
    `${JSON.stringify({ script: segment.script, scriptMaxWords: 42 }, null, 2)}\n`,
  );
  if (!existsSync(audioPath) || flag("regenerate-audio") || (segment.id === "opener" && flag("regenerate-opener"))) {
    run(process.execPath, [
      resolve(projectRoot, "scripts/generate-narration.mjs"),
      "--story", scratchStoryPath,
      "--provider", "kokoro",
      "--voice", "af_heart",
      "--speed", ttsSpeed,
      "--output", audioPath,
    ]);
  } else {
    console.log(`✓ reusing narration: ${relative(projectRoot, audioPath)}`);
  }
  const duration = probeDuration(audioPath);
  segmentAudio.push({ id: segment.id, path: audioPath, duration });
  /* generate-narration writes these two helper files at the project level;
   * the source of truth for this recreation remains topic-data.js. */
  rmSync(resolve(projectRoot, `assets/narration/${slug}.txt`), { force: true });
  rmSync(resolve(projectRoot, `assets/narration/${slug}.words.json`), { force: true });
  rmSync(scratchStoryPath, { force: true });
});

/* Schedule from measured clip lengths instead of guessed timestamps. The
 * previous fixed schedule allowed long lines to run into the next line. */
let narrationCursor = 0.35;
segmentAudio.forEach((entry) => {
  entry.start = Number(narrationCursor.toFixed(3));
  narrationCursor += entry.duration + narrationGap;
});
const lastAudioEnd = Number(
  (segmentAudio.at(-1).start + segmentAudio.at(-1).duration).toFixed(3),
);
const overlap = segmentAudio.slice(1).some((entry, index) => {
  const previous = segmentAudio[index];
  return previous.start + previous.duration > entry.start + 0.001;
});
if (overlap) die("narration schedule still overlaps after measured sequencing");
if (lastAudioEnd > TOPIC.duration - 2.6) {
  die(`narration ends at ${lastAudioEnd}s, leaving too little room for the closer`);
}
console.log(`✓ narration schedule: ${segmentAudio.length} clips, no overlap, final speech ends at ${lastAudioEnd}s`);

const firstSpeakAt = segmentAudio[1].start;
const openerEnd = Number(Math.min(4.3, Math.max(3.1, firstSpeakAt - 0.48)).toFixed(3));
const endCardStart = Number(Math.min(TOPIC.duration - 2.6, Math.max(53.8, lastAudioEnd + 0.48)).toFixed(3));
const endCardReveal = Number((endCardStart + 0.30).toFixed(3));
const stops = TOPIC.chapters.map((chapter, index) => {
  const speakAt = segmentAudio[index + 1].start;
  const nextSpeakAt = segmentAudio[index + 2]?.start || endCardStart;
  const previousAudioEnd = Number(
    (segmentAudio[index].start + segmentAudio[index].duration).toFixed(3),
  );
  const travelStart = index === 0
    ? Math.max(1.6, speakAt - 3.35)
    : Number((previousAudioEnd + 0.05).toFixed(3));
  const arrive = index === 0
    ? Number(Math.max(0.4, speakAt - 0.58).toFixed(3))
    : Number(Math.max(travelStart + 0.1, speakAt - 0.1).toFixed(3));
  const nextTravelStart = index < TOPIC.chapters.length - 1
    ? Number((segmentAudio[index + 1].start + segmentAudio[index + 1].duration + 0.05).toFixed(3))
    : endCardStart;
  return {
    countryCode: chapter.code,
    countryName: chapter.country,
    coordinates: chapter.coordinates,
    mapSource: chapter.mapSource,
    speakAt,
    travelStart,
    arrive,
    holdUntil: Number(Math.max(arrive + 0.1, nextTravelStart - 0.04).toFixed(3)),
    focusZoom: chapter.code === "BA" ? 3.5 : chapter.code === "SR" ? 4.0 : chapter.code === "NA" ? 4.2 : ["FI", "RU"].includes(chapter.code) ? 4.5 : 4.7,
    resetCamera: index > 0,
    freezeMode: ["FI", "RU"].includes(chapter.code) ? (chapter.code === "FI" ? "baltic" : "arctic") : null,
  };
});
validateMapPlans(stops);

const inputs = segmentAudio.flatMap((entry) => ["-i", entry.path]);
const delayed = segmentAudio.map((entry, index) => {
  const delay = Math.max(0, Math.round(entry.start * 1000));
  return `[${index}:a]adelay=${delay}|${delay},apad=whole_dur=${TOPIC.duration}[a${index}]`;
});
const mixLabels = segmentAudio.map((_, index) => `[a${index}]`).join("");
const filterComplex = `${delayed.join(";")};${mixLabels}amix=inputs=${segmentAudio.length}:duration=longest:normalize=0,atrim=duration=${TOPIC.duration},aresample=24000[aout]`;
run("ffmpeg", [
  "-y",
  "-loglevel", "error",
  ...inputs,
  "-filter_complex", filterComplex,
  "-map", "[aout]",
  "-ac", "1",
  "-ar", "24000",
  "-c:a", "pcm_s16le",
  mixPath,
]);

const stopsJson = JSON.stringify(stops);
writeFileSync(
  variablesPath,
  `${JSON.stringify({
    edition: TOPIC.edition,
    deskName: TOPIC.deskName,
    openerSub: TOPIC.openerSub,
    tour: stopsJson,
    duration: TOPIC.duration,
    openerEnd,
    endCardStart,
    endCardReveal,
    narrationAudio: "assets/narration/recreation-coastline-mix.wav",
  }, null, 2)}\n`,
);

if (!flag("skip-render")) {
  run("npx", [
    "--yes",
    "hyperframes@0.7.106",
    "render",
    recreationRoot,
    "--composition", "index.html",
    "--variables-file", variablesPath,
    "--output", outputPath,
    "--fps", "30",
    "--quality", quality,
    "-w", "1",
  ]);
}

const mixDuration = probeDuration(mixPath);
console.log(`✓ narration mix: ${relative(projectRoot, mixPath)} (${mixDuration}s)`);
console.log(`✓ map plans: ${stops.length} country-outline beats validated`);
console.log(`✓ variables: ${relative(projectRoot, variablesPath)}`);
if (!flag("skip-render")) console.log(`✓ render: ${relative(projectRoot, outputPath)}`);
