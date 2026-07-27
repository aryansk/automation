#!/usr/bin/env node
/* ============================================================
   build-top3.mjs — render several stories through index.html and
   concatenate them into one "top N" vertical video.

   Usage:
     node scripts/build-top3.mjs \
       --stories stories/a.json,stories/b.json,stories/c.json \
       --output renders/top3-2026-07-25.mp4

   Per story: narrate with Kokoro, render index.html, then join.
   Segment length comes from data-duration on the composition root
   (18s); the CLI has no --duration flag, so keep narration under it.

   Flags:
     --skip-narrate   reuse existing wavs
     --resume         skip segments that are already rendered
     --voice          kokoro voice (default af_heart)
     --fps            frame rate (default 30)
     --quality        draft | standard | high (default standard)
     --workdir        where to put intermediates (default renders/)
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

/* Some mounts refuse unlink even when the write succeeded. */
const tryRemove = (path) => {
  try {
    rmSync(path, { force: true });
  } catch {
    /* stale temp file; overwritten next run */
  }
};

const die = (message) => {
  console.error(`\u2717 build-top3: ${message}`);
  process.exit(1);
};

const HF = option("hyperframes", "0.7.71");
const VOICE = option("voice", "af_heart");
const COMPOSITION = option("composition", "index.html");
const FPS = option("fps", "30");
const QUALITY = option("quality", "standard");

function run(command, commandArgs, label) {
  console.log(`\n\u2192 ${label}`);
  const localPython = resolve(projectRoot, ".venv-tts/bin/python");
  const environment = { ...process.env };
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

/* ---------------- inputs ---------------- */

const storyList = option("stories")
  .split(",")
  .map((entry) => entry.trim())
  .filter(Boolean);

if (!storyList.length) die("pass --stories a.json,b.json,c.json");

const outputArg = option("output", "renders/top3.mp4");
const outputPath = isAbsolute(outputArg) ? outputArg : resolve(projectRoot, outputArg);
const workRoot = option("workdir") ? resolve(option("workdir")) : resolve(projectRoot, "renders");
const segmentDir = resolve(workRoot, "segments");
mkdirSync(segmentDir, { recursive: true });
mkdirSync(dirname(outputPath), { recursive: true });

const compositionPath = resolve(projectRoot, COMPOSITION);
if (!existsSync(compositionPath)) die(`composition not found: ${COMPOSITION}`);
const compositionHtml = readFileSync(compositionPath, "utf8");
const segmentDuration = Number(/id="root"[\s\S]*?data-duration="([\d.]+)"/.exec(compositionHtml)?.[1] || 18);

const segments = [];

/* ---------------- per-story ---------------- */

for (const [index, entry] of storyList.entries()) {
  const storyPath = isAbsolute(entry) ? entry : resolve(projectRoot, entry);
  if (!existsSync(storyPath)) die(`story not found: ${storyPath}`);

  const slug = parse(storyPath).name;
  const story = JSON.parse(readFileSync(storyPath, "utf8"));

  console.log(`\n\u2550\u2550 [${index + 1}/${storyList.length}] ${slug} \u2550\u2550`);

  const audioPath = resolve(projectRoot, `assets/narration/${slug}.wav`);

  if (!flag("skip-narrate")) {
    run(
      "npm",
      ["run", "narrate", "--", "--story", storyPath, "--provider", "kokoro", "--voice", VOICE],
      `narrate ${slug}`,
    );
  }
  if (!existsSync(audioPath)) die(`narration missing: ${audioPath}`);

  const measured = probeDuration(audioPath);
  if (measured > segmentDuration) {
    console.warn(`  ! narration is ${measured.toFixed(1)}s but the segment is ${segmentDuration}s; it will be cut`);
  } else {
    console.log(`  narration ${measured.toFixed(1)}s / ${segmentDuration}s`);
  }

  const segmentPath = resolve(segmentDir, `${slug}.mp4`);
  const alreadyRendered = flag("resume") && existsSync(segmentPath) && probeDuration(segmentPath) > 0;

  if (alreadyRendered) {
    console.log(`  skip render (already built)`);
  } else {
    /* The narration src must be written into the markup. The render
       pipeline extracts audio from the static composition before the
       page executes, so the src that news-renderer.js assigns at
       runtime is never seen and the output comes out mute. */
    const renderComposition = "index.__render.html";
    const renderCompositionPath = resolve(projectRoot, renderComposition);
    writeFileSync(
      renderCompositionPath,
      compositionHtml.replace(
        /(id="narration-track"[\s\S]*?src=")[^"]*(")/,
        `$1assets/narration/${slug}.wav$2`,
      ),
    );

    run(
      "npx",
      [
        "--yes", `hyperframes@${HF}`, "render", ".",
        "--composition", renderComposition,
        "--variables-file", storyPath,
        "--output", segmentPath,
        "--fps", FPS,
        "--quality", QUALITY,
        "-w", "1",
      ],
      `render ${slug}`,
    );
    tryRemove(renderCompositionPath);
  }

  if (!existsSync(segmentPath)) die(`segment missing: ${segmentPath}`);
  segments.push(segmentPath);
}

/* ---------------- stitch ---------------- */

const listPath = resolve(workRoot, ".concat.txt");
writeFileSync(listPath, `${segments.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n")}\n`);
run(
  "ffmpeg",
  [
    "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", listPath,
    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", FPS,
    "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart",
    outputPath,
  ],
  `stitch ${segments.length} segments`,
);
tryRemove(listPath);

console.log(`\n\u2713 top-${segments.length} video built`);
console.log(`  ${outputPath}  ${probeDuration(outputPath).toFixed(1)}s`);
