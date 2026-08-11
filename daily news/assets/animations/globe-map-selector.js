/*
 * godandbaddaily — production adapter between story metadata and the
 * editorial globe/map library.
 *
 * This module is deliberately renderer-agnostic and works in both Node and
 * the browser. It owns the conservative rules that decide WHEN geography
 * materially improves a story, maps verified story fields onto the 60-preset
 * payloads, and enforces the strict production data policy: never fabricate a
 * map from illustrative sample values, and fall back to no map when the
 * verified data cannot support the claim.
 */

import {
  getGlobeMapAnimation,
  suggestGlobeMapAnimation,
  validateProductionGlobeMapAnimationConfig,
} from "./globe-map-library.js";

export const MAP_ANIMATION_NONE = "none";

/* ---- schema helpers (mirror validate-story.mjs conventions) ---- */

function asFiniteNumber(value, fallback = Number.NaN) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function isCoordinates(value) {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((number) => Number.isFinite(Number(number))) &&
    Math.abs(Number(value[0])) <= 180 &&
    Math.abs(Number(value[1])) <= 90
  );
}

function asPoint(value) {
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value.coordinates)) {
    const coordinates = value.coordinates.map(Number);
    if (isCoordinates(coordinates)) return { ...value, coordinates };
    return null;
  }
  if (Array.isArray(value)) {
    const coordinates = value.map(Number);
    if (isCoordinates(coordinates)) return { coordinates };
    return null;
  }
  return null;
}

function asPoints(value) {
  if (!Array.isArray(value)) return [];
  return value.map(asPoint).filter(Boolean);
}

function asRoutes(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((route) => {
      const points = asPoints(Array.isArray(route?.points) ? route.points : route);
      if (points.length < 2) return null;
      const numericValue = asFiniteNumber(route?.value, 0);
      return {
        points,
        value: numericValue,
        label: String(route?.label || ""),
        ...(route?.status ? { status: String(route.status) } : {}),
      };
    })
    .filter(Boolean);
}

function asTrack(value) {
  return asPoints(value);
}

function asCode(value, fallback = "") {
  return /^[A-Z]{2}$/.test(String(value || "")) ? String(value).toUpperCase() : fallback;
}

function asCodeList(value) {
  const raw = Array.isArray(value)
    ? value
    : String(value || "").split(/[\s,]+/).filter(Boolean);
  return [...new Set(raw.map((code) => asCode(code)).filter(Boolean))];
}

function asTarget(value, story = {}) {
  const target = value && typeof value === "object" ? value : {};
  const coordinates = isCoordinates(target.coordinates)
    ? target.coordinates.map(Number)
    : isCoordinates(story.coordinates)
      ? story.coordinates.map(Number)
      : null;
  if (!coordinates) return null;
  return {
    name: String(target.name || story.cityName || story.countryName || "Focus").trim(),
    country: String(target.country || story.countryName || "").trim(),
    code: asCode(target.code || story.countryCode, ""),
    coordinates,
  };
}

function asStages(value, kind) {
  if (!Array.isArray(value)) return [];
  return value
    .map((stage, index) => {
      const base = stage && typeof stage === "object" ? stage : {};
      const radiusKm = asFiniteNumber(base.radiusKm, Number.NaN);
      const values = base.values && typeof base.values === "object" && !Array.isArray(base.values)
        ? base.values
        : null;
      if (kind === "radius" && !Number.isFinite(radiusKm)) return null;
      if (kind === "values" && !values) return null;
      return {
        label: String(base.label || `STAGE ${index + 1}`),
        ...(Number.isFinite(radiusKm) ? { radiusKm } : {}),
        ...(values ? { values } : {}),
      };
    })
    .filter(Boolean);
}

function asValuesMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entries = Object.entries(value).filter(([code]) => /^[A-Z]{2}$/.test(code));
  if (!entries.length) return null;
  return Object.fromEntries(entries.map(([code, entry]) => [code, Number(entry?.value ?? entry)]));
}

function pick(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "" && value !== false);
}

