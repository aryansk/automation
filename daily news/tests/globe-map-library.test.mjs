import test from "node:test";
import assert from "node:assert/strict";

import {
  GLOBE_MAP_FORMATS,
  GLOBE_MAP_LIBRARY_VERSION,
  assertGlobeOnlyCatalog,
  getGlobeMapAnimation,
  getGlobeMapLibrarySummary,
  globeMapAnimations,
  listGlobeMapAnimations,
  suggestGlobeMapAnimation,
  validateGlobeMapAnimationConfig,
  validateProductionGlobeMapAnimationConfig,
} from "../assets/animations/globe-map-library.js";
import {
  clamp,
  easeInOutQuint,
  easeOutCubic,
  mix,
  smootherstep,
} from "../assets/animations/globe-map-renderer.js";

test("catalog exposes 60 stable animations across five editorial categories", () => {
  const summary = getGlobeMapLibrarySummary();
  assert.equal(GLOBE_MAP_LIBRARY_VERSION, "1.1.0");
  assert.equal(summary.total, 60);
  assert.deepEqual(summary.categories, {
    Camera: 10,
    Highlights: 13,
    Routes: 14,
    Change: 12,
    Events: 11,
  });
  assert.equal(new Set(globeMapAnimations.map((definition) => definition.id)).size, 60);
});

test("every preset renders on the globe projection — no flat or rectangular projections", () => {
  /* Catalog-level guarantee: a future preset cannot reintroduce a flat map. */
  assert.equal(assertGlobeOnlyCatalog(), true);
  const summary = getGlobeMapLibrarySummary();
  assert.deepEqual(summary.projections, { globe: 60, map: 0, hybrid: 0 });
  for (const definition of globeMapAnimations) {
    assert.equal(definition.projection, "globe", `${definition.id} must use the globe projection`);
  }
  assert.equal(listGlobeMapAnimations({ projection: "globe" }).length, 60);
  assert.equal(listGlobeMapAnimations({ projection: "hybrid" }).length, 0);
  assert.equal(listGlobeMapAnimations({ projection: "map" }).length, 0);
});

test("every animation ships a valid illustrative sample and format guidance", () => {
  for (const definition of globeMapAnimations) {
    const result = validateGlobeMapAnimationConfig(definition.id);
    assert.equal(result.valid, true, `${definition.id}: ${[...result.missing, ...result.issues].join(", ")}`);
    assert.match(result.config.source, /Illustrative sample data/i);
    assert.deepEqual(definition.formats, ["portrait", "landscape"]);
    assert.ok(definition.useWhen.length > 12);
    assert.ok(definition.avoidWhen.length > 12);
  }
});

test("format profiles preserve explicit Shorts and long-form safe areas", () => {
  assert.deepEqual([GLOBE_MAP_FORMATS.portrait.width, GLOBE_MAP_FORMATS.portrait.height], [1080, 1920]);
  assert.deepEqual([GLOBE_MAP_FORMATS.landscape.width, GLOBE_MAP_FORMATS.landscape.height], [1920, 1080]);
  assert.ok(GLOBE_MAP_FORMATS.portrait.safeInset.bottom >= 270);
  assert.ok(GLOBE_MAP_FORMATS.landscape.mapFrame.width > GLOBE_MAP_FORMATS.landscape.mapFrame.height);
});

test("filters and lookups are deterministic and fail loudly for unknown IDs", () => {
  assert.equal(listGlobeMapAnimations({ category: "Routes" }).length, 14);
  assert.equal(listGlobeMapAnimations({ family: "event" }).length, 11);
  assert.equal(listGlobeMapAnimations({ projection: "globe" }).length, 60);
  assert.equal(getGlobeMapAnimation("country-lock").title, "Country lock");
  assert.throws(() => getGlobeMapAnimation("decorative-random-spin"), /Unknown globe\/map animation/);
});

test("invalid coordinates, radii and confidence fail validation", () => {
  const badCoordinates = validateGlobeMapAnimationConfig("city-lock", {
    target: { name: "Invalid", code: "XX", coordinates: [240, 110] },
  });
  assert.equal(badCoordinates.valid, false);
  assert.match(badCoordinates.issues.join(" "), /outside longitude\/latitude bounds/);

  const badRadius = validateGlobeMapAnimationConfig("disaster-radius", { radiusKm: -5 });
  assert.equal(badRadius.valid, false);
  assert.match(badRadius.issues.join(" "), /positive number/);

  const badConfidence = validateGlobeMapAnimationConfig("uncertainty-cloud", { confidence: 1.4 });
  assert.equal(badConfidence.valid, false);
  assert.match(badConfidence.issues.join(" "), /between 0 and 1/);

  const badTrack = validateProductionGlobeMapAnimationConfig("storm-track", {
    source: "Verified storm bulletin",
    track: [
      { coordinates: [132, 16], status: "observed" },
      { coordinates: [220, 24], status: "forecast" },
    ],
  });
  assert.equal(badTrack.valid, false);
  assert.match(badTrack.issues.join(" "), /track\[1\].*outside longitude\/latitude bounds/);

  const shortRoute = validateProductionGlobeMapAnimationConfig("great-circle-route", {
    source: "Verified route ledger",
    route: [{ name: "Only stop", coordinates: [10, 20] }],
  });
  assert.equal(shortRoute.valid, false);
  assert.match(shortRoute.issues.join(" "), /at least two geographic points/);
});

