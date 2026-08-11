/* ============================================================
   IndieHouse.io News — globe tour renderer

   One continuous film:
     a tone-led cold open, then exact narration handoffs between story
     cards, a globe route, and two photographic beats.

   All timings come in through the `tour` variable, which the build
   script fills from the measured length of each narration clip, so the
   globe and story card timing are derived from the measured narration track.
   ============================================================ */

import { createGlobeTour } from "./animations/globe-tour.js";
import { createGlobeMapLayer, renderMapPlan, resolveMapPlanForScene } from "./animations/globe-map-runtime.js";

const variables = window.__globeTourVariables;
const features = window.DAILY_NEWS_GEO?.features || [];
const root = document.getElementById("root");
const compositionId = root?.dataset.compositionId || "globe-tour";
const timeline = window.__timelines[compositionId];
const CANVAS_WIDTH = Number(root?.dataset.width || 1080);
const CANVAS_HEIGHT = Number(root?.dataset.height || 1920);
const FORMAT = CANVAS_WIDTH >= CANVAS_HEIGHT ? "landscape" : "portrait";

const DURATION = Number(root.dataset.duration) || 44;

/* ---------------- variables ---------------- */

document.querySelectorAll("[data-bind]").forEach((element) => {
  element.textContent = variables[element.dataset.bind] ?? "";
});

/* The opening frame is a title card only. The narrated lead remains in
   openerLine for the audio track, but no story headline is shown beside it. */
const openerLine = String(variables.openerLine || "").trim();
const openerTitleFromLine = /good morning,\s*bad news/i.test(openerLine)
  ? "Good morning, bad news"
  : /good morning,\s*good news/i.test(openerLine)
    ? "Good morning, good news"
    : "";
const openerTitle = String(
  openerTitleFromLine ||
    variables.openerTitle ||
    openerLine.split(/—\s*/)[0] ||
    "Good morning, bad news",
).trim();
const commaIndex = openerTitle.indexOf(",");
const openerLines = commaIndex >= 0
  ? [openerTitle.slice(0, commaIndex + 1).trim(), openerTitle.slice(commaIndex + 1).trim()].filter(Boolean)
  : openerTitle.split(/\s*,\s*/, 2).filter(Boolean);
document.getElementById("opener-line-first").textContent = openerLines[0] || openerTitle;
document.getElementById("opener-line-second").textContent = openerLines[1] || "";

