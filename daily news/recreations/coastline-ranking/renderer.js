import { createGlobeTour } from "/assets/animations/globe-tour.js";
import {
  createGlobeMapLayer,
  renderMapPlan,
  resolveMapPlanForScene,
} from "/assets/animations/globe-map-runtime.js";
import { TOPIC } from "./topic-data.js";

const variables = window.__coastlineVariables || {};
const root = document.getElementById("root");
const compositionId = root?.dataset.compositionId || TOPIC.id;
const timeline = window.__timelines[compositionId];
const WIDTH = Number(root?.dataset.width || 1080);
const HEIGHT = Number(root?.dataset.height || 1920);
const DURATION = Number(variables.duration || root?.dataset.duration || TOPIC.duration);
const features = window.DAILY_NEWS_GEO?.features || [];

function parseJson(value, fallback) {
  if (Array.isArray(value) || (value && typeof value === "object")) return value;
  try {
    const parsed = JSON.parse(String(value || ""));
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = String(value ?? "");
}

const parseTour = (value) => {
  const parsed = parseJson(value, []);
  return Array.isArray(parsed) ? parsed : [];
};

const coldCodes = new Set(["FI", "RU"]);
function highlightPalette(countryCode) {
  switch (String(countryCode || "").toUpperCase()) {
    case "FI":
      return { fill: "rgba(83,190,226,0.90)", glow: "rgba(229,250,255,1)" };
    case "SR":
      return { fill: "rgba(86,196,188,0.88)", glow: "rgba(213,255,245,0.98)" };
    case "NA":
      return { fill: "rgba(131,192,212,0.88)", glow: "rgba(230,248,255,0.98)" };
    case "RU":
      return { fill: "rgba(75,168,220,0.92)", glow: "rgba(224,249,255,1)" };
    case "BA":
      return { fill: "rgba(99,176,231,0.90)", glow: "rgba(232,249,255,0.98)" };
    default:
      return { fill: "rgba(86,196,188,0.88)", glow: "rgba(213,255,245,0.98)" };
  }
}

const fallbackStarts = [8.95, 18.05, 27.15, 36.25, 45.35];
const authoredStops = parseTour(variables.tour);
const stops = authoredStops.length
  ? authoredStops
  : TOPIC.chapters.map((chapter, index) => ({
    countryCode: chapter.code,
    countryName: chapter.country,
    coordinates: chapter.coordinates,
    mapSource: chapter.mapSource,
    speakAt: fallbackStarts[index],
    travelStart: Math.max(1.6, fallbackStarts[index] - 3.35),
    arrive: Math.max(0.4, fallbackStarts[index] - 0.58),
    holdUntil: index < TOPIC.chapters.length - 1 ? fallbackStarts[index + 1] - 0.16 : 56.7,
    focusZoom: chapter.code === "BA" ? 3.5 : chapter.code === "SR" ? 4.0 : chapter.code === "NA" ? 4.2 : coldCodes.has(chapter.code) ? 4.5 : 4.7,
    resetCamera: index > 0,
  }));
if (stops.length !== TOPIC.chapters.length) {
  throw new Error(`coastline-ranking expects ${TOPIC.chapters.length} globe stops, received ${stops.length}`);
}

setText("desk-name", variables.deskName || TOPIC.deskName);
setText("edition", variables.edition || TOPIC.edition);
setText("opener-title-top", TOPIC.titleTop);
setText("opener-title-bottom", TOPIC.titleBottom);
setText("opener-sub", variables.openerSub || TOPIC.openerSub);
setText("closer-title", TOPIC.closer.title);
setText("closer-sub", TOPIC.closer.sub);

TOPIC.chapters.forEach((chapter, index) => {
  setText(`caption-eyebrow-${index}`, chapter.kicker);
  setText(`caption-plain-${index}`, chapter.captionPlain);
  setText(`caption-accent-${index}`, chapter.captionAccent);
  setText(`chapter-rank-${index}`, String(chapter.rank).padStart(2, "0"));
  setText(`chapter-kicker-${index}`, chapter.kicker);
  setText(`chapter-country-${index}`, chapter.country);
  setText(`chapter-headline-${index}`, chapter.headline);
  setText(`chapter-detail-${index}`, chapter.detail);
  setText(`chapter-source-${index}`, `SOURCE / ${chapter.mapSource}`);
});

/* The drafting mat is deterministic, so frame seeks cannot produce a new
 * pattern behind the globe. It is a quiet texture, not a second focal point. */
function paintMatteTexture() {
  const canvas = document.getElementById("space-layer");
  const context = canvas?.getContext("2d");
  if (!context) return;
  let seed = 20260812;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  context.clearRect(0, 0, WIDTH, HEIGHT);
  for (let index = 0; index < 560; index += 1) {
    const x = random() * WIDTH;
    const y = random() * HEIGHT;
    const length = random() * 4.4 + 0.5;
    const angle = random() * Math.PI;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    context.strokeStyle = `rgba(226,235,221,${(0.025 + random() * 0.07).toFixed(3)})`;
    context.lineWidth = random() * 0.8 + 0.25;
    context.stroke();
  }
}
paintMatteTexture();

function storyForStop(stop) {
  return {
    countryCode: stop.countryCode,
    countryName: stop.countryName,
    coordinates: stop.coordinates,
    mapAnimation: "country-outline",
    mapData: {
      target: {
        code: stop.countryCode,
        name: stop.countryName,
        country: stop.countryName,
        coordinates: stop.coordinates,
      },
    },
    mapSource: stop.mapSource,
    source: stop.mapSource,
  };
}

const mapLayer = createGlobeMapLayer({
  canvas: document.getElementById("map-layer"),
  features,
  width: WIDTH,
  height: HEIGHT,
  format: "portrait",
  drawBackground: false,
  drawGlobeSurface: false,
  safeRects: [
    { x: 58, y: 46, width: 964, height: 112 },
    { x: 48, y: 1060, width: 984, height: 330 },
    { x: 48, y: 1330, width: 984, height: 405 },
  ],
  showLabels: false,
});

const stopMapPlans = stops.map((stop) => resolveMapPlanForScene({
  story: storyForStop(stop),
  format: "portrait",
  mode: "production",
  duration: Math.max(0.1, Number(stop.holdUntil) - Number(stop.arrive)),
  requireLibrary: true,
}));
stopMapPlans.forEach((plan, index) => {
  if (!plan.valid) throw new Error(`globe map plan ${index + 1}: ${plan.errors.join("; ")}`);
});
const openingMapPlan = resolveMapPlanForScene({
  story: {
    mapAnimation: "world-orbit",
    mapSource: "green globe workflow / global orientation",
    source: "green globe workflow / global orientation",
  },
  format: "portrait",
  mode: "production",
  duration: Math.max(0.1, Number(stops[0].arrive)),
  requireLibrary: true,
});

const globe = createGlobeTour({
  canvas: document.getElementById("globe-layer"),
  width: WIDTH,
  height: HEIGHT,
  features,
  stops: stops.map((stop) => ({
    ...highlightPalette(stop.countryCode),
    countryCode: stop.countryCode,
    coordinates: stop.coordinates,
    travelStart: Number(stop.travelStart),
    arrive: Number(stop.arrive),
    holdUntil: Number(stop.holdUntil),
    focusZoom: Number(stop.focusZoom || (stop.countryCode === "BA" ? 3.5 : stop.countryCode === "SR" ? 4.0 : stop.countryCode === "NA" ? 4.2 : coldCodes.has(stop.countryCode) ? 4.5 : 4.7)),
    resetCamera: stop.resetCamera !== false,
    freezeMode: stop.freezeMode || (stop.countryCode === "FI" ? "baltic" : stop.countryCode === "RU" ? "arctic" : null),
    highlightFill: stop.highlightFill || highlightPalette(stop.countryCode).fill,
    highlightGlow: stop.highlightGlow || highlightPalette(stop.countryCode).glow,
    routePoints: [],
    mentionedCountryCodes: [],
    affectedCountryCodes: [],
  })),
  defaultCameraZ: 6.4,
  openingCameraZ: 14.8,
  baseHeight: 0.08,
  liftHeight: 0.21,
  openingHeight: 0.04,
  idleSpin: 0.034,
  showRouteMarkers: false,
  showRouteLayers: false,
  showCountryHighlights: true,
});

const cards = TOPIC.chapters.map((_, index) => ({
  element: document.getElementById(`chapter-${index}`),
  rank: document.getElementById(`chapter-rank-${index}`),
  kicker: document.getElementById(`chapter-kicker-${index}`),
  country: document.getElementById(`chapter-country-${index}`),
  headline: document.getElementById(`chapter-headline-${index}`),
  detail: document.getElementById(`chapter-detail-${index}`),
  source: document.getElementById(`chapter-source-${index}`),
}));
const captions = TOPIC.chapters.map((_, index) => ({
  element: document.getElementById(`caption-${index}`),
  eyebrow: document.getElementById(`caption-eyebrow-${index}`),
  plain: document.getElementById(`caption-plain-${index}`),
  accent: document.getElementById(`caption-accent-${index}`),
}));
TOPIC.chapters.forEach((chapter, index) => {
  const isCold = coldCodes.has(chapter.code);
  captions[index].element?.classList.toggle("is-cold", isCold);
  cards[index].element?.classList.toggle("is-cold", isCold);
});

/* One paused timeline owns every DOM transition. The globe is driven by the
 * same seek time in the handler below, so browser preview and MP4 rendering
 * share the exact clock. */
  const openerEnd = Number(variables.openerEnd) || 4.3;
const endCardStart = Number(variables.endCardStart) || 55.4;
const endCardReveal = Number(variables.endCardReveal) || endCardStart + 0.28;

timeline.set("#opener, #closer, .caption, .chapter-card", { opacity: 0 }, 0);
timeline.set("#progress-rail, #footer", { opacity: 0 }, 0);
timeline.set("#chrome", { opacity: 0, y: -18 }, 0);
timeline.set("#chrome-rule", { scaleX: 0 }, 0);
timeline.set(".opener__eyebrow", { opacity: 0, x: -18 }, 0);
timeline.set("#opener h1 span:first-child", { opacity: 0, y: 40 }, 0);
timeline.set("#opener h1 span:last-child", { opacity: 0, y: 52 }, 0);
timeline.set(".opener__sub", { opacity: 0 }, 0);
timeline.set(".caption__eyebrow", { opacity: 0, y: 8 }, 0);
timeline.set(".caption__plain", { opacity: 0, y: 14 }, 0);
timeline.set(".caption__accent", { opacity: 0, y: 24, scale: 0.88 }, 0);
timeline.set(".chapter-card__rank", { opacity: 0, x: -20, scale: 0.76 }, 0);
timeline.set(".chapter-card__kicker", { opacity: 0 }, 0);
timeline.set(".chapter-card__country", { opacity: 0, y: 16 }, 0);
timeline.set(".chapter-card__headline", { opacity: 0, y: 10 }, 0);
timeline.set(".chapter-card__detail", { opacity: 0, y: 8 }, 0);
timeline.set(".chapter-card__source", { opacity: 0 }, 0);
timeline.set(".closer__eyebrow", { opacity: 0, y: 10 }, 0);
timeline.set(".closer__title", { opacity: 0, y: 18 }, 0);
timeline.set(".closer__sub", { opacity: 0, y: 10 }, 0);
timeline.set(".closer__stamp", { opacity: 0, scale: 0.92 }, 0);
timeline.set("#freeze-wash", { opacity: 0 }, 0);
timeline.set("#caption-opener", { opacity: 0, y: 24, scale: 0.985 }, 0);
timeline.fromTo("#chrome", { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.65 }, 0.18);
timeline.fromTo("#chrome-rule", { scaleX: 0 }, { scaleX: 1, duration: 0.82, ease: "expo.out" }, 0.34);
timeline.fromTo("#opener", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.72, ease: "expo.out", immediateRender: false }, 0.28);
timeline.fromTo(".opener__eyebrow", { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: 0.46, immediateRender: false }, 0.44);
timeline.fromTo("#opener h1 span:first-child", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.64, ease: "expo.out", immediateRender: false }, 0.6);
timeline.fromTo("#opener h1 span:last-child", { opacity: 0, y: 52 }, { opacity: 1, y: 0, duration: 0.72, ease: "expo.out", immediateRender: false }, 0.76);
timeline.fromTo(".opener__sub", { opacity: 0 }, { opacity: 1, duration: 0.5, immediateRender: false }, 1.65);
timeline.to("#opener", { opacity: 0, y: -28, duration: 0.52, ease: "power2.in" }, openerEnd - 0.52);
timeline.fromTo(
  "#caption-opener",
  { opacity: 0, y: 24, scale: 0.985 },
  { opacity: 1, y: 0, scale: 1, duration: 0.62, ease: "expo.out", immediateRender: false },
  0.18,
);
timeline.to("#caption-opener", { opacity: 0, y: -18, duration: 0.28, ease: "power2.in" }, openerEnd - 0.34);
timeline.fromTo("#progress-rail", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.48, immediateRender: false }, openerEnd - 0.1);
timeline.fromTo("#footer", { opacity: 0 }, { opacity: 1, duration: 0.45, immediateRender: false }, openerEnd + 0.1);

