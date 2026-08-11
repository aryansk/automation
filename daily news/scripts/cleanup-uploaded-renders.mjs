#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") {
      options.help = true;
      continue;
    }
    if (argument === "--apply") {
      options.apply = true;
      continue;
    }
    if (!argument.startsWith("--")) {
      throw new Error(`Unexpected argument: ${argument}`);
    }

    const [rawKey, inlineValue] = argument.slice(2).split("=", 2);
    if (inlineValue !== undefined) {
      options[rawKey] = inlineValue;
      continue;
    }
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${rawKey}`);
    }
    options[rawKey] = value;
    index += 1;
  }

  return options;
}

function printHelp() {
  console.log(`Usage:
  npm run cleanup:uploaded -- --upload-manifest renders/manifests/<batch>__upload-manifest.json \
    --instagram-correction-manifest renders/manifests/<batch>__instagram-correction-manifest.json \
    --batch-root renders/<batch> \
    --apply

The default mode is a dry run. --apply moves only eligible MP4s to the dated
workspace quarantine; it never permanently deletes them.

Options:
  --upload-manifest PATH                 Verified YouTube + Instagram manifest
  --instagram-correction-manifest PATH   Verified portrait Reel correction manifest
  --batch-root PATH                     Directory containing the uploaded files
  --quarantine-root PATH                Recoverable cleanup destination
  --apply                               Move eligible files after all checks pass
`);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Could not read JSON ${filePath}: ${error.message}`);
  }
}

function requireValue(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function resolvePath(value, base = projectRoot) {
  return path.resolve(base, value);
}

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function isUrl(value, hostname) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === hostname;
  } catch {
    return false;
  }
}

function parseDimensions(value) {
  if (typeof value !== "string") {
    return null;
  }
  const match = value.trim().match(/^(\d+)\s*[x×]\s*(\d+)$/i);
  return match ? { width: Number(match[1]), height: Number(match[2]) } : null;
}

function portraitDimensions(dimensions) {
  return Boolean(
    dimensions &&
      dimensions.width > 0 &&
      dimensions.height > 0 &&
      dimensions.width * 16 === dimensions.height * 9,
  );
}

function itemDimensions(item) {
  const candidates = [
    item?.liveDimensions,
    item?.dimensions,
    item?.formatDimensions,
    item?.width && item?.height ? `${item.width}x${item.height}` : null,
    item?.liveWidth && item?.liveHeight ? `${item.liveWidth}x${item.liveHeight}` : null,
  ];
  for (const candidate of candidates) {
    const dimensions = parseDimensions(candidate);
    if (dimensions) {
      return dimensions;
    }
  }
  return null;
}

