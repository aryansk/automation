import {
  getGlobeMapAnimation,
  validateGlobeMapAnimationConfig,
} from "./globe-map-library.js";
import { clamp } from "./globe-map-renderer.js";
import { createGlobeNativeAnnotationRenderer } from "./globe-native-annotation-renderer.js";
import { createHistoricalGlobeGallery } from "./historical-globe-gallery.js";

/* Representative presets across every family, rendered on the globe only. */
export const SAMPLE_PRESET_IDS = [
  "country-lock",
  "city-lock",
  "great-circle-route",
  "multi-leg-journey",
  "trade-flow-ribbons",
  "election-results-fill",
  "conflict-zone-hatch",
  "uncertainty-cloud",
  "storm-track",
  "wildfire-spread",
  "flood-inundation",
  "earthquake-ripple",
  "time-lapse-choropleth",
  "before-after-swipe",
];

export function buildSampleDefinitions() {
  return SAMPLE_PRESET_IDS.map((id) => {
    const definition = getGlobeMapAnimation(id);
    const sample = validateGlobeMapAnimationConfig(id).config;
    return { definition, sample };
  });
}

export function createGlobeSampleRuntime({
  canvas,
  features,
  width,
  height,
  format,
  segmentDuration = 3.2,
}) {
  const entries = buildSampleDefinitions();
  const totalDuration = entries.length * segmentDuration;
  const historicalGlobe = createHistoricalGlobeGallery({
    canvas: document.getElementById("globe-layer"),
    features: features?.features || features || [],
    width,
    height,
    format,
    entries,
    segmentDuration,
  });
  const renderer = createGlobeNativeAnnotationRenderer({
    canvas,
    features,
    width,
    height,
    format,
  });

  const label = document.getElementById("sample-label");
  const source = document.getElementById("sample-source");
  const counter = document.getElementById("sample-counter");

  function renderAt(time) {
    const safeTime = clamp(Number(time) || 0, 0, totalDuration - 0.0001);
    const index = Math.min(entries.length - 1, Math.floor(safeTime / segmentDuration));
    const localTime = safeTime - index * segmentDuration;
    const localProgress = clamp(localTime / segmentDuration);
    const { definition, sample } = entries[index];
    const view = historicalGlobe.renderAt(safeTime);
    renderer.render(definition.id, localProgress * definition.duration, sample, view);
    if (label) {
      label.textContent = `${definition.id.toUpperCase()} / ${definition.category.toUpperCase()} / GLOBE`;
    }
    if (source) source.textContent = sample.source;
    if (counter) counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(entries.length).padStart(2, "0")}`;
  }

  return {
    renderer,
    historicalGlobe,
    renderAt,
    totalDuration,
    segmentDuration,
    entries,
  };
}

export function bootGlobeSample({ format }) {
  const root = document.querySelector("[data-composition-id]");
  const canvas = document.getElementById("sample-canvas");
  const width = Number(root?.dataset.width || canvas?.width || 1920);
  const height = Number(root?.dataset.height || canvas?.height || 1080);
  const worldData = window.DAILY_NEWS_GEO || { type: "FeatureCollection", features: [] };
  const runtime = createGlobeSampleRuntime({
    canvas,
    features: worldData,
    width,
    height,
    format,
  });

  const playhead = { time: 0 };
  const timeline = gsap.timeline({ paused: true });
  timeline.to(playhead, {
    time: runtime.totalDuration,
    duration: runtime.totalDuration,
    ease: "none",
    onUpdate: () => runtime.renderAt(playhead.time),
  }, 0);

  window.__timelines = window.__timelines || {};
  window.__timelines[root.dataset.compositionId] = timeline;
  window.addEventListener("hf-seek", (event) => runtime.renderAt(event.detail?.time || 0));
  runtime.renderAt(0);
  window.__globeSampleRuntime = runtime;
  window.__globeSampleReady = runtime.historicalGlobe.ready.then(() => runtime);
  return runtime;
}
