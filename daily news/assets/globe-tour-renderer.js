/* ============================================================
   IndieHouse.io News — globe tour renderer

   One continuous film:
     cold open over a slowly turning globe, then for each story the
     globe rotates round to that country, the country lights up, and one
     attributed field photograph carries the headline into the frame.

   All timings come in through the `tour` variable, which the build
   script fills from the measured length of each narration clip, so the
   globe always lands on a country as its line begins.
   ============================================================ */

import { createGlobeTour } from "./animations/globe-tour.js";

const variables = window.__globeTourVariables;
const features = window.DAILY_NEWS_GEO?.features || [];
const root = document.getElementById("root");
const timeline = window.__timelines["globe-tour"];

const DURATION = Number(root.dataset.duration) || 44;

/* ---------------- variables ---------------- */

document.querySelectorAll("[data-bind]").forEach((element) => {
  element.textContent = variables[element.dataset.bind] ?? "";
});

/* Accent the last clause of the cold open so "bad news" carries. */
const openerLine = String(variables.openerLine || "Good morning, bad news.");
const openerParts = openerLine.split(/,\s*/);
document.getElementById("opener-line").innerHTML =
  openerParts.length > 1
    ? `${openerParts[0]},<br><em>${openerParts.slice(1).join(", ")}</em>`
    : openerLine;

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
  context.clearRect(0, 0, 1080, 1920);
  for (let index = 0; index < 560; index += 1) {
    const x = random() * 1080;
    const y = random() * 1920;
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

/* ---------------- globe ---------------- */

const tour = createGlobeTour({
  canvas: document.getElementById("globe-layer"),
  features,
  stops: stops.map((stop) => ({
    countryCode: stop.countryCode,
    coordinates: stop.coordinates,
    travelStart: Number(stop.travelStart),
    arrive: Number(stop.arrive),
    holdUntil: Number(stop.holdUntil),
    focusZoom: Number(stop.focusZoom) || 14.9,
  })),
});

window.addEventListener("hf-seek", (event) => tour.renderAt(event.detail.time));
tour.renderAt(window.__hfThreeTime || 0);
window.__globeTourReady = tour.ready.then(() => tour.renderAt(window.__hfThreeTime || 0));

/* ---------------- timeline ---------------- */

const cardElement = document.getElementById("card");
const cardKicker = document.getElementById("card-kicker");
const cardIndex = document.getElementById("card-index");
const cardHeadline = document.getElementById("card-headline");
const cardSource = document.getElementById("card-source");
const locatorElement = document.getElementById("locator");
const locatorName = document.getElementById("locator-name");
const storyMedia = document.getElementById("story-media");
const imageCredit = document.getElementById("image-credit");
const imageIndex = document.getElementById("image-index");
const imageLayers = stops.map((_, index) => document.getElementById(`story-image-${index}`));

/* Chrome in first, then hold for the whole film. */
timeline.fromTo("#rail", { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.7 }, 0.25);
timeline.fromTo("#rail-rule", { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "expo.out" }, 0.4);

/* Cold open. */
timeline.fromTo(
  "#opener-line",
  { opacity: 0, y: 34 },
  { opacity: 1, y: 0, duration: 0.85, ease: "expo.out", immediateRender: false },
  0.5,
);
timeline.fromTo(
  ".opener__sub",
  { opacity: 0 },
  { opacity: 1, duration: 0.6, immediateRender: false },
  1.05,
);
timeline.to("#opener", { opacity: 0, y: -26, duration: 0.55, ease: "power2.in" }, openerEnd - 0.55);

timeline.fromTo(
  "#footer",
  { opacity: 0 },
  { opacity: 1, duration: 0.7, immediateRender: false },
  openerEnd,
);

/* Per stop: swap the copy, bring the locator and card in as the globe
   settles, take them out again before it leaves. Exit the current card
   before the next stop's copy swap; overlapping opacity tweens on this
   shared card let the earlier fade-out cancel the next story's entrance. */
stops.forEach((stop, index) => {
  const swapAt = Math.max(0, Number(stop.travelStart) + 0.05);
  const inAt = Number(stop.arrive) - 0.45;
  const nextTravelStart = Number(stops[index + 1]?.travelStart ?? DURATION);
  const outAt =
    index < stops.length - 1
      ? Math.max(inAt + 1, Math.min(Number(stop.holdUntil) - 0.35, nextTravelStart - 0.65))
      : Number(stop.holdUntil) - 0.35;

  timeline.call(
    () => {
      cardKicker.textContent = stop.kicker || "";
      cardIndex.textContent = `Story ${String(index + 1).padStart(2, "0")} / ${String(stops.length).padStart(2, "0")}`;
      cardHeadline.textContent = stop.headline || "";
      cardSource.textContent = stop.source ? `Sources · ${stop.source}` : "";
      locatorName.textContent = stop.locationName || stop.countryName || "";
      imageCredit.textContent = stop.imageCredit || "";
      imageIndex.textContent = `Photo ${String(index + 1).padStart(2, "0")} / ${String(stops.length).padStart(2, "0")}`;
      if (imageLayers[index]) imageLayers[index].alt = stop.imageAlt || "News photograph";
    },
    null,
    swapAt,
  );

  timeline.fromTo(
    locatorElement,
    { opacity: 0, x: -18 },
    { opacity: 1, x: 0, duration: 0.5, ease: "power3.out", immediateRender: false },
    inAt,
  );
  timeline.fromTo(
    cardElement,
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 0.62, ease: "expo.out", immediateRender: false },
    inAt + 0.12,
  );

  if (index === 0) {
    timeline.fromTo(
      storyMedia,
      { opacity: 0, y: 32, scale: 0.975 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "expo.out", immediateRender: false },
      Math.max(0, inAt - 0.22),
    );
  }

  const imageLayer = imageLayers[index];
  if (imageLayer) {
    const imageInAt =
      index === 0
        ? Math.max(0, inAt - 0.16)
        : Math.max(0, swapAt + 0.18);
    timeline.fromTo(
      imageLayer,
      { opacity: 0, scale: 1.08 },
      { opacity: 1, scale: 1, duration: 0.9, ease: "power3.out", immediateRender: false },
      imageInAt,
    );
  }

  if (index < stops.length - 1) {
    timeline.to(locatorElement, { opacity: 0, x: 14, duration: 0.4, ease: "power2.in" }, outAt);
    timeline.to(cardElement, { opacity: 0, y: -24, duration: 0.45, ease: "power2.in" }, outAt + 0.06);
    if (imageLayer) {
      const imageOutAt = Math.max(outAt, nextTravelStart + 0.02);
      timeline.to(
        imageLayer,
        { opacity: 0, scale: 1.04, duration: 0.5, ease: "power2.in" },
        imageOutAt,
      );
    }
  }
});

/* Let the last card ride out to the end rather than cutting to nothing. */
timeline.to(cardElement, { opacity: 0, duration: 0.5, ease: "power2.in" }, DURATION - 0.5);
timeline.to(locatorElement, { opacity: 0, duration: 0.5, ease: "power2.in" }, DURATION - 0.5);
timeline.to(storyMedia, { opacity: 0, y: -20, duration: 0.5, ease: "power2.in" }, DURATION - 0.5);
const lastImageLayer = imageLayers[imageLayers.length - 1];
if (lastImageLayer) {
  timeline.to(lastImageLayer, { opacity: 0, scale: 1.04, duration: 0.5, ease: "power2.in" }, DURATION - 0.5);
}
timeline.to("#footer", { opacity: 0, duration: 0.5 }, DURATION - 0.5);
