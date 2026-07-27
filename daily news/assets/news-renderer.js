import { createNewsGlobe } from "./animations/globe.js";
import {
  addNumberCount,
  chooseStoryAnimation,
  getAnimation,
  normalizeStoryMetadata,
} from "./animations/index.js";

const variables = window.__dailyNewsVariables;
const features = window.DAILY_NEWS_GEO?.features || [];
const cityRows = window.DAILY_NEWS_CITIES || [];
const root = document.getElementById("root");
const timeline = window.__timelines["daily-news"];

const normalizeLocation = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

const cityAliases = Object.freeze({
  "new york": "new york city",
  nyc: "new york city",
  dc: "washington",
  "d c": "washington",
  "washington dc": "washington",
  "washington d c": "washington",
  bombay: "mumbai",
});

function parseCoordinateOverride(value) {
  if (Array.isArray(value) && value.length === 2) return value.map(Number);
  const source = String(value || "").trim();
  if (!source) return null;
  try {
    const parsed = JSON.parse(source);
    if (!Array.isArray(parsed) || parsed.length !== 2) return null;
    const coordinates = parsed.map(Number);
    return coordinates.every(Number.isFinite) ? coordinates : null;
  } catch {
    return null;
  }
}

function resolveLocation() {
  const requestedCode = String(variables.countryCode || "US").toUpperCase();
  const selectedCountry =
    features.find((feature) => feature.properties.code === requestedCode) ||
    features.find((feature) => feature.properties.code === "US") ||
    features[0];
  const countryCode = selectedCountry?.properties?.code || "US";
  const requestedCityName = String(variables.cityName || "").trim();
  const requestedCityKey = normalizeLocation(requestedCityName);
  const resolvedCityKey = cityAliases[requestedCityKey] || requestedCityKey;
  const exactCities = requestedCityKey
    ? cityRows.filter((city) => {
        if (city[2] !== countryCode) return false;
        return normalizeLocation(city[0]) === resolvedCityKey ||
          normalizeLocation(city[1]) === resolvedCityKey;
      })
    : [];
  const prefixCities = exactCities.length || !requestedCityKey
    ? []
    : cityRows.filter((city) => {
        if (city[2] !== countryCode) return false;
        return normalizeLocation(city[0]).startsWith(resolvedCityKey) ||
          normalizeLocation(city[1]).startsWith(resolvedCityKey);
      });
  const selectedCity = [...exactCities, ...prefixCities].sort((a, b) => b[5] - a[5])[0] || null;
  const storedLatLng = selectedCountry?.properties?.latlng;
  const countryCenter = storedLatLng
    ? [Number(storedLatLng[1]), Number(storedLatLng[0])]
    : window.d3.geoCentroid(selectedCountry);
  const cityCoordinates = selectedCity
    ? [Number(selectedCity[4]), Number(selectedCity[3])]
    : null;
  const coordinates = parseCoordinateOverride(variables.coordinates) || cityCoordinates || countryCenter;
  const countryName = requestedCode === countryCode && String(variables.countryName || "").trim()
    ? variables.countryName
    : selectedCountry?.properties?.name || "United States";
  const locationName = selectedCity
    ? requestedCityName || selectedCity[0]
    : countryName;
  return Object.freeze({
    requestedCode,
    countryCode,
    countryName,
    selectedCountry,
    selectedCity,
    coordinates,
    locationName,
  });
}

function splitNarration(script) {
  const source = String(script || "").trim();
  if (!source) return ["Daily briefing.", "Verified context.", "Follow the developing story."];
  const sentences = source.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((item) => item.trim()).filter(Boolean) || [];
  if (sentences.length >= 3) {
    return [sentences[0], sentences[1], sentences.slice(2).join(" ")];
  }
  const words = source.split(/\s+/);
  const partSize = Math.ceil(words.length / 3);
  return [
    words.slice(0, partSize).join(" "),
    words.slice(partSize, partSize * 2).join(" "),
    words.slice(partSize * 2).join(" "),
  ].map((part) => part || source);
}

function fitHeadline(element, text) {
  const length = String(text || "").length;
  const size = length <= 38 ? 136 : length <= 58 ? 120 : length <= 76 ? 104 : 92;
  element.style.fontSize = `${size}px`;
}

function fitLocation(element, text) {
  const length = String(text || "").length;
  const size = length <= 10 ? 164 : length <= 18 ? 146 : length <= 26 ? 122 : 100;
  element.style.fontSize = `${size}px`;
}

