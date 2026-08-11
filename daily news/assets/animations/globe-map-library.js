/*
 * godandbaddaily — editorial globe and map animation catalog.
 *
 * This module is deliberately renderer-agnostic. It owns stable IDs, sample
 * payloads, validation, format profiles, and story-to-animation suggestions.
 * The globe-native Canvas annotation implementation lives in
 * globe-native-annotation-renderer.js; the older projection helper remains
 * available for catalog-level geometry tests and compatibility imports.
 */

export const GLOBE_MAP_LIBRARY_VERSION = "1.1.0";
export const GLOBE_MAP_SUPPORTED_LIBRARY_VERSIONS = Object.freeze(["1.0.0", GLOBE_MAP_LIBRARY_VERSION]);

export const GLOBE_MAP_FORMATS = Object.freeze({
  portrait: Object.freeze({
    id: "portrait",
    width: 1080,
    height: 1920,
    safeInset: Object.freeze({ top: 150, right: 96, bottom: 300, left: 72 }),
    mapFrame: Object.freeze({ x: 54, y: 270, width: 972, height: 1150 }),
    labelScale: 1,
  }),
  landscape: Object.freeze({
    id: "landscape",
    width: 1920,
    height: 1080,
    safeInset: Object.freeze({ top: 72, right: 88, bottom: 72, left: 88 }),
    mapFrame: Object.freeze({ x: 62, y: 118, width: 1796, height: 830 }),
    labelScale: 0.84,
  }),
});

export const GLOBE_MAP_THEME = Object.freeze({
  mat: "#2D4B3C",
  matShadow: "#20372D",
  ocean: "#A9B9AA",
  land: "#E5DFC9",
  landOutline: "#617B6E",
  border: "#587267",
  paper: "#F5F0DF",
  copy: "#D8E1D4",
  ink: "#17372F",
  accent: "#D49352",
  live: "#E37568",
  panel: "#19352D",
  secondary: "#9AAE9F",
  uncertainty: "#C9B88B",
});

const LOCATIONS = Object.freeze({
  london: Object.freeze({ name: "London", country: "United Kingdom", code: "GB", coordinates: [-0.1276, 51.5072] }),
  delhi: Object.freeze({ name: "Delhi", country: "India", code: "IN", coordinates: [77.209, 28.6139] }),
  tokyo: Object.freeze({ name: "Tokyo", country: "Japan", code: "JP", coordinates: [139.6917, 35.6895] }),
  nairobi: Object.freeze({ name: "Nairobi", country: "Kenya", code: "KE", coordinates: [36.8219, -1.2921] }),
  newYork: Object.freeze({ name: "New York", country: "United States", code: "US", coordinates: [-74.006, 40.7128] }),
  saoPaulo: Object.freeze({ name: "Sao Paulo", country: "Brazil", code: "BR", coordinates: [-46.6333, -23.5505] }),
  singapore: Object.freeze({ name: "Singapore", country: "Singapore", code: "SG", coordinates: [103.8198, 1.3521] }),
  rotterdam: Object.freeze({ name: "Rotterdam", country: "Netherlands", code: "NL", coordinates: [4.4777, 51.9244] }),
  suez: Object.freeze({ name: "Suez Canal", country: "Egypt", code: "EG", coordinates: [32.55, 30.45] }),
  hormuz: Object.freeze({ name: "Strait of Hormuz", country: "Oman / Iran", code: "OM", coordinates: [56.5, 26.5] }),
  panama: Object.freeze({ name: "Panama Canal", country: "Panama", code: "PA", coordinates: [-79.68, 9.08] }),
  sydney: Object.freeze({ name: "Sydney", country: "Australia", code: "AU", coordinates: [151.2093, -33.8688] }),
});

const ROUTES = Object.freeze({
  atlantic: Object.freeze([LOCATIONS.london, LOCATIONS.newYork]),
  globalSupply: Object.freeze([LOCATIONS.rotterdam, LOCATIONS.suez, LOCATIONS.singapore, LOCATIONS.tokyo]),
  southSouth: Object.freeze([LOCATIONS.saoPaulo, LOCATIONS.nairobi, LOCATIONS.delhi, LOCATIONS.singapore]),
  canals: Object.freeze([LOCATIONS.rotterdam, LOCATIONS.suez, LOCATIONS.hormuz, LOCATIONS.singapore, LOCATIONS.panama]),
  aroundWorld: Object.freeze([LOCATIONS.london, LOCATIONS.newYork, LOCATIONS.panama, LOCATIONS.sydney, LOCATIONS.tokyo, LOCATIONS.delhi]),
});

const SAMPLE_SOURCE = "Illustrative sample data — not reporting";

function sample(label, payload = {}) {
  return Object.freeze({
    label,
    source: SAMPLE_SOURCE,
    dateLabel: "DEMO / 2026",
    ...payload,
  });
}

function define({
  id,
  category,
  title,
  summary,
  family,
  projection,
  duration = 4,
  required = [],
  useWhen,
  avoidWhen,
  tags = [],
  sampleData,
}) {
  return Object.freeze({
    id,
    category,
    title,
    summary,
    family,
    projection,
    duration,
    required: Object.freeze([...required]),
    formats: Object.freeze(["portrait", "landscape"]),
    useWhen,
    avoidWhen,
    tags: Object.freeze([...tags]),
    sample: sampleData,
    apiVersion: 1,
  });
}

const DEMO_VALUES = Object.freeze({
  US: 82,
  BR: 58,
  GB: 64,
  IN: 74,
  KE: 46,
  EG: 69,
  SG: 91,
  JP: 78,
  AU: 55,
  ZA: 49,
});

const ELECTION_VALUES = Object.freeze({
  US: { value: 52, group: "A" },
  CA: { value: 48, group: "B" },
  MX: { value: 55, group: "A" },
});

const POLICY_STAGES = Object.freeze([
  Object.freeze({ label: "ANNOUNCED", states: Object.freeze({ GB: "active", EG: "pending", IN: "blocked", SG: "exempt" }) }),
  Object.freeze({ label: "IN FORCE", states: Object.freeze({ GB: "active", EG: "active", IN: "blocked", SG: "exempt" }) }),
  Object.freeze({ label: "REVIEW", states: Object.freeze({ GB: "active", EG: "active", IN: "pending", SG: "exempt" }) }),
]);

const SAMPLE_GEOFENCE = Object.freeze([
  [29.3, 30.8],
  [31.8, 31.2],
  [34.0, 30.7],
  [34.4, 29.4],
  [32.2, 29.1],
  [30.0, 29.5],
]);

const EVIDENCE_VALUES = Object.freeze({
  US: "confirmed",
  GB: "reported",
  EG: "confirmed",
  IN: "unverified",
  SG: "reported",
  JP: "confirmed",
});

const NETWORK_NODES = Object.freeze([
  Object.freeze({ id: "origin", name: "ORIGIN", coordinates: LOCATIONS.rotterdam.coordinates, status: "active" }),
  Object.freeze({ id: "chokepoint", name: "CHOKEPOINT", coordinates: LOCATIONS.suez.coordinates, status: "blocked" }),
  Object.freeze({ id: "hub", name: "HUB", coordinates: LOCATIONS.singapore.coordinates, status: "active" }),
  Object.freeze({ id: "market", name: "MARKET", coordinates: LOCATIONS.tokyo.coordinates, status: "pending" }),
]);

const NETWORK_LINKS = Object.freeze([
  Object.freeze({ from: "origin", to: "chokepoint", value: 72, status: "blocked" }),
  Object.freeze({ from: "chokepoint", to: "hub", value: 54, status: "detour" }),
  Object.freeze({ from: "hub", to: "market", value: 42, status: "active" }),
]);

