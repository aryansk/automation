/* One-story landscape explainer: a seek-safe editorial timeline over one globe. */
import { createGlobeTour } from "./animations/globe-tour.js";
import { createGlobeMapLayer, renderMapPlan, resolveMapPlanForScene } from "./animations/globe-map-runtime.js";
import { getFeatureGlobeAnimationOptions, mergeFeatureGlobeSelection } from "./animations/feature-globe-map-runtime.js";

const variables = window.__storyExplainerVariables || {};
const root = document.getElementById("root");
const compositionId = root?.dataset.compositionId || "story-explainer-landscape";
const timeline = window.__timelines[compositionId];
const CANVAS_WIDTH = Number(root?.dataset.width || 1920);
const CANVAS_HEIGHT = Number(root?.dataset.height || 1080);
const DURATION = Number(root?.dataset.duration || 160);
const parseJson = (value, fallback) => { if (Array.isArray(value)) return value; try { const parsed = JSON.parse(String(value || "")); return parsed ?? fallback; } catch { return fallback; } };
const assetUrl = (value) => String(value || "");
const story = parseJson(variables.story, {});
const chapters = parseJson(variables.chapters, []);
const routeNodes = parseJson(variables.routeNodes, []);
const captionGroups = parseJson(variables.captions, []);
const chapterStarts = parseJson(variables.chapterStarts, []);
const globeAnimationPlan = parseJson(variables.globeAnimationPlan, null);
const globeMapData = parseJson(variables.globeMapData, null);
const openerEnd = Number(variables.openerEnd) || 5.8;
const endCardStart = Number(variables.endCardStart) || Math.max(0, DURATION - 5.2);
const endCardReveal = Number(variables.endCardReveal) || endCardStart + 0.24;
const mapSelection = mergeFeatureGlobeSelection({
  story,
  chapters,
  animationId: variables.globeAnimationId,
  animationPlan: globeAnimationPlan,
  mapData: globeMapData,
  mapSource: variables.globeMapSource,
});
const mapStory = mapSelection.story;
const mapChapters = mapSelection.chapters;
window.__featureGlobeMapOptions = getFeatureGlobeAnimationOptions("landscape");

document.querySelectorAll("[data-bind]").forEach((element) => { element.textContent = variables[element.dataset.bind] ?? ""; });
const openerWords = String(variables.openerTitle || "Why Hormuz matters").trim().split(/\s+/).filter(Boolean);
document.getElementById("opener-title-top").textContent = openerWords.slice(0, 1).join(" ") || "WHY";
document.getElementById("opener-title-bottom").textContent = openerWords.slice(1).join(" ") || "HORMUZ MATTERS";

function paintMatteTexture() {
  const canvas = document.getElementById("space-layer"); const context = canvas?.getContext("2d"); if (!context) return;
  let seed = 20260803; const random = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  for (let index = 0; index < 520; index += 1) { const x = random() * CANVAS_WIDTH; const y = random() * CANVAS_HEIGHT; const length = random() * 4.5 + 0.5; const angle = random() * Math.PI; context.beginPath(); context.moveTo(x, y); context.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length); context.strokeStyle = `rgba(226,235,221,${(0.025 + random() * 0.07).toFixed(3)})`; context.lineWidth = random() * 0.8 + 0.25; context.stroke(); }
}
paintMatteTexture();

chapters.forEach((chapter, index) => {
  const setText = (id, value) => { const element = document.getElementById(id); if (element) element.textContent = String(value || ""); };
  setText(`chapter-kicker-${index}`, chapter.kicker); setText(`chapter-title-${index}`, chapter.title); setText(`chapter-body-${index}`, chapter.body); setText(`chapter-tag-${index}`, chapter.tag);
  const nav = document.querySelector(`[data-chapter-nav="${index}"]`); if (nav) nav.textContent = String(index + 1).padStart(2, "0");
});

const incidentImage = document.getElementById("incident-image");
if (incidentImage && story.imageOne) incidentImage.src = assetUrl(story.imageOne);
if (incidentImage) incidentImage.alt = story.imageAlt || "Contextual news image";
const incidentCredit = document.getElementById("incident-credit"); if (incidentCredit) incidentCredit.textContent = story.imageCredit || "ARCHIVE VISUAL / RIGHTS REVIEW REQUIRED";
const incidentImageTwo = document.getElementById("incident-image-two");
if (incidentImageTwo && story.imageTwo) incidentImageTwo.src = assetUrl(story.imageTwo);
if (incidentImageTwo) incidentImageTwo.alt = story.imageAltTwo || "Related news archive image";
const incidentCreditTwo = document.getElementById("incident-credit-two"); if (incidentCreditTwo) incidentCreditTwo.textContent = story.imageCreditTwo || "AP · ARCHIVE VISUAL";

