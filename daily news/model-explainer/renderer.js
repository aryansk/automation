/* Current-affairs landscape explainer: one seek-safe timeline, one globe, one question. */
import { createGlobeTour } from "../assets/animations/globe-tour.js";
import { createFeatureGlobeMapRuntime } from "../assets/animations/feature-globe-map-runtime.js";

const variables = window.__trendVariables || {};
const root = document.getElementById("root");
const compositionId = root?.dataset.compositionId || "model-explainer";
const timeline = window.__timelines[compositionId];
const CANVAS_WIDTH = Number(root?.dataset.width || 1920);
const CANVAS_HEIGHT = Number(root?.dataset.height || 1080);
const DURATION = Number(root?.dataset.duration || 220);
const fallback = window.__topicData || {};
const parseJson = (value, fallbackValue) => {
  if (Array.isArray(value) || (value && typeof value === "object")) return value;
  try {
    const parsed = JSON.parse(String(value || ""));
    return parsed ?? fallbackValue;
  } catch {
    return fallbackValue;
  }
};
const nonEmptyObject = (value) => value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0;
const storyCandidate = parseJson(variables.story, {});
const story = nonEmptyObject(storyCandidate) ? storyCandidate : (fallback.story || {});
const chaptersCandidate = parseJson(variables.chapters, []);
const chapters = Array.isArray(chaptersCandidate) && chaptersCandidate.length ? chaptersCandidate : (story.chapters || fallback.chapters || []);
const captionCandidate = parseJson(variables.captions, []);
const captionGroups = Array.isArray(captionCandidate) ? captionCandidate : [];
const chapterStartsInput = parseJson(variables.chapterStarts, []);
const globeAnimationPlan = parseJson(variables.globeAnimationPlan, null);
const globeMapData = parseJson(variables.globeMapData, null);
const openerEnd = Number(variables.openerEnd) || 6;
const endCardStart = Number(variables.endCardStart) || Math.max(openerEnd + 32, DURATION - 6.4);
const endCardReveal = Number(variables.endCardReveal) || endCardStart + 0.25;

document.querySelectorAll("[data-bind]").forEach((element) => {
  element.textContent = variables[element.dataset.bind] ?? "";
});
document.getElementById("opener-title-top").textContent = variables.openerTop || story.openerTitle?.split("/")[0]?.trim() || "THE MODEL IS NOT";
document.getElementById("opener-title-bottom").textContent = variables.openerBottom || story.openerTitle?.split("/").slice(1).join("/").trim() || "THE PRODUCT";
const globeCaptionCopy = document.querySelector("#globe-caption .globe-caption__copy");
if (globeCaptionCopy) globeCaptionCopy.textContent = story.globeCaption || "The model is becoming the cheapest part of the stack";