const firstSpeakAt = Number(stops[0].speakAt);
timeline.fromTo(
  "#progress-fill",
  { scaleX: 0 },
  { scaleX: 1, duration: Math.max(0.1, endCardStart - firstSpeakAt), ease: "none", immediateRender: false },
  firstSpeakAt,
);

stops.forEach((stop, index) => {
  const speakAt = Number(stop.speakAt);
  const nextSpeakAt = Number(stops[index + 1]?.speakAt || endCardStart);
  const outAt = index < stops.length - 1
    ? Math.max(speakAt + 3.8, nextSpeakAt - 0.42)
    : Math.max(speakAt + 4.6, endCardStart - 0.46);
  const card = cards[index];
  const caption = captions[index];
  if (!card?.element || !caption?.element) return;
  const isCold = coldCodes.has(stop.countryCode);

  timeline.fromTo(
    caption.element,
    { opacity: 0, y: 30, scale: 0.985 },
    { opacity: 1, y: 0, scale: 1, duration: 0.66, ease: "expo.out", immediateRender: false },
    speakAt,
  );
  timeline.fromTo(
    caption.eyebrow,
    { opacity: 0, y: 8 },
    { opacity: 1, y: 0, duration: 0.32, immediateRender: false },
    speakAt + 0.12,
  );
  timeline.fromTo(
    caption.plain,
    { opacity: 0, y: 14 },
    { opacity: 1, y: 0, duration: 0.42, immediateRender: false },
    speakAt + 0.2,
  );
  timeline.fromTo(
    caption.accent,
    { opacity: 0, y: 24, scale: 0.88 },
    { opacity: 1, y: 0, scale: 1, duration: 0.62, ease: "back.out(1.35)", immediateRender: false },
    speakAt + 0.28,
  );

  timeline.fromTo(
    card.element,
    { opacity: 0, y: 44 },
    { opacity: 1, y: 0, duration: 0.62, ease: "expo.out", immediateRender: false },
    speakAt + 0.12,
  );
  timeline.fromTo(card.rank, { opacity: 0, x: -20, scale: 0.76 }, { opacity: 1, x: 0, scale: 1, duration: 0.58, ease: "back.out(1.7)", immediateRender: false }, speakAt + 0.18);
  timeline.fromTo(card.kicker, { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, speakAt + 0.2);
  timeline.fromTo(card.country, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.48, ease: "expo.out", immediateRender: false }, speakAt + 0.28);
  timeline.fromTo(card.headline, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, immediateRender: false }, speakAt + 0.52);
  timeline.fromTo(card.detail, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.38, immediateRender: false }, speakAt + 0.68);
  timeline.fromTo(card.source, { opacity: 0 }, { opacity: 1, duration: 0.34, immediateRender: false }, speakAt + 0.9);

  if (isCold) {
    timeline.fromTo(
      "#freeze-wash",
      { opacity: 0 },
      { opacity: 0.22, duration: 0.52, ease: "power2.out", immediateRender: false },
      speakAt + 0.02,
    );
    timeline.to("#freeze-wash", { opacity: 0, duration: 0.38, ease: "power2.in" }, outAt + 0.06);
  }

  timeline.to(caption.element, { opacity: 0, y: -22, duration: 0.36, ease: "power2.in" }, outAt);
  timeline.to(card.element, { opacity: 0, y: -25, duration: 0.38, ease: "power2.in" }, outAt + 0.04);
});