const liveCaptions = document.getElementById("live-captions");
const captionElements = captionGroups.filter((caption) => caption && String(caption.text || "").trim()).map((caption, index) => {
  const element = document.createElement("div"); element.className = "live-captions__group"; element.id = `live-caption-${index}`; element.textContent = String(caption.text).trim(); liveCaptions?.appendChild(element);
  return { element, start: Number(caption.start) || 0, end: Number(caption.end) || Number(caption.start) + 1 };
});

const sourceLinks = document.getElementById("source-card-links");
(Array.isArray(story.sources) ? story.sources : []).slice(0, 4).forEach((source) => { const link = document.createElement("a"); link.className = "source-card__link"; link.href = source.url || "#"; link.textContent = source.label || "Source"; link.target = "_blank"; link.rel = "noreferrer"; sourceLinks?.appendChild(link); });

const svgNodes = Array.from(document.querySelectorAll("[data-route-node]"));
const nodePoint = (index) => { const node = routeNodes[index] || { x: 72 + index * 170, y: 170 }; return { x: Number(node.x), y: Number(node.y) }; };
const curvedPath = (from, to) => { const midX = (from.x + to.x) / 2; const lift = Math.max(26, Math.abs(to.y - from.y) * 0.72); const direction = to.y <= from.y ? -1 : 1; return `M ${from.x} ${from.y} C ${midX - 36} ${from.y + direction * lift} ${midX + 36} ${to.y - direction * lift} ${to.x} ${to.y}`; };
svgNodes.forEach((group, index) => {
  const node = routeNodes[index] || {}; const point = nodePoint(index); group.setAttribute("transform", `translate(${point.x} ${point.y})`);
  const label = group.querySelector(".route-svg__label"); const detail = group.querySelector(".route-svg__detail");
  if (label) { label.textContent = String(node.label || ""); label.setAttribute("x", index === 4 ? -94 : 16); label.setAttribute("y", -12); }
  if (detail) { detail.textContent = String(node.detail || ""); detail.setAttribute("x", index === 4 ? -94 : 16); detail.setAttribute("y", 10); }
});
const routeSegments = Array.from(document.querySelectorAll(".route-svg__segment"));
const routeGlows = Array.from(document.querySelectorAll(".route-svg__glow"));
const routeDashes = Array.from(document.querySelectorAll(".route-svg__dash"));
routeSegments.forEach((path, index) => { const d = curvedPath(nodePoint(index), nodePoint(index + 1)); path.setAttribute("d", d); const length = path.getTotalLength(); path.style.strokeDasharray = `${length}`; path.style.strokeDashoffset = `${length}`; path.dataset.length = String(length); });
[...routeGlows, ...routeDashes].forEach((path, index) => { const source = routeSegments[index % routeSegments.length]; if (!source) return; path.setAttribute("d", source.getAttribute("d") || ""); const length = source.getTotalLength(); path.style.strokeDashoffset = `${length}`; path.dataset.length = String(length); });

const locationRouteLine = document.getElementById("location-route-line"); const locationRouteLength = locationRouteLine?.getTotalLength?.() || 1;
if (locationRouteLine) { locationRouteLine.style.strokeDasharray = `${locationRouteLength}`; locationRouteLine.style.strokeDashoffset = `${locationRouteLength}`; }
const incidentFlight = document.getElementById("incident-flight"); const incidentFlightLength = incidentFlight?.getTotalLength?.() || 1;
if (incidentFlight) { incidentFlight.style.strokeDasharray = `${incidentFlightLength}`; incidentFlight.style.strokeDashoffset = `${incidentFlightLength}`; }
const statValueElement = document.getElementById("stat-value"); const statValueState = { value: 0 };

