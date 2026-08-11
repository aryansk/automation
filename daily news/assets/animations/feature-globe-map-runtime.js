/*
 * Feature-render bridge for the canonical historical globe.
 *
 * Feature compositions have their own editorial boards, but their geographic
 * beats use the same 60-preset globe-map library as Shorts, long-form stories
 * and the showcase. The map canvas is intentionally transparent: the
 * established Three.js globe remains the only visible globe surface.
 */

import { listGlobeMapAnimations } from "./globe-map-library.js";
import {
  createGlobeMapLayer,
  renderMapPlan,
  resolveMapPlanForScene,
} from "./globe-map-runtime.js";

const AUTO_IDS = new Set(["", "auto", "inherit"]);

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function nonEmptyObject(value) {
  return isObject(value) && Object.keys(value).length > 0;
}

function asJsonObject(value) {
  return nonEmptyObject(value) ? value : null;
}

function asAnimationId(value) {
  return String(value || "").trim().toLowerCase();
}

function hasExplicitChoice(value) {
  if (!isObject(value)) return false;
  const hasPlan = [value.animationPlan, value.visualPlan].some((entry) => (
    (isObject(entry) && Object.keys(entry).length > 0)
      || (Array.isArray(entry) && entry.length > 0)
  ));
  if (hasPlan) return true;
  return [value.mapAnimation, value.animationId, value.animation, value.visualType]
    .some((entry) => entry !== undefined && entry !== null && entry !== "" && entry !== "auto" && entry !== "inherit");
}

/**
 * Apply optional feature-render variables without weakening authored
 * precedence. A supplied plan is a story-level plan; a simple preset ID is a
 * default for chapters that do not already carry their own plan or ID.
 */
export function mergeFeatureGlobeSelection({
  story = {},
  chapters = [],
  animationId = "",
  animationPlan = null,
  mapData = null,
  mapSource = "",
} = {}) {
  const selectedId = asAnimationId(animationId);
  const selectedPlan = asJsonObject(animationPlan) || (Array.isArray(animationPlan) && animationPlan.length ? animationPlan : null);
  const selectedData = asJsonObject(mapData);
  const selectedSource = String(mapSource || "").trim();
  const storyHasPlan = isObject(story) && (story.animationPlan !== undefined || story.visualPlan !== undefined);
  const storyOverrides = {};

  if (selectedPlan) storyOverrides.animationPlan = selectedPlan;
  if (selectedId && !AUTO_IDS.has(selectedId) && !selectedPlan && !storyHasPlan) {
    storyOverrides.mapAnimation = selectedId;
  }
  if (selectedData) storyOverrides.mapData = selectedData;
  if (selectedSource) storyOverrides.mapSource = selectedSource;

  const resolvedStory = { ...(isObject(story) ? story : {}), ...storyOverrides };
  const resolvedChapters = (Array.isArray(chapters) ? chapters : []).map((chapter) => {
    const resolvedChapter = isObject(chapter) ? { ...chapter } : {};
    if (selectedId && !AUTO_IDS.has(selectedId) && !hasExplicitChoice(resolvedChapter) && !selectedPlan) {
      resolvedChapter.mapAnimation = selectedId;
    }
    if (selectedData && resolvedChapter.mapData === undefined) resolvedChapter.mapData = selectedData;
    if (selectedSource && resolvedChapter.mapSource === undefined) resolvedChapter.mapSource = selectedSource;
    return resolvedChapter;
  });

  return Object.freeze({
    story: resolvedStory,
    chapters: Object.freeze(resolvedChapters),
    animationId: selectedId || "auto",
    hasPlan: Boolean(selectedPlan),
  });
}

/**
 * Return safe, UI-ready metadata for every preset. Sample payloads are not
 * exposed here: feature production must supply verified chapter/story data.
 */
