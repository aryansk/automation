#!/usr/bin/env node

import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_UPSTREAM = resolve(ROOT, "..", "hyperframes-upstream");
const DEFAULT_PROJECTS = ["daily news", "daily-news-brief"];

const argv = process.argv.slice(2);
const checkOnly = argv.includes("--check");
const skillsOnly = argv.includes("--skills-only");
const strict = argv.includes("--strict");
const shouldRefreshSkills = argv.includes("--skills") || (!argv.includes("--no-skills") && !checkOnly);
const projectArgs = [];
let upstreamArg = null;

for (let index = 0; index < argv.length; index += 1) {
  const arg = argv[index];
  if (arg === "--project") {
    const value = argv[index + 1];
    if (!value) throw new Error("--project requires a path");
    projectArgs.push(value);
    index += 1;
  } else if (arg.startsWith("--project=")) {
    projectArgs.push(arg.slice("--project=".length));
  } else if (arg === "--upstream") {
    upstreamArg = argv[index + 1];
    if (!upstreamArg) throw new Error("--upstream requires a path");
    index += 1;
  } else if (arg.startsWith("--upstream=")) {
    upstreamArg = arg.slice("--upstream=".length);
  }
}

if (argv.includes("--help") || argv.includes("-h")) {
  console.log(`Usage: node scripts/update-hyperframes.mjs [options]

Options:
  --check                 Fetch and report updates without changing project files
  --project <path>       Limit the run; repeatable. Defaults to both news projects
  --upstream <path>      Override the local upstream clone path
  --skills               Refresh installed HyperFrames skills
  --skills-only          Refresh skills without checking project pins
  --no-skills            Skip the skill refresh during an apply run
  --strict               Exit non-zero instead of falling back after a failed upgrade check
`);
  process.exit(0);
}

const upstream = resolve(process.cwd(), upstreamArg ?? DEFAULT_UPSTREAM);
const projects = projectArgs.length
  ? projectArgs.map((project) => resolve(process.cwd(), project))
  : DEFAULT_PROJECTS.map((project) => resolve(ROOT, project));

function displayPath(path) {
  const relativePath = relative(ROOT, path);
  return relativePath && !relativePath.startsWith("..") ? relativePath : path;
}

function run(command, args, cwd) {
  return new Promise((resolveResult, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code, signal) => resolveResult({ code: code ?? 1, signal, stdout, stderr }));
  });
}

function tail(text, lines = 16) {
  return text.trim().split("\n").slice(-lines).join("\n");
}

function commandOutput(result) {
  return [result.stdout, result.stderr].filter((value) => value.trim()).join("\n");
}

function parseJsonOutput(output) {
  const start = output.indexOf("{");
  const end = output.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error(`Expected JSON output, received:\n${tail(output)}`);
  return JSON.parse(output.slice(start, end + 1));
}

function extractPinnedVersions(packageJson) {
  return [...packageJson.matchAll(/hyperframes@(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)/g)].map(
    (match) => match[1],
  );
}

async function checkProject(project) {
  const result = await run(
    "npx",
    ["--yes", "hyperframes@latest", "upgrade", "--project", ".", "--check", "--json"],
    project,
  );
  if (result.code !== 0) {
    throw new Error(`Upgrade probe failed:\n${tail(commandOutput(result))}`);
  }
  const payload = parseJsonOutput(result.stdout);
  const from = Array.isArray(payload.from) ? payload.from : [];
  const current = from[0] ?? payload._meta?.version ?? "unknown";
  const latest = payload.to ?? payload._meta?.latestVersion ?? "unknown";
  const updateAvailable = Boolean(payload.changed || payload._meta?.updateAvailable);
  return { current, latest, updateAvailable };
}

async function verifyProject(project) {
  const result = await run("npm", ["run", "check", "--silent"], project);
  if (result.code !== 0) {
    throw new Error(`npm run check failed:\n${tail(commandOutput(result), 24)}`);
  }
}