function paintMatteTexture() {
  const canvas = document.getElementById("space-layer");
  const context = canvas?.getContext("2d");
  if (!context) return;
  let seed = 20260807;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  for (let index = 0; index < 540; index += 1) {
    const x = random() * CANVAS_WIDTH;
    const y = random() * CANVAS_HEIGHT;
    const length = random() * 4.5 + 0.5;
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

chapters.forEach((chapter, index) => {
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = String(value || "");
  };
  setText(`chapter-kicker-${index}`, chapter.kicker);
  setText(`chapter-title-${index}`, chapter.title);
  setText(`chapter-body-${index}`, chapter.body);
  setText(`chapter-tag-${index}`, chapter.tag);
});

const sourceLinks = document.getElementById("source-card-links");
(Array.isArray(story.sources) ? story.sources : []).slice(0, 5).forEach((source) => {
  const link = document.createElement("a");
  link.className = "source-card__link";
  link.href = source.url || "#";
  link.textContent = source.label || "Source";
  link.target = "_blank";
  link.rel = "noreferrer";
  sourceLinks?.appendChild(link);
});

const liveCaptions = document.getElementById("live-captions");
const captionElements = captionGroups
  .filter((caption) => caption && String(caption.text || "").trim())
  .map((caption, index) => {
    const element = document.createElement("div");
    element.className = "topic-caption";
    element.id = `topic-caption-${index}`;
    element.textContent = String(caption.text).trim();
    liveCaptions?.appendChild(element);
    return { element, start: Number(caption.start) || 0, end: Number(caption.end) || Number(caption.start) + 1 };
  });

const starts = chapters.map((_, index) => {
  const authored = Number(chapterStartsInput[index]);
  if (Number.isFinite(authored)) return authored;
  return Number((openerEnd + ((endCardStart - openerEnd) * index) / Math.max(1, chapters.length)).toFixed(3));
});
const chapterEnd = (index) => index < starts.length - 1 ? starts[index + 1] - 0.42 : endCardStart - 1.1;

const globeFocuses = chapters.map((chapter) => chapter.focus || {
  codes: "WORLD / AI",
  label: "GLOBAL AI ECONOMY",
  coordinates: "SCHEMATIC",
});
const activeChapterIndex = (time) => starts.reduce((index, start, candidateIndex) => time >= start ? candidateIndex : index, 0);
let globeStops = [];
const activeGlobeStop = (time) => {
  let active = null;
  globeStops.forEach((stop) => {
    if (time >= stop.travelStart) active = stop;
  });
  return active;
};
const formatCoordinates = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length < 2) return "SCHEMATIC";
  const [longitude, latitude] = coordinates.map(Number);
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return "SCHEMATIC";
  return `${Math.abs(latitude).toFixed(1)}° ${latitude >= 0 ? "N" : "S"} / ${Math.abs(longitude).toFixed(1)}° ${longitude >= 0 ? "E" : "W"}`;
};
const photoText = (photo, key, fallbackText = "") => String(photo?.[key] || fallbackText);
function updatePhotoDock(activeIndex) {
  const chapter = chapters[Math.min(activeIndex, chapters.length - 1)] || {};
  const photos = Array.isArray(chapter.photos) ? chapter.photos : [];
  const primary = photos[0] || {};
  const imageA = document.getElementById("topic-photo-a");
  if (imageA) {
    imageA.src = photoText(primary, "src");
    imageA.alt = `${photoText(primary, "country", "Country")} / ${photoText(primary, "location", "Context image")}`;
  }
  const setPhotoText = (id, photo, key, fallbackText = "") => {
    const element = document.getElementById(id);
    if (element) element.textContent = photoText(photo, key, fallbackText);
  };
  setPhotoText("topic-photo-a-label", primary, "country", "Context image");
  const primaryLabel = document.getElementById("topic-photo-a-label");
  if (primaryLabel && primary.location) primaryLabel.textContent = `${primary.country || "Context"} / ${primary.location}`;
  setPhotoText("topic-photo-a-caption", primary, "caption", "Photo context");
  const secondary = photos[1] || {};
  const imageB = document.getElementById("topic-photo-b");
  if (imageB) {
    imageB.src = photoText(secondary, "src");
    imageB.alt = `${photoText(secondary, "country", "Country")} / ${photoText(secondary, "location", "Context image")}`;
  }
  setPhotoText("topic-photo-b-label", secondary, "country", "Context image");
  const secondaryLabel = document.getElementById("topic-photo-b-label");
  if (secondaryLabel && secondary.location) secondaryLabel.textContent = `${secondary.country || "Context"} / ${secondary.location}`;
  setPhotoText("topic-photo-b-caption", secondary, "caption", "Photo context");
  const index = document.getElementById("topic-photo-index");
  if (index) index.textContent = `CHAPTER ${String(activeIndex + 1).padStart(2, "0")} / ${String(chapters.length).padStart(2, "0")}`;
  const credit = document.getElementById("topic-photo-credit");
  if (credit) credit.textContent = primary.credit || "Context image · source credit in story manifest";
}
function updateGlobeHud(time) {
  const activeIndex = activeChapterIndex(time);
  const focus = globeFocuses[Math.min(activeIndex, globeFocuses.length - 1)] || globeFocuses[0];
  const stop = activeGlobeStop(time);
  const codes = document.getElementById("globe-focus-codes");
  const label = document.getElementById("globe-focus-label");
  const coordinates = document.getElementById("globe-focus-coordinates");
  if (stop?.isMention) {
    if (codes) codes.textContent = `${stop.countryName.toUpperCase()} / SPOKEN SIGNAL`;
    if (label) label.textContent = `${stop.city.toUpperCase()}, ${stop.countryName.toUpperCase()} / ${stop.event.toUpperCase()}`;
    if (coordinates) coordinates.textContent = formatCoordinates(stop.coordinates);
  } else {
    if (codes) codes.textContent = focus.codes || "WORLD / AI";
    if (label) label.textContent = focus.label || "GLOBAL AI ECONOMY";
    if (coordinates) coordinates.textContent = focus.coordinates || "SCHEMATIC";
  }
  updatePhotoDock(activeIndex);
}