const location = resolveLocation();
const metadata = normalizeStoryMetadata({
  ...variables,
  countryCode: location.countryCode,
  countryName: location.countryName,
});
const affectedCountryCodes = metadata.geography.affectedCountryCodes;
const affectedCount = Math.max(0, Number(variables.affectedCount || affectedCountryCodes.length));
const hasAffectedSweep = affectedCountryCodes.length > 0 && affectedCount > 0;
const transitionTime = hasAffectedSweep ? 10.05 : 5.72;
const lockUiStart = hasAffectedSweep ? 7.68 : 3.36;

document.querySelectorAll("[data-bind]").forEach((element) => {
  const key = element.dataset.bind;
  element.textContent = variables[key] ?? "";
});

root.dataset.urgency = metadata.urgency;
root.dataset.storyType = metadata.storyType;
document.getElementById("scan-country").textContent = location.locationName;
document.getElementById("scan-code").textContent = location.countryCode;
document.getElementById("target-mode").textContent = location.selectedCity ? "City scan" : "Country scan";
document.getElementById("location-tag").textContent = location.selectedCity
  ? `${location.locationName} · ${location.countryCode}`
  : `${location.countryName} · ${location.countryCode}`;
document.getElementById("sweep-count").textContent = `${affectedCount} economies`;
if (!hasAffectedSweep) document.getElementById("sweep-banner").style.opacity = "0";

const [targetLongitude, targetLatitude] = location.coordinates;
const coordinatePrecision = location.selectedCity ? 2 : 1;
document.getElementById("coord-lat").textContent =
  `LAT ${Math.abs(targetLatitude).toFixed(coordinatePrecision)}°${targetLatitude >= 0 ? "N" : "S"}`;
document.getElementById("coord-lon").textContent =
  `LON ${Math.abs(targetLongitude).toFixed(coordinatePrecision)}°${targetLongitude >= 0 ? "E" : "W"}`;

const primaryImage = document.getElementById("photo-primary");
const secondaryImage = document.getElementById("photo-secondary");
primaryImage.src = variables.imageOne || "assets/sample-primary.jpg";
secondaryImage.src = variables.imageTwo || "assets/sample-secondary.jpg";
[primaryImage, secondaryImage].forEach((image, index) => {
  image.addEventListener("error", () => {
    image.src = index === 0 ? "assets/sample-primary.jpg" : "assets/sample-secondary.jpg";
  }, { once: true });
});
document.getElementById("narration-track").src =
  variables.narrationAudio || "assets/narration/silence.wav";

fitHeadline(document.getElementById("story-headline"), variables.headline);
fitLocation(document.getElementById("scan-country"), location.locationName);

const captions = splitNarration(variables.script);
document.querySelectorAll("[data-caption-index]").forEach((element) => {
  element.textContent = captions[Number(element.dataset.captionIndex)] || "";
});

let animationOptions = chooseStoryAnimation({
  ...variables,
  countryCode: location.countryCode,
  countryName: location.countryName,
  cityName: location.selectedCity ? location.locationName : "",
});
animationOptions = {
  ...animationOptions,
  duration: Math.max(4.2, 16.35 - transitionTime),
  entry: metadata.urgency === "breaking" ? "hard-cut" : "editorial-rise",
  exit: "quiet-fade",
  reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "always" : "respect",
};

let adaptiveAnimation;
try {
  adaptiveAnimation = getAnimation(animationOptions);
  if (!adaptiveAnimation.valid) throw new Error(adaptiveAnimation.missing.join(", "));
} catch {
  adaptiveAnimation = getAnimation({
    type: "headline-reveal",
    headline: variables.headline,
    label: variables.kicker,
    text: variables.summary,
    source: variables.source,
    duration: animationOptions.duration,
  });
}

const adaptiveTarget = document.getElementById("adaptive-visual");
adaptiveAnimation.mount(adaptiveTarget);
const showAdaptiveVisual = !adaptiveAnimation.definition.type.startsWith("country-globe");
if (!showAdaptiveVisual) adaptiveTarget.style.display = "none";

const globeCanvas = document.getElementById("globe-layer");
const rendererMode = document.getElementById("renderer-mode");
const rendererStatus = document.getElementById("renderer-status");
const globe = createNewsGlobe({
  canvas: globeCanvas,
  features,
  countryCode: location.countryCode,
  countryName: location.countryName,
  city: location.selectedCity ? location.locationName : "",
  coordinates: location.coordinates,
  affectedCountryCodes,
  highlightStyle: metadata.geography.highlightStyle,
  cameraAngle: metadata.geography.cameraAngle,
  duration: transitionTime,
  transitionTime,
  labelText: location.locationName,
  onFallback: () => {
    rendererMode.textContent = "2D premium fallback";
    rendererStatus.textContent = "Renderer / fallback active";
  },
  onTextureError: () => {
    rendererMode.textContent = "2D premium fallback";
    rendererStatus.textContent = "Renderer / texture fallback";
  },
});