function parseTour(value) {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(String(value || "[]"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/* Deterministic fibers and pinholes keep the drafting mat tactile without
   introducing a second focal point behind the globe. */
(function paintMatteTexture() {
  const canvas = document.getElementById("space-layer");
  const context = canvas?.getContext("2d");
  if (!context) return;
  let seed = 20260725;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  for (let index = 0; index < 560; index += 1) {
    const x = random() * CANVAS_WIDTH;
    const y = random() * CANVAS_HEIGHT;
    const length = random() * 4.2 + 0.6;
    const angle = random() * Math.PI;
    const alpha = 0.025 + random() * 0.075;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    context.strokeStyle = `rgba(226,235,221,${alpha.toFixed(3)})`;
    context.lineWidth = random() * 0.8 + 0.25;
    context.stroke();
  }
})();

const stops = parseTour(variables.tour);
const openerEnd = Number(variables.openerEnd) || 3.4;

/* ---------------- globe / map layer ---------------- */

/* Every stop is resolved through the shared library plan. The historic
   Three.js globe is the single visible globe; the map library contributes
   transparent claim annotations above that instrument. */

const mapLayer = createGlobeMapLayer({
  canvas: document.getElementById("map-layer"),
  features,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  format: FORMAT,
  drawBackground: false,
  drawGlobeSurface: false,
});

const storyForStop = (stop) => ({
  headline: stop.headline || "",
  summary: stop.deck || "",
  kicker: stop.kicker || "",
  countryCode: stop.countryCode || "",
  countryName: stop.countryName || "",
  cityName: stop.locationName || "",
  coordinates: Array.isArray(stop.coordinates) ? stop.coordinates.map(Number) : null,
  routePoints: Array.isArray(stop.routePoints) ? stop.routePoints : [],
  mentionedCountryCodes: Array.isArray(stop.mentionedCountryCodes) ? stop.mentionedCountryCodes : [],
  affectedCountryCodes: Array.isArray(stop.affectedCountryCodes) ? stop.affectedCountryCodes : [],
  mapAnimation: stop.mapAnimation || "",
  mapData: stop.mapData || null,
  mapSource: stop.mapSource || stop.source || "",
  source: stop.source || "",
  storyType: stop.storyType || "auto",
  animationPlan: stop.animationPlan || stop.visualPlan || null,
});

const stopMapPlans = stops.map((stop) => resolveMapPlanForScene({
  story: storyForStop(stop),
  format: FORMAT,
  mode: "production",
  duration: Math.max(0.1, Number(stop.holdUntil || stop.speakAt || 0) - Number(stop.arrive || stop.speakAt || 0)),
  requireLibrary: true,
}));
const openingMapPlan = resolveMapPlanForScene({
  story: {
    headline: "Global orientation",
    mapAnimation: "world-orbit",
    mapSource: "godandbaddaily / globe-map library context",
    source: "godandbaddaily / globe-map library context",
  },
  format: FORMAT,
  mode: "production",
  duration: Math.max(0.1, openerEnd),
  requireLibrary: true,
});

/* ---------------- globe ---------------- */

const tour = createGlobeTour({
  canvas: document.getElementById("globe-layer"),
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  openingHeight: 0,
  features,
  stops: stops.map((stop) => ({
    countryCode: stop.countryCode,
    coordinates: stop.coordinates,
    travelStart: Number(stop.travelStart),
    arrive: Number(stop.arrive),
    holdUntil: Number(stop.holdUntil),
    focusZoom: Number(stop.focusZoom) || 14.9,
    routePoints: Array.isArray(stop.routePoints) ? stop.routePoints : [],
    mentionedCountryCodes: Array.isArray(stop.mentionedCountryCodes)
      ? stop.mentionedCountryCodes
      : [],
    affectedCountryCodes: Array.isArray(stop.affectedCountryCodes)
      ? stop.affectedCountryCodes
      : [],
  })),
  showRouteLayers: false,
});

tour.renderAt(window.__hfThreeTime || 0);
window.__globeTourReady = tour.ready.then(() => tour.renderAt(window.__hfThreeTime || 0));

/* ---------------- timeline ---------------- */

const storyMedia = document.getElementById("story-media");
const endCard = document.getElementById("end-card");
const storyCards = stops.map((_, index) => ({
  element: document.getElementById(`card-${index}`),
  kicker: document.getElementById(`card-kicker-${index}`),
  index: document.getElementById(`card-index-${index}`),
  headline: document.getElementById(`card-headline-${index}`),
  facts: document.getElementById(`card-facts-${index}`),
  deck: document.getElementById(`card-deck-${index}`),
  source: document.getElementById(`card-source-${index}`),
}));
const storyLocators = stops.map((_, index) => ({
  element: document.getElementById(`locator-${index}`),
  name: document.getElementById(`locator-name-${index}`),
}));
const storyBeats = stops.map((_, index) => ({
  primary: {
    element: document.getElementById(`story-beat-${index}-primary`),
    image: document.getElementById(`story-image-${index}-primary`),
    credit: document.getElementById(`story-credit-${index}-primary`),
  },
  secondary: {
    element: document.getElementById(`story-beat-${index}-secondary`),
    image: document.getElementById(`story-image-${index}-secondary`),
    credit: document.getElementById(`story-credit-${index}-secondary`),
  },
}));

/* Fill every story state once, before the paused timeline is built. The
   timeline only animates pre-existing elements; it never swaps text, image
   sources, or credits from a callback while a render is being seeked. */
stops.forEach((stop, index) => {
  const card = storyCards[index];
  const locator = storyLocators[index];
  if (card?.element) {
    card.kicker.textContent = stop.kicker || "";
    card.index.textContent = `Story ${String(index + 1).padStart(2, "0")} / ${String(stops.length).padStart(2, "0")}`;
    card.headline.textContent = stop.headline || "";
    if (card.facts) card.facts.textContent = stop.factLine || "";
    if (card.deck) card.deck.textContent = stop.deck || "";
    card.source.textContent = stop.source ? `Sources · ${stop.source}` : "";
  }
  if (locator) locator.name.textContent = stop.locationName || stop.countryName || "";
  const beats = storyBeats[index];
  if (beats) {
    if (stop.imagePath) beats.primary.image.src = stop.imagePath;
    if (stop.imagePathTwo) beats.secondary.image.src = stop.imagePathTwo;
    beats.primary.credit.textContent = stop.imageCredit || "";
    beats.secondary.credit.textContent = stop.imageCreditTwo || stop.imageCredit || "";
    beats.primary.image.alt = stop.imageAlt || "News photograph";
    beats.secondary.image.alt = stop.imageAltTwo || stop.imageAlt || "News photograph";
  }
});

/* Chrome in first, then hold for the whole film. */
timeline.set("#opener-line-first, #opener-line-second, .opener__sub", { opacity: 0 }, 0);
timeline.set("#opener", { opacity: 0 }, 0);
timeline.fromTo("#rail", { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.7 }, 0.25);
timeline.fromTo("#rail-rule", { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "expo.out" }, 0.4);
timeline.fromTo(
  "#opener",
  { opacity: 0 },
  { opacity: 1, duration: 0.01, immediateRender: false },
  0.28,
);

/* Cold open: the title enters immediately, with no second headline on this page. */
timeline.fromTo(
  "#opener-line-first, #opener-line-second",
  { opacity: 0, y: 34 },
  { opacity: 1, y: 0, duration: 0.85, ease: "expo.out", immediateRender: false },
  0.28,
);
timeline.fromTo(
  ".opener__sub",
  { opacity: 0 },
  { opacity: 1, duration: 0.6, immediateRender: false },
  0.72,
);
timeline.to("#opener", { opacity: 0, y: -26, duration: 0.55, ease: "power2.in" }, openerEnd - 0.55);

timeline.set("#footer", { opacity: 0 }, openerEnd - 0.001);
timeline.fromTo(
  "#footer",
  { opacity: 0 },
  { opacity: 1, duration: 0.7, immediateRender: false },
  openerEnd,
);

/* Per stop: every story state changes at the exact narration handoff. The
   globe can still travel after the handoff, while the outgoing card remains
   readable until the previous line has finished. */
stops.forEach((stop, index) => {
  const speakAt = Number(stop.speakAt ?? stop.arrive ?? 0);
  const nextSpeakAt = Number(stops[index + 1]?.speakAt ?? DURATION);
  const outAt = index < stops.length - 1
    ? Math.max(speakAt + 1, nextSpeakAt - 0.44)
    : Math.max(speakAt + 1, Number(stop.holdUntil || DURATION) - 0.28);
  const midAt = Math.min(outAt - 0.7, speakAt + Math.max(4.2, (outAt - speakAt) * 0.52));

  const card = storyCards[index]?.element;
  const locator = storyLocators[index]?.element;
  const locatorName = storyLocators[index]?.name;
  const beats = storyBeats[index];
  if (!card || !locator || !beats) return;

  timeline.set(locator, { opacity: 0 }, speakAt - 0.001);
  timeline.set(card, { opacity: 0 }, speakAt - 0.001);
  timeline.fromTo(
    locator,
    { opacity: 0, x: -18 },
    { opacity: 1, x: 0, duration: 0.5, ease: "power3.out", immediateRender: false },
    speakAt,
  );
  if (locatorName) {
    timeline.fromTo(
      locatorName,
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.42, ease: "power2.out", immediateRender: false },
      speakAt + 0.08,
    );
  }
  timeline.fromTo(
    card,
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 0.62, ease: "expo.out", immediateRender: false },
    speakAt + 0.08,
  );

  /* The card's inner text starts at opacity 0 in CSS; reveal it in lockstep
     with the card so the kicker, headline and source are readable. */
  const innerReveal = () => ({
    opacity: 1,
    duration: 0.5,
    ease: "power2.out",
    immediateRender: false,
  });
  if (card.querySelector(".card__meta")) {
    timeline.fromTo(card.querySelector(".card__meta"), { opacity: 0 }, innerReveal(), speakAt + 0.14);
  }
  if (card.querySelector(".card__headline")) {
    timeline.fromTo(card.querySelector(".card__headline"), { opacity: 0 }, innerReveal(), speakAt + 0.2);
  }
  if (card.querySelector(".card__facts")) {
    timeline.fromTo(card.querySelector(".card__facts"), { opacity: 0, y: 8 }, { ...innerReveal(), y: 0 }, speakAt + 0.3);
  }
  if (card.querySelector(".card__source")) {
    timeline.fromTo(card.querySelector(".card__source"), { opacity: 0 }, innerReveal(), speakAt + 0.42);
  }

  if (index === 0) {
    timeline.set(storyMedia, { opacity: 0 }, speakAt - 0.001);
    timeline.fromTo(
      storyMedia,
      { opacity: 0, y: 32, scale: 0.975 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "expo.out", immediateRender: false },
      speakAt,
    );
  }

  if (beats.primary.element) {
    timeline.set(beats.primary.element, { opacity: 0 }, speakAt - 0.001);
    timeline.fromTo(
      beats.primary.element,
      { opacity: 0, scale: 1.025 },
      { opacity: 1, scale: 1, duration: 0.72, ease: "power3.out", immediateRender: false },
      speakAt,
    );
    beats.primary.element.querySelectorAll(".story-media__beat-index, .story-media__beat-credit").forEach((label) => {
      timeline.fromTo(
        label,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.38, ease: "power2.out", immediateRender: false },
        speakAt + 0.22,
      );
    });
  }

  if (beats.secondary.element) {
    timeline.set(beats.secondary.element, { opacity: 0 }, midAt - 0.001);
    timeline.fromTo(
      beats.secondary.element,
      { opacity: 0, scale: 1.025 },
      { opacity: 1, scale: 1, duration: 0.64, ease: "power3.out", immediateRender: false },
      midAt,
    );
    beats.secondary.element.querySelectorAll(".story-media__beat-index, .story-media__beat-credit").forEach((label) => {
      timeline.fromTo(
        label,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.34, ease: "power2.out", immediateRender: false },
        midAt + 0.18,
      );
    });
    if (beats.primary.element) {
      timeline.to(
        beats.primary.element,
        { opacity: 0, scale: 1, duration: 0.48, ease: "power2.in" },
        midAt + 0.08,
      );
    }
  }

  if (index < stops.length - 1) {
    timeline.to(locator, { opacity: 0, x: 14, duration: 0.4, ease: "power2.in" }, outAt);
    timeline.to(card, { opacity: 0, y: -24, duration: 0.32, ease: "power2.in" }, outAt);
  }

  if (index < stops.length - 1) {
    [beats.primary.element, beats.secondary.element].filter(Boolean).forEach((beat) => {
      // Keep the outgoing photo visible until the exact narration handoff;
      // the next photo then crossfades in on that same beat.
      timeline.to(beat, { opacity: 0, scale: 1, duration: 0.38, ease: "power2.in" }, nextSpeakAt);
    });
  }

});