function explicitAnimationId(value = {}) {
  return String(
    pick(
      value?.mapAnimation,
      value?.animationId,
      value?.animation,
      value?.visualType,
    ) || "",
  ).trim().toLowerCase();
}

/* ---- conservative story classification ---- */

const STORY_HINTS = Object.freeze({
  conflict: /conflict|war|strike|attack|invasion|occupied|territory|border|hatch|dispute|ceasefire|truce|militia|hostage|armistice/i,
  election: /elect|vote|ballot|poll|constituenc|referendum|parliament|assembly|primary/i,
  route: /route|corridor|shipping|lane|chokepoint|pipeline|supply chain|import|export|trade|travel|journey|ferry|flight|rail|transit|caravan/i,
  migration: /migrat|refugee|displaced|asylum|resettle|exodus|population flow|border crossing/i,
  weather: /storm|hurricane|typhoon|cyclone|monsoon|flood|rainfall|drought|heatwave|front|blizzard|tornado|weather|precipitation/i,
  storm: /storm|hurricane|typhoon|cyclone|monsoon|tornado|blizzard|front|weather/i,
  flood: /flood|inundation|rainfall|river level|storm surge/i,
  wildfire: /wildfire|bushfire|forest fire|fire perimeter|blaze/i,
  quake: /earthquake|seismic|tremor|aftershock|epicenter|magnitude/i,
  hazard: /evacuat|radiation|landslide|mudslide|avalanche|explosion|contamination|exclusion zone|disaster|emergency/i,
  infrastructure: /infrastructure|grid|rail|highway|bridge|tunnel|port|airport|fibre|fiber|substation|transmission|corridor/i,
  comparison: /compare|versus|vs\.?|different|rival|race|gap|outperform|lag/,
  change: /now|before|after|since|until|turned|shift|transition|morph|decline|surge|rise|fall|change|evolve/i,
  uncertainty: /uncertain|estimate|approximate|likely|possible|disputed|projected|forecast|unclear|unconfirmed|risk/i,
});

function classifyStory(story = {}) {
  const haystack = [
    story.kicker,
    story.headline,
    story.summary,
    story.script,
    story.region,
    story.tag,
    ...(Array.isArray(story.tags) ? story.tags : []),
  ]
    .filter(Boolean)
    .map(String)
    .join(" · ");
  const hints = Object.fromEntries(
    Object.entries(STORY_HINTS).map(([hint, pattern]) => [hint, pattern.test(haystack)]),
  );
  /* Structured geo fields are the strongest signal: a story that ships
     verified route points, tracks, or stages is a geography story even when
     the copy avoids the keyword. */
  if (Array.isArray(story.routePoints) && story.routePoints.length >= 2) hints.route = true;
  if (Array.isArray(story.track) && story.track.length >= 2) hints.storm = true;
  if (Array.isArray(story.stages) && story.stages.length >= 2) {
    const allRadii = story.stages.every((stage) => Number.isFinite(Number(stage?.radiusKm)));
    const allValues = story.stages.every((stage) => stage?.values && typeof stage.values === "object");
    if (allRadii && !allValues) {
      /* Radius stages are only meaningful for hazard spreads; the copy must
         corroborate the hazard so a bare stage list does not invent one. */
      hints.wildfire = hints.wildfire || hints.flood;
    }
    if (allValues && !allRadii) hints.change = true;
  }
  if (Array.isArray(story.routes) && story.routes.length >= 2) hints.routes = true;
  if (isCoordinates(story.coordinates) || story.countryCode || story.affectedCountryCodes) hints.geographicFocus = true;
  return hints;
}

/* ---- deterministic payload builders for each editorial family ---- */

function payloadForCamera(story, hints) {
  if (isCoordinates(story.coordinates)) {
    return { target: asTarget({ coordinates: story.coordinates, name: story.cityName, code: story.countryCode }, story) };
  }
  if (hints.conflict) return null;
  if (story.countryCode) {
    const target = { code: asCode(story.countryCode), name: story.countryName || story.countryCode };
    if (isCoordinates(story.coordinates)) target.coordinates = story.coordinates.map(Number);
    return target;
  }
  return null;
}

