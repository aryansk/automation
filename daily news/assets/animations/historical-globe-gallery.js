import { createGlobeTour } from "./globe-tour.js";

function coordinates(value) {
  if (!Array.isArray(value) || value.length !== 2) return null;
  const point = value.map(Number);
  return point.every(Number.isFinite) ? point : null;
}

function point(value) {
  if (Array.isArray(value)) {
    const parsed = coordinates(value);
    return parsed ? { coordinates: parsed } : null;
  }
  const parsed = coordinates(value?.coordinates);
  return parsed ? { ...value, coordinates: parsed } : null;
}

function firstRoute(sample) {
  const candidates = [
    sample?.route,
    ...(Array.isArray(sample?.routes) ? sample.routes.map((route) => route?.points) : []),
    sample?.track,
    sample?.observed,
    sample?.forecast,
    sample?.line,
  ];
  for (const candidate of candidates) {
    const route = Array.isArray(candidate) ? candidate.map(point).filter(Boolean) : [];
    if (route.length >= 2) return route;
  }
  return [];
}

function firstCoordinate(sample) {
  const direct = coordinates(sample?.target?.coordinates);
  if (direct) return direct;
  const route = firstRoute(sample);
  if (route[0]?.coordinates) return route[0].coordinates;
  const candidates = [
    ...(Array.isArray(sample?.points) ? sample.points : []),
    ...(Array.isArray(sample?.nodes) ? sample.nodes : []),
    ...(Array.isArray(sample?.sources) ? sample.sources : []),
    ...(Array.isArray(sample?.sinks) ? sample.sinks : []),
    ...(Array.isArray(sample?.before) ? sample.before : []),
    ...(Array.isArray(sample?.after) ? sample.after : []),
  ];
  for (const candidate of candidates) {
    const parsed = coordinates(candidate?.coordinates);
    if (parsed) return parsed;
  }
  return [0, 15];
}

function countryCodes(sample, route) {
  return [
    sample?.target?.code,
    ...route.map((entry) => entry?.code),
    ...(Array.isArray(sample?.nodes) ? sample.nodes.map((entry) => entry?.code) : []),
  ]
    .map((code) => String(code || "").trim().toUpperCase())
    .filter((code, index, values) => code && values.indexOf(code) === index);
}

/**
 * Build the historic globe's stop schedule for a gallery. The library's
 * Canvas renderer remains the transparent, globe-native annotation layer,
 * while this Three.js tour owns the visible globe surface in every format.
 */
export function createHistoricalGlobeGallery({
  canvas,
  features,
  width,
  height,
  format,
  entries,
  segmentDuration,
  maxStops = entries.length,
}) {
  const portrait = format === "portrait";
  const cameraZ = portrait ? 16 : 10.8;
  const baseHeight = portrait ? 0.53 : 0;
  /* Every gallery preset gets a corresponding globe stop. The old bounded
     tour left later presets looking static while their independent map layer
     continued animating. Country fills are intentionally delegated to the
     native annotation layer here, so sixty stops do not allocate duplicate
     globe textures. `maxStops` remains as a compatibility escape hatch for
     small diagnostic compositions. */
  const stopEntries = Number.isFinite(maxStops)
    ? entries.slice(0, Math.max(1, maxStops))
    : entries;
  const stops = stopEntries.map(({ sample }, index) => {
    const route = firstRoute(sample);
    const target = firstCoordinate(sample);
    const codes = countryCodes(sample, route);
    const start = index * segmentDuration;
    return {
      countryCode: String(sample?.target?.code || codes[0] || "").toUpperCase(),
      coordinates: target,
      travelStart: start + 0.04,
      arrive: start + Math.min(0.86, segmentDuration * 0.34),
      holdUntil: start + segmentDuration,
      cameraZ,
      routePoints: route,
      mentionedCountryCodes: codes,
      affectedCountryCodes: [],
    };
  });

  return createGlobeTour({
    canvas,
    features: Array.isArray(features) ? features : [],
    width,
    height,
    baseHeight,
    liftHeight: baseHeight,
    openingHeight: baseHeight,
    defaultCameraZ: cameraZ,
    openingCameraZ: cameraZ,
    idleSpin: 0.012,
    stops,
    showRouteMarkers: false,
    showRouteLayers: false,
    showCountryHighlights: false,
  });
}