const starts = chapters.map((_, index) => Number(chapterStarts[index] || (openerEnd + index * ((endCardStart - openerEnd) / Math.max(1, chapters.length)))));
const chapterEnd = (index) => index < starts.length - 1 ? starts[index + 1] - 0.42 : endCardStart - 1.2;
const storyRoute = Array.isArray(story.routePoints) ? story.routePoints : [];
const gatewayRoute = [{ label: "Iran", coordinates: [51.42, 27.2] }, { label: "Hormuz", coordinates: [56.45, 26.56] }, { label: "Oman", coordinates: [58.41, 23.59] }];
const incidentRoute = [{ label: "Kuwait", coordinates: [47.98, 29.38] }, { label: "Oman", coordinates: [58.41, 23.59] }];
const globeFocuses = [{ codes: "IR · OM", label: "STRAIT OF HORMUZ", coordinates: "26.6° N / 56.5° E" }, { codes: "GULF → ASIA", label: "ENERGY ROUTE", coordinates: "INDIA / EAST ASIA" }, { codes: "KW · OM", label: "FIELD SIGNALS", coordinates: "REPORTED / 02 AUG" }, { codes: "ASIA FLOW", label: "GLOBAL ENERGY", coordinates: "20M B/D · 2024" }, { codes: "IR · OM", label: "NEGOTIATION ZONE", coordinates: "STATUS UNSETTLED" }];
function updateGlobeHud(time) { const activeIndex = starts.reduce((index, start, candidateIndex) => time >= start ? candidateIndex : index, 0); const focus = globeFocuses[Math.min(activeIndex, globeFocuses.length - 1)]; const codes = document.getElementById("globe-focus-codes"); const label = document.getElementById("globe-focus-label"); const coordinates = document.getElementById("globe-focus-coordinates"); if (codes) codes.textContent = focus.codes; if (label) label.textContent = focus.label; if (coordinates) coordinates.textContent = focus.coordinates; }
const globeStops = [
  { countryCode: story.countryCode || "IR", coordinates: Array.isArray(story.coordinates) ? story.coordinates : [56.45, 26.56], travelStart: Math.max(2.4, openerEnd - 2.2), arrive: Math.min(starts[0] + 4.4, chapterEnd(0) - 2.2), holdUntil: chapterEnd(0), cameraZ: 6.2, routePoints: gatewayRoute, mentionedCountryCodes: ["OM"], affectedCountryCodes: [] },
  { countryCode: "IN", coordinates: [72.8777, 19.076], travelStart: starts[1] + 0.14, arrive: starts[1] + 4.7, holdUntil: chapterEnd(1), cameraZ: 12.8, routePoints: storyRoute, mentionedCountryCodes: ["IR", "OM", "CN", "KR", "JP"], affectedCountryCodes: [] },
  { countryCode: "OM", coordinates: [58.4059, 23.588], travelStart: starts[2] + 0.14, arrive: starts[2] + 4.25, holdUntil: chapterEnd(2), cameraZ: 5.8, routePoints: incidentRoute, mentionedCountryCodes: ["IR", "KW", "IQ"], affectedCountryCodes: [] },
  { countryCode: "IN", coordinates: [72.8777, 19.076], travelStart: starts[3] + 0.14, arrive: starts[3] + 4.8, holdUntil: chapterEnd(3), cameraZ: 13.2, routePoints: storyRoute, mentionedCountryCodes: ["CN", "KR", "JP"], affectedCountryCodes: [] },
  { countryCode: story.countryCode || "IR", coordinates: Array.isArray(story.coordinates) ? story.coordinates : [56.45, 26.56], travelStart: starts[4] + 0.14, arrive: starts[4] + 4.5, holdUntil: endCardStart - 1.2, cameraZ: 5.6, routePoints: gatewayRoute, mentionedCountryCodes: ["OM"], affectedCountryCodes: [] },
].filter((_, index) => index < Math.max(1, chapters.length));
const globe = createGlobeTour({ canvas: document.getElementById("globe-layer"), width: CANVAS_WIDTH, height: CANVAS_HEIGHT, baseHeight: 0, liftHeight: 0, openingHeight: 0, features: window.DAILY_NEWS_GEO?.features || [], stops: globeStops, defaultCameraZ: 12.2, openingCameraZ: 13.8, idleSpin: 0.018, showRouteLayers: false });
updateGlobeHud(window.__hfThreeTime || 0); globe.renderAt(window.__hfThreeTime || 0); window.__storyExplainerGlobeReady = globe.ready.then(() => globe.renderAt(window.__hfThreeTime || 0));

/* ---------------- editorial globe/map layer ---------------- */
/* Every chapter uses the shared globe-map library plan. Authored segments can
   switch presets at script-relative times; automatic segments resolve to a
   verified preset or the neutral world-orbit library fallback. */
