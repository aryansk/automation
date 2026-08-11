import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  GLOBE_MAP_FORMATS,
  GLOBE_MAP_LIBRARY_VERSION,
  GLOBE_MAP_SUPPORTED_LIBRARY_VERSIONS,
  getGlobeMapAnimation,
  validateProductionGlobeMapAnimationConfig,
  validateStrictGlobeMapAnimationConfig,
} from "../assets/animations/globe-map-library.js";

function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

export function validateGlobeMapSequence(sequence) {
  const errors = [];
  const warnings = [];

  if (!sequence || typeof sequence !== "object" || Array.isArray(sequence)) {
    return { valid: false, errors: ["sequence must be a JSON object"], warnings, duration: 0, sceneCount: 0 };
  }
  if (!GLOBE_MAP_SUPPORTED_LIBRARY_VERSIONS.includes(sequence.libraryVersion)) {
    errors.push(`libraryVersion must be one of: ${GLOBE_MAP_SUPPORTED_LIBRARY_VERSIONS.join(", ")}`);
  }
  if (!Object.hasOwn(GLOBE_MAP_FORMATS, sequence.format)) {
    errors.push(`format must be one of: ${Object.keys(GLOBE_MAP_FORMATS).join(", ")}`);
  }
  if (![24, 30, 60].includes(Number(sequence.fps))) {
    errors.push("fps must be 24, 30 or 60");
  }
  if (!Array.isArray(sequence.scenes) || sequence.scenes.length === 0) {
    errors.push("scenes must be a non-empty array");
  }

  const mode = sequence.mode === "production" ? "production" : "sample";
  let previousEnd = 0;
  (sequence.scenes || []).forEach((scene, index) => {
    const prefix = `scenes[${index}]`;
    let definition;
    try {
      definition = getGlobeMapAnimation(scene.animation);
    } catch (error) {
      errors.push(`${prefix}.animation: ${error.message}`);
      return;
    }

    if (!isFiniteNumber(scene.start) || Number(scene.start) < 0) {
      errors.push(`${prefix}.start must be a non-negative number`);
    }
    if (!isFiniteNumber(scene.duration) || Number(scene.duration) < 1.2) {
      errors.push(`${prefix}.duration must be at least 1.2 seconds`);
    }
    const start = Number(scene.start) || 0;
    const duration = Number(scene.duration) || 0;
    if (start < previousEnd - 0.0001) {
      errors.push(`${prefix} overlaps the previous scene (${start}s < ${previousEnd}s)`);
    }
    if (start > previousEnd + 0.0001) {
      warnings.push(`${prefix} leaves a ${Number((start - previousEnd).toFixed(3))}s gap`);
    }
    previousEnd = Math.max(previousEnd, start + duration);

    const validation = mode === "production"
      ? validateProductionGlobeMapAnimationConfig(definition.id, scene.data)
      : validateStrictGlobeMapAnimationConfig(definition.id, scene.data, {
          allowIllustrativeSource: true,
          requireSource: true,
        });
    validation.missing.forEach((field) => errors.push(`${prefix}.data is missing ${field}`));
    validation.issues.forEach((issue) => errors.push(`${prefix}.data: ${issue}`));

    if (duration < definition.duration * 0.65) {
      warnings.push(`${prefix} is shorter than 65% of the ${definition.duration}s default; verify readability`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    duration: Number(previousEnd.toFixed(3)),
    sceneCount: Array.isArray(sequence.scenes) ? sequence.scenes.length : 0,
    mode,
    format: sequence.format,
  };
}

export function readAndValidateSequence(filePath) {
  const absolute = path.resolve(filePath);
  const sequence = JSON.parse(fs.readFileSync(absolute, "utf8"));
  return { file: absolute, ...validateGlobeMapSequence(sequence) };
}

const modulePath = fileURLToPath(import.meta.url);
const invokedPath = process.argv[1] ? fileURLToPath(pathToFileURL(path.resolve(process.argv[1]))) : "";
if (modulePath === invokedPath) {
  const fallback = path.resolve(path.dirname(modulePath), "../stories/templates/globe-map-sequence.example.json");
  const file = process.argv[2] || fallback;
  try {
    const result = readAndValidateSequence(file);
    console.log(JSON.stringify(result, null, 2));
    if (!result.valid) process.exitCode = 1;
  } catch (error) {
    console.error(JSON.stringify({ valid: false, file: path.resolve(file), errors: [error.message] }, null, 2));
    process.exitCode = 1;
  }
}