test("production validation does not silently borrow illustrative sample fields", () => {
  const missing = validateProductionGlobeMapAnimationConfig("city-lock", {
    target: { name: "Delhi", code: "IN", coordinates: [77.209, 28.6139] },
  });
  assert.equal(missing.valid, false);
  assert.deepEqual(missing.missing, ["source"]);

  const sampleSource = validateProductionGlobeMapAnimationConfig("city-lock", {
    target: { name: "Delhi", code: "IN", coordinates: [77.209, 28.6139] },
    source: "Illustrative sample data — not reporting",
  });
  assert.equal(sampleSource.valid, false);
  assert.match(sampleSource.issues.join(" "), /replace the illustrative sample source/);

  const production = validateProductionGlobeMapAnimationConfig("city-lock", {
    target: { name: "Delhi", code: "IN", coordinates: [77.209, 28.6139] },
    source: "Verified source ledger entry",
  });
  assert.equal(production.valid, true);
});

test("story suggestions prefer evidence-bearing structured metadata", () => {
  assert.equal(suggestGlobeMapAnimation({ cityName: "Delhi", coordinates: [77.2, 28.6], countryCode: "IN" }), "city-lock");
  assert.equal(suggestGlobeMapAnimation({ route: [{}, {}] }), "great-circle-route");
  assert.equal(suggestGlobeMapAnimation({ routes: [{}, {}] }), "trade-flow-ribbons");
  assert.equal(suggestGlobeMapAnimation({ before: {}, after: {} }), "before-after-swipe");
  assert.equal(suggestGlobeMapAnimation({ confidence: 0.7 }), "uncertainty-cloud");
  assert.equal(suggestGlobeMapAnimation({ mapEvidence: { animationId: "route-disruption", data: { routes: [{ points: [{ coordinates: [0, 0] }, { coordinates: [10, 10] }], status: "blocked" }] } } }), "route-disruption");
  assert.equal(suggestGlobeMapAnimation({}), "world-orbit");
});

test("new payload shapes reject malformed production data", () => {
  const cases = [
    ["policy-status-sweep", { stages: [{ states: { IND: "active" } }, { states: { IN: "pending" } }] }, /invalid country code/],
    ["geofenced-area", { polygon: [[0, 0], [1, 1]] }, /at least three/],
    ["evidence-confidence-fill", { values: { IN: "guess" } }, /confirmed, reported or unverified/],
    ["route-disruption", { routes: [{ points: [[0, 0], [1, 1]], status: "unknown" }] }, /active, blocked or detour/],
    ["network-branch", { nodes: [{ id: "a", coordinates: [0, 0] }, { id: "b", coordinates: [1, 1] }], links: [{ from: "a", to: "missing", value: 2 }] }, /existing node IDs/],
    ["source-sink-flow", { sources: [{ id: "a", coordinates: [0, 0] }], sinks: [{ id: "b", coordinates: [1, 1] }], flows: [{ from: "a", to: "b", value: -1 }] }, /non-negative number/],
    ["delta-bubbles", { points: [{ coordinates: [0, 0], before: 1, after: "bad", delta: 2 }] }, /after must be a number/],
    ["rank-shift", { before: [{ id: "a", coordinates: [0, 0], rank: 1, value: 2 }, { id: "b", coordinates: [1, 1], rank: 2, value: 1 }], after: [{ id: "c", coordinates: [0, 0], rank: 1, value: 2 }, { id: "b", coordinates: [1, 1], rank: 2, value: 1 }] }, /same point IDs/],
    ["event-cluster", { points: [{ coordinates: [0, 0], status: "imagined" }, { coordinates: [1, 1] }] }, /status is invalid/],
    ["forecast-cone", { observed: [[0, 0]], forecast: [[1, 1], [2, 2]], cone: { left: [[1, 1], [2, 2]], right: [[1, 1], [2, 2]] } }, /observed must contain at least two/],
    ["impact-layers", { target: { coordinates: [0, 0] }, layers: [{ radiusKm: 0 }, { radiusKm: 10 }] }, /radiusKm must be positive/],
  ];
  for (const [id, data, expected] of cases) {
    const result = validateGlobeMapAnimationConfig(id, data);
    assert.equal(result.valid, false, id);
    assert.match(result.issues.join(" "), expected, id);
  }
});

test("new production presets require real attribution and reject sample sources", () => {
  const result = validateProductionGlobeMapAnimationConfig("route-disruption", {
    source: "Illustrative sample data — not reporting",
    routes: [{ points: [{ coordinates: [0, 0] }, { coordinates: [10, 10] }], status: "blocked" }],
  });
  assert.equal(result.valid, false);
  assert.match(result.issues.join(" "), /replace the illustrative sample source/);
});

test("renderer interpolation helpers are bounded and endpoint-correct", () => {
  assert.equal(clamp(-1), 0);
  assert.equal(clamp(2), 1);
  assert.equal(mix(10, 20, 0.5), 15);
  assert.equal(smootherstep(0, 1, 0), 0);
  assert.equal(smootherstep(0, 1, 1), 1);
  assert.equal(easeOutCubic(0), 0);
  assert.equal(easeOutCubic(1), 1);
  assert.equal(easeInOutQuint(0), 0);
  assert.equal(easeInOutQuint(1), 1);
});