const mapLayer = createGlobeMapLayer({ canvas: document.getElementById("map-layer"), features: window.DAILY_NEWS_GEO?.features || [], width: CANVAS_WIDTH, height: CANVAS_HEIGHT, format: "landscape", drawBackground: false, drawGlobeSurface: false });
const chapterMapPlans = chapters.map((chapter, index) => resolveMapPlanForScene({
  chapter: mapChapters[index] || chapter,
  story: mapStory,
  format: "landscape",
  mode: "production",
  duration: Math.max(0.1, chapterEnd(index) - starts[index]),
  requireLibrary: true,
}));
window.__featureGlobeMapSelection = chapterMapPlans.map((plan) => plan.segments.map((segment) => segment.resolved?.animationId || null));

timeline.fromTo("#rail", { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.65 }, 0.18); timeline.fromTo("#rail-rule", { scaleX: 0 }, { scaleX: 1, duration: 0.82, ease: "expo.out" }, 0.32); timeline.fromTo("#opener", { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.72, ease: "expo.out", immediateRender: false }, 0.28); timeline.fromTo("#opener-title-top", { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out", immediateRender: false }, 0.46); timeline.fromTo("#opener-title-bottom", { opacity: 0, y: 54 }, { opacity: 1, y: 0, duration: 0.72, ease: "expo.out", immediateRender: false }, 0.62); timeline.fromTo(".opener__sub", { opacity: 0 }, { opacity: 1, duration: 0.5, immediateRender: false }, 1.5); timeline.to("#opener", { opacity: 0, y: -30, duration: 0.52, ease: "power2.in" }, openerEnd - 0.52); timeline.fromTo("#globe-hud", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.55, immediateRender: false }, openerEnd - 0.2); timeline.fromTo("#globe-caption", { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: 0.55, immediateRender: false }, openerEnd + 0.1); timeline.fromTo("#chapter-nav", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.5, immediateRender: false }, openerEnd + 0.08); timeline.fromTo("#chapter-progress", { opacity: 0 }, { opacity: 1, duration: 0.4, immediateRender: false }, openerEnd);
const panels = chapters.map((_, index) => document.getElementById(`chapter-${index}`)).filter(Boolean); const navItems = chapters.map((_, index) => document.querySelector(`[data-chapter-nav="${index}"]`)).filter(Boolean);
function animateLocation(start) { if (locationRouteLine) timeline.fromTo(locationRouteLine, { strokeDashoffset: locationRouteLength, opacity: 0 }, { strokeDashoffset: 0, opacity: 1, duration: 1.05, ease: "power2.inOut", immediateRender: false }, start + 0.12); timeline.fromTo("#location-route-marker", { scale: 0.25, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.42, ease: "back.out(1.7)", immediateRender: false }, start + 0.3); timeline.fromTo("#location-route-halo", { scale: 0.35, opacity: 0 }, { scale: 1, opacity: 0.58, duration: 0.52, ease: "power2.out", immediateRender: false }, start + 0.3); timeline.to("#location-route-halo", { scale: 1.28, opacity: 0, duration: 0.55, ease: "power2.in", immediateRender: false }, start + 0.86); timeline.fromTo("#location-ring", { scale: 0 }, { scale: 1, duration: 1.1, ease: "back.out(1.8)", immediateRender: false }, start + 0.22); timeline.fromTo("#location-callout", { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: 0.48, immediateRender: false }, start + 0.54); timeline.fromTo(".location-diagram__sub", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, immediateRender: false }, start + 0.74); }
function animateRoute(start) { routeGlows.forEach((path, index) => { const length = Number(path.dataset.length || 1); timeline.fromTo(path, { strokeDashoffset: length, opacity: 0 }, { strokeDashoffset: 0, opacity: 0.18, duration: 0.84, ease: "power2.inOut", immediateRender: false }, start + 0.08 + index * 0.55); }); routeDashes.forEach((path, index) => { const length = Number(path.dataset.length || 1); timeline.fromTo(path, { strokeDashoffset: length, opacity: 0 }, { strokeDashoffset: 0, opacity: 0.72, duration: 0.72, ease: "power2.inOut", immediateRender: false }, start + 0.16 + index * 0.55); }); routeSegments.forEach((path, index) => { const length = Number(path.dataset.length || 1); timeline.fromTo(path, { strokeDashoffset: length }, { strokeDashoffset: 0, duration: 0.82, ease: "power2.inOut", immediateRender: false }, start + 0.2 + index * 0.55); }); svgNodes.forEach((node, index) => { const ring = node.querySelector(".route-svg__node-ring"); const halo = node.querySelector(".route-svg__node-halo"); timeline.fromTo(node, { opacity: 0, scale: 0.32 }, { opacity: 1, scale: 1, duration: 0.42, ease: "back.out(1.6)", transformOrigin: "center center", immediateRender: false }, start + 0.28 + index * 0.55); if (ring) timeline.fromTo(ring, { scale: 0.45, opacity: 0 }, { scale: 1, opacity: 0.8, duration: 0.38, ease: "power2.out", transformOrigin: "center center", immediateRender: false }, start + 0.38 + index * 0.55); if (halo) { timeline.fromTo(halo, { scale: 0.35, opacity: 0 }, { scale: 1, opacity: 0.35, duration: 0.45, ease: "power2.out", transformOrigin: "center center", immediateRender: false }, start + 0.38 + index * 0.55); timeline.to(halo, { scale: 1.28, opacity: 0, duration: 0.52, ease: "power2.in", immediateRender: false }, start + 0.9 + index * 0.55); } }); timeline.fromTo(".route-svg__foot", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.42, immediateRender: false }, start + 2.2); }
function animateIncidents(start) { timeline.fromTo(".incident-photo", { opacity: 0, x: -28, scale: 1.03 }, { opacity: 1, x: 0, scale: 1, duration: 0.72, ease: "expo.out", immediateRender: false }, start + 0.16); timeline.fromTo(".incident-photo img", { scale: 1.14 }, { scale: 1.04, duration: 3.2, ease: "none", immediateRender: false }, start + 0.18); if (incidentFlight) timeline.fromTo(incidentFlight, { strokeDashoffset: incidentFlightLength, opacity: 0 }, { strokeDashoffset: 0, opacity: 1, duration: 0.92, ease: "power2.inOut", immediateRender: false }, start + 0.22); timeline.fromTo("#incident-drone", { opacity: 0, x: -10, scale: 0.72 }, { opacity: 1, x: 0, scale: 1, duration: 0.48, ease: "back.out(1.5)", immediateRender: false }, start + 0.36); timeline.fromTo("#incident-target", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.42, ease: "back.out(1.4)", transformOrigin: "center center", immediateRender: false }, start + 0.84); timeline.fromTo(".incident-signal__target-ring", { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 0.9, duration: 0.38, ease: "power2.out", transformOrigin: "center center", stagger: 0.08, immediateRender: false }, start + 0.94); timeline.to(".incident-signal__target-ring", { scale: 1.28, opacity: 0, duration: 0.52, ease: "power2.in", immediateRender: false }, start + 1.52); timeline.fromTo(".incident-row", { opacity: 0, x: 26 }, { opacity: 1, x: 0, duration: 0.48, stagger: 0.18, immediateRender: false }, start + 0.42); }
function animateStats(start) { timeline.fromTo(".stat-number", { opacity: 0, y: 20, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.62, ease: "expo.out", immediateRender: false }, start + 0.14); if (statValueElement) { statValueState.value = 0; timeline.fromTo(statValueState, { value: 0 }, { value: 20, duration: 0.82, ease: "power2.out", immediateRender: false, onUpdate: () => { statValueElement.textContent = String(Math.round(statValueState.value)); } }, start + 0.14); } timeline.fromTo(".stat-number__rule i", { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power3.out", immediateRender: false }, start + 0.54); timeline.fromTo(".stat-caption", { opacity: 0, x: 18 }, { opacity: 1, x: 0, duration: 0.4, immediateRender: false }, start + 0.48); timeline.fromTo(".stat-bar__fill", { scaleX: 0 }, { scaleX: 1, duration: 0.82, stagger: 0.25, ease: "power3.out", immediateRender: false }, start + 0.78); timeline.fromTo(".stat-bar", { opacity: 0, x: 18 }, { opacity: 1, x: 0, duration: 0.44, stagger: 0.25, immediateRender: false }, start + 0.72); timeline.fromTo(".stat-source", { opacity: 0 }, { opacity: 1, duration: 0.4, immediateRender: false }, start + 2.1); }
function animateDeal(start) { timeline.fromTo(".deal-state", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.3, ease: "back.out(1.2)", immediateRender: false }, start + 0.28); timeline.fromTo(".deal-line", { scaleX: 0 }, { scaleX: 1, duration: 0.5, stagger: 0.3, ease: "power2.out", immediateRender: false }, start + 0.7); timeline.fromTo(".deal-note", { opacity: 0, x: 18 }, { opacity: 1, x: 0, duration: 0.52, immediateRender: false }, start + 1.72); }

chapters.forEach((chapter, index) => { const start = starts[index]; const next = index < starts.length - 1 ? starts[index + 1] : endCardStart - 0.48; const panel = panels[index]; const graphic = document.getElementById(`graphic-${chapter.graphic}`); const nav = navItems[index]; if (!panel || !graphic) return; timeline.fromTo(graphic, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.64, ease: "expo.out", immediateRender: false }, start + 0.1); timeline.fromTo(panel, { opacity: 0, x: 48 }, { opacity: 1, x: 0, duration: 0.58, ease: "expo.out", immediateRender: false }, start + 0.24); timeline.fromTo(panel.querySelector(".chapter__kicker"), { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.42, immediateRender: false }, start + 0.34); timeline.fromTo(panel.querySelector(".chapter__title"), { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.66, ease: "expo.out", immediateRender: false }, start + 0.42); timeline.fromTo(panel.querySelector(".chapter__body"), { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.5, immediateRender: false }, start + 0.86); timeline.fromTo(panel.querySelector(".chapter__tag"), { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.42, immediateRender: false }, start + 1.16); timeline.to(panel, { opacity: 0, x: -34, duration: 0.35, ease: "power2.in" }, next); timeline.to(graphic, { opacity: 0, x: -26, duration: 0.32, ease: "power2.in" }, next); if (nav) timeline.fromTo(nav, { opacity: 0.35, y: 8 }, { opacity: 1, y: 0, duration: 0.38, immediateRender: false }, start); if (index === 0 && chapter.graphic === "location") animateLocation(start); if (chapter.graphic === "route") animateRoute(start); if (chapter.graphic === "incidents") animateIncidents(start); if (chapter.graphic === "stats") animateStats(start); if (chapter.graphic === "deal") animateDeal(start); });
captionElements.forEach(({ element, start, end }) => { timeline.set(element, { visibility: "visible" }, start); timeline.fromTo(element, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.14, ease: "power2.out", immediateRender: false }, start); timeline.to(element, { opacity: 0, y: -8, duration: 0.12, ease: "power2.in" }, Math.max(start, end - 0.12)); timeline.set(element, { opacity: 0, visibility: "hidden" }, end); });
timeline.fromTo("#chapter-progress span", { scaleX: 0 }, { scaleX: 1, duration: Math.max(0.2, endCardStart - openerEnd), ease: "none", immediateRender: false }, openerEnd); timeline.to("#explainer", { opacity: 0, y: -18, duration: 0.35, ease: "power2.in" }, endCardStart); timeline.to("#globe-hud, #globe-caption", { opacity: 0, duration: 0.3, ease: "power2.in" }, endCardStart); timeline.to("#live-captions", { opacity: 0, duration: 0.3, ease: "power2.in" }, endCardStart); timeline.fromTo("#source-card", { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.58, ease: "expo.out", immediateRender: false }, endCardReveal); timeline.fromTo("#end-card", { opacity: 0, y: 28, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "expo.out", immediateRender: false }, endCardReveal + 0.16); timeline.fromTo("#footer", { opacity: 0 }, { opacity: 1, duration: 0.5, immediateRender: false }, endCardReveal + 0.32);
window.addEventListener("hf-seek", (event) => { const time = Number(event.detail?.time) || 0; updateGlobeHud(time); const activeIndex = starts.reduce((index, start, candidateIndex) => time >= start ? candidateIndex : index, 0); const activePlan = chapterMapPlans[Math.min(activeIndex, chapterMapPlans.length - 1)] || null; const globeCanvas = document.getElementById("globe-layer"); const mapCanvas = document.getElementById("map-layer"); if (globeCanvas) globeCanvas.style.display = "block"; if (mapCanvas) mapCanvas.style.display = "block"; const view = globe.renderAt(time); if (activePlan?.segments?.some((segment) => segment.resolved?.animationId)) { const localTime = Math.max(0, time - starts[Math.min(activeIndex, starts.length - 1)]); renderMapPlan({ layer: mapLayer, sceneTime: localTime, plan: activePlan, view }); } else { mapLayer?.clear?.(); } });