async function updateProject(project) {
  const packagePath = resolve(project, "package.json");
  if (!existsSync(packagePath)) throw new Error(`Missing package.json in ${project}`);

  const status = await checkProject(project);
  const label = displayPath(project);
  console.log(`${label}: ${status.current} -> ${status.latest}${status.updateAvailable ? " (update available)" : " (current)"}`);

  if (checkOnly) return;

  const originalPackage = await readFile(packagePath, "utf8");
  if (status.updateAvailable) {
    const apply = await run(
      "npx",
      ["--yes", "hyperframes@latest", "upgrade", "--project", "."],
      project,
    );
    if (apply.code !== 0) {
      throw new Error(`Project pin update failed:\n${tail(commandOutput(apply))}`);
    }
    const updatedPackage = await readFile(packagePath, "utf8");
    const pinnedVersions = extractPinnedVersions(updatedPackage);
    if (updatedPackage === originalPackage || !pinnedVersions.includes(status.latest)) {
      throw new Error(`The CLI did not rewrite ${packagePath} to ${status.latest}`);
    }
    console.log(`${label}: applied ${status.current} -> ${status.latest}`);
    try {
      await verifyProject(project);
    } catch (error) {
      await writeFile(packagePath, originalPackage);
      console.error(`${label}: validation failed; restored the ${status.current} pin`);
      console.error(error.message);
      if (strict) throw error;
      console.log(`${label}: continuing on pinned ${status.current}`);
      return;
    }
  } else {
    await verifyProject(project);
  }
  console.log(`${label}: check passed`);
}

async function syncUpstream() {
  if (!existsSync(resolve(upstream, ".git"))) {
    throw new Error(`Missing upstream clone at ${upstream}. Clone heygen-com/hyperframes there first.`);
  }

  const fetch = await run("git", ["fetch", "origin", "--prune"], upstream);
  if (fetch.code !== 0) throw new Error(`Upstream fetch failed:\n${tail(commandOutput(fetch))}`);

  const headResult = await run("git", ["rev-parse", "HEAD"], upstream);
  const remoteResult = await run("git", ["rev-parse", "origin/main"], upstream);
  const countResult = await run("git", ["rev-list", "--left-right", "--count", "HEAD...origin/main"], upstream);
  if (headResult.code !== 0 || remoteResult.code !== 0 || countResult.code !== 0) {
    throw new Error(`Could not compare the local upstream clone with origin/main`);
  }

  const [behind, ahead] = countResult.stdout.trim().split(/\s+/).map(Number);
  const head = headResult.stdout.trim();
  const remote = remoteResult.stdout.trim();
  const remoteLog = await run("git", ["log", "-1", "--format=%h %ad %s", "--date=iso", "origin/main"], upstream);
  console.log(`upstream: local ${head.slice(0, 12)}, origin/main ${remote.slice(0, 12)} (${ahead} new, ${behind} local-only)`);
  if (remoteLog.stdout.trim()) console.log(`upstream latest: ${remoteLog.stdout.trim()}`);

  if (!checkOnly && ahead > 0 && behind === 0) {
    const dirty = await run("git", ["status", "--porcelain"], upstream);
    if (dirty.stdout.trim()) {
      console.log(`upstream: left checkout untouched because it has local changes`);
    } else {
      const merge = await run(
        "git",
        [
          "-c",
          "filter.lfs.process=",
          "-c",
          "filter.lfs.smudge=",
          "-c",
          "filter.lfs.clean=",
          "-c",
          "filter.lfs.required=false",
          "merge",
          "--ff-only",
          "origin/main",
        ],
        upstream,
      );
      if (merge.code !== 0) throw new Error(`Could not fast-forward the upstream clone:\n${tail(commandOutput(merge))}`);
      console.log(`upstream: fast-forwarded local checkout to ${remote.slice(0, 12)}`);
    }
  }
}

async function refreshInstalledSkills() {
  const result = await run("npx", ["--yes", "hyperframes@latest", "skills", "update", "--json"], ROOT);
  if (result.code !== 0) throw new Error(`Skill refresh failed:\n${tail(commandOutput(result), 24)}`);
  console.log(`skills: refreshed installed HyperFrames skills`);
  if (result.stdout.trim()) console.log(tail(result.stdout, 8));
}

async function main() {
  if (!skillsOnly) {
    await syncUpstream();
    for (const project of projects) {
      try {
        await updateProject(project);
      } catch (error) {
        console.error(`${displayPath(project)}: ${error.message}`);
        process.exitCode = 1;
      }
    }
  }
  if (!checkOnly && shouldRefreshSkills) {
    try {
      await refreshInstalledSkills();
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
