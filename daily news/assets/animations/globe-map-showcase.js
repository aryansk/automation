import {
  getGlobeMapLibrarySummary,
  globeMapAnimations,
  validateGlobeMapAnimationConfig,
} from "./globe-map-library.js";
import { clamp, easeOutCubic, smootherstep } from "./globe-map-renderer.js";
import { createGlobeNativeAnnotationRenderer } from "./globe-native-annotation-renderer.js";
import { createHistoricalGlobeGallery } from "./historical-globe-gallery.js";

const root = document.querySelector("[data-composition-id]");
const canvas = document.getElementById("map-canvas");
const format = root?.dataset.format || (Number(root?.dataset.height) > Number(root?.dataset.width) ? "portrait" : "landscape");
const width = Number(root?.dataset.width || canvas?.width || 1920);
const height = Number(root?.dataset.height || canvas?.height || 1080);
const segmentDuration = Number(root?.dataset.segmentDuration || 2.6);
const timeOffset = Number(root?.dataset.startOffset || 0);
const totalDuration = Number(root?.dataset.duration || globeMapAnimations.length * segmentDuration);

const title = document.getElementById("showcase-title");
const summary = document.getElementById("showcase-summary");
const presetId = document.getElementById("preset-id");
const category = document.getElementById("category-label");
const sampleLabel = document.getElementById("sample-data-label");
const useNote = document.getElementById("use-note-copy");
const counterCurrent = document.getElementById("counter-current");
const counterTotal = document.getElementById("counter-total");
const progressBar = document.getElementById("progress-bar");
const progressLabel = document.getElementById("progress-label");
const infoPanel = document.getElementById("info-panel");
const usePanel = document.getElementById("use-note");
const sourceNote = document.getElementById("source-note");
const formatMark = document.getElementById("format-mark");

const worldData = window.DAILY_NEWS_GEO || { type: "FeatureCollection", features: [] };
const entries = globeMapAnimations.map((definition) => ({
  definition,
  sample: validateGlobeMapAnimationConfig(definition.id).config,
}));
const historicalGlobe = createHistoricalGlobeGallery({
  canvas: document.getElementById("globe-layer"),
  features: worldData.features || [],
  width,
  height,
  format,
  entries,
  segmentDuration,
});
const annotationSafeRects = format === "portrait"
  ? [
    { x: 48, y: 42, width: width - 96, height: 126 },
    { x: 48, y: 142, width: Math.min(width - 96, 760), height: 390 },
    { x: 48, y: Math.max(0, height - 700), width: width - 96, height: 500 },
    { x: 48, y: Math.max(0, height - 176), width: width - 96, height: 120 },
  ]
  : [
    { x: 48, y: 30, width: width - 96, height: 100 },
    { x: 48, y: 96, width: 720, height: 130 },
    { x: 48, y: Math.max(0, height - 560), width: 720, height: 460 },
    { x: Math.max(0, width - 650), y: Math.max(0, height - 390), width: 600, height: 300 },
    { x: 700, y: Math.max(0, height - 145), width: Math.max(0, width - 750), height: 110 },
  ];
const renderer = createGlobeNativeAnnotationRenderer({
  canvas,
  features: worldData,
  width,
  height,
  format,
  safeRects: annotationSafeRects,
});

const librarySummary = getGlobeMapLibrarySummary();
counterTotal.textContent = String(librarySummary.total).padStart(2, "0");
formatMark.textContent = format === "portrait" ? "SHORTS / 1080×1920" : "LONG FORM / 1920×1080";
sourceNote.textContent = `${librarySummary.total} PRESETS · V${librarySummary.version} · HISTORICAL GLOBE / NATIVE ANNOTATIONS`;

let lastIndex = -1;

function sceneState(time) {
  const safeTime = clamp(Number(time) || 0, 0, totalDuration - 0.0001);
  const absoluteTime = clamp(timeOffset + safeTime, 0, globeMapAnimations.length * segmentDuration - 0.0001);
  const index = Math.min(globeMapAnimations.length - 1, Math.floor(absoluteTime / segmentDuration));
  const localTime = absoluteTime - index * segmentDuration;
  const localProgress = clamp(localTime / segmentDuration);
  return { safeTime, absoluteTime, index, localProgress, definition: globeMapAnimations[index] };
}

function applyPanelMotion(localProgress) {
  const enter = easeOutCubic(clamp(localProgress / 0.16));
  const exit = 1 - smootherstep(0.86, 1, localProgress);
  const visibility = Math.min(enter, exit);
  const panelTravel = format === "portrait" ? 64 : 52;
  const useTravel = format === "portrait" ? -28 : 34;
  const scenePhase = (Math.max(0, lastIndex) % 5) * 0.44;
  const bob = Math.sin(localProgress * Math.PI * 2 + scenePhase) * 3.5 * visibility;
  infoPanel.style.opacity = String(visibility);
  infoPanel.style.transform = `translate3d(0, ${(1 - enter) * panelTravel + (1 - exit) * 18 + bob}px, 0) scale(${0.985 + visibility * 0.015})`;
  usePanel.style.opacity = String(Math.min(smootherstep(0.16, 0.34, localProgress), exit));
  const useBob = Math.sin(localProgress * Math.PI * 2 + scenePhase + 0.7) * 2.2 * visibility;
  usePanel.style.transform = `translate3d(${(1 - smootherstep(0.16, 0.34, localProgress)) * useTravel}px, ${useBob}px, 0)`;
}

function updateText(definition, index) {
  if (index === lastIndex) return;
  lastIndex = index;
  title.textContent = definition.title;
  summary.textContent = definition.summary;
  presetId.textContent = definition.id;
  category.textContent = definition.category;
  sampleLabel.textContent = definition.sample.label;
  useNote.textContent = definition.useWhen;
  counterCurrent.textContent = String(index + 1).padStart(2, "0");
  progressLabel.textContent = `${definition.category.toUpperCase()} / ${definition.projection.toUpperCase()} / ${definition.duration.toFixed(1)}S DEFAULT`;
}

function renderAt(time) {
  const { safeTime, absoluteTime, index, localProgress, definition } = sceneState(time);
  updateText(definition, index);
  applyPanelMotion(localProgress);
  progressBar.style.transform = `scaleX(${safeTime / totalDuration})`;
  const view = historicalGlobe.renderAt(absoluteTime);
  renderer.render(definition.id, localProgress * definition.duration, entries[index].sample, view);
}

const playhead = { time: 0 };
const timeline = gsap.timeline({ paused: true });
timeline.to(playhead, {
  time: totalDuration,
  duration: totalDuration,
  ease: "none",
  onUpdate: () => renderAt(playhead.time),
}, 0);

window.__timelines = window.__timelines || {};
window.__timelines[root.dataset.compositionId] = timeline;
window.addEventListener("hf-seek", (event) => renderAt(event.detail?.time || 0));

renderAt(0);
window.__globeMapShowcase = Object.freeze({
  renderer,
  historicalGlobe,
  renderAt,
  totalDuration,
  segmentDuration,
  animationCount: globeMapAnimations.length,
  format,
});
window.__globeMapShowcaseReady = historicalGlobe.ready.then(() => window.__globeMapShowcase);