/* The last two seconds become a clear follow/source handoff. The footer
   stays present and now sits above the platform's bottom UI safe area. */
const endCardStart = Number(variables.endCardStart) || Math.max(0, DURATION - 2.4);
const endCardReveal = Number(variables.endCardReveal) || endCardStart + 0.24;
storyCards.map((storyCard) => storyCard.element).filter(Boolean).forEach((card) => {
  timeline.to(card, { opacity: 0, y: -24, duration: 0.24, ease: "power2.in" }, endCardStart);
});
storyLocators.map((storyLocator) => storyLocator.element).filter(Boolean).forEach((locator) => {
  timeline.to(locator, { opacity: 0, duration: 0.24, ease: "power2.in" }, endCardStart);
});
timeline.to(storyMedia, { opacity: 0, y: -20, duration: 0.24, ease: "power2.in" }, endCardStart);
storyBeats.flatMap((beats) => [beats.primary.element, beats.secondary.element]).filter(Boolean).forEach((beat) => {
  timeline.to(beat, { opacity: 0, scale: 1, duration: 0.24, ease: "power2.in" }, endCardStart);
});
timeline.set(endCard, { opacity: 0 }, endCardReveal - 0.001);
timeline.fromTo(
  endCard,
  { opacity: 0, y: 28, scale: 0.97 },
  { opacity: 1, y: 0, scale: 1, duration: 0.58, ease: "expo.out", immediateRender: false },
  endCardReveal,
);
timeline.fromTo(
  ".end-card__eyebrow",
  { opacity: 0, y: 10 },
  { opacity: 1, y: 0, duration: 0.34, ease: "power2.out", immediateRender: false },
  endCardReveal + 0.1,
);
timeline.fromTo(
  ".end-card__title",
  { opacity: 0, y: 16 },
  { opacity: 1, y: 0, duration: 0.46, ease: "expo.out", immediateRender: false },
  endCardReveal + 0.18,
);
timeline.fromTo(
  ".end-card__source",
  { opacity: 0, y: 10 },
  { opacity: 1, y: 0, duration: 0.34, ease: "power2.out", immediateRender: false },
  endCardReveal + 0.32,
);
timeline.to(endCard, { opacity: 0, duration: 0.3, ease: "power2.in" }, DURATION - 0.3);