function probeLocalDimensions(filePath) {
  const result = spawnSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height",
      "-of",
      "csv=p=0:s=x",
      filePath,
    ],
    { encoding: "utf8" },
  );

  if (result.error) {
    throw new Error(`ffprobe is required to verify local video dimensions: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`ffprobe failed for ${filePath}: ${result.stderr.trim()}`);
  }
  const dimensions = parseDimensions(result.stdout.trim());
  if (!dimensions) {
    throw new Error(`ffprobe returned no video dimensions for ${filePath}`);
  }
  return dimensions;
}

function getManifestItems(manifest, key) {
  const items = manifest?.[key]?.items;
  requireValue(Array.isArray(items) && items.length > 0, `Manifest has no ${key}.items`);
  return items;
}

function assertUnique(items, key, label) {
  const values = items.map((item) => item?.[key]);
  requireValue(values.every(Boolean), `${label} items must all include ${key}`);
  requireValue(new Set(values).size === values.length, `${label} items contain duplicate ${key} values`);
}

function validateManifest(manifest, correctionManifest) {
  const youtubeItems = getManifestItems(manifest, "youtube");
  const instagramItems = getManifestItems(manifest, "instagram");

  requireValue(manifest.youtube.status === "published", "YouTube status is not published");
  requireValue(manifest.youtube.verified === true, "YouTube upload is not verified");
  requireValue(manifest.instagram.status === "published", "Instagram status is not published");
  requireValue(manifest.instagram.verified === true, "Instagram upload is not verified");
  requireValue(
    manifest.counts?.youtubePublished === youtubeItems.length,
    "YouTube published count does not match verified items",
  );
  requireValue(
    manifest.counts?.instagramPublished === instagramItems.length,
    "Instagram published count does not match verified items",
  );

  assertUnique(youtubeItems, "file", "YouTube");
  assertUnique(instagramItems, "file", "Instagram");
  requireValue(
    new Set(youtubeItems.map((item) => item.file)).size ===
      new Set(instagramItems.map((item) => item.file)).size &&
      youtubeItems.every((item) => instagramItems.some((instagramItem) => instagramItem.file === item.file)),
    "YouTube and Instagram file sets do not match",
  );

  for (const item of youtubeItems) {
    requireValue(isUrl(item.url, "youtube.com"), `Invalid YouTube URL for ${item.file}`);
  }
  for (const item of instagramItems) {
    requireValue(isUrl(item.url, "www.instagram.com"), `Invalid Instagram URL for ${item.file}`);
  }

  const correctedByHeadline = new Map();
  let correctionDimensions = null;
  if (correctionManifest) {
    requireValue(
      correctionManifest.correctedCount === instagramItems.length,
      "Instagram corrected count does not match verified Instagram items",
    );
    requireValue(
      Array.isArray(correctionManifest.correctedItems) &&
        correctionManifest.correctedItems.length === instagramItems.length,
      "Instagram correction manifest does not contain one corrected item per Reel",
    );
    correctionDimensions = parseDimensions(correctionManifest.correctedDimensions);
    requireValue(
      portraitDimensions(correctionDimensions),
      "Instagram correction manifest does not prove a 9:16 live format",
    );
    for (const item of correctionManifest.correctedItems) {
      requireValue(item.headline, "Instagram corrected items must include headline");
      requireValue(isUrl(item.url, "www.instagram.com"), `Invalid corrected Instagram URL for ${item.headline}`);
      requireValue(!correctedByHeadline.has(item.headline), `Duplicate corrected Instagram headline: ${item.headline}`);
      correctedByHeadline.set(item.headline, item);
    }
  }

  for (const item of instagramItems) {
    const perItemDimensions = itemDimensions(item);
    const liveDimensions = perItemDimensions || correctionDimensions;
    requireValue(
      portraitDimensions(liveDimensions),
      `Instagram format is not verified as 9:16 for ${item.file}`,
    );
    if (correctionManifest) {
      requireValue(correctedByHeadline.has(item.headline), `No corrected Instagram Reel matches ${item.file}`);
    } else {
      requireValue(
        item.formatVerified === true || item.crop === "9:16",
        `Instagram item lacks explicit 9:16 format verification: ${item.file}`,
      );
    }
  }

  return { youtubeItems, instagramItems, correctionDimensions };
}

function makePlan(manifest, correctionManifest, batchRoot) {
  const { youtubeItems, instagramItems, correctionDimensions } = validateManifest(
    manifest,
    correctionManifest,
  );
  const instagramByFile = new Map(instagramItems.map((item) => [item.file, item]));
  const plan = [];

  for (const youtubeItem of youtubeItems) {
    const relativeFile = youtubeItem.file;
    requireValue(typeof relativeFile === "string" && relativeFile.length > 0, "Upload items need a file name");
    const sourcePath = resolvePath(relativeFile, batchRoot);
    requireValue(isInside(batchRoot, sourcePath), `Upload file escapes batch root: ${relativeFile}`);
    requireValue(fs.existsSync(sourcePath), `Uploaded file is missing locally: ${sourcePath}`);
    const localDimensions = probeLocalDimensions(sourcePath);
    requireValue(
      portraitDimensions(localDimensions),
      `Local file is not 9:16: ${relativeFile} (${localDimensions.width}x${localDimensions.height})`,
    );
    const instagramItem = instagramByFile.get(relativeFile);
    plan.push({
      file: relativeFile,
      sourcePath,
      youtubeUrl: youtubeItem.url,
      instagramUrl: instagramItem.url,
      localDimensions: `${localDimensions.width}x${localDimensions.height}`,
      instagramDimensions: `${(itemDimensions(instagramItem) || correctionDimensions).width}x${
        (itemDimensions(instagramItem) || correctionDimensions).height
      }`,
    });
  }

  return plan;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  requireValue(options["upload-manifest"], "--upload-manifest is required");
  const uploadManifestPath = resolvePath(options["upload-manifest"]);
  const batchRoot = resolvePath(options["batch-root"] || path.dirname(uploadManifestPath));
  const correctionManifestPath = options["instagram-correction-manifest"]
    ? resolvePath(options["instagram-correction-manifest"])
    : null;
  const quarantineRoot = resolvePath(
    options["quarantine-root"] ||
      path.join("..", ".quarantine", `goodandbaddaily-uploaded-renders-${new Date().toISOString().slice(0, 10)}`),
  );
  const manifest = readJson(uploadManifestPath);
  const correctionManifest = correctionManifestPath ? readJson(correctionManifestPath) : null;
  const plan = makePlan(manifest, correctionManifest, batchRoot);

  const targetRoot = path.join(quarantineRoot, path.basename(batchRoot));
  for (const item of plan) {
    const targetPath = path.join(targetRoot, item.file);
    requireValue(!fs.existsSync(targetPath), `Quarantine target already exists: ${targetPath}`);
  }

  const result = {
    status: options.apply ? "applied" : "dry-run",
    uploadManifest: uploadManifestPath,
    batchRoot,
    quarantineRoot: targetRoot,
    count: plan.length,
    files: plan,
  };

  if (!options.apply) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  fs.mkdirSync(targetRoot, { recursive: true });
  for (const item of plan) {
    const targetPath = path.join(targetRoot, item.file);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.renameSync(item.sourcePath, targetPath);
  }
  fs.writeFileSync(
    path.join(targetRoot, "cleanup-receipt.json"),
    `${JSON.stringify({ ...result, appliedAt: new Date().toISOString() }, null, 2)}\n`,
  );
  console.log(JSON.stringify(result, null, 2));
}

try {
  main();
} catch (error) {
  console.error(`cleanup-uploaded-renders: ${error.message}`);
  process.exitCode = 1;
}