const globeStopSources = [];
chapters.forEach((chapter, index) => {
  const geo = chapter.globe || {};
  const start = starts[index];
  const authoredMentions = Array.isArray(geo.mentionStops) ? geo.mentionStops : [];
  const mentionStops = authoredMentions
    .map((mention) => ({ ...geo, ...mention }))
    .filter((mention) => Number.isFinite(Number(mention.at)))
    .sort((left, right) => Number(left.at) - Number(right.at));

  if (mentionStops.length) {
    mentionStops.forEach((mention, mentionIndex) => {
      globeStopSources.push({
        countryCode: String(mention.countryCode || geo.countryCode || "US").toUpperCase(),
        countryName: mention.countryName || geo.countryName || "United States",
        city: mention.city || geo.city || "Global context",
        event: mention.event || geo.event || "Market context",
        coordinates: Array.isArray(mention.coordinates) ? mention.coordinates : (Array.isArray(geo.coordinates) ? geo.coordinates : [-98.5795, 39.8283]),
        travelStart: Number(mention.at),
        cameraZ: Number(mention.cameraZ || geo.cameraZ || 10.5),
        routePoints: mentionIndex === 0 && Array.isArray(geo.routePoints) ? geo.routePoints : [],
        mentionedCountryCodes: mentionIndex === 0 && Array.isArray(geo.mentionedCountryCodes) ? geo.mentionedCountryCodes : [],
        affectedCountryCodes: mentionIndex === 0 && Array.isArray(geo.affectedCountryCodes) ? geo.affectedCountryCodes : [],
        chapterIndex: index,
        isMention: true,
      });
    });
    return;
  }

  globeStopSources.push({
    countryCode: String(geo.countryCode || "US").toUpperCase(),
    countryName: geo.countryName || "United States",
    city: geo.city || "Global context",
    event: geo.event || "Market context",
    coordinates: Array.isArray(geo.coordinates) ? geo.coordinates : [-98.5795, 39.8283],
    travelStart: index === 0 ? Math.max(2.5, openerEnd - 2.0) : start + 0.16,
    cameraZ: Number(geo.cameraZ || 10.5),
    routePoints: Array.isArray(geo.routePoints) ? geo.routePoints : [],
    mentionedCountryCodes: Array.isArray(geo.mentionedCountryCodes) ? geo.mentionedCountryCodes : [],
    affectedCountryCodes: Array.isArray(geo.affectedCountryCodes) ? geo.affectedCountryCodes : [],
    chapterIndex: index,
    isMention: false,
  });
});

