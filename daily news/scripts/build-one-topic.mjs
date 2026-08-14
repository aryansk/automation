#!/usr/bin/env node

/*
 * Build one or more current stories as independent vertical Shorts.
 *
 * This is the optional standalone distribution path. The daily edition still
 * uses build-globe-tour.mjs and requires exactly three stories; this builder
 * renders each story as its own portrait video and writes a manifest that can
 * be consumed by a later upload step.
 *
 * Examples:
 *   npm run build:standalone -- --story stories/good-story.json
 *   npm run build:standalone -- \
 *     --stories stories/good-1.json,stories/good-2.json,stories/bad-1.json \
 *     --output-dir renders/2026-08-06-standalone --skip-narrate
 */

import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, isAbsolute, parse, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeGlobeMapPlan } from "../assets/animations/globe-map-plan.js";
import { resolveMapPlanForScene } from "../assets/animations/globe-map-runtime.js";
import { HYPERFRAMES_VERSION } from "./hyperframes-version.mjs";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

const option = (name, fallback = "") => {
  const index = args.indexOf(`--${name}`);
  const value = index >= 0 ? args[index + 1] : undefined;
  return value && !value.startsWith("--") ? value : fallback;
};

const flag = (name) => args.includes(`--${name}`);
const round = (value) => Number(Number(value).toFixed(3));
const projectPath = (value) => (isAbsolute(value) ? value : resolve(projectRoot, value));
const projectRelative = (value) => relative(projectRoot, value).split("\\").join("/");
const slugify = (value) => String(value || "story")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "") || "story";

const die = (message) => {
  console.error(`✗ build-standalone: ${message}`);
  process.exit(1);
};

const usage = () => {
  console.log(`Usage:
  npm run build:standalone -- --story stories/story.json [options]
  npm run build:standalone -- --stories stories/a.json,stories/b.json [options]

Options:
  --output PATH              Exact output path; valid with one story only
  --output-dir DIR           Directory for batch outputs (default renders/standalone)
  --manifest PATH            Manifest path (default renders/manifests/<batch>__standalone-manifest.json)
  --skip-narrate              Require existing narration instead of generating it
  --skip-render               Validate and prepare audio/variables without rendering
  --keep-work                 Keep generated work files for inspection
  --provider PROVIDER         kokoro, heygen, or elevenlabs (default kokoro)
  --voice VOICE               Provider voice (default af_heart)
  --speed SPEED               TTS speed (default 1.0)
  --fps FPS                   Render frame rate (default 30)
  --quality QUALITY           draft, standard, or high (default high)
  --hyperframes VERSION       HyperFrames version (default: package.json pin)
  --tone good|bad             Require one tone for every input story
  --cta TEXT                  Spoken end-card line (regenerates the CTA audio)
  --gap SECONDS               Gap before the end card (default 0.45)
  --travel SECONDS            Globe travel time (default 2.6)
  --max-story-duration SEC    Maximum story narration duration (default 18)
  --help                     Show this help`);
};

if (flag("help") || flag("h")) {
  usage();
  process.exit(0);
}

const HF = option("hyperframes", HYPERFRAMES_VERSION);
const PROVIDER = option("provider", "kokoro").toLowerCase();
const VOICE = option("voice", PROVIDER === "kokoro" ? "af_heart" : "");
const SPEED = option("speed", "1.0");
const FPS = option("fps", "30");
const QUALITY = option("quality", "high");
const GAP = Number(option("gap", "0.45"));
const TRAVEL = Number(option("travel", "2.6"));
const MAX_STORY_DURATION = Number(option("max-story-duration", "18"));
const FORCED_TONE = option("tone", "").trim().toLowerCase();
const CTA = option("cta", "Follow for tomorrow's global brief.").trim();
const SKIP_NARRATE = flag("skip-narrate");
const SKIP_RENDER = flag("skip-render");
const KEEP_WORK = flag("keep-work");

if (!["kokoro", "heygen", "elevenlabs"].includes(PROVIDER)) {
  die(`unknown provider "${PROVIDER}"; use kokoro, heygen, or elevenlabs`);
}
if (!Number.isFinite(GAP) || GAP < 0) die("--gap must be a non-negative number");
if (!Number.isFinite(TRAVEL) || TRAVEL <= 0) die("--travel must be greater than zero");
if (!Number.isFinite(MAX_STORY_DURATION) || MAX_STORY_DURATION <= 0) {
  die("--max-story-duration must be greater than zero");
}
if (FORCED_TONE && !["good", "bad"].includes(FORCED_TONE)) {
  die("--tone must be good or bad");
}

