#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, extname, isAbsolute, join, parse, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = resolve(projectRoot, "..");
const args = process.argv.slice(2);

function option(name, fallback = "") {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function die(message) {
  console.error(`✗ narration: ${message}`);
  process.exit(1);
}

function run(command, commandArgs) {
  const localPython =
    process.platform === "win32"
      ? resolve(projectRoot, ".venv-tts/Scripts/python.exe")
      : resolve(projectRoot, ".venv-tts/bin/python");
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
  if (result.status !== 0) die(`${command} exited with status ${result.status}`);
}

const storyArg = option("story") || args.find((arg) => !arg.startsWith("--"));
if (!storyArg) {
  die("usage: npm run narrate -- --story stories/your-story.json --provider kokoro");
}

const storyPath = isAbsolute(storyArg) ? storyArg : resolve(projectRoot, storyArg);
if (!existsSync(storyPath)) die(`story file not found: ${storyPath}`);

const story = JSON.parse(readFileSync(storyPath, "utf8"));
const script = String(story.script || "").trim();
if (!script) die("the story has no script field");

const wordCount = script.split(/\s+/).filter(Boolean).length;
const requestedScriptLimit = Number(story.scriptMaxWords);
const scriptWordLimit = Number.isInteger(requestedScriptLimit) && requestedScriptLimit > 0
  ? requestedScriptLimit
  : 42;
if (wordCount > scriptWordLimit) die(`script has ${wordCount} words; shorten it to ${scriptWordLimit} words or fewer`);

const provider = option("provider", "kokoro").toLowerCase();
const speed = option("speed", "1.0");
const voice = option("voice");
const lang = option("lang", "en");
const slug = parse(storyPath).name.replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
const defaultExtension = provider === "elevenlabs" ? ".mp3" : ".wav";
const outputArg = option("output", `assets/narration/${slug}${defaultExtension}`);
const outputPath = isAbsolute(outputArg) ? outputArg : resolve(projectRoot, outputArg);
const textPath = resolve(projectRoot, `assets/narration/${slug}.txt`);
const wordsPath = resolve(projectRoot, `assets/narration/${slug}.words.json`);

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(textPath, `${script}\n`);

if (provider === "kokoro") {
  const kokoroVoice = voice || "af_heart";
  const commandArgs = [
    "--yes",
    "hyperframes@0.7.85",
    "tts",
    textPath,
    "--output",
    outputPath,
    "--voice",
    kokoroVoice,
    "--speed",
    speed,
  ];
  if (lang && lang !== "en") commandArgs.push("--lang", lang);
  run("npx", commandArgs);
} else if (provider === "heygen") {
  const helperPath = resolve(
    workspaceRoot,
    ".agents/skills/hyperframes-media/scripts/heygen-tts.mjs",
  );
  if (!existsSync(helperPath)) {
    die("HeyGen helper is unavailable; install the hyperframes-media skill first");
  }
  const commandArgs = [helperPath, textPath, "--output", outputPath, "--words", wordsPath, "--speed", speed];
  if (voice) commandArgs.push("--voice", voice);
  if (lang && lang !== "en") commandArgs.push("--lang", lang);
  run(process.execPath, commandArgs);
} else if (provider === "elevenlabs") {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = voice || process.env.ELEVENLABS_VOICE_ID;
  if (!apiKey) die("set ELEVENLABS_API_KEY before using the ElevenLabs provider");
  if (!voiceId) die("pass --voice VOICE_ID or set ELEVENLABS_VOICE_ID");

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: script,
        model_id: "eleven_multilingual_v2",
      }),
    },
  );
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    die(`ElevenLabs request failed (${response.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (extname(outputPath).toLowerCase() === ".wav") {
    const tempPath = join(dirname(outputPath), `${slug}.elevenlabs.mp3`);
    writeFileSync(tempPath, bytes);
    run("ffmpeg", ["-y", "-loglevel", "error", "-i", tempPath, "-ar", "44100", "-ac", "1", outputPath]);
    rmSync(tempPath, { force: true });
  } else {
    writeFileSync(outputPath, bytes);
  }
} else {
  die(`unknown provider "${provider}"; use kokoro, heygen, or elevenlabs`);
}

if (!existsSync(outputPath)) die(`provider completed without creating ${outputPath}`);

const projectRelativeAudio = outputPath.startsWith(`${projectRoot}/`)
  ? outputPath.slice(projectRoot.length + 1)
  : outputPath;
story.narrationAudio = projectRelativeAudio;
const tempStoryPath = `${storyPath}.tmp`;
writeFileSync(tempStoryPath, `${JSON.stringify(story, null, 2)}\n`);
renameSync(tempStoryPath, storyPath);

console.log(`✓ narration generated with ${provider}`);
console.log(`  audio: ${projectRelativeAudio}`);
console.log(`  script: ${textPath.slice(projectRoot.length + 1)}`);
console.log(`  words: ${wordCount}/${scriptWordLimit}`);