timeline.fromTo(
  "#closer",
  { opacity: 0, y: 32, scale: 0.97 },
  { opacity: 1, y: 0, scale: 1, duration: 0.66, ease: "expo.out", immediateRender: false },
  endCardReveal,
);
timeline.fromTo(".closer__eyebrow", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.32, immediateRender: false }, endCardReveal + 0.12);
timeline.fromTo(".closer__title", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.52, ease: "expo.out", immediateRender: false }, endCardReveal + 0.2);
timeline.fromTo(".closer__sub", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.38, immediateRender: false }, endCardReveal + 0.38);
timeline.fromTo(".closer__stamp", { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.44, ease: "back.out(1.4)", immediateRender: false }, endCardReveal + 0.55);
timeline.to("#closer", { opacity: 0, duration: 0.28, ease: "power2.in" }, DURATION - 0.28);

function renderAt(time) {
  const currentTime = Number.isFinite(Number(time)) ? Number(time) : 0;
  const view = globe.renderAt(currentTime);
  const activeIndex = stops.findIndex((stop, index) => {
    const nextStart = Number(stops[index + 1]?.speakAt || endCardStart);
    return currentTime >= Number(stop.arrive) && currentTime < nextStart;
  });
  const mapPlan = activeIndex >= 0 ? stopMapPlans[activeIndex] : openingMapPlan;
  if (mapLayer && mapPlan) {
    const localTime = activeIndex >= 0
      ? Math.max(0, currentTime - Number(stops[activeIndex].arrive))
      : Math.max(0, currentTime);
    renderMapPlan({ layer: mapLayer, sceneTime: localTime, plan: mapPlan, view });
  } else {
    mapLayer?.clear?.();
  }
  return view;
}

renderAt(Number(window.__hfThreeTime) || 0);
window.__coastlineReady = globe.ready.then(() => renderAt(Number(window.__hfThreeTime) || 0));
window.addEventListener("hf-seek", (event) => {
  renderAt(Number(event.detail?.time) || 0);
});