function payloadForElection(story) {
  const results = story.results && typeof story.results === "object" && !Array.isArray(story.results)
    ? story.results
    : null;
  if (!results) return null;
  const entries = Object.entries(results).filter(([code]) => /^[A-Z]{2}$/.test(code));
  if (!entries.length) return null;
  const countryCodes = entries.map(([code]) => code);
  return {
    results: Object.fromEntries(
      entries.map(([code, entry]) => [code, { value: Number(entry?.value ?? entry), group: String(entry?.group ?? "A") }]),
    ),
    countryCodes,
  };
}

function payloadForHighlight(story, hints) {
  if (hints.uncertainty && isCoordinates(story.coordinates)) {
    const radiusKm = asFiniteNumber(pick(story.radiusKm, story.uncertaintyRadiusKm), Number.NaN);
    if (Number.isFinite(radiusKm) && radiusKm > 0) {
      return {
        target: asTarget(story, story),
        radiusKm,
        confidence: asFiniteNumber(story.confidence, 0.7),
      };
    }
  }
  const affected = asCodeList(story.affectedCountryCodes);
  if (affected.length > 1) return { countryCodes: affected };
  if (story.countryCode && (hints.conflict || hints.election || hints.geographicFocus)) {
    const target = { code: asCode(story.countryCode), name: story.countryName || story.countryCode };
    if (isCoordinates(story.coordinates)) target.coordinates = story.coordinates.map(Number);
    return { target };
  }
  return null;
}

function payloadForRoute(story, hints) {
  const route = asPoints(pick(story.routePoints, story.route, story.waypoints));
  if (route.length >= 2) {
    const value = asFiniteNumber(story.routeValue, Number.NaN);
    return {
      ...(Number.isFinite(value) ? { value } : {}),
      ...(route.length >= 3 ? { stages: Array.isArray(story.routeStages) ? story.routeStages : [] } : {}),
      route,
    };
  }
  if (hints.route) {
    const from = asTarget(story.from, story);
    const target = asTarget(story.target || story.to, story);
    if (from && target) return { from, target };
  }
  return null;
}

function payloadForRoutes(story, hints) {
  const routes = asRoutes(story.routes);
  if (routes.length >= 2) return { routes };
  return null;
}

function payloadForChange(story, hints) {
  if (story.before && story.after) {
    const before = asValuesMap(story.before?.values || story.before);
    const after = asValuesMap(story.after?.values || story.after);
    if (before && after) return { before: { values: before }, after: { values: after } };
  }
  const stages = asStages(story.stages, "values");
  if (stages.length >= 2) return { stages };
  return null;
}

function payloadForEvents(story, hints) {
  const track = asTrack(story.track);
  if (track.length >= 2) return { track };

  if (hints.quake && isCoordinates(story.coordinates)) {
    const magnitude = asFiniteNumber(story.magnitude, Number.NaN);
    const target = asTarget(story, story);
    if (target) return { ...(Number.isFinite(magnitude) ? { magnitude } : {}), target };
  }

  if (hints.storm && isCoordinates(story.coordinates)) {
    /* A storm needs a verified track to draw observed/forecast segments; a
       bare coordinate is only enough for an earthquake-style event point. */
    const target = asTarget(story, story);
    if (target) return { target };
  }

  if (hints.wildfire && isCoordinates(story.coordinates)) {
    const target = asTarget(story, story);
    const stages = asStages(story.stages, "radius");
    if (target && stages.length >= 2) return { target, stages };
  }
  if (hints.flood && isCoordinates(story.coordinates)) {
    const target = asTarget(story, story);
    const stages = asStages(story.stages, "radius");
    if (target && stages.length >= 2) return { target, stages };
  }
  return null;
}

function payloadForUncertainty(story, hints) {
  if (!isCoordinates(story.coordinates)) return null;
  const radiusKm = asFiniteNumber(pick(story.radiusKm, story.uncertaintyRadiusKm), Number.NaN);
  if (!Number.isFinite(radiusKm) || radiusKm <= 0) return null;
  return {
    target: asTarget(story, story),
    radiusKm,
    confidence: asFiniteNumber(story.confidence, 0.7),
  };
}