export function getFeatureGlobeAnimationOptions(format = "landscape") {
  return Object.freeze(listGlobeMapAnimations({ format }).map((definition) => Object.freeze({
    id: definition.id,
    title: definition.title,
    family: definition.family,
    category: definition.category,
    summary: definition.summary,
    useWhen: definition.useWhen,
    avoidWhen: definition.avoidWhen,
    required: definition.required,
    formats: definition.formats,
    duration: definition.duration,
    projection: definition.projection,
  })));
}

function numericStarts(starts, count) {
  return Array.from({ length: count }, (_, index) => {
    const value = Number(Array.isArray(starts) ? starts[index] : Number.NaN);
    return Number.isFinite(value) ? Math.max(0, value) : index;
  });
}

function defaultSafeRects(width, height) {
  return [
    { x: 64, y: 118, width: Math.min(860, width * 0.46), height: 142 },
    { x: Math.max(980, width * 0.52), y: 108, width: Math.max(0, width * 0.45 - 64), height: Math.max(0, height - 190) },
    { x: 64, y: Math.max(0, height - 150), width: Math.min(920, width * 0.5), height: 98 },
  ];
}

/**
 * Create the shared feature renderer. It resolves one production plan per
 * chapter and exposes all catalog choices for a host UI or variables editor.
 */
export function createFeatureGlobeMapRuntime({
  canvas,
  features = [],
  width = 1920,
  height = 1080,
  format = "landscape",
  story = {},
  chapters = [],
  starts = [],
  chapterEnd = null,
  endCardStart = Number.POSITIVE_INFINITY,
  mode = "production",
  requireLibrary = true,
  safeRects = null,
  animationId = "",
  animationPlan = null,
  mapData = null,
  mapSource = "",
} = {}) {
  const selection = mergeFeatureGlobeSelection({
    story,
    chapters,
    animationId,
    animationPlan,
    mapData,
    mapSource,
  });
  const sceneChapters = selection.chapters.length ? selection.chapters : [selection.story];
  const sceneStarts = numericStarts(starts, sceneChapters.length);
  const options = getFeatureGlobeAnimationOptions(format);
  const layer = createGlobeMapLayer({
    canvas,
    features,
    width,
    height,
    format,
    drawBackground: false,
    drawGlobeSurface: false,
    safeRects: Array.isArray(safeRects) ? safeRects : defaultSafeRects(width, height),
  });
  const plans = sceneChapters.map((chapter, index) => {
    const start = sceneStarts[index] || 0;
    const fallbackEnd = index < sceneChapters.length - 1
      ? sceneStarts[index + 1]
      : Number(endCardStart);
    const duration = typeof chapterEnd === "function"
      ? Number(chapterEnd(index)) - start
      : fallbackEnd - start;
    return resolveMapPlanForScene({
      chapter: selection.chapters.length ? chapter : undefined,
      story: selection.story,
      format,
      mode,
      duration: Math.max(0.1, Number.isFinite(duration) ? duration : 30),
      requireLibrary,
    });
  });

  function activeChapterIndex(time) {
    const value = Number(time) || 0;
    let index = 0;
    sceneStarts.forEach((start, candidateIndex) => {
      if (value >= start) index = candidateIndex;
    });
    return Math.min(sceneChapters.length - 1, index);
  }

  function render(time, view = null) {
    if (!layer || !plans.length) return null;
    const index = activeChapterIndex(time);
    const localTime = Math.max(0, (Number(time) || 0) - (sceneStarts[index] || 0));
    return renderMapPlan({ layer, sceneTime: localTime, plan: plans[index], view });
  }

  const resolvedSelection = Object.freeze(plans.map((plan) => Object.freeze({
    ids: Object.freeze(plan.segments.map((segment) => segment.resolved?.animationId || null)),
    valid: plan.valid,
    errors: Object.freeze(plan.errors || []),
  })));

  return Object.freeze({
    layer,
    story: selection.story,
    chapters: selection.chapters,
    plans: Object.freeze(plans),
    availableAnimations: options,
    selected: resolvedSelection,
    activeChapterIndex,
    render,
    clear: () => layer?.clear?.(),
  });
}
