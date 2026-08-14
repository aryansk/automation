/* ============================================================
   hyperframes-version.mjs — single source of truth for the
   pinned HyperFrames CLI version.

   The version lives in package.json (the `npm run render/check/
   publish` scripts and the `hyperframes upgrade` tooling only
   ever rewrite package.json). Every build/narrate script reads
   the pin from here so a single upgrade propagates everywhere
   instead of leaving stale, divergent versions hardcoded across
   the scripts directory.

   Usage:
     import { HYPERFRAMES_VERSION, hyperframesPin } from "./hyperframes-version.mjs";
     spawnSync("npx", ["--yes", hyperframesPin(), "render", ...]);
   ============================================================ */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageJsonPath = resolve(dirname(fileURLToPath(import.meta.url)), "..", "package.json");

function readPinnedVersion() {
  let raw;
  try {
    raw = readFileSync(packageJsonPath, "utf8");
  } catch (error) {
    throw new Error(`hyperframes-version: cannot read ${packageJsonPath}: ${error.message}`);
  }

  // Match the exact version the package.json scripts already pin, e.g.
  // "render": "npx --yes hyperframes@0.7.106 render". This is the same
  // regex shape update-hyperframes.mjs uses to discover the pin.
  const match = raw.match(/hyperframes@(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)/);
  if (!match) {
    throw new Error(
      `hyperframes-version: no pinned hyperframes@X.Y.Z found in ${packageJsonPath}. ` +
        "Add one to a package.json script (e.g. \"render\") or run `npm run update:hyperframes`.",
    );
  }
  return match[1];
}

export const HYPERFRAMES_VERSION = readPinnedVersion();

/** The full `hyperframes@X.Y.Z` spec to hand to `npx`. */
export function hyperframesPin() {
  return `hyperframes@${HYPERFRAMES_VERSION}`;
}
