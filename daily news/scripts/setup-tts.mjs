#!/usr/bin/env node

import { rmSync } from "node:fs";
import { delimiter, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const venvPath = resolve(projectRoot, ".venv-tts");

function findOnPath(command) {
  const result = spawnSync("which", [command], { encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim().split(delimiter)[0] : "";
}

function versionOf(executable) {
  const result = spawnSync(executable, ["--version"], { encoding: "utf8" });
  const match = `${result.stdout}${result.stderr}`.match(/Python\s+(\d+)\.(\d+)/);
  return match ? { major: Number(match[1]), minor: Number(match[2]) } : null;
}

function run(command, args) {
  const result = spawnSync(command, args, { cwd: projectRoot, stdio: "inherit" });
  if (result.error || result.status !== 0) {
    console.error(`✗ TTS setup failed while running ${command}`);
    process.exit(result.status || 1);
  }
}

const requested = process.env.DAILY_NEWS_TTS_PYTHON;
const candidates = [
  requested,
  findOnPath("python3.12"),
  findOnPath("python3.11"),
  findOnPath("python3.10"),
  findOnPath("python3"),
].filter(Boolean);

const python = candidates.find((candidate) => {
  const version = versionOf(candidate);
  return version && version.major === 3 && version.minor >= 10 && version.minor <= 12;
});

if (!python) {
  console.error(
    "✗ Kokoro requires Python 3.10–3.12. Install Python 3.11 or set DAILY_NEWS_TTS_PYTHON.",
  );
  process.exit(1);
}

console.log(`· using ${python}`);
rmSync(venvPath, { recursive: true, force: true });
run(python, ["-m", "venv", venvPath]);

const venvPython =
  process.platform === "win32"
    ? resolve(venvPath, "Scripts/python.exe")
    : resolve(venvPath, "bin/python");
run(venvPython, ["-m", "pip", "install", "--upgrade", "pip"]);
run(venvPython, ["-m", "pip", "install", "kokoro-onnx", "soundfile"]);

console.log("✓ local Kokoro TTS environment is ready");