function resolveMapEvidence(story, { format, mode }) {
  const evidence = story?.mapEvidence;
  if (!evidence || typeof evidence !== "object" || Array.isArray(evidence)) return null;
  const id = explicitAnimationId(evidence);
  const data = evidence.data && typeof evidence.data === "object" && !Array.isArray(evidence.data)
    ? evidence.data
    : null;
  if (!id || !data) return { animationId: null, reason: "map-evidence-invalid" };
  try {
    getGlobeMapAnimation(id);
  } catch {
    return { animationId: null, reason: `map-evidence-${id}-not-verifiable` };
  }
  const source = String(
    pick(
      evidence.source,
      story.mapSource,
      story.source,
      story.attribution,
      Array.isArray(story.sources) ? story.sources[0]?.label : "",
    ) || "",
  ).trim();
  const resolved = resolveData({ ...story, mapSource: source, source }, id, data, { format, mode });
  return resolved || { animationId: null, reason: `map-evidence-${id}-not-verifiable` };
}

/* ---- automatic selection ---- */

/**
 * Conservatively decide whether a story benefits from a globe/map animation.
 *
 * Geography must materially improve understanding. A story with no verified
 * coordinates, codes, routes or quantitative geo data is rejected even when
 * the copy mentions a country, because a decorative map adds noise.
 *
 * Returns { animationId, data, definition } when a map is warranted and the
 * production payload is fully verifiable; otherwise { animationId: null }.
 */