globeStopSources.sort((left, right) => left.travelStart - right.travelStart);
globeStops = globeStopSources.map((stop, index) => {
  const nextStart = globeStopSources[index + 1]?.travelStart ?? endCardStart;
  const gap = Math.max(0.3, nextStart - stop.travelStart);
  const travelDuration = Math.min(3.4, Math.max(0.3, gap * 0.72));
  const arrive = Math.min(stop.travelStart + travelDuration, nextStart - 0.08);
  const holdUntil = Math.min(endCardStart, Math.max(arrive + 0.45, nextStart + 0.22));
  return {
    ...stop,
    arrive: Number(arrive.toFixed(3)),
    holdUntil: Number(holdUntil.toFixed(3)),
  };
});
const globe = createGlobeTour({
  canvas: document.getElementById("globe-layer"),
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  baseHeight: 0,
  liftHeight: 0,
  openingHeight: 0,
  features: window.DAILY_NEWS_GEO?.features || [],
  stops: globeStops,
  defaultCameraZ: 13.2,
  openingCameraZ: 14.8,
  idleSpin: 0.021,
  showRouteMarkers: false,
});
const featureMapRuntime = createFeatureGlobeMapRuntime({
  canvas: document.getElementById("map-layer"),
  features: window.DAILY_NEWS_GEO?.features || [],
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  format: "landscape",
  story,
  chapters,
  starts,
  chapterEnd,
  endCardStart,
  animationId: variables.globeAnimationId,
  animationPlan: globeAnimationPlan,
  mapData: globeMapData,
  mapSource: variables.globeMapSource,
});
window.__featureGlobeMapRuntime = featureMapRuntime;
window.__featureGlobeMapOptions = featureMapRuntime.availableAnimations;
const initialTime = Number(window.__hfThreeTime) || 0;
updateGlobeHud(initialTime);
const initialView = globe.renderAt(initialTime);
featureMapRuntime.render(initialTime, initialView);
window.__trendGlobeReady = globe.ready.then(() => {
  const time = Number(window.__hfThreeTime) || 0;
  const view = globe.renderAt(time);
  featureMapRuntime.render(time, view);
  return view;
});

/* ---------------- editorial globe layer ---------------- */

/* The 3D globe tour above is the single continuous instrument. The shared
   feature bridge adds only transparent, globe-native annotations over it; it
   never swaps in a second globe or projection. */

const pathLength = (selector) => {
  const path = document.querySelector(selector);
  return path?.getTotalLength?.() || 1;
};
const marketExpectedLength = pathLength("#market-expected");
const marketRealityLength = pathLength("#market-reality");
const marketExpected = document.getElementById("market-expected");
const marketReality = document.getElementById("market-reality");
if (marketExpected) { marketExpected.style.strokeDasharray = `${marketExpectedLength}`; marketExpected.style.strokeDashoffset = `${marketExpectedLength}`; }
if (marketReality) { marketReality.style.strokeDasharray = `${marketRealityLength}`; marketReality.style.strokeDashoffset = `${marketRealityLength}`; }

timeline.set("#opener-title-top, #opener-title-bottom, .opener__sub", { opacity: 0 }, 0);
timeline.set("#opener", { opacity: 0 }, 0);
timeline.fromTo("#rail", { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.65 }, 0.18);
timeline.fromTo("#rail-rule", { scaleX: 0 }, { scaleX: 1, duration: 0.82, ease: "expo.out" }, 0.32);
timeline.fromTo("#opener", { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.72, ease: "expo.out", immediateRender: false }, 0.28);
timeline.fromTo("#opener-title-top", { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out", immediateRender: false }, 0.46);
timeline.fromTo("#opener-title-bottom", { opacity: 0, y: 54 }, { opacity: 1, y: 0, duration: 0.72, ease: "expo.out", immediateRender: false }, 0.62);
timeline.fromTo(".opener__sub", { opacity: 0 }, { opacity: 1, duration: 0.5, immediateRender: false }, 1.5);
timeline.fromTo("#opener", { opacity: 1, y: 0 }, { opacity: 0, y: -30, duration: 0.52, ease: "power2.in", immediateRender: false }, openerEnd - 0.52);
timeline.fromTo("#globe-hud", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.55, immediateRender: false }, openerEnd - 0.2);
timeline.fromTo("#globe-caption", { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: 0.55, immediateRender: false }, openerEnd + 0.1);
timeline.fromTo("#chapter-nav", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.5, immediateRender: false }, openerEnd + 0.08);
timeline.fromTo("#chapter-progress", { opacity: 0 }, { opacity: 1, duration: 0.4, immediateRender: false }, openerEnd);

