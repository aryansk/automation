/*
 * Shared production contract for choosing globe-map library presets against
 * spoken script beats.  The plan is deliberately renderer-agnostic so the
 * same story JSON can drive portrait Shorts and landscape long-form videos.
 */

import { getGlobeMapAnimation } from "./globe-map-library.js";

export const GLOBE_MAP_PLAN_VERSION = 1;
export const GLOBE_MAP_PLAN_LIBRARY = "globe-map-library";
export const GLOBE_MAP_PLAN_POLICY = "required";
export const GLOBE_MAP_PLAN_AUTO = "auto";

function asText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function asStart(value, fallback = Number.NaN) {
  const number = Number(value);
  return Number.isFinite(number) ? Number(number.toFixed(3)) : fallback;
}

function rawSegments(plan) {
  if (Array.isArray(plan)) return plan;
  if (!plan || typeof plan !== "object") return [];
  if (Array.isArray(plan.segments)) return plan.segments;
  if (Array.isArray(plan.beats)) return plan.beats;
  return [];
}

function animationIdFor(segment, fallback) {
  return asText(
    segment?.animationId
      ?? segment?.animation
      ?? segment?.mapAnimation,
    fallback,
  ).toLowerCase();
}

/**
 * Return a stable plan object even when a story has no authored plan yet.
 * The runtime resolves `auto` through the verified story metadata; it never
 * bypasses the globe-map catalog.
 */
export function createDefaultGlobeMapPlan() {
  return {
    version: GLOBE_MAP_PLAN_VERSION,
    library: GLOBE_MAP_PLAN_LIBRARY,
    policy: GLOBE_MAP_PLAN_POLICY,
    segments: [{
      id: "default-library-beat",
      scriptSection: "story",
      start: 0,
      animationId: GLOBE_MAP_PLAN_AUTO,
    }],
    authored: false,
  };
}

/**
 * Validate and normalize the script-to-animation contract.
 *
 * Each segment starts at a time relative to its story/chapter narration. It
 * remains active until the next segment starts, so agents only need to mark
 * the point where the script changes visual claim. `scriptCue` is editorial
 * guidance for the agent and is not used as a timing source.
 */
export function normalizeGlobeMapPlan(plan, {
  duration = Number.POSITIVE_INFINITY,
  requireLibrary = true,
} = {}) {
  const errors = [];
  const authored = plan !== undefined && plan !== null;
  const input = authored && !Array.isArray(plan) && plan && typeof plan === "object"
    ? plan
    : {};
  const defaultPlan = createDefaultGlobeMapPlan();

  if (authored && (typeof plan !== "object" || plan === null)) {
    errors.push("animationPlan must be an object or segment array");
  }
  if (authored && input.version !== undefined && Number(input.version) !== GLOBE_MAP_PLAN_VERSION) {
    errors.push(`animationPlan.version must be ${GLOBE_MAP_PLAN_VERSION}`);
  }
  if (authored && input.library !== undefined && asText(input.library) !== GLOBE_MAP_PLAN_LIBRARY) {
    errors.push(`animationPlan.library must be ${GLOBE_MAP_PLAN_LIBRARY}`);
  }
  if (requireLibrary && authored && input.policy !== undefined && asText(input.policy).toLowerCase() !== GLOBE_MAP_PLAN_POLICY) {
    errors.push(`animationPlan.policy must be ${GLOBE_MAP_PLAN_POLICY}`);
  }

  const defaultAnimation = animationIdFor(
    { animationId: input.defaultAnimation ?? input.default },
    GLOBE_MAP_PLAN_AUTO,
  );
  if (defaultAnimation !== GLOBE_MAP_PLAN_AUTO) {
    try {
      getGlobeMapAnimation(defaultAnimation);
    } catch {
      errors.push(`animationPlan.defaultAnimation is not a registered globe/map animation: ${defaultAnimation}`);
    }
  }
  if (requireLibrary && ["none", "disabled", "false"].includes(defaultAnimation)) {
    errors.push("animationPlan.defaultAnimation cannot disable the library in production");
  }

  const sourceSegments = authored ? rawSegments(plan) : defaultPlan.segments;
  if (authored && sourceSegments.length === 0) {
    errors.push("animationPlan.segments must contain at least one segment");
  }

  let previousStart = -0.001;
  const segments = sourceSegments.map((source, index) => {
    const segment = source && typeof source === "object" ? source : {};
    const prefix = `animationPlan.segments[${index}]`;
    const start = asStart(segment.start ?? segment.at, index === 0 ? 0 : Number.NaN);
    const scriptSection = asText(segment.scriptSection ?? segment.section ?? segment.part);
    const id = asText(segment.id, scriptSection || `segment-${String(index + 1).padStart(2, "0")}`);
    const animationId = animationIdFor(segment, defaultAnimation);

    if (!scriptSection) errors.push(`${prefix}.scriptSection is required`);
    if (!Number.isFinite(start) || start < 0) errors.push(`${prefix}.start must be a non-negative number`);
    if (Number.isFinite(start) && start < previousStart) errors.push(`${prefix}.start must be in script order`);
    if (Number.isFinite(duration) && duration > 0 && Number.isFinite(start) && start >= duration) {
      errors.push(`${prefix}.start must be before the scene duration (${duration}s)`);
    }
    previousStart = Number.isFinite(start) ? start : previousStart;

    if (animationId !== GLOBE_MAP_PLAN_AUTO && animationId !== "inherit") {
      try {
        getGlobeMapAnimation(animationId);
      } catch {
        errors.push(`${prefix}.animationId is not a registered globe/map animation: ${animationId}`);
      }
    }
    if (requireLibrary && ["none", "disabled", "false"].includes(animationId)) {
      errors.push(`${prefix}.animationId cannot disable the library in production`);
    }

    const mapData = segment.mapData ?? segment.data;
    if (mapData !== undefined && (typeof mapData !== "object" || mapData === null || Array.isArray(mapData))) {
      errors.push(`${prefix}.mapData must be an object when provided`);
    }

    return {
      id,
      scriptSection,
      scriptCue: asText(segment.scriptCue ?? segment.cue ?? segment.script),
      start: Number.isFinite(start) ? start : 0,
      animationId,
      ...(mapData !== undefined ? { mapData } : {}),
      ...(asText(segment.mapSource ?? segment.source) ? { mapSource: asText(segment.mapSource ?? segment.source) } : {}),
      ...(asText(segment.label) ? { label: asText(segment.label) } : {}),
    };
  });

  if (segments.length && segments[0].start !== 0) {
    errors.push("animationPlan.segments[0].start must be 0 so the library owns the whole scene");
  }

  return {
    version: GLOBE_MAP_PLAN_VERSION,
    library: GLOBE_MAP_PLAN_LIBRARY,
    policy: GLOBE_MAP_PLAN_POLICY,
    defaultAnimation,
    segments,
    authored,
    errors: [...new Set(errors)],
    valid: errors.length === 0,
  };
}

export function getGlobeMapPlanForScene(scene = {}, story = {}) {
  return scene?.animationPlan
    ?? scene?.visualPlan
    ?? story?.animationPlan
    ?? story?.visualPlan;
}

export function getActiveGlobeMapPlanSegment(plan, sceneTime = 0) {
  const segments = Array.isArray(plan?.segments) ? plan.segments : [];
  if (!segments.length) return null;
  const time = Number(sceneTime) || 0;
  let active = segments[0];
  for (const segment of segments) {
    if (time >= Number(segment.start || 0)) active = segment;
    else break;
  }
  return active;
}