export function selectStoryMapAnimation(story = {}, options = {}) {
  const hints = classifyStory(story);
  const explicit = explicitAnimationId(story);
  const mode = options.mode === "production" ? "production" : "sample";
  const format = options.format || "landscape";

  /* Explicit selection always wins. */
  if (explicit && explicit !== MAP_ANIMATION_NONE) {
    const resolved = resolveExplicitMapAnimation(story, explicit, { format, mode });
    if (resolved) return resolved;
  }

  /* Explicit disablement always wins over auto-selection. */
  if (explicit === MAP_ANIMATION_NONE || story.mapAnimation === "disabled" || story.mapAnimation === false) {
    return { animationId: null, reason: "disabled" };
  }

  /* A structured evidence envelope is the only new automatic path. It is
     checked before keyword heuristics and fails closed when its ID, source or
     payload cannot pass strict production validation. */
  if (story.mapEvidence !== undefined) {
    return resolveMapEvidence(story, { format, mode }) || { animationId: null, reason: "map-evidence-invalid" };
  }

  /* Pattern-first families. Order matters: the most specific claim wins, and
     structured event data (track/stages/magnitude) beats a generic city lock. */
  if (hints.storm || Array.isArray(story.track)) {
    const data = payloadForEvents(story, hints);
    if (data) {
      const resolved = resolveData(story, "storm-track", data, { format, mode });
      if (resolved) return resolved;
    }
  }

  if (hints.wildfire) {
    const data = payloadForEvents(story, hints);
    if (data) {
      const resolved = resolveData(story, "wildfire-spread", data, { format, mode });
      if (resolved) return resolved;
    }
  }

  if (hints.flood) {
    const data = payloadForEvents(story, hints);
    if (data) {
      const resolved = resolveData(story, "flood-inundation", data, { format, mode });
      if (resolved) return resolved;
    }
  }

  if (hints.quake) {
    const data = payloadForEvents(story, hints);
    if (data) {
      const resolved = resolveData(story, "earthquake-ripple", data, { format, mode });
      if (resolved) return resolved;
    }
  }

  if (hints.route) {
    const data = payloadForRoute(story, hints);
    if (data) {
      const resolved = resolveData(story, data.stages?.length ? "multi-leg-journey" : "great-circle-route", data, { format, mode });
      if (resolved) return resolved;
    }
  }

  if (hints.routes) {
    const data = payloadForRoutes(story, hints);
    if (data) {
      const resolved = resolveData(story, hints.migration ? "migration-flow" : "trade-flow-ribbons", data, { format, mode });
      if (resolved) return resolved;
    }
  }

  if (hints.migration) {
    const data = payloadForRoutes(story, hints);
    if (data) {
      const resolved = resolveData(story, "migration-flow", data, { format, mode });
      if (resolved) return resolved;
    }
  }

  if (hints.election) {
    const data = payloadForElection(story) || payloadForHighlight(story, hints);
    if (data) {
      const resolved = resolveData(story, "election-results-fill", data, { format, mode });
      if (resolved) return resolved;
    }
  }

  if (hints.conflict) {
    const data = payloadForHighlight(story, hints);
    if (data) {
      const resolved = resolveData(story, "conflict-zone-hatch", data, { format, mode });
      if (resolved) return resolved;
    }
  }

  if (hints.uncertainty) {
    const data = payloadForUncertainty(story, hints);
    if (data) {
      const resolved = resolveData(story, "uncertainty-cloud", data, { format, mode });
      if (resolved) return resolved;
    }
  }

  if (hints.comparison) {
    const data = payloadForChange(story, hints);
    if (data) {
      const resolved = resolveData(story, "before-after-swipe", data, { format, mode });
      if (resolved) return resolved;
    }
  }

  if (hints.change) {
    const data = payloadForChange(story, hints);
    if (data) {
      const resolved = resolveData(story, "time-lapse-choropleth", data, { format, mode });
      if (resolved) return resolved;
    }
  }

  /* The library's shape-based suggestion is a final fallback, so a generic
     "city + coordinates" story still gets a useful map. A hazard/event story
     that failed its specific preset is deliberately not given a decorative
     city lock — the map would overclaim the event geometry. */
  const hazardHint = hints.storm || hints.wildfire || hints.flood || hints.quake;

  /* A story that attempts a route (shipping routePoints/routes) but lacks
     enough verified points must not silently degrade to a city lock. */
  const routeAttempted = Array.isArray(story.routePoints) || Array.isArray(story.routes) || Array.isArray(story.route);
  if (routeAttempted) {
    return { animationId: null, reason: "route-data-insufficient" };
  }

  const structured = suggestGlobeMapAnimation(story);
  if (structured && structured !== "world-orbit" && !isExplicitGlobalOnly(story) && !(hazardHint && structured === "city-lock")) {
    const data = buildPayloadForId(story, structured, hints);
    if (data) {
      const resolved = resolveData(story, structured, data, { format, mode });
      if (resolved) return resolved;
    }
  }

  if (hazardHint) {
    return { animationId: null, reason: "hazard-data-insufficient" };
  }

  /* A simple verified location is enough for a country/city lock, but only
     when the story is genuinely geographic. */
  if (hints.geographicFocus || story.storyType === "geographic") {
    if (isCoordinates(story.coordinates) && story.cityName) {
      const data = payloadForCamera(story, hints);
      if (data) {
        const resolved = resolveData(story, "city-lock", data, { format, mode });
        if (resolved) return resolved;
      }
    }
    if (story.countryCode) {
      const data = payloadForCamera(story, hints);
      if (data) {
        const resolved = resolveData(story, "country-lock", data, { format, mode });
        if (resolved) return resolved;
      }
    }
  }

  return { animationId: null, reason: "no-verified-geography" };
}

function isExplicitGlobalOnly(story) {
  const hints = classifyStory(story);
  if (hints.route || hints.migration || hints.weather || hints.quake) return false;
  return !isCoordinates(story.coordinates) && !story.countryCode && !story.affectedCountryCodes && !story.routes && !story.routePoints;
}

function resolveExplicitMapAnimation(story, id, { format, mode }) {
  let definition;
  try {
    definition = getGlobeMapAnimation(id);
  } catch {
    return null;
  }
  /* A story may supply fully custom verified data for the preset; that wins
     over anything derived from the story so the author controls the payload. */
  if (story.mapData && typeof story.mapData === "object") {
    const custom = resolveData(story, id, { ...story.mapData }, { format, mode });
    if (custom) return custom;
  }
  const data = buildPayloadForId(story, id, classifyStory(story));
  const resolved = data ? resolveData(story, id, data, { format, mode }) : null;
  if (resolved) return resolved;
  return { animationId: null, reason: `explicit-${id}-not-verifiable` };
}