function run(command, commandArgs, label) {
  console.log(`\n→ ${label}`);
  const localPython = resolve(projectRoot, ".venv-tts/bin/python");
  const environment = { ...process.env };
  if (!environment.HYPERFRAMES_PYTHON && existsSync(localPython)) {
    environment.HYPERFRAMES_PYTHON = localPython;
  }
  const result = spawnSync(command, commandArgs, {
    cwd: projectRoot,
    stdio: "inherit",
    env: environment,
  });
  if (result.error) die(result.error.message);
  if (result.status !== 0) die(`${label} exited with status ${result.status}`);
}

function probeDuration(filePath) {
  const result = spawnSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", filePath],
    { encoding: "utf8" },
  );
  const duration = Number(String(result.stdout || "").trim());
  return Number.isFinite(duration) && duration > 0 ? duration : 0;
}

function probeVideo(filePath) {
  const result = spawnSync(
    "ffprobe",
    [
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream=width,height,duration",
      "-of", "json",
      filePath,
    ],
    { encoding: "utf8" },
  );
  try {
    const stream = JSON.parse(result.stdout || "{}").streams?.[0] || {};
    return {
      width: Number(stream.width || 0),
      height: Number(stream.height || 0),
      duration: Number(stream.duration || probeDuration(filePath)),
    };
  } catch {
    return { width: 0, height: 0, duration: 0 };
  }
}

function readStory(storyPath) {
  try {
    return JSON.parse(readFileSync(storyPath, "utf8"));
  } catch (error) {
    die(`invalid story JSON ${storyPath}: ${error.message}`);
  }
}