const SOURCE_SINKS = Object.freeze({
  sources: Object.freeze([
    Object.freeze({ id: "source-a", name: "SOURCE A", coordinates: LOCATIONS.rotterdam.coordinates }),
    Object.freeze({ id: "source-b", name: "SOURCE B", coordinates: LOCATIONS.saoPaulo.coordinates }),
  ]),
  sinks: Object.freeze([
    Object.freeze({ id: "sink-a", name: "SINK A", coordinates: LOCATIONS.delhi.coordinates }),
    Object.freeze({ id: "sink-b", name: "SINK B", coordinates: LOCATIONS.tokyo.coordinates }),
  ]),
  flows: Object.freeze([
    Object.freeze({ from: "source-a", to: "sink-a", value: 78 }),
    Object.freeze({ from: "source-a", to: "sink-b", value: 42 }),
    Object.freeze({ from: "source-b", to: "sink-a", value: 56 }),
  ]),
});

const DEFINITIONS = [
  // Camera and geographic orientation (10)
  define({ id: "world-orbit", category: "Camera", title: "World orbit", summary: "A restrained global turn that establishes scope before any claim.", family: "camera", projection: "globe", duration: 4.2, required: [], useWhen: "Opening a genuinely global or multi-region story.", avoidWhen: "A single-location story should lock directly to the place.", tags: ["global", "opener", "orientation"], sampleData: sample("Global context", { target: LOCATIONS.delhi }) }),
  define({ id: "hemisphere-reveal", category: "Camera", title: "Hemisphere reveal", summary: "Rotates from a darkened far side into the relevant hemisphere.", family: "camera", projection: "globe", required: ["target.coordinates"], useWhen: "The audience needs continental orientation.", avoidWhen: "Do not imply a day-night state unless it is part of the story.", tags: ["hemisphere", "reveal"], sampleData: sample("Asia-Pacific comes into view", { target: LOCATIONS.tokyo }) }),
  define({ id: "country-lock", category: "Camera", title: "Country lock", summary: "Turns, pushes in, outlines a verified country and holds it readable.", family: "camera", projection: "globe", required: ["target.code", "target.coordinates"], useWhen: "A country is the primary geographic unit.", avoidWhen: "A city-specific event needs a city lock instead.", tags: ["country", "focus", "lock"], sampleData: sample("India", { target: LOCATIONS.delhi }) }),
  define({ id: "city-lock", category: "Camera", title: "City lock", summary: "Country context resolves into a precise city crosshair.", family: "camera", projection: "globe", required: ["target.coordinates", "target.name"], useWhen: "The event is verifiably tied to a city or site.", avoidWhen: "Never invent a city to make the shot more specific.", tags: ["city", "crosshair", "focus"], sampleData: sample("Nairobi", { target: LOCATIONS.nairobi }) }),
  define({ id: "region-dive", category: "Camera", title: "Region dive", summary: "A global view transitions into a flat regional detail map.", family: "camera", projection: "globe", duration: 4.8, required: ["target.coordinates"], useWhen: "A regional relationship needs more detail than a globe can show.", avoidWhen: "Avoid aggressive zooms that remove all geographic reference.", tags: ["zoom", "region", "hybrid"], sampleData: sample("Eastern Mediterranean", { target: LOCATIONS.suez, relatedCountryCodes: ["EG", "IL", "JO", "SA", "CY", "TR"] }) }),
  define({ id: "country-hop", category: "Camera", title: "Country-to-country hop", summary: "Moves between two countries along the shortest readable turn.", family: "camera", projection: "globe", duration: 4.6, required: ["from.coordinates", "target.coordinates"], useWhen: "A relationship or comparison spans two places.", avoidWhen: "Do not imply a route when the story is only comparative.", tags: ["transition", "comparison"], sampleData: sample("London to Delhi", { from: LOCATIONS.london, target: LOCATIONS.delhi }) }),
  define({ id: "antipode-flip", category: "Camera", title: "Antipode flip", summary: "A decisive half-world turn for distant locations.", family: "camera", projection: "globe", duration: 4.4, required: ["from.coordinates", "target.coordinates"], useWhen: "The physical distance itself matters.", avoidWhen: "Too dramatic for nearby places or neutral continuity.", tags: ["distance", "turn"], sampleData: sample("Sao Paulo to Tokyo", { from: LOCATIONS.saoPaulo, target: LOCATIONS.tokyo }) }),
  define({ id: "globe-pullback", category: "Camera", title: "Globe pullback", summary: "Starts close on one place, then reveals the wider network around it.", family: "camera", projection: "globe", duration: 4.5, required: ["target.coordinates"], useWhen: "The explanation expands from local consequence to global context.", avoidWhen: "Not for a story whose scope stays local.", tags: ["zoom-out", "context"], sampleData: sample("Singapore in a global network", { target: LOCATIONS.singapore, route: ROUTES.globalSupply }) }),
  define({ id: "globe-to-flat-map", category: "Camera", title: "Globe to flat map", summary: "Hands orientation from an orthographic globe to a data-ready planar map.", family: "camera", projection: "globe", duration: 4.8, required: ["target.coordinates"], useWhen: "A story begins geographically and then needs regional data layers.", avoidWhen: "Do not switch projections without a narrative reason.", tags: ["projection", "handoff"], sampleData: sample("Global to regional", { target: LOCATIONS.delhi, values: DEMO_VALUES }) }),
  define({ id: "flat-map-to-globe", category: "Camera", title: "Flat map to globe", summary: "Pulls a regional data view back into global context.", family: "camera", projection: "globe", duration: 4.8, required: ["target.coordinates"], useWhen: "Closing a detailed map beat by restoring worldwide scope.", avoidWhen: "Avoid when the next scene remains local.", tags: ["projection", "resolve"], sampleData: sample("Regional detail to world", { target: LOCATIONS.nairobi, relatedCountryCodes: ["KE", "TZ", "UG", "ET", "SO"] }) }),

  // Areas, boundaries, and emphasis (10)
  define({ id: "country-fill", category: "Highlights", title: "Country fill", summary: "Fades one verified country into the signal color while borders remain visible.", family: "highlight", projection: "globe", required: ["target.code"], useWhen: "One country must be identified at a glance.", avoidWhen: "Do not use fill alone for tiny island states; add a locator.", tags: ["area", "country"], sampleData: sample("Brazil", { target: LOCATIONS.saoPaulo }) }),
  define({ id: "country-outline", category: "Highlights", title: "Country outline draw", summary: "Traces a border before adding the label.", family: "highlight", projection: "globe", required: ["target.code"], useWhen: "The boundary itself matters or fill would obscure detail.", avoidWhen: "A disputed border needs the disputed-boundary treatment.", tags: ["outline", "border"], sampleData: sample("Kenya outline", { target: LOCATIONS.nairobi }) }),
  define({ id: "multi-country-sweep", category: "Highlights", title: "Multi-country sweep", summary: "Highlights a verified list in sequence, then settles on the lead country.", family: "highlight", projection: "globe", duration: 5.2, required: ["countryCodes"], useWhen: "A real event affects multiple named countries.", avoidWhen: "Not a decorative opener for single-country stories.", tags: ["multi-country", "sequence"], sampleData: sample("Illustrative regional rollout", { countryCodes: ["GB", "EG", "IN", "SG", "JP"], target: LOCATIONS.delhi }) }),
  define({ id: "regional-choropleth", category: "Highlights", title: "Regional choropleth", summary: "Reveals comparable area values on a stable, sourced scale.", family: "highlight", projection: "globe", duration: 5, required: ["values"], useWhen: "Comparable numeric values exist for several areas.", avoidWhen: "Never map incomparable counts or silently change bins over time.", tags: ["choropleth", "data"], sampleData: sample("Illustrative activity index", { values: DEMO_VALUES, legend: { min: 40, max: 100, unit: "index" } }) }),
  define({ id: "election-results-fill", category: "Highlights", title: "Election results fill", summary: "Builds categorical results, vote share and an explicit sample legend.", family: "highlight", projection: "globe", duration: 5.4, required: ["results"], useWhen: "Certified or clearly attributed election results are available.", avoidWhen: "Do not present projections as final results.", tags: ["election", "categorical"], sampleData: sample("Illustrative result split", { results: ELECTION_VALUES, countryCodes: ["US", "CA", "MX"] }) }),
  define({ id: "conflict-zone-hatch", category: "Highlights", title: "Conflict-zone hatch", summary: "Uses directional hatching instead of a solid territorial claim.", family: "highlight", projection: "globe", duration: 5, required: ["countryCodes"], useWhen: "Showing an attributed zone of activity or control.", avoidWhen: "A hatch is not a legal border; label source and date.", tags: ["conflict", "hatch", "uncertainty"], sampleData: sample("Illustrative activity zone", { countryCodes: ["EG", "SD"], note: "Illustrative zone only" }) }),
  define({ id: "disputed-boundary-dash", category: "Highlights", title: "Disputed boundary dash", summary: "Draws a dashed line with a visible dispute label and source slot.", family: "highlight", projection: "globe", duration: 4.8, required: ["line"], useWhen: "A sourced disputed or provisional line is essential.", avoidWhen: "Never substitute a present-day national border for a dispute line.", tags: ["boundary", "dispute", "line"], sampleData: sample("Illustrative provisional line", { target: LOCATIONS.delhi, line: [[72, 34], [76, 33], [79, 34], [82, 31]], note: "ILLUSTRATIVE LINE" }) }),
  define({ id: "buffer-zone-band", category: "Highlights", title: "Buffer-zone band", summary: "Builds a translucent corridor around a verified line.", family: "highlight", projection: "globe", duration: 4.8, required: ["line"], useWhen: "A treaty, evacuation or safety corridor has a stated width.", avoidWhen: "Do not estimate width from a screenshot.", tags: ["buffer", "corridor"], sampleData: sample("Illustrative 25 km corridor", { target: LOCATIONS.suez, line: [[31.7, 30.7], [32.4, 30.4], [33.1, 30.1]], radiusKm: 25 }) }),
  define({ id: "disaster-radius", category: "Highlights", title: "Disaster radius", summary: "Expands a geodesic ring from an event point with a unit label.", family: "highlight", projection: "globe", duration: 4.6, required: ["target.coordinates", "radiusKm"], useWhen: "A sourced radius or exclusion zone exists.", avoidWhen: "Never turn an uncertain impact area into a precise circle.", tags: ["radius", "event"], sampleData: sample("Illustrative 120 km radius", { target: LOCATIONS.tokyo, radiusKm: 120 }) }),
  define({ id: "spotlight-dim", category: "Highlights", title: "Spotlight dim", summary: "Dims the rest of the map while keeping context faintly readable.", family: "highlight", projection: "globe", duration: 4.2, required: ["target.code"], useWhen: "A small place is visually lost in a dense regional map.", avoidWhen: "Do not erase neighboring context entirely.", tags: ["spotlight", "focus"], sampleData: sample("Singapore spotlight", { target: LOCATIONS.singapore }) }),

  // Routes, movement, and systems (10)
  define({ id: "great-circle-route", category: "Routes", title: "Great-circle route", summary: "Draws the shortest globe arc with origin and destination holds.", family: "route", projection: "globe", duration: 5, required: ["route"], useWhen: "A verified movement connects two distant places.", avoidWhen: "A relationship without movement should use a country hop.", tags: ["route", "arc"], sampleData: sample("Illustrative London–New York link", { route: ROUTES.atlantic }) }),
  define({ id: "multi-leg-journey", category: "Routes", title: "Multi-leg journey", summary: "Builds a route one leg at a time and numbers the stops.", family: "route", projection: "globe", duration: 6.2, required: ["route"], useWhen: "Order and intermediate stops matter.", avoidWhen: "Do not add stops not supported by the reporting.", tags: ["route", "stops", "sequence"], sampleData: sample("Illustrative global itinerary", { route: ROUTES.aroundWorld }) }),
  define({ id: "bilateral-flow", category: "Routes", title: "Bilateral flow", summary: "Uses two opposing arcs to show reciprocal movement.", family: "route", projection: "globe", duration: 5.2, required: ["route"], useWhen: "Two-way exchange is supported by data.", avoidWhen: "Do not imply equal magnitude; provide values when they differ.", tags: ["flow", "bilateral"], sampleData: sample("Illustrative two-way exchange", { route: ROUTES.atlantic, flows: [{ value: 68 }, { value: 42 }] }) }),
  define({ id: "trade-flow-ribbons", category: "Routes", title: "Trade-flow ribbons", summary: "Scales several route strokes from sourced comparable values.", family: "route", projection: "globe", duration: 5.8, required: ["routes"], useWhen: "Comparable flow magnitudes exist across routes.", avoidWhen: "Never scale widths from mismatched units.", tags: ["trade", "flow", "ribbon"], sampleData: sample("Illustrative trade volume", { routes: [{ points: ROUTES.atlantic, value: 38 }, { points: ROUTES.southSouth, value: 72 }, { points: ROUTES.globalSupply, value: 56 }] }) }),
  define({ id: "migration-flow", category: "Routes", title: "Migration flow", summary: "Moves dot cohorts along sourced routes while preserving directional uncertainty.", family: "route", projection: "globe", duration: 5.8, required: ["routes"], useWhen: "Directional movement data is verified and ethically appropriate.", avoidWhen: "Avoid decorative people icons or dehumanizing particle swarms.", tags: ["migration", "flow", "dots"], sampleData: sample("Illustrative movement paths", { routes: [{ points: [LOCATIONS.nairobi, LOCATIONS.delhi], value: 24 }, { points: [LOCATIONS.saoPaulo, LOCATIONS.london], value: 12 }] }) }),
  define({ id: "shipping-lanes", category: "Routes", title: "Shipping lanes", summary: "Reveals multiple sea lanes and chokepoints without implying vessel tracking.", family: "route", projection: "globe", duration: 6, required: ["routes"], useWhen: "Explaining maritime systems or trade geography.", avoidWhen: "Use real AIS data for claims about live ship locations.", tags: ["shipping", "lanes", "maritime"], sampleData: sample("Illustrative maritime network", { routes: [{ points: ROUTES.globalSupply, value: 75 }, { points: ROUTES.canals, value: 55 }], points: [LOCATIONS.suez, LOCATIONS.hormuz, LOCATIONS.panama] }) }),
  define({ id: "flight-network", category: "Routes", title: "Flight network", summary: "Staggers hub arcs and proportional endpoint pulses.", family: "route", projection: "globe", duration: 5.8, required: ["routes"], useWhen: "Aviation connections or network concentration matter.", avoidWhen: "Do not infer current routes from historical schedules.", tags: ["aviation", "network", "hub"], sampleData: sample("Illustrative hub connections", { hub: LOCATIONS.singapore, routes: [{ points: [LOCATIONS.singapore, LOCATIONS.tokyo], value: 78 }, { points: [LOCATIONS.singapore, LOCATIONS.delhi], value: 63 }, { points: [LOCATIONS.singapore, LOCATIONS.sydney], value: 52 }] }) }),
  define({ id: "pipeline-trace", category: "Routes", title: "Pipeline trace", summary: "Draws a segmented land route with capacity and source slots.", family: "route", projection: "globe", duration: 5.4, required: ["line"], useWhen: "A verified infrastructure alignment is available.", avoidWhen: "Never approximate a sensitive route from memory.", tags: ["infrastructure", "pipeline", "trace"], sampleData: sample("Illustrative infrastructure trace", { target: LOCATIONS.suez, line: [[24, 31], [29, 30], [34, 31], [39, 29], [44, 30]], value: 68, unit: "demo capacity" }) }),
  define({ id: "supply-chain-hop", category: "Routes", title: "Supply-chain hop", summary: "Advances a highlighted package through verified production stages.", family: "route", projection: "globe", duration: 6.2, required: ["route"], useWhen: "The sequence of production or logistics stages is known.", avoidWhen: "Do not collapse suppliers into countries without evidence.", tags: ["supply-chain", "stages"], sampleData: sample("Illustrative component journey", { route: ROUTES.globalSupply, stages: ["INPUT", "ASSEMBLY", "PORT", "MARKET"] }) }),
  define({ id: "chokepoint-focus", category: "Routes", title: "Chokepoint focus", summary: "Routes converge, then the camera and label isolate a narrow passage.", family: "route", projection: "globe", duration: 5.8, required: ["target.coordinates", "routes"], useWhen: "A passage is central to the system being explained.", avoidWhen: "Do not suggest disruption unless the story establishes it.", tags: ["chokepoint", "focus", "routes"], sampleData: sample("Illustrative Suez focus", { target: LOCATIONS.suez, routes: [{ points: ROUTES.globalSupply, value: 72 }, { points: ROUTES.canals, value: 48 }] }) }),

  // Change over time, comparison, and spatial data (10)
  define({ id: "before-after-swipe", category: "Change", title: "Before/after swipe", summary: "Moves a clean divider between two sourced spatial states.", family: "change", projection: "globe", duration: 5.2, required: ["before", "after"], useWhen: "Two comparable maps share projection, extent and classification.", avoidWhen: "Never compare differently scaled or differently classified maps.", tags: ["before", "after", "comparison"], sampleData: sample("Illustrative index change", { before: { values: { IN: 34, KE: 52, EG: 41 } }, after: { values: { IN: 72, KE: 61, EG: 68 } } }) }),
  define({ id: "historical-border-morph", category: "Change", title: "Historical border morph", summary: "Transitions between explicitly supplied dated geometries.", family: "change", projection: "globe", duration: 5.8, required: ["stages"], useWhen: "Authoritative historical geometry exists for each date.", avoidWhen: "Current country polygons are not substitutes for historical borders.", tags: ["history", "boundary", "morph"], sampleData: sample("Illustrative administrative change", { target: LOCATIONS.delhi, stages: [{ label: "PHASE 1", countryCodes: ["IN"] }, { label: "PHASE 2", countryCodes: ["IN", "BD"] }] }) }),
  define({ id: "time-lapse-choropleth", category: "Change", title: "Time-lapse choropleth", summary: "Steps through fixed-scale area values with a visible date ticker.", family: "change", projection: "globe", duration: 6.2, required: ["stages"], useWhen: "A consistent time series exists across areas.", avoidWhen: "Never re-bin the legend between dates.", tags: ["time-series", "choropleth"], sampleData: sample("Illustrative index / 2022–2026", { stages: [{ label: "2022", values: { US: 44, BR: 31, IN: 36, JP: 52 } }, { label: "2024", values: { US: 61, BR: 48, IN: 57, JP: 64 } }, { label: "2026", values: { US: 74, BR: 58, IN: 79, JP: 71 } }], legend: { min: 0, max: 100, unit: "index" } }) }),
  define({ id: "ranking-wave", category: "Change", title: "Geographic ranking wave", summary: "Reveals ranked places in order while retaining their map positions.", family: "change", projection: "globe", duration: 5.6, required: ["rankedPoints"], useWhen: "A ranking is methodologically comparable and sourced.", avoidWhen: "Rank order alone should not hide absolute values.", tags: ["ranking", "points"], sampleData: sample("Illustrative network score", { rankedPoints: [{ ...LOCATIONS.singapore, rank: 1, value: 91 }, { ...LOCATIONS.tokyo, rank: 2, value: 84 }, { ...LOCATIONS.london, rank: 3, value: 78 }, { ...LOCATIONS.delhi, rank: 4, value: 69 }] }) }),
  define({ id: "proportional-bubbles", category: "Change", title: "Proportional bubbles", summary: "Grows area-scaled circles over sourced point values.", family: "change", projection: "globe", duration: 5.2, required: ["points"], useWhen: "Point values span places and circle area can encode magnitude.", avoidWhen: "Use square-root radius scaling; raw radius exaggerates values.", tags: ["bubbles", "magnitude"], sampleData: sample("Illustrative project volume", { points: [{ ...LOCATIONS.london, value: 36 }, { ...LOCATIONS.delhi, value: 82 }, { ...LOCATIONS.nairobi, value: 48 }, { ...LOCATIONS.saoPaulo, value: 67 }, { ...LOCATIONS.tokyo, value: 74 }] }) }),
  define({ id: "dot-density", category: "Change", title: "Dot-density field", summary: "Adds deterministic dots within supplied areas to communicate density.", family: "change", projection: "globe", duration: 5.4, required: ["values"], useWhen: "Counts can be normalized to a documented people/items-per-dot rule.", avoidWhen: "Dots are representative, not exact locations; say so.", tags: ["dot-density", "distribution"], sampleData: sample("Illustrative density / one dot = 5 units", { values: { US: 60, BR: 45, IN: 85, KE: 30, JP: 50 }, dotUnit: 5 }) }),
  define({ id: "heatmap-bloom", category: "Change", title: "Heatmap bloom", summary: "Builds overlapping radial fields from supplied point intensities.", family: "change", projection: "globe", duration: 5.4, required: ["points"], useWhen: "A continuous spatial pattern is more meaningful than point labels.", avoidWhen: "Heatmaps can imply precision; disclose smoothing and source.", tags: ["heatmap", "field"], sampleData: sample("Illustrative activity field", { points: [{ ...LOCATIONS.london, value: 55 }, { ...LOCATIONS.delhi, value: 88 }, { ...LOCATIONS.singapore, value: 72 }, { ...LOCATIONS.tokyo, value: 64 }] }) }),
  define({ id: "uncertainty-cloud", category: "Change", title: "Uncertainty cloud", summary: "Shows a probabilistic area with a feathered field and explicit confidence label.", family: "change", projection: "globe", duration: 5.2, required: ["target.coordinates", "radiusKm"], useWhen: "Location or extent is estimated rather than known precisely.", avoidWhen: "Do not replace a known boundary with an aesthetic blur.", tags: ["uncertainty", "confidence"], sampleData: sample("Illustrative estimate / 70% confidence", { target: LOCATIONS.suez, radiusKm: 240, confidence: 0.7 }) }),
  define({ id: "comparison-split-map", category: "Change", title: "Split-map comparison", summary: "Places two synchronized map states side by side on the same scale.", family: "change", projection: "globe", duration: 5.4, required: ["left", "right"], useWhen: "Two places, dates or scenarios need direct comparison.", avoidWhen: "Keep extent, scale and legend consistent.", tags: ["split", "comparison"], sampleData: sample("Illustrative scenario comparison", { left: { label: "BASELINE", target: LOCATIONS.london, values: { GB: 42, FR: 36, DE: 51 } }, right: { label: "SCENARIO", target: LOCATIONS.delhi, values: { IN: 74, PK: 48, BD: 58 } } }) }),
  define({ id: "small-multiple-regions", category: "Change", title: "Regional small multiples", summary: "Builds four equally scaled mini-maps for pattern comparison.", family: "change", projection: "globe", duration: 6, required: ["panels"], useWhen: "Several regional snapshots must be compared without camera travel.", avoidWhen: "Too dense for more than four panels in a Short.", tags: ["small-multiples", "regions"], sampleData: sample("Illustrative regional snapshots", { panels: [{ label: "AMERICAS", target: LOCATIONS.newYork, values: { US: 70, BR: 51 } }, { label: "EUROPE", target: LOCATIONS.london, values: { GB: 66, FR: 58, DE: 62 } }, { label: "AFRICA", target: LOCATIONS.nairobi, values: { KE: 61, ZA: 48, EG: 55 } }, { label: "ASIA", target: LOCATIONS.tokyo, values: { JP: 72, IN: 69, SG: 84 } }] }) }),

  // Events and environmental motion (8)
  define({ id: "earthquake-ripple", category: "Events", title: "Earthquake ripple", summary: "Emits finite geodesic rings from a verified epicenter.", family: "event", projection: "globe", duration: 4.8, required: ["target.coordinates"], useWhen: "Epicenter, time and magnitude are sourced.", avoidWhen: "Ring size must not be read as damage extent unless explicitly encoded.", tags: ["earthquake", "ripple"], sampleData: sample("Illustrative seismic event / M5.8", { target: LOCATIONS.tokyo, magnitude: 5.8 }) }),
  define({ id: "storm-track", category: "Events", title: "Storm track", summary: "Draws observed and forecast segments with different certainty styles.", family: "event", projection: "globe", duration: 5.8, required: ["track"], useWhen: "Official track points and timestamps are available.", avoidWhen: "Observed and forecast positions must remain visually distinct.", tags: ["storm", "track", "forecast"], sampleData: sample("Illustrative cyclone track", { track: [{ coordinates: [128, 12], status: "observed", label: "T-24" }, { coordinates: [132, 16], status: "observed", label: "NOW" }, { coordinates: [136, 21], status: "forecast", label: "+24" }, { coordinates: [139, 27], status: "forecast", label: "+48" }] }) }),
  define({ id: "weather-front", category: "Events", title: "Weather front", summary: "Moves a stylized front line across a supplied forecast corridor.", family: "event", projection: "globe", duration: 5.4, required: ["line"], useWhen: "A meteorological source supplies the front or corridor.", avoidWhen: "This is not a substitute for an official forecast map.", tags: ["weather", "front"], sampleData: sample("Illustrative cold-front corridor", { target: LOCATIONS.london, line: [[-12, 57], [-6, 54], [1, 51], [8, 49], [15, 48]] }) }),
  define({ id: "wildfire-spread", category: "Events", title: "Wildfire spread", summary: "Builds dated nested extents with a non-photorealistic hatch.", family: "event", projection: "globe", duration: 5.6, required: ["target.coordinates", "stages"], useWhen: "Verified perimeter snapshots exist.", avoidWhen: "Do not interpolate beyond source perimeters as a forecast.", tags: ["wildfire", "spread", "time"], sampleData: sample("Illustrative perimeter growth", { target: LOCATIONS.sydney, stages: [{ label: "08:00", radiusKm: 30 }, { label: "12:00", radiusKm: 58 }, { label: "16:00", radiusKm: 86 }] }) }),
  define({ id: "flood-inundation", category: "Events", title: "Flood inundation", summary: "Raises a translucent water field through supplied extent stages.", family: "event", projection: "globe", duration: 5.6, required: ["target.coordinates", "stages"], useWhen: "Observed or modeled flood extents are sourced and labeled.", avoidWhen: "Do not present a model scenario as observed flooding.", tags: ["flood", "extent", "scenario"], sampleData: sample("Illustrative modeled extent", { target: LOCATIONS.saoPaulo, stages: [{ label: "LEVEL 1", radiusKm: 24 }, { label: "LEVEL 2", radiusKm: 44 }, { label: "LEVEL 3", radiusKm: 70 }] }) }),
  define({ id: "outage-cascade", category: "Events", title: "Network-outage cascade", summary: "Switches verified nodes from active to offline along a dependency path.", family: "event", projection: "globe", duration: 5.8, required: ["route"], useWhen: "A network dependency or outage sequence is known.", avoidWhen: "Do not infer causal order from simultaneous reports.", tags: ["network", "outage", "cascade"], sampleData: sample("Illustrative service cascade", { route: ROUTES.southSouth, stages: ["ACTIVE", "DEGRADED", "OFFLINE", "RECOVERY"] }) }),
  define({ id: "day-night-terminator", category: "Events", title: "Day/night terminator", summary: "Moves a deterministic solar terminator over a globe for time context.", family: "event", projection: "globe", duration: 5.2, required: ["solar"], useWhen: "Time zones, daylight or simultaneity matter.", avoidWhen: "Use an actual timestamp for reporting; the sample is illustrative.", tags: ["day", "night", "time-zone"], sampleData: sample("Illustrative UTC progression", { solar: { startLongitude: -30, endLongitude: 55 }, target: LOCATIONS.delhi }) }),
  define({ id: "satellite-orbit", category: "Events", title: "Satellite orbit", summary: "Traces a finite orbital ground path with timed passes over target points.", family: "event", projection: "globe", duration: 5.8, required: ["orbit"], useWhen: "Explaining observation coverage or a sourced orbital path.", avoidWhen: "A decorative orbit must not imply a real spacecraft trajectory.", tags: ["satellite", "orbit", "coverage"], sampleData: sample("Illustrative observation pass", { orbit: { inclination: 51.6, laps: 1.25 }, points: [LOCATIONS.london, LOCATIONS.delhi, LOCATIONS.tokyo] }) }),

  // Editorial evidence extensions (12)
  define({ id: "policy-status-sweep", category: "Highlights", title: "Policy status sweep", summary: "Steps through sourced country states as a policy moves from announcement to effect.", family: "highlight", projection: "globe", duration: 5.6, required: ["stages"], useWhen: "A policy, restriction or agreement changes status across named countries.", avoidWhen: "Do not infer adoption, exemption or blockage without an attributed status source.", tags: ["policy", "status", "stages"], sampleData: sample("Illustrative policy rollout", { stages: POLICY_STAGES }) }),
  define({ id: "geofenced-area", category: "Highlights", title: "Geofenced area", summary: "Draws a sourced polygon for a restricted, protected or evacuation area.", family: "highlight", projection: "globe", duration: 5, required: ["polygon"], useWhen: "A reported zone has a supplied geographic perimeter.", avoidWhen: "Do not sketch a legal, safety or military boundary from memory.", tags: ["polygon", "zone", "restriction"], sampleData: sample("Illustrative restricted area", { polygon: SAMPLE_GEOFENCE, mode: "restricted", label: "ILLUSTRATIVE ZONE" }) }),
  define({ id: "evidence-confidence-fill", category: "Highlights", title: "Evidence confidence fill", summary: "Separates confirmed, reported and unverified country-level evidence without implying certainty.", family: "highlight", projection: "globe", duration: 5.2, required: ["values"], useWhen: "A desk needs to show the reporting status of several geographic claims.", avoidWhen: "Never use evidence status as a substitute for the underlying source or fact.", tags: ["evidence", "confidence", "status"], sampleData: sample("Illustrative reporting status", { values: EVIDENCE_VALUES, legend: { confirmed: "CONFIRMED", reported: "REPORTED", unverified: "UNVERIFIED" } }) }),
  define({ id: "route-disruption", category: "Routes", title: "Route disruption", summary: "Shows an active route break and the verified detour that follows it.", family: "route", projection: "globe", duration: 6, required: ["routes"], useWhen: "A route is blocked, interrupted or replaced by a sourced detour.", avoidWhen: "Do not convert a general risk into a claimed closure or rerouting.", tags: ["route", "disruption", "detour"], sampleData: sample("Illustrative route disruption", { routes: [{ points: ROUTES.globalSupply, value: 72, status: "active", label: "BASELINE" }, { points: [LOCATIONS.rotterdam, LOCATIONS.panama, LOCATIONS.singapore, LOCATIONS.tokyo], value: 54, status: "detour", label: "DETOUR" }, { points: [LOCATIONS.suez, LOCATIONS.hormuz], value: 0, status: "blocked", label: "BLOCKED" }] }) }),
  define({ id: "network-branch", category: "Routes", title: "Network branch", summary: "Builds a branching dependency network around verified nodes and link states.", family: "route", projection: "globe", duration: 6.2, required: ["nodes", "links"], useWhen: "Several dependent nodes and links matter more than one linear route.", avoidWhen: "Do not infer causal dependency from geographic proximity alone.", tags: ["network", "dependency", "branch"], sampleData: sample("Illustrative dependency network", { nodes: NETWORK_NODES, links: NETWORK_LINKS }) }),
  define({ id: "flow-shift", category: "Routes", title: "Flow shift", summary: "Crossfades comparable baseline and changed flow networks on one globe.", family: "route", projection: "globe", duration: 6, required: ["beforeRoutes", "afterRoutes"], useWhen: "Comparable route volumes change between two sourced states.", avoidWhen: "Keep units, route definitions and scale stable across both states.", tags: ["flow", "change", "reroute"], sampleData: sample("Illustrative flow shift", { beforeRoutes: [{ points: ROUTES.globalSupply, value: 78 }], afterRoutes: [{ points: [LOCATIONS.rotterdam, LOCATIONS.panama, LOCATIONS.singapore, LOCATIONS.tokyo], value: 52 }, { points: ROUTES.canals, value: 24 }] }) }),
  define({ id: "source-sink-flow", category: "Routes", title: "Source-to-sink flow", summary: "Connects identified source nodes to destination nodes with proportional directional flows.", family: "route", projection: "globe", duration: 6, required: ["sources", "sinks", "flows"], useWhen: "The story identifies origins, destinations and comparable movement values.", avoidWhen: "Do not collapse an unknown supply chain into invented source or destination countries.", tags: ["source", "sink", "flow"], sampleData: sample("Illustrative source-to-market flow", SOURCE_SINKS) }),
  define({ id: "delta-bubbles", category: "Change", title: "Delta bubbles", summary: "Grows or contracts point markers to show signed change between two measured states.", family: "change", projection: "globe", duration: 5.4, required: ["points"], useWhen: "Comparable point measurements have a meaningful before, after and delta.", avoidWhen: "Do not use raw bubble radius for signed values or mixed units.", tags: ["delta", "bubbles", "change"], sampleData: sample("Illustrative point deltas", { unit: "index points", points: [{ ...LOCATIONS.london, before: 36, after: 54, delta: 18 }, { ...LOCATIONS.delhi, before: 74, after: 61, delta: -13 }, { ...LOCATIONS.tokyo, before: 42, after: 67, delta: 25 }] }) }),
  define({ id: "rank-shift", category: "Change", title: "Rank shift", summary: "Links the same places across two ranked states while keeping absolute values visible.", family: "change", projection: "globe", duration: 5.6, required: ["before", "after"], useWhen: "A methodologically stable ranking changes between two dated states.", avoidWhen: "Do not hide ties, methodology or absolute values behind rank movement.", tags: ["rank", "shift", "comparison"], sampleData: sample("Illustrative rank movement", { before: [{ id: "sg", name: "Singapore", coordinates: LOCATIONS.singapore.coordinates, rank: 1, value: 91 }, { id: "jp", name: "Tokyo", coordinates: LOCATIONS.tokyo.coordinates, rank: 2, value: 84 }, { id: "in", name: "Delhi", coordinates: LOCATIONS.delhi.coordinates, rank: 3, value: 69 }], after: [{ id: "jp", name: "Tokyo", coordinates: LOCATIONS.tokyo.coordinates, rank: 1, value: 93 }, { id: "in", name: "Delhi", coordinates: LOCATIONS.delhi.coordinates, rank: 2, value: 78 }, { id: "sg", name: "Singapore", coordinates: LOCATIONS.singapore.coordinates, rank: 3, value: 72 }] }) }),
  define({ id: "event-cluster", category: "Events", title: "Event cluster", summary: "Reveals multiple verified sites in chronological order with finite pulses and labels.", family: "event", projection: "globe", duration: 5.8, required: ["points"], useWhen: "Several related locations and their sequence are sourced.", avoidWhen: "Do not imply a cluster from a handful of unrelated points.", tags: ["event", "cluster", "sequence"], sampleData: sample("Illustrative incident cluster", { points: [{ ...LOCATIONS.london, label: "T-2", status: "reported" }, { ...LOCATIONS.suez, label: "T-1", status: "confirmed" }, { ...LOCATIONS.delhi, label: "NOW", status: "confirmed" }] }) }),
  define({ id: "forecast-cone", category: "Events", title: "Forecast cone", summary: "Separates an observed path, forecast centerline and supplied uncertainty envelope.", family: "event", projection: "globe", duration: 6.2, required: ["observed", "forecast", "cone"], useWhen: "An official forecast supplies a centerline and uncertainty boundaries.", avoidWhen: "Never draw a cone from a single forecast point or present it as a guaranteed path.", tags: ["forecast", "cone", "uncertainty"], sampleData: sample("Illustrative forecast envelope", { observed: [[128, 12], [132, 16]], forecast: [[132, 16], [136, 21], [139, 27]], cone: { left: [[132, 16], [134, 25], [136, 32]], right: [[132, 16], [140, 22], [146, 26]] }, confidence: 0.7 }) }),
  define({ id: "impact-layers", category: "Events", title: "Impact layers", summary: "Builds nested measured extents around one site with explicit units and labels.", family: "event", projection: "globe", duration: 5.8, required: ["target.coordinates", "layers"], useWhen: "A source provides multiple measured or modeled impact bands.", avoidWhen: "Do not turn a qualitative warning into precise concentric geometry.", tags: ["impact", "layers", "extent"], sampleData: sample("Illustrative impact bands", { target: LOCATIONS.sydney, layers: [{ label: "DIRECT", radiusKm: 24, value: 12, unit: "km" }, { label: "SECONDARY", radiusKm: 58, value: 34, unit: "km" }, { label: "OUTER", radiusKm: 92, value: 61, unit: "km" }] }) }),
];