function buildPayloadForId(story, id, hints) {
  switch (id) {
    case "city-lock":
    case "country-lock":
    case "region-dive":
    case "globe-pullback":
    case "globe-to-flat-map":
    case "flat-map-to-globe":
    case "hemisphere-reveal":
      return payloadForCamera(story, hints) || (isCoordinates(story.coordinates) ? { target: asTarget(story, story) } : null);
    case "world-orbit":
      /* The library-required production path uses this preset as a neutral
         opener when the script has no claim-bearing geography yet. It does
         not fabricate a target or borrow sample coordinates. */
      return {};
    case "country-fill":
    case "country-outline":
    case "spotlight-dim":
    case "election-results-fill":
    case "conflict-zone-hatch":
    case "multi-country-sweep":
      return payloadForHighlight(story, hints) || (story.countryCode ? { target: { code: asCode(story.countryCode), name: story.countryName || story.countryCode } } : null);
    case "great-circle-route":
    case "multi-leg-journey":
    case "bilateral-flow":
    case "supply-chain-hop":
    case "chokepoint-focus":
      return payloadForRoute(story, hints);
    case "trade-flow-ribbons":
    case "migration-flow":
    case "shipping-lanes":
    case "flight-network":
      return payloadForRoutes(story, hints) || payloadForRoute(story, hints);
    case "before-after-swipe":
    case "comparison-split-map":
      return payloadForChange(story, hints);
    case "time-lapse-choropleth":
    case "ranking-wave":
      return payloadForChange(story, hints) || payloadForRoute(story, hints);
    case "earthquake-ripple":
    case "storm-track":
    case "weather-front":
    case "wildfire-spread":
    case "flood-inundation":
    case "day-night-terminator":
    case "satellite-orbit":
    case "outage-cascade":
      return payloadForEvents(story, hints);
    case "disaster-radius":
    case "uncertainty-cloud":
      return payloadForUncertainty(story, hints) || payloadForEvents(story, hints);
    case "proportional-bubbles":
    case "heatmap-bloom":
      return payloadForRoutes(story, hints) || payloadForChange(story, hints);
    case "dot-density":
    case "regional-choropleth":
      return story.values && typeof story.values === "object" && Object.keys(story.values).length > 1
        ? { values: asValuesMap(story.values) }
        : null;
    case "policy-status-sweep":
    case "geofenced-area":
    case "evidence-confidence-fill":
    case "route-disruption":
    case "network-branch":
    case "flow-shift":
    case "source-sink-flow":
    case "delta-bubbles":
    case "rank-shift":
    case "event-cluster":
    case "forecast-cone":
    case "impact-layers":
      return story.mapEvidence?.data && typeof story.mapEvidence.data === "object"
        ? story.mapEvidence.data
        : null;
    case "buffer-zone-band":
    case "disputed-boundary-dash":
    case "pipeline-trace":
      return payloadForRoute(story, hints) || payloadForCamera(story, hints);
    default:
      return null;
  }
}

function resolveData(story, id, data, { format, mode }) {
  if (!data || typeof data !== "object") return null;
  const source = String(
    pick(
      story.mapEvidence?.source,
      story.mapSource,
      story.source,
      story.attribution,
      Array.isArray(story.sources) ? story.sources[0]?.label : "",
    ) || "",
  ).trim();
  if (!source) return null;
  if (/illustrative sample data/i.test(source)) return null;

  const payload = {
    ...data,
    label: String(pick(story.mapLabel, story.kicker, story.headline) || "Geographic context").trim(),
    source,
  };

  const validation = validateProductionGlobeMapAnimationConfig(id, payload);
  if (!validation.valid) return null;

  return {
    animationId: id,
    definition: validation.definition,
    data: validation.config,
    format,
    mode,
  };
}