window.addEventListener("hf-seek", (event) => globe.renderAt(event.detail.time));
globe.renderAt(window.__hfThreeTime || 0);
window.__dailyNewsReady = globe.ready.then(() => {
  rendererMode.textContent = globe.mode === "webgl" ? "3D Earth / satellite" : "2D premium fallback";
  rendererStatus.textContent = globe.mode === "webgl" ? "Renderer / WebGL ready" : "Renderer / fallback ready";
  globe.renderAt(window.__hfThreeTime || 0);
});

timeline.fromTo("#space-layer", { opacity: 0 }, {
  opacity: 0.78,
  duration: 1.2,
  ease: "sine.out",
  immediateRender: false,
}, 0.08);
timeline.fromTo("#globe-layer", { opacity: 0 }, {
  opacity: 1,
  duration: 0.88,
  ease: "sine.out",
  immediateRender: false,
}, 0.12);
timeline.fromTo("#scan-topbar", { y: -54, opacity: 0 }, {
  y: 0,
  opacity: 1,
  duration: 0.52,
  ease: "expo.out",
  immediateRender: false,
}, 0.2);
timeline.fromTo("#scan-heading", { x: -58, opacity: 0 }, {
  x: 0,
  opacity: 1,
  duration: 0.66,
  ease: "power4.out",
  immediateRender: false,
}, 0.36);
timeline.fromTo("#globe-hud", { opacity: 0, scale: 0.96 }, {
  opacity: 1,
  scale: 1,
  duration: 0.92,
  ease: "power3.out",
  immediateRender: false,
}, 0.48);
if (hasAffectedSweep) {
  timeline.fromTo("#sweep-banner", { y: -32, opacity: 0 }, {
    y: 0,
    opacity: 1,
    duration: 0.52,
    ease: "expo.out",
    immediateRender: false,
  }, 0.72);
}
timeline.fromTo("#lock-panel", { y: 104, opacity: 0 }, {
  y: 0,
  opacity: 1,
  duration: 0.68,
  ease: "power4.out",
  immediateRender: false,
}, lockUiStart);
timeline.fromTo("#scan-country", { y: 64, opacity: 0 }, {
  y: 0,
  opacity: 1,
  duration: 0.62,
  ease: "expo.out",
  immediateRender: false,
}, lockUiStart + 0.2);
timeline.fromTo("#scan-code", { scale: 0.62, opacity: 0 }, {
  scale: 1,
  opacity: 1,
  duration: 0.54,
  ease: "power4.out",
  immediateRender: false,
}, lockUiStart + 0.38);
timeline.fromTo("#coord-rail", { x: 46, opacity: 0 }, {
  x: 0,
  opacity: 1,
  duration: 0.42,
  ease: "power3.out",
  immediateRender: false,
}, lockUiStart + 0.62);

timeline.fromTo("#story-wipe", { x: 0 }, {
  x: 2780,
  duration: 1.02,
  ease: "expo.inOut",
  immediateRender: false,
}, transitionTime - 0.22);
timeline.to("#scene-scan", {
  y: -110,
  opacity: 0,
  duration: 0.34,
  ease: "power3.in",
}, transitionTime - 0.16);
timeline.set("#scene-scan", { visibility: "hidden" }, transitionTime + 0.02);
timeline.fromTo("#scene-story", { x: 92, opacity: 0 }, {
  x: 0,
  opacity: 1,
  duration: 0.66,
  ease: "power4.out",
  immediateRender: false,
}, transitionTime + 0.16);