export const globeMapAnimations = Object.freeze(DEFINITIONS);

const BY_ID = new Map(globeMapAnimations.map((definition) => [definition.id, definition]));

function getPath(value, path) {
  return String(path).split(".").reduce((current, key) => current?.[key], value);
}

function hasValue(value) {
  if (value === undefined || value === null || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

function coordinateCandidates(config) {
  const candidates = [];
  const add = (path, value) => {
    if (value !== undefined) candidates.push([path, value]);
  };
  const addPoint = (path, point) => add(path, Array.isArray(point) ? point : point?.coordinates);
  const addPointList = (path, points) => {
    if (!Array.isArray(points)) return;
    points.forEach((point, index) => addPoint(`${path}[${index}]`, point));
  };

  add("target.coordinates", config.target?.coordinates);
  add("from.coordinates", config.from?.coordinates);
  add("hub.coordinates", config.hub?.coordinates);
  addPointList("route", config.route);
  addPointList("line", config.line);
  addPointList("points", config.points);
  addPointList("rankedPoints", config.rankedPoints);
  addPointList("track", config.track);
  addPointList("polygon", config.polygon);
  addPointList("observed", config.observed);
  addPointList("forecast", config.forecast);
  addPointList("cone.left", config.cone?.left);
  addPointList("cone.right", config.cone?.right);
  addPointList("nodes", config.nodes);
  addPointList("sources", config.sources);
  addPointList("sinks", config.sinks);
  if (Array.isArray(config.beforeRoutes)) {
    config.beforeRoutes.forEach((route, index) => addPointList(`beforeRoutes[${index}].points`, route?.points));
  }
  if (Array.isArray(config.afterRoutes)) {
    config.afterRoutes.forEach((route, index) => addPointList(`afterRoutes[${index}].points`, route?.points));
  }
  if (Array.isArray(config.routes)) {
    config.routes.forEach((route, index) => addPointList(`routes[${index}].points`, route?.points));
  }
  if (Array.isArray(config.panels)) {
    config.panels.forEach((panel, index) => add(`panels[${index}].target.coordinates`, panel?.target?.coordinates));
  }
  add("left.target.coordinates", config.left?.target?.coordinates);
  add("right.target.coordinates", config.right?.target?.coordinates);
  return candidates;
}

export function listGlobeMapAnimations({ category, family, projection, format } = {}) {
  return globeMapAnimations.filter((definition) => {
    if (category && definition.category.toLowerCase() !== String(category).toLowerCase()) return false;
    if (family && definition.family !== family) return false;
    if (projection && definition.projection !== projection) return false;
    if (format && !definition.formats.includes(format)) return false;
    return true;
  });
}

export function getGlobeMapAnimation(id) {
  const normalized = String(id || "").trim().toLowerCase();
  const definition = BY_ID.get(normalized);
  if (!definition) {
    throw new Error(`Unknown globe/map animation "${id}". Use listGlobeMapAnimations() to discover stable IDs.`);
  }
  return definition;
}

function validateResolvedConfig(definition, config, { requireSource = false } = {}) {
  const missing = definition.required.filter((path) => !hasValue(getPath(config, path)));
  const issues = [];

  if (requireSource && !hasValue(config.source)) missing.push("source");

  for (const [path, coordinates] of coordinateCandidates(config)) {
    if (!Array.isArray(coordinates) || coordinates.length !== 2 || coordinates.some((number) => !Number.isFinite(Number(number)))) {
      issues.push(`${path} must be [longitude, latitude] numbers`);
      continue;
    }
    const [longitude, latitude] = coordinates.map(Number);
    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      issues.push(`${path} falls outside longitude/latitude bounds`);
    }
  }

  if (config.radiusKm !== undefined && (!Number.isFinite(Number(config.radiusKm)) || Number(config.radiusKm) <= 0)) {
    issues.push("radiusKm must be a positive number");
  }
  if (config.confidence !== undefined && (Number(config.confidence) < 0 || Number(config.confidence) > 1)) {
    issues.push("confidence must be between 0 and 1");
  }

  for (const field of ["route", "line", "track"]) {
    if (config[field] !== undefined && (!Array.isArray(config[field]) || config[field].length < 2)) {
      issues.push(`${field} must contain at least two geographic points`);
    }
  }
  if (config.routes !== undefined) {
    if (!Array.isArray(config.routes) || config.routes.length === 0) {
      issues.push("routes must contain at least one route");
    } else {
      config.routes.forEach((route, index) => {
        if (!Array.isArray(route?.points) || route.points.length < 2) {
          issues.push(`routes[${index}].points must contain at least two geographic points`);
        }
        if (route?.value !== undefined && (!Number.isFinite(Number(route.value)) || Number(route.value) < 0)) {
          issues.push(`routes[${index}].value must be a non-negative number`);
        }
      });
    }
  }
  const validateRouteCollection = (field) => {
    if (config[field] === undefined) return;
    if (!Array.isArray(config[field]) || config[field].length === 0) {
      issues.push(`${field} must contain at least one route`);
      return;
    }
    config[field].forEach((route, index) => {
      if (!Array.isArray(route?.points) || route.points.length < 2) {
        issues.push(`${field}[${index}].points must contain at least two geographic points`);
      }
      if (route?.value !== undefined && (!Number.isFinite(Number(route.value)) || Number(route.value) < 0)) {
        issues.push(`${field}[${index}].value must be a non-negative number`);
      }
    });
  };
  validateRouteCollection("beforeRoutes");
  validateRouteCollection("afterRoutes");

  if (definition.id === "policy-status-sweep") {
    const statuses = new Set(["active", "pending", "blocked", "exempt"]);
    if (!Array.isArray(config.stages) || config.stages.length < 2) issues.push("stages must contain at least two policy states");
    (config.stages || []).forEach((stage, index) => {
      if (!stage?.states || typeof stage.states !== "object" || Array.isArray(stage.states)) {
        issues.push(`stages[${index}].states must be an object`);
        return;
      }
      Object.entries(stage.states).forEach(([code, status]) => {
        if (!/^[A-Z]{2}$/.test(code)) issues.push(`stages[${index}].states has invalid country code ${code}`);
        if (!statuses.has(status)) issues.push(`stages[${index}].states.${code} has invalid status ${status}`);
      });
    });
  }
  if (definition.id === "geofenced-area") {
    if (!Array.isArray(config.polygon) || config.polygon.length < 3) issues.push("polygon must contain at least three geographic points");
    if (config.mode !== undefined && !["restricted", "protected", "evacuate"].includes(config.mode)) issues.push("mode must be restricted, protected or evacuate");
  }
  if (definition.id === "evidence-confidence-fill") {
    const statuses = new Set(["confirmed", "reported", "unverified"]);
    Object.entries(config.values || {}).forEach(([code, status]) => {
      if (!/^[A-Z]{2}$/.test(code)) issues.push(`values has invalid country code ${code}`);
      if (!statuses.has(status)) issues.push(`values.${code} must be confirmed, reported or unverified`);
    });
  }
  if (definition.id === "route-disruption") {
    const statuses = new Set(["active", "blocked", "detour"]);
    (config.routes || []).forEach((route, index) => {
      if (!statuses.has(route?.status)) issues.push(`routes[${index}].status must be active, blocked or detour`);
    });
  }
  if (definition.id === "network-branch") {
    const nodeIds = new Set((config.nodes || []).map((node) => String(node?.id || "")));
    if (!Array.isArray(config.nodes) || config.nodes.length < 2) issues.push("nodes must contain at least two nodes");
    if (!Array.isArray(config.links) || config.links.length < 1) issues.push("links must contain at least one link");
    (config.links || []).forEach((link, index) => {
      if (!nodeIds.has(String(link?.from || "")) || !nodeIds.has(String(link?.to || ""))) issues.push(`links[${index}] must reference existing node IDs`);
      if (link?.value !== undefined && (!Number.isFinite(Number(link.value)) || Number(link.value) < 0)) issues.push(`links[${index}].value must be a non-negative number`);
      if (link?.status !== undefined && !["active", "blocked", "detour", "pending"].includes(link.status)) issues.push(`links[${index}].status is invalid`);
    });
  }
  if (definition.id === "source-sink-flow") {
    const sourceIds = new Set((config.sources || []).map((node) => String(node?.id || "")));
    const sinkIds = new Set((config.sinks || []).map((node) => String(node?.id || "")));
    if (!Array.isArray(config.sources) || config.sources.length < 1) issues.push("sources must contain at least one node");
    if (!Array.isArray(config.sinks) || config.sinks.length < 1) issues.push("sinks must contain at least one node");
    if (!Array.isArray(config.flows) || config.flows.length < 1) issues.push("flows must contain at least one flow");
    (config.flows || []).forEach((flow, index) => {
      if (!sourceIds.has(String(flow?.from || "")) || !sinkIds.has(String(flow?.to || ""))) issues.push(`flows[${index}] must reference source and sink IDs`);
      if (!Number.isFinite(Number(flow?.value)) || Number(flow.value) < 0) issues.push(`flows[${index}].value must be a non-negative number`);
    });
  }
  if (definition.id === "delta-bubbles") {
    (config.points || []).forEach((point, index) => {
      ["before", "after", "delta"].forEach((field) => {
        if (!Number.isFinite(Number(point?.[field]))) issues.push(`points[${index}].${field} must be a number`);
      });
    });
  }
  if (definition.id === "rank-shift") {
    const beforeIds = new Set((config.before || []).map((point) => String(point?.id || "")));
    const afterIds = new Set((config.after || []).map((point) => String(point?.id || "")));
    if (!Array.isArray(config.before) || config.before.length < 2) issues.push("before must contain at least two ranked points");
    if (!Array.isArray(config.after) || config.after.length < 2) issues.push("after must contain at least two ranked points");
    if (beforeIds.size !== afterIds.size || [...beforeIds].some((id) => !afterIds.has(id))) issues.push("before and after must contain the same point IDs");
    [...(config.before || []), ...(config.after || [])].forEach((point, index) => {
      if (!Number.isInteger(Number(point?.rank)) || Number(point.rank) < 1) issues.push(`ranked point ${index} must have a positive integer rank`);
      if (!Number.isFinite(Number(point?.value))) issues.push(`ranked point ${index}.value must be a number`);
    });
  }
  if (definition.id === "event-cluster") {
    const statuses = new Set(["observed", "reported", "forecast", "confirmed"]);
    if (!Array.isArray(config.points) || config.points.length < 2) issues.push("points must contain at least two event locations");
    (config.points || []).forEach((point, index) => {
      if (point?.status !== undefined && !statuses.has(point.status)) issues.push(`points[${index}].status is invalid`);
    });
  }
  if (definition.id === "forecast-cone") {
    if (!Array.isArray(config.observed) || config.observed.length < 2) issues.push("observed must contain at least two points");
    if (!Array.isArray(config.forecast) || config.forecast.length < 2) issues.push("forecast must contain at least two points");
    if (!Array.isArray(config.cone?.left) || config.cone.left.length < 2) issues.push("cone.left must contain at least two points");
    if (!Array.isArray(config.cone?.right) || config.cone.right.length < 2) issues.push("cone.right must contain at least two points");
  }
  if (definition.id === "impact-layers") {
    if (!Array.isArray(config.layers) || config.layers.length < 2) issues.push("layers must contain at least two impact bands");
    (config.layers || []).forEach((layer, index) => {
      if (!Number.isFinite(Number(layer?.radiusKm)) || Number(layer.radiusKm) <= 0) issues.push(`layers[${index}].radiusKm must be positive`);
      if (layer?.value !== undefined && !Number.isFinite(Number(layer.value))) issues.push(`layers[${index}].value must be a number`);
    });
  }
  if (Array.isArray(config.stages)) {
    config.stages.forEach((stage, index) => {
      if (stage?.radiusKm !== undefined && (!Number.isFinite(Number(stage.radiusKm)) || Number(stage.radiusKm) <= 0)) {
        issues.push(`stages[${index}].radiusKm must be a positive number`);
      }
    });
  }

  return Object.freeze({
    definition,
    config: Object.freeze(config),
    missing: Object.freeze(missing),
    issues: Object.freeze(issues),
    valid: missing.length === 0 && issues.length === 0,
  });
}

export function validateGlobeMapAnimationConfig(id, input = {}) {
  const definition = getGlobeMapAnimation(id);
  return validateResolvedConfig(definition, { ...definition.sample, ...input });
}

export function validateStrictGlobeMapAnimationConfig(id, input = {}, {
  allowIllustrativeSource = false,
  requireSource = true,
} = {}) {
  const definition = getGlobeMapAnimation(id);
  const result = validateResolvedConfig(definition, { ...input }, { requireSource });
  const issues = [...result.issues];
  if (!allowIllustrativeSource && /illustrative sample data/i.test(String(result.config.source || ""))) {
    issues.push("production config must replace the illustrative sample source");
  }
  return Object.freeze({
    ...result,
    issues: Object.freeze(issues),
    valid: result.missing.length === 0 && issues.length === 0,
  });
}

export function validateProductionGlobeMapAnimationConfig(id, input = {}) {
  return validateStrictGlobeMapAnimationConfig(id, input, {
    allowIllustrativeSource: false,
    requireSource: true,
  });
}

export function createGlobeMapAnimationConfig(id, overrides = {}) {
  const result = validateGlobeMapAnimationConfig(id, overrides);
  if (!result.valid) {
    const details = [...result.missing.map((path) => `missing ${path}`), ...result.issues].join("; ");
    throw new Error(`Invalid ${id} animation config: ${details}`);
  }
  return result.config;
}

export function suggestGlobeMapAnimation(story = {}) {
  const explicit = String(
    story.mapAnimation
      || story.animationId
      || story.animation
      || story.visualType
      || "",
  ).trim().toLowerCase();
  if (explicit && BY_ID.has(explicit)) return explicit;
  const evidence = String(story.mapEvidence?.animationId || story.mapEvidence?.animation || "").trim().toLowerCase();
  if (evidence && BY_ID.has(evidence)) return evidence;
  if (story.uncertainty || story.confidence) return "uncertainty-cloud";
  if (story.before && story.after) return "before-after-swipe";
  if (Array.isArray(story.stages) && story.stages.length > 1) return "time-lapse-choropleth";
  if (Array.isArray(story.routes) && story.routes.length > 1) return "trade-flow-ribbons";
  if (Array.isArray(story.route) && story.route.length > 2) return "multi-leg-journey";
  if (Array.isArray(story.route) && story.route.length === 2) return "great-circle-route";
  if (story.radiusKm && story.coordinates) return "disaster-radius";
  if (story.values && Object.keys(story.values).length > 1) return "regional-choropleth";
  if (Array.isArray(story.affectedCountryCodes) && story.affectedCountryCodes.length > 1) return "multi-country-sweep";
  if (story.cityName && story.coordinates) return "city-lock";
  if (story.countryCode) return "country-lock";
  return "world-orbit";
}

export function getGlobeMapLibrarySummary() {
  const categories = {};
  globeMapAnimations.forEach((definition) => {
    categories[definition.category] = (categories[definition.category] || 0) + 1;
  });
  return Object.freeze({
    version: GLOBE_MAP_LIBRARY_VERSION,
    total: globeMapAnimations.length,
    categories: Object.freeze(categories),
    formats: Object.keys(GLOBE_MAP_FORMATS),
    projections: Object.freeze({ globe: globeMapAnimations.length, map: 0, hybrid: 0 }),
  });
}

/* Catalog-level guarantee: every preset must render on the globe projection.
   A future preset that reintroduces a flat/rectangular projection fails here. */
export function assertGlobeOnlyCatalog() {
  const offenders = globeMapAnimations.filter((definition) => definition.projection !== "globe");
  if (offenders.length) {
    throw new Error(
      `Globe-only catalog violated: ${offenders.map((definition) => definition.id).join(", ")} use projection "${offenders[0]?.projection}"`,
    );
  }
  return true;
}

export const GLOBE_ONLY = Object.freeze(true);

/**
 * Lightweight timing lint for an animation plan.
 * Returns { warnings: string[] } without throwing.
 */
export function lintGlobeMapPlanTiming(plan, { duration = Number.POSITIVE_INFINITY } = {}) {
  const warnings = [];
  if (!plan || typeof plan !== "object" || !Array.isArray(plan.segments)) return { warnings };
  const ordered = [...plan.segments].sort((a, b) => (Number(a.start) || 0) - (Number(b.start) || 0));
  for (let index = 1; index < ordered.length; index += 1) {
    const gap = Number(ordered[index].start) - Number(ordered[index - 1].start);
    if (gap > 8) warnings.push(`segments ${ordered[index - 1].id} → ${ordered[index].id} leave ${gap.toFixed(1)}s gap`);
  }
  if (Number.isFinite(duration)) {
    ordered.forEach((segment) => {
      const definition = BY_ID.get(String(segment.animationId).toLowerCase());
      if (!definition) return;
      const remaining = duration - Number(segment.start || 0);
      if (remaining > 0 && definition.duration > remaining + 0.4) {
        warnings.push(`${segment.id} (${definition.id}) runs ${definition.duration}s but only ${remaining.toFixed(1)}s remain`);
      }
    });
  }
  return { warnings };
}