window.addEventListener("hf-seek", (event) => {
  const time = Number(event.detail?.time) || 0;
  /* The historical Three.js globe is always rendered. A resolved map plan
     adds transparent annotations only; it never swaps in a second globe. */
  const activeIndex = stops.findIndex((stop, index) => {
    const speakAt = Number(stop.speakAt ?? stop.arrive ?? 0);
    const nextSpeakAt = Number(stops[index + 1]?.speakAt ?? DURATION);
    return time >= speakAt && time < nextSpeakAt;
  });
  const activePlan = activeIndex >= 0 ? stopMapPlans[activeIndex] : openingMapPlan;
  const globeCanvas = document.getElementById("globe-layer");
  const mapCanvas = document.getElementById("map-layer");
  if (globeCanvas) globeCanvas.style.display = "block";
  if (mapCanvas) mapCanvas.style.display = "block";
  const view = tour.renderAt(time);
  if (activePlan?.segments?.some((segment) => segment.resolved?.animationId)) {
    const localTime = activeIndex >= 0
      ? Math.max(0, time - Number(stops[activeIndex].arrive ?? stops[activeIndex].speakAt ?? 0))
      : Math.max(0, time);
    renderMapPlan({ layer: mapLayer, sceneTime: localTime, plan: activePlan, view });
  } else {
    mapLayer?.clear?.();
  }
});