/* ---- per-scene resolution (chapter-level, like the production schema) ---- */

/**
 * Resolve a chapter's map animation.
 *
 * A chapter may carry its own `mapAnimation` (explicit), `mapAnimation: "none"`
 * (disable), or inherit from the story. Verified data comes from the chapter's
 * `globe`/`focus`/`coordinates` fields; when it cannot satisfy the preset's
 * strict production validation the chapter falls back to no map rather than
 * fabricating sample values.
 */
export function resolveChapterMapAnimation(chapter = {}, story = {}, options = {}) {
  const format = options.format || "landscape";
  const explicit = explicitAnimationId(chapter) || explicitAnimationId(story);
  const geo = chapter.globe || chapter.focus || {};

  const candidate = {
    ...story,
    ...chapter,
    ...geo,
    mapAnimation: explicit || story.mapAnimation || story.animationId || story.animation || story.visualType,
    visualType: explicit || story.visualType,
    coordinates: pick(
      isCoordinates(geo.coordinates) && geo.coordinates,
      isCoordinates(chapter.coordinates) && chapter.coordinates,
      isCoordinates(story.coordinates) && story.coordinates,
      null,
    ),
    countryCode: pick(geo.countryCode, chapter.countryCode, story.countryCode, ""),
    countryName: pick(geo.countryName, chapter.countryName, story.countryName, ""),
    cityName: pick(geo.city, geo.cityName, chapter.cityName, story.cityName, ""),
    routePoints: pick(
      Array.isArray(geo.routePoints) && geo.routePoints.length >= 2 && geo.routePoints,
      Array.isArray(chapter.routePoints) && chapter.routePoints.length >= 2 && chapter.routePoints,
      Array.isArray(story.routePoints) && story.routePoints.length >= 2 && story.routePoints,
      null,
    ),
    mentionedCountryCodes: pick(
      Array.isArray(geo.mentionedCountryCodes) && geo.mentionedCountryCodes.length && geo.mentionedCountryCodes,
      Array.isArray(story.mentionedCountryCodes) && story.mentionedCountryCodes.length && story.mentionedCountryCodes,
      null,
    ),
    affectedCountryCodes: pick(
      Array.isArray(geo.affectedCountryCodes) && geo.affectedCountryCodes.length && geo.affectedCountryCodes,
      Array.isArray(story.affectedCountryCodes) && story.affectedCountryCodes.length && story.affectedCountryCodes,
      null,
    ),
    stages: pick(
      Array.isArray(geo.stages) && geo.stages.length >= 2 && geo.stages,
      Array.isArray(chapter.stages) && chapter.stages.length >= 2 && chapter.stages,
      null,
    ),
    mapData: pick(
      chapter.mapData && typeof chapter.mapData === "object" && chapter.mapData,
      chapter.animationData && typeof chapter.animationData === "object" && chapter.animationData,
      geo.mapData && typeof geo.mapData === "object" && geo.mapData,
      story.mapData && typeof story.mapData === "object" && story.mapData,
      story.animationData && typeof story.animationData === "object" && story.animationData,
      null,
    ),
    mapSource: pick(
      chapter.mapSource,
      chapter.source,
      geo.mapSource,
      story.mapSource,
      story.source,
      Array.isArray(story.sources) ? story.sources[0]?.label : "",
      "",
    ),
  };

  return selectStoryMapAnimation(candidate, { format, mode: options.mode || "production" });
}

export function isMapDisabled(storyOrChapter = {}) {
  const value = explicitAnimationId(storyOrChapter);
  return value === MAP_ANIMATION_NONE || value === "disabled" || storyOrChapter.mapAnimation === false;
}

export function getExplicitGlobeMapAnimationId(storyOrChapter = {}) {
  return explicitAnimationId(storyOrChapter);
}

export function getGlobeMapSelectorSummary() {
  return Object.freeze({
    name: "globe-map-selector",
    version: "1.0.0",
    none: MAP_ANIMATION_NONE,
    families: Object.freeze([
      "camera",
      "highlight",
      "route",
      "change",
      "event",
    ]),
  });
}