function parseStoryPaths() {
  const single = option("story", "").trim();
  const many = option("stories", "").trim();
  if (single && many) die("use --story or --stories, not both");
  const values = (single ? [single] : many.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
  if (!values.length) die("pass --story stories/story.json or --stories a.json,b.json");
  const paths = values.map(projectPath);
  const unique = new Set(paths);
  if (unique.size !== paths.length) die("the same story file was passed more than once");
  paths.forEach((path) => {
    if (!existsSync(path)) die(`story not found: ${path}`);
  });
  return paths;
}

function parseDataFile(filePath, startToken, endToken) {
  const source = readFileSync(filePath, "utf8");
  const start = source.indexOf(startToken);
  const end = source.lastIndexOf(endToken);
  if (start < 0 || end < start) return null;
  try {
    return JSON.parse(source.slice(start, end + endToken.length));
  } catch {
    return null;
  }
}

const cityData = parseDataFile(resolve(projectRoot, "assets/data/city-data.js"), "[", "]") || [];
const countryData = parseDataFile(resolve(projectRoot, "assets/data/world-data.js"), "{", "}")?.features || [];

const normalize = (value) => String(value || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

function resolveCoordinates(story) {
  if (
    Array.isArray(story.coordinates)
    && story.coordinates.length === 2
    && story.coordinates.every((value) => Number.isFinite(Number(value)))
  ) {
    return story.coordinates.map(Number);
  }

  const countryCode = String(story.countryCode || "").toUpperCase();
  const cityName = normalize(story.cityName);
  if (cityName && Array.isArray(cityData)) {
    const matches = cityData.filter(
      (city) => city[2] === countryCode
        && (normalize(city[0]) === cityName || normalize(city[1]) === cityName),
    );
    const best = matches.sort((a, b) => Number(b[5] || 0) - Number(a[5] || 0))[0];
    if (best) return [Number(best[4]), Number(best[3])];
  }

  const country = countryData.find((feature) => feature.properties?.code === countryCode);
  const latlng = country?.properties?.latlng;
  if (Array.isArray(latlng) && latlng.length === 2) return [Number(latlng[1]), Number(latlng[0])];
  return [0, 0];
}

function normalizeCodes(value) {
  if (Array.isArray(value)) {
    return value.map((code) => String(code || "").toUpperCase()).filter(Boolean);
  }
  return String(value || "").split(/\s+/).map((code) => code.toUpperCase()).filter(Boolean);
}

function resolveTone(story) {
  const tone = FORCED_TONE || String(story.tone || "").trim().toLowerCase();
  if (!["good", "bad"].includes(tone)) {
    die(`${story.eventId || story.headline || "story"}: tone must be good or bad`);
  }
  if (FORCED_TONE && story.tone && String(story.tone).toLowerCase() !== FORCED_TONE) {
    die(`${story.eventId || story.headline || "story"}: --tone ${FORCED_TONE} does not match story tone ${story.tone}`);
  }
  return tone;
}

function audioExtension() {
  return PROVIDER === "elevenlabs" ? ".mp3" : ".wav";
}

function ensureNarration({ story, storyPath, outputPath, scratchPath, label, force = false }) {
  if (existsSync(outputPath) && !force) return;
  if (SKIP_NARRATE) {
    die(force
      ? `${label} narration must be regenerated, but --skip-narrate was supplied`
      : `${label} narration missing: ${outputPath}`);
  }
  mkdirSync(dirname(outputPath), { recursive: true });
  const scratchStory = {
    ...story,
    narrationAudio: projectRelative(outputPath),
  };
  writeFileSync(scratchPath, `${JSON.stringify(scratchStory, null, 2)}\n`);
  const narrationArgs = [
    "run", "narrate", "--",
    "--story", scratchPath,
    "--provider", PROVIDER,
    "--speed", SPEED,
    "--output", projectRelative(outputPath),
  ];
  if (VOICE) narrationArgs.push("--voice", VOICE);
  run("npm", narrationArgs, `narrate ${label}`);
  if (!existsSync(outputPath)) die(`narration command completed without creating ${outputPath}`);
  if (storyPath && !existsSync(storyPath)) die(`story disappeared during narration: ${storyPath}`);
}

function buildStop(story, storyLength, storySpeakAt) {
  const authoredAt = (field, fallback = null) => {
    const value = Number(story[field]);
    if (!Number.isFinite(value)) return fallback;
    return round(storySpeakAt + Math.max(0, value));
  };
  const visualStart = authoredAt("visualStart", round(storySpeakAt));
  return {
    countryCode: String(story.countryCode || "US").toUpperCase(),
    countryName: story.countryName || "",
    locationName: story.cityName || story.countryName || "",
    kicker: story.kicker || "",
    headline: story.headline || "",
    factLine: story.factLine || "",
    deck: story.summary || "",
    source: story.source || "",
    imagePath: story.imageOne || "",
    imagePathTwo: story.imageTwo || story.imageOne || "",
    imageAlt: story.imageAlt || "News photograph",
    imageAltTwo: story.imageAltTwo || story.imageAlt || "News photograph",
    imageCredit: story.imageCredit || story.source || "",
    imageCreditTwo: story.imageCreditTwo || story.imageCredit || story.source || "",
    coordinates: resolveCoordinates(story),
    routePoints: Array.isArray(story.routePoints) ? story.routePoints : [],
    mentionedCountryCodes: normalizeCodes(story.mentionedCountryCodes),
    affectedCountryCodes: normalizeCodes(story.affectedCountryCodes),
    focusZoom: Number(story.focusZoom || 14.9),
    storyType: story.storyType || "auto",
    mapAnimation: story.mapAnimation || story.animationId || story.animation || story.visualType || "",
    mapData: story.mapData || null,
    mapSource: story.mapSource || story.source || "",
    animationPlan: story.animationPlan || story.visualPlan || null,
    storyLength: round(storyLength),
    captions: Array.isArray(story.captions) ? story.captions : [],
    captionTimings: Array.isArray(story.captionTimings) ? story.captionTimings : [],
    visualBeats: Array.isArray(story.visualBeats) ? story.visualBeats : [],
    visualStart,
    mediaStart: authoredAt("mediaStart", visualStart),
    cardStart: authoredAt("cardStart", visualStart),
    photoSwapAt: authoredAt("photoSwapAt", null),
    imageFocusPrimary: story.imageFocusPrimary || "",
    imageFocusSecondary: story.imageFocusSecondary || "",
    travelStart: round(Math.max(0.8, storySpeakAt - TRAVEL)),
    speakAt: round(storySpeakAt),
    arrive: round(storySpeakAt),
    holdUntil: round(storySpeakAt + storyLength + GAP * 0.6),
  };
}

function writeNarrationTrack({ tracks, starts, totalDuration, outputPath }) {
  const inputs = Array.isArray(tracks) ? tracks.filter(Boolean) : [];
  if (!inputs.length || inputs.length !== starts.length) die("narration track inputs and starts must match");
  const filters = inputs.map((_, index) => {
    const delay = Math.round(Number(starts[index]) * 1000);
    return `[${index}:a]aresample=24000,adelay=${delay}|${delay}[d${index}]`;
  });
  const mixed = inputs.map((_, index) => `[d${index}]`).join("");
  run(
    "ffmpeg",
    [
      "-y", "-loglevel", "error",
      ...inputs.flatMap((input) => ["-i", input]),
      "-filter_complex",
      `${filters.join(";")};${mixed}amix=inputs=${inputs.length}:normalize=0[mixed];[mixed]loudnorm=I=-19:TP=-1.5:LRA=7:linear=true[limited];[limited]apad=whole_dur=${totalDuration}[out]`,
      "-map", "[out]",
      "-t", String(totalDuration),
      "-ar", "24000",
      "-ac", "1",
      outputPath,
    ],
    `place standalone narration (${totalDuration}s)`,
  );
  if (!existsSync(outputPath) || !probeDuration(outputPath)) die(`mixed narration missing: ${outputPath}`);
}

function replaceComposition(sourceHtml, { duration, narrationPath, story }) {
  let html = sourceHtml
    .replace(/(id="root"[\s\S]*?data-duration=")[\d.]+(")/, `$1${duration}$2`)
    .replace(/(id="narration-track"[\s\S]*?data-duration=")[\d.]+(")/, `$1${duration}$2`)
    .replace(/(id="narration-track"[\s\S]*?src=")[^"]*(")/, `$1${projectRelative(narrationPath)}$2`);

  for (const [slot, imagePath] of [
    ["0-primary", story.imageOne],
    ["0-secondary", story.imageTwo || story.imageOne],
  ]) {
    if (!imagePath) continue;
    const slotPattern = new RegExp(`(data-story-image-slot="${slot}"[^>]*\\ssrc=")[^"]*(")`);
    html = html.replace(slotPattern, `$1${imagePath}$2`);
  }
  return html;
}

function sourceLabel(story) {
  return String(story.source || "News desk")
    .replace(/\s*·\s*/g, " / ")
    .replace(/\s*\/\s*/g, " / ");
}

function outputForStory({ story, storyPath, outputArg, outputDir }) {
  if (outputArg) return projectPath(outputArg);
  const tone = resolveTone(story);
  const slug = slugify(parse(storyPath).name);
  return resolve(outputDir, `${tone}-${slug}.mp4`);
}

const storyPaths = parseStoryPaths();
const outputArg = option("output", "").trim();
if (outputArg && storyPaths.length !== 1) die("--output is only valid when building one story");
const outputDirArg = option("output-dir", "").trim();
const defaultOutputDir = outputArg && !outputDirArg
  ? dirname(projectPath(outputArg))
  : "renders/standalone";
const outputDir = projectPath(outputDirArg || defaultOutputDir);
mkdirSync(outputDir, { recursive: true });
const rendersRoot = resolve(projectRoot, "renders");
const outputDirRelativeToRenders = relative(rendersRoot, outputDir);
const outputDirIsInRenders =
  outputDirRelativeToRenders !== "" &&
  !outputDirRelativeToRenders.startsWith("..") &&
  !isAbsolute(outputDirRelativeToRenders);
const defaultManifestPath = outputDirIsInRenders
  ? resolve(rendersRoot, "manifests", `${basename(outputDir)}__standalone-manifest.json`)
  : resolve(outputDir, "standalone-manifest.json");
const manifestPath = projectPath(option("manifest", relative(projectRoot, defaultManifestPath)));
const sourceHtmlPath = resolve(projectRoot, "index.html");
if (!existsSync(sourceHtmlPath)) die("index.html not found");
const sourceHtml = readFileSync(sourceHtmlPath, "utf8");

const openerCache = new Map();
const ctaCache = new Map();

function defaultOpeningText(tone) {
  return tone === "good" ? "Good morning, good news" : "Good morning, bad news";
}

function ensureOpener(tone, workDir, configuredText = "") {
  const text = String(configuredText || defaultOpeningText(tone)).trim();
  const cacheKey = `${tone}::${text}`;
  if (openerCache.has(cacheKey)) return openerCache.get(cacheKey);
  const isDefault = text === defaultOpeningText(tone);
  const path = isDefault
    ? resolve(projectRoot, `assets/narration/tour/00-opener-${tone}.wav`)
    : resolve(projectRoot, `assets/narration/tour/custom-${slugify(text)}.wav`);
  ensureNarration({
    story: { script: text },
    outputPath: path,
    scratchPath: resolve(workDir, `opener-${slugify(text)}.json`),
    label: `${tone}-news opener: ${text}`,
  });
  openerCache.set(cacheKey, path);
  return path;
}

function ensureCta(workDir) {
  if (ctaCache.has(CTA)) return ctaCache.get(CTA);
  const path = resolve(projectRoot, "assets/narration/tour/99-end-cta.wav");
  ensureNarration({
    story: { script: CTA },
    outputPath: path,
    scratchPath: resolve(workDir, "end-cta.json"),
    label: "standalone end-card CTA",
    force: CTA !== "Follow for tomorrow's global brief.",
  });
  ctaCache.set(CTA, path);
  return path;
}

function buildOne(storyPath) {
  const story = readStory(storyPath);
  const slug = slugify(parse(storyPath).name);
  const tone = resolveTone(story);
  const outputPath = outputForStory({ story, storyPath, outputArg, outputDir });
  const storyWorkDir = resolve(outputDir, ".standalone-work", slug);
  mkdirSync(storyWorkDir, { recursive: true });

  const configuredAudio = String(story.narrationAudio || "").trim();
  const storyAudioPath = configuredAudio
    ? projectPath(configuredAudio)
    : resolve(projectRoot, `assets/narration/${slug}${audioExtension()}`);
  ensureNarration({
    story,
    storyPath,
    outputPath: storyAudioPath,
    scratchPath: resolve(storyWorkDir, `${slug}.narration.json`),
    label: slug,
  });

  const effectiveStory = {
    ...story,
    tone,
    narrationAudio: projectRelative(storyAudioPath),
  };
  const effectiveStoryPath = resolve(storyWorkDir, `${slug}.story.json`);
  writeFileSync(effectiveStoryPath, `${JSON.stringify(effectiveStory, null, 2)}\n`);
  run("npm", ["run", "validate:story", "--", "--story", effectiveStoryPath], `validate ${slug}`);

  const storyLength = probeDuration(storyAudioPath);
  if (!storyLength) die(`${slug}: narration has no measurable duration`);
  if (storyLength > MAX_STORY_DURATION + 0.02) {
    die(`${slug}: narration is ${storyLength.toFixed(2)}s; maximum is ${MAX_STORY_DURATION}s`);
  }

  const animationPlan = normalizeGlobeMapPlan(
    effectiveStory.animationPlan || effectiveStory.visualPlan,
    { duration: storyLength, requireLibrary: true },
  );
  if (!animationPlan.valid) die(`${slug}: ${animationPlan.errors.join("; ")}`);
  const resolvedPlan = resolveMapPlanForScene({
    story: effectiveStory,
    format: "portrait",
    mode: "production",
    duration: storyLength,
    requireLibrary: true,
  });
  if (!resolvedPlan.valid) die(`${slug}: ${resolvedPlan.errors.join("; ")}`);

  /* Every standalone Short opens with the consistent brand sting. Story
     specific openingHook copy belongs in the later story card, not frame one. */
  const openingText = defaultOpeningText(tone);
  const spokenOpener = true;
  const openerPath = spokenOpener ? ensureOpener(tone, storyWorkDir, openingText) : null;
  const ctaPath = ensureCta(storyWorkDir);
  const openerLength = openerPath ? probeDuration(openerPath) : 0;
  const ctaLength = probeDuration(ctaPath);
  if ((spokenOpener && !openerLength) || !ctaLength) die(`${slug}: opener or CTA audio has no measurable duration`);

  const openerDelay = spokenOpener ? Number(option("opener-delay", "0.18")) : 0;
  const openerHold = spokenOpener ? Number(option("opener-hold", "0.22")) : 0;
  const storySpeakAt = spokenOpener ? round(openerDelay + openerLength + openerHold) : 0;
  const ctaStart = round(storySpeakAt + storyLength + GAP);
  const endCardStart = round(spokenOpener
    ? Math.max(storySpeakAt + 1, ctaStart - 0.18)
    : Math.max(0, ctaStart - 0.08));
  const endCardReveal = round(spokenOpener ? endCardStart + 0.22 : ctaStart);
  const totalDuration = Math.ceil((ctaStart + ctaLength + (spokenOpener ? 0.55 : 0.35)) * 10) / 10;
  const stop = buildStop(effectiveStory, storyLength, storySpeakAt);
  const mixedAudioPath = resolve(storyWorkDir, `${tone}-${slug}.narration.wav`);
  const narrationTracks = [
    ...(openerPath ? [openerPath] : []),
    storyAudioPath,
    ctaPath,
  ];
  const narrationStarts = [
    ...(openerPath ? [openerDelay] : []),
    storySpeakAt,
    ctaStart,
  ];

  writeNarrationTrack({
    tracks: narrationTracks,
    starts: narrationStarts,
    totalDuration,
    outputPath: mixedAudioPath,
  });

  const variablesPath = resolve(storyWorkDir, `${tone}-${slug}.variables.json`);
  writeFileSync(
    variablesPath,
    `${JSON.stringify({
      deskName: "IndieHouse.io News",
      edition: effectiveStory.edition || "Current edition",
      openerTitle: openingText,
      openerLine: openingText,
      hookMode: false,
      hookLine: "",
      openerSub: effectiveStory.openingSub || `Global brief · ${effectiveStory.edition || "Current edition"}`,
      openerEnd: round(storySpeakAt + 0.35),
      endCardStart,
      endCardReveal,
      tour: JSON.stringify([stop]),
      narrationAudio: projectRelative(mixedAudioPath),
      footerNote: "One story · Context first",
      ctaLine: "Follow for tomorrow’s global brief.",
      ctaSource: "",
    }, null, 2)}\n`,
  );

  const renderComposition = `index.__render.standalone.${slug}.html`;
  const renderCompositionPath = resolve(projectRoot, renderComposition);
  writeFileSync(
    renderCompositionPath,
    replaceComposition(sourceHtml, {
      duration: totalDuration,
      narrationPath: mixedAudioPath,
      story: effectiveStory,
    }),
  );

  try {
    if (!SKIP_RENDER) {
      mkdirSync(dirname(outputPath), { recursive: true });
      run(
        "npx",
        [
          "--yes", `hyperframes@${HF}`, "render", ".",
          "--composition", renderComposition,
          "--variables-file", projectRelative(variablesPath),
          "--output", outputPath,
          "--fps", FPS,
          "--quality", QUALITY,
          "-w", "1",
        ],
        `render ${tone} standalone Short (${totalDuration}s)`,
      );
      if (!existsSync(outputPath)) die(`${slug}: render completed without creating ${outputPath}`);
      const media = probeVideo(outputPath);
      if (media.width !== 1080 || media.height !== 1920) {
        die(`${slug}: expected 1080x1920 output, got ${media.width}x${media.height}`);
      }
      if (!media.duration) die(`${slug}: rendered video has no measurable duration`);
    }
  } finally {
    rmSync(renderCompositionPath, { force: true });
    if (!KEEP_WORK && !SKIP_RENDER) rmSync(storyWorkDir, { recursive: true, force: true });
  }

  const media = SKIP_RENDER ? null : probeVideo(outputPath);
  return {
    eventId: effectiveStory.eventId || "",
    tone,
    story: projectRelative(storyPath),
    headline: effectiveStory.headline || "",
    output: projectRelative(outputPath),
    status: SKIP_RENDER ? "prepared" : "rendered",
    duration: SKIP_RENDER ? totalDuration : round(media.duration),
    width: SKIP_RENDER ? 1080 : media.width,
    height: SKIP_RENDER ? 1920 : media.height,
    fps: Number(FPS),
    narration: projectRelative(storyAudioPath),
  };
}

const results = storyPaths.map(buildOne);
const manifest = {
  version: 1,
  format: "portrait",
  width: 1080,
  height: 1920,
  fps: Number(FPS),
  mode: "standalone-story",
  status: SKIP_RENDER ? "prepared" : "rendered",
  items: results,
};
mkdirSync(dirname(manifestPath), { recursive: true });
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`\n✓ ${results.length} standalone ${results.length === 1 ? "Short" : "Shorts"} ${SKIP_RENDER ? "prepared" : "built"}`);
results.forEach((result) => {
  console.log(`  ${result.tone} · ${result.headline}`);
  console.log(`    ${result.output} · ${result.duration.toFixed(1)}s · ${result.width}x${result.height}`);
});
console.log(`  manifest: ${projectRelative(manifestPath)}`);