function animatePhotoDock(start) {
  timeline.fromTo("#topic-photo-dock", { opacity: 0, y: 18, scale: 0.985 }, { opacity: 1, y: 0, scale: 1, duration: 0.62, ease: "expo.out", immediateRender: false }, start + 0.12);
}
function animateLetter(start) {
  /* Keep the first chapter's heading on one stable text layer. Independent
     scale/y tweens on the two words could rasterize as a brief glitch. */
  timeline.fromTo(".letter-lockup", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.58, ease: "expo.out", immediateRender: false }, start + 0.18);
  timeline.fromTo(".letter-lockup__small", { opacity: 0 }, { opacity: 1, duration: 0.28, stagger: 0.1, immediateRender: false }, start + 0.24);
  timeline.fromTo(".letter-lockup__slash", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, start + 0.62);
  timeline.fromTo(".letter-rail", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.42, immediateRender: false }, start + 1.06);
}
function animateDefinition(start) {
  timeline.fromTo(".definition-node", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.2)", stagger: 0.24, immediateRender: false }, start + 0.22);
  timeline.fromTo("#definition-line-fill", { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "power3.inOut", immediateRender: false }, start + 0.62);
  timeline.fromTo("#definition-arrow", { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.35, immediateRender: false }, start + 1.14);
  timeline.fromTo(".definition-note", { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.52, immediateRender: false }, start + 1.34);
}
function animateStack(start) {
  timeline.fromTo(".stack-layer", { opacity: 0, x: -28, scaleX: 0.72 }, { opacity: 1, x: 0, scaleX: 1, duration: 0.52, ease: "expo.out", stagger: 0.16, immediateRender: false }, start + 0.2);
  timeline.fromTo(".stack-arrow", { opacity: 0, x: 15 }, { opacity: 1, x: 0, duration: 0.48, immediateRender: false }, start + 1.04);
  timeline.fromTo("#stack-arrow-line", { scaleX: 0 }, { scaleX: 1, duration: 0.55, immediateRender: false }, start + 1.22);
  timeline.fromTo(".stack-callout", { opacity: 0, y: 22, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: "back.out(1.2)", immediateRender: false }, start + 0.8);
}
function animateMarket(start) {
  timeline.fromTo("#market-expected", { strokeDashoffset: marketExpectedLength, opacity: 0 }, { strokeDashoffset: 0, opacity: 1, duration: 1.35, ease: "power2.inOut", immediateRender: false }, start + 0.18);
  timeline.fromTo("#market-reality", { strokeDashoffset: marketRealityLength, opacity: 0 }, { strokeDashoffset: 0, opacity: 1, duration: 1.25, ease: "power2.inOut", immediateRender: false }, start + 0.46);
  timeline.fromTo("#market-point", { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: 0.42, ease: "back.out(1.8)", immediateRender: false }, start + 1.4);
  timeline.fromTo(".market-legend__item", { opacity: 0, x: 18 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.16, immediateRender: false }, start + 0.82);
  timeline.fromTo(".market-warning", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.46, immediateRender: false }, start + 1.42);
}
function animateVerdict(start) {
  timeline.fromTo(".verdict-lane", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.15)", stagger: 0.18, immediateRender: false }, start + 0.22);
  timeline.fromTo(".verdict-lane i", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power3.out", stagger: 0.18, immediateRender: false }, start + 0.66);
  timeline.fromTo("#verdict-stamp", { opacity: 0, scale: 0.92, y: 14 }, { opacity: 1, scale: 1, y: 0, duration: 0.62, ease: "expo.out", immediateRender: false }, start + 1.38);
}

const panels = chapters.map((_, index) => document.getElementById(`chapter-${index}`)).filter(Boolean);
const navItems = chapters.map((_, index) => document.querySelector(`[data-chapter-nav="${index}"]`)).filter(Boolean);
const graphicByType = {
  letter: document.getElementById("graphic-letter"),
  definition: document.getElementById("graphic-definition"),
  stack: document.getElementById("graphic-stack"),
  market: document.getElementById("graphic-market"),
  verdict: document.getElementById("graphic-verdict"),
};
const graphicAnimations = { letter: animateLetter, definition: animateDefinition, stack: animateStack, market: animateMarket, verdict: animateVerdict };

chapters.forEach((chapter, index) => {
  const start = starts[index];
  const next = index < starts.length - 1 ? starts[index + 1] : endCardStart - 0.48;
  const panel = panels[index];
  const graphic = graphicByType[chapter.graphic] || graphicByType.letter;
  const nav = navItems[index];
  if (!panel || !graphic) return;
  animatePhotoDock(start);
  const graphicStart = start + 0.78;
  const headlineStart = start + 1.34;
  timeline.set(graphic, { opacity: 0 }, graphicStart - 0.001);
  timeline.set(panel, { opacity: 0 }, headlineStart - 0.001);
  timeline.fromTo(graphic, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.56, ease: "expo.out", immediateRender: false }, graphicStart);
  timeline.fromTo(panel, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.56, ease: "expo.out", immediateRender: false }, headlineStart);
  timeline.fromTo(panel.querySelector(".chapter__kicker"), { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.36, immediateRender: false }, headlineStart + 0.08);
  timeline.fromTo(panel.querySelector(".chapter__title"), { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.58, ease: "expo.out", immediateRender: false }, headlineStart + 0.16);
  timeline.fromTo(panel.querySelector(".chapter__body"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.48, immediateRender: false }, headlineStart + 0.48);
  timeline.fromTo(panel.querySelector(".chapter__tag"), { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.34, immediateRender: false }, headlineStart + 0.92);
  if (nav) timeline.to(nav, { color: "#e2b582", duration: 0.18, immediateRender: false }, start + 0.08);
  if (index > 0 && navItems[index - 1]) timeline.to(navItems[index - 1], { color: "#eef3eb", duration: 0.18, immediateRender: false }, start + 0.08);
  const animate = graphicAnimations[chapter.graphic] || animateLetter;
  animate(graphicStart);
  timeline.to("#topic-photo-dock", { opacity: 0, duration: 0.34, ease: "power2.in", immediateRender: false }, next);
  timeline.to(graphic, { opacity: 0, x: -24, duration: 0.38, ease: "power2.in", immediateRender: false }, next);
  timeline.to(panel, { opacity: 0, x: -24, duration: 0.38, ease: "power2.in", immediateRender: false }, next + 0.03);
});