timeline.fromTo("#story-topbar", { y: -42, opacity: 0 }, {
  y: 0,
  opacity: 1,
  duration: 0.44,
  ease: "expo.out",
  immediateRender: false,
}, transitionTime + 0.38);
timeline.fromTo("#photo-primary-wrap", { y: 96, opacity: 0 }, {
  y: 0,
  opacity: 1,
  duration: 0.7,
  ease: "power4.out",
  immediateRender: false,
}, transitionTime + 0.48);
timeline.fromTo("#photo-secondary-wrap", { x: 132, opacity: 0 }, {
  x: 0,
  opacity: 1,
  duration: 0.66,
  ease: "power4.out",
  immediateRender: false,
}, transitionTime + 0.7);
timeline.fromTo("#photo-primary", { scale: 1.075, x: -8 }, {
  scale: 1,
  x: 0,
  duration: Math.max(5.4, 16.5 - transitionTime),
  ease: "sine.inOut",
  immediateRender: false,
}, transitionTime + 0.48);
timeline.fromTo("#photo-secondary", { scale: 1.12 }, {
  scale: 1.025,
  duration: Math.max(5.1, 16.3 - transitionTime),
  ease: "none",
  immediateRender: false,
}, transitionTime + 0.7);
if (showAdaptiveVisual) {
  adaptiveAnimation.addToTimeline(timeline, adaptiveTarget, transitionTime + 0.98);
}
if (metadata.storyType === "statistics" && metadata.statistic.numericValue !== null) {
  const numberElement = adaptiveTarget.querySelector(".ani-stat strong");
  const rawValue = metadata.statistic.value;
  const prefix = rawValue.match(/^[^\d-]*/)?.[0] || "";
  const suffix = rawValue.match(/[^\d.]+$/)?.[0] || metadata.statistic.unit || "";
  addNumberCount(
    timeline,
    numberElement,
    metadata.statistic.numericValue,
    transitionTime + 1.08,
    1.05,
    (value) => `${prefix}${Math.round(value).toLocaleString("en-US")}${suffix}`,
  );
}
timeline.fromTo("#kicker-row", { x: -72, opacity: 0 }, {
  x: 0,
  opacity: 1,
  duration: 0.42,
  ease: "power3.out",
  immediateRender: false,
}, transitionTime + 1.2);
timeline.fromTo("#headline-rule", { scaleX: 0 }, {
  scaleX: 1,
  duration: 0.45,
  ease: "expo.out",
  immediateRender: false,
}, transitionTime + 1.34);
timeline.fromTo("#story-headline", { y: 68, opacity: 0 }, {
  y: 0,
  opacity: 1,
  duration: 0.66,
  ease: "expo.out",
  immediateRender: false,
}, transitionTime + 1.48);
timeline.fromTo("#story-summary", { x: 54, opacity: 0 }, {
  x: 0,
  opacity: 1,
  duration: 0.52,
  ease: "power2.out",
  immediateRender: false,
}, transitionTime + 1.82);
timeline.fromTo("#source-row", { y: 32, opacity: 0 }, {
  y: 0,
  opacity: 1,
  duration: 0.4,
  ease: "sine.out",
  immediateRender: false,
}, transitionTime + 2.1);

timeline.fromTo("#caption-rail", { y: 40, opacity: 0 }, {
  y: 0,
  opacity: 1,
  duration: 0.48,
  ease: "power3.out",
  immediateRender: false,
}, 0.36);
timeline.set('[data-caption-index="0"]', { opacity: 1 }, 0);
timeline.set('[data-caption-index="1"], [data-caption-index="2"]', { opacity: 0 }, 0);
timeline.to('[data-caption-index="0"]', { opacity: 0, duration: 0.22, ease: "sine.in" }, 5.48);
timeline.to('[data-caption-index="1"]', { opacity: 1, duration: 0.26, ease: "sine.out" }, 5.62);
timeline.to('[data-caption-index="1"]', { opacity: 0, duration: 0.22, ease: "sine.in" }, 11.2);
timeline.to('[data-caption-index="2"]', { opacity: 1, duration: 0.26, ease: "sine.out" }, 11.34);
timeline.to("#progress-fill", { scaleX: 1, duration: 17.1, ease: "none" }, 0.16);

timeline.to("#scene-story", { opacity: 0.12, scale: 1.025, duration: 0.48, ease: "power2.in" }, 16.68);
timeline.to("#caption-rail", { y: 34, opacity: 0, duration: 0.38, ease: "power2.in" }, 16.68);
timeline.fromTo("#outro-card", { opacity: 0, scale: 1.035 }, {
  opacity: 1,
  scale: 1,
  duration: 0.58,
  ease: "power3.out",
  immediateRender: false,
}, 16.72);
timeline.set(["#scene-story", "#caption-rail"], { visibility: "hidden" }, 16.76);
timeline.fromTo(".outro-card__brand", { y: 34, opacity: 0 }, {
  y: 0,
  opacity: 1,
  duration: 0.48,
  ease: "expo.out",
  immediateRender: false,
}, 16.88);
timeline.fromTo(".outro-card__line", { scaleX: 0 }, {
  scaleX: 1,
  duration: 0.36,
  ease: "power4.out",
  immediateRender: false,
}, 17.03);
