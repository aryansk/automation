/*
 * godandbaddaily — shared runtime bridge between a composition and the
 * editorial globe/map library.
 *
 * A composition hands this module its story and scene timing; the module
 * resolves the per-scene map animation (explicit or automatic via
 * globe-map-selector.js), then renders the chosen preset as transparent
 * globe-native annotations through globe-native-annotation-renderer.js. The canonical visible globe is
 * the established Three.js createGlobeTour surface beneath it. In production, an authored or
 * automatic beat always resolves to a catalog preset; claim-bearing presets
 * still require verified data, while a neutral world-orbit beat covers scenes
 * with no geography. It never fabricates a map.
 *
 * Rendering is deterministic: the only clock is the frame time supplied by
 * the composition's hf-seek handler.
 */

import {
  GLOBE_MAP_PLAN_AUTO,
  getActiveGlobeMapPlanSegment,
  getGlobeMapPlanForScene,
  normalizeGlobeMapPlan,
} from "./globe-map-plan.js";
import {
  resolveChapterMapAnimation,
  selectStoryMapAnimation,
} from "./globe-map-selector.js";
import { createGlobeNativeAnnotationRenderer } from "./globe-native-annotation-renderer.js";

const LIBRARY_FALLBACK_ID = "world-orbit";
const LIBRARY_FALLBACK_SOURCE = "godandbaddaily / globe-map library context";

function canvas2d(canvas) {
  return canvas && typeof canvas.getContext === "function" ? canvas : null;
}

/**
 * Create a map renderer bound to one canvas, sized for a format.
 * Returns null when the canvas or Canvas 2D context is unavailable — the
 * composition keeps its existing backdrop in that case.
 */
export function createGlobeMapLayer({
  canvas,
  features,
  width,
  height,
  format = "landscape",
  theme = {},
  drawBackground = true,
  /* Runtime compositions already provide the canonical Three.js globe. */
  drawGlobeSurface = false,
  safeRects = [],
}) {
  const target = canvas2d(canvas);
  if (!target) return null;
  try {
    return createGlobeNativeAnnotationRenderer({
      canvas: target,
      features,
      width,
      height,
      format,
      safeRects,
    });
  } catch {
    return null;
  }
}

/**
 * Resolve the map animation for a chapter (or whole story when no chapters
 * exist, e.g. the portrait tour). Returns the selectStoryMapAnimation result
 * with the resolved format.
 */
export function resolveMapForScene({ chapter, story, format, mode = "production" }) {
  if (chapter && typeof chapter === "object") {
    return resolveChapterMapAnimation(chapter, story, { format, mode });
  }
  return selectStoryMapAnimation(story || {}, { format, mode });
}

function sceneWithPlanSegment({ chapter, story, segment }) {
  const animationId = String(segment?.animationId || "auto").trim().toLowerCase();
  const explicit = animationId && !["auto", "inherit"].includes(animationId)
    ? { mapAnimation: animationId }
    : {};
  const segmentData = segment?.mapData && typeof segment.mapData === "object"
    ? { mapData: segment.mapData }
    : {};
  const segmentSource = segment?.mapSource ? { mapSource: segment.mapSource } : {};
  return {
    ...(story && typeof story === "object" ? story : {}),
    ...(chapter && typeof chapter === "object" ? chapter : {}),
    ...explicit,
    ...segmentData,
    ...segmentSource,
  };
}

function resolveLibraryFallback(scene, { format, mode }) {
  const candidateSource = String(scene?.mapSource || scene?.source || "").trim();
  const source = candidateSource && !/illustrative sample data/i.test(candidateSource)
    ? candidateSource
    : LIBRARY_FALLBACK_SOURCE;
  return selectStoryMapAnimation(
    {
      ...scene,
      mapAnimation: LIBRARY_FALLBACK_ID,
      mapData: null,
      mapSource: source,
      source,
    },
    { format, mode },
  );
}

/**
 * Resolve every authored script beat to a catalog preset. A missing plan is
 * intentionally materialized as one automatic library beat, so new Shorts
 * and long-form stories cannot silently fall back to the legacy globe-only
 * path. Claim-bearing presets still require verified story data; a neutral
 * world-orbit is the safe library fallback when a scene has no geography.
 */
export function resolveMapPlanForScene({
  chapter,
  story = {},
  format = "landscape",
  mode = "production",
  duration = Number.POSITIVE_INFINITY,
  requireLibrary = true,
} = {}) {
  const scene = chapter && typeof chapter === "object" ? chapter : story;
  const authoredPlan = getGlobeMapPlanForScene(chapter, story);
  const normalized = normalizeGlobeMapPlan(authoredPlan, { duration, requireLibrary });
  const sourceSegments = normalized.segments.length
    ? normalized.segments
    : [{ id: "fallback-library-beat", scriptSection: "story", start: 0, animationId: "auto" }];

  const resolutionErrors = [];
  const segments = sourceSegments.map((segment) => {
    const candidate = sceneWithPlanSegment({ chapter, story, segment });
    const requestedAnimationId = String(segment.animationId || "auto").trim().toLowerCase();
    let resolved = chapter && typeof chapter === "object"
      ? resolveChapterMapAnimation(candidate, story, { format, mode })
      : selectStoryMapAnimation(candidate, { format, mode });

    const requestedExplicitPreset = ![GLOBE_MAP_PLAN_AUTO, "inherit"].includes(requestedAnimationId);
    if (requestedExplicitPreset && !resolved?.animationId) {
      resolutionErrors.push(
        `animationPlan segment ${segment.id} could not resolve ${requestedAnimationId} from verified story data`,
      );
    }

    if (requireLibrary && mode === "production" && !resolved?.animationId) {
      resolved = resolveLibraryFallback(candidate, { format, mode });
    }

    return {
      ...segment,
      resolved,
    };
  });

  return {
    version: normalized.version,
    library: normalized.library,
    policy: normalized.policy,
    authored: normalized.authored,
    valid: normalized.valid && resolutionErrors.length === 0,
    errors: [...normalized.errors, ...resolutionErrors],
    scene,
    segments,
  };
}

/**
 * Render the active script beat at a time relative to its scene/chapter.
 * The underlying map renderer clamps the local clock to the selected preset's
 * duration, which keeps short beats readable without inventing a second
 * animation clock.
 */
export function renderMapPlan({ layer, sceneTime, plan, view = null }) {
  if (!layer || !plan) return null;
  const segment = getActiveGlobeMapPlanSegment(plan, sceneTime);
  if (!segment?.resolved?.animationId) return null;
  const localTime = Math.max(0, (Number(sceneTime) || 0) - Number(segment.start || 0));
  return layer.render(segment.resolved.animationId, localTime, segment.resolved.data, view);
}

/**
 * Render one scene's map at an animation-local time. `sceneTime` is seconds
 * since the scene started; the renderer clamps it to the preset duration.
 * Returns the renderer result, or null when no map applies.
 */
export function renderSceneMap({ layer, sceneTime, resolved, view = null }) {
  if (!layer || !resolved?.animationId) return null;
  const time = Number(sceneTime) || 0;
  return layer.render(resolved.animationId, time, resolved.data, view);
}

/**
 * Render a representative hero frame for a scene's map (used for snapshots
 * and contact sheets). Returns the renderer result or null.
 */
export function renderSceneMapHero({ layer, resolved, view = null }) {
  if (!layer || !resolved?.animationId) return null;
  return layer.renderHeroFrame(resolved.animationId, resolved.data, view);
}