captionElements.forEach((caption) => {
  timeline.set(caption.element, { autoAlpha: 0 }, caption.start);
  timeline.fromTo(caption.element, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.16, immediateRender: false }, caption.start);
  timeline.to(caption.element, { autoAlpha: 0, duration: 0.16, immediateRender: false }, Math.max(caption.start + 0.18, caption.end));
  timeline.set(caption.element, { autoAlpha: 0 }, Math.max(caption.start + 0.18, caption.end));
});

timeline.to("#explainer", { opacity: 0, y: -18, duration: 0.38, ease: "power2.in", immediateRender: false }, endCardStart);
timeline.to("#globe-hud, #globe-caption", { opacity: 0, duration: 0.32, ease: "power2.in", immediateRender: false }, endCardStart);
timeline.fromTo("#source-card", { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.58, ease: "expo.out", immediateRender: false }, endCardReveal);
timeline.fromTo(".source-card__links", { opacity: 0 }, { opacity: 1, duration: 0.4, immediateRender: false }, endCardReveal + 0.14);
timeline.fromTo(".source-card__note", { opacity: 0 }, { opacity: 1, duration: 0.4, immediateRender: false }, endCardReveal + 0.26);
timeline.fromTo("#end-card", { opacity: 0, y: 28, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "expo.out", immediateRender: false }, endCardReveal + 0.16);
timeline.fromTo("#footer", { opacity: 0 }, { opacity: 1, duration: 0.5, immediateRender: false }, endCardReveal + 0.32);

window.addEventListener("hf-seek", (event) => {
  const time = Number(event.detail?.time) || 0;
  updateGlobeHud(time);
  /* The Three.js globe is always visible. The selected catalog beat is
     projected onto that same view at every seek. */
  const mapCanvas = document.getElementById("map-layer");
  const globeCanvas = document.getElementById("globe-layer");
  if (mapCanvas) mapCanvas.style.display = "block";
  if (globeCanvas) globeCanvas.style.display = "block";
  const view = globe.renderAt(time);
  featureMapRuntime.render(time, view);
});
