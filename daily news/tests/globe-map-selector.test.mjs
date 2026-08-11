import test from "node:test";
import assert from "node:assert/strict";

import {
  MAP_ANIMATION_NONE,
  isMapDisabled,
  resolveChapterMapAnimation,
  selectStoryMapAnimation,
} from "../assets/animations/globe-map-selector.js";

/* Deterministic fixtures. Coordinates and routes are illustrative but carry a
   real-looking source, which is what production requires. */
const routeStory = {
  headline: "Why the Strait of Hormuz still matters",
  storyType: "geographic",
  countryCode: "IR",
  countryName: "Iran",
  cityName: "Strait of Hormuz",
  coordinates: [56.45, 26.56],
  source: "AP / EIA",
  routePoints: [
    { label: "Hormuz", coordinates: [56.45, 26.56] },
    { label: "India", coordinates: [72.8777, 19.076] },
    { label: "China", coordinates: [121.4737, 31.2304] },
  ],
};

const stormStory = {
  headline: "Cyclone approaches the eastern coast",
  storyType: "weather",
  countryCode: "IN",
  cityName: "Chennai",
  coordinates: [80.27, 13.08],
  source: "IMD bulletin",
  track: [
    { coordinates: [84, 10], status: "observed", label: "T-24" },
    { coordinates: [81, 13], status: "observed", label: "NOW" },
    { coordinates: [79, 16], status: "forecast", label: "+24" },
  ],
};

const quakeStory = {
  headline: "Earthquake hits the region",
  storyType: "breaking",
  countryCode: "JP",
  cityName: "Sendai",
  coordinates: [140.87, 38.27],
  magnitude: 7.1,
  source: "JMA",
};

const tradeStory = {
  headline: "Trade flows shift as supply chains reorganize",
  storyType: "editorial",
  source: "IMF",
  routes: [
    { points: [{ coordinates: [4.4, 51.9] }, { coordinates: [103.8, 1.35] }], value: 38 },
    { points: [{ coordinates: [-46.6, -23.5] }, { coordinates: [36.8, -1.29] }], value: 72 },
  ],
};

const conflictStory = {
  headline: "Conflict zone expands",
  storyType: "breaking",
  source: "UN OCHA",
  affectedCountryCodes: ["EG", "SD"],
};

const noGeoStory = {
  headline: "A purely domestic budget announcement",
  storyType: "statistics",
  source: "Treasury",
};

test("automatic selection is conservative and pattern-driven", () => {
  const route = selectStoryMapAnimation(routeStory, { format: "landscape", mode: "production" });
  assert.equal(route.animationId, "great-circle-route");
  assert.ok(route.data.source.includes("AP / EIA"));

  const storm = selectStoryMapAnimation(stormStory, { format: "portrait", mode: "production" });
  assert.equal(storm.animationId, "storm-track");

  const quake = selectStoryMapAnimation(quakeStory, { format: "landscape", mode: "production" });
  assert.equal(quake.animationId, "earthquake-ripple");

  const trade = selectStoryMapAnimation(tradeStory, { format: "landscape", mode: "production" });
  assert.equal(trade.animationId, "trade-flow-ribbons");

  const conflict = selectStoryMapAnimation(conflictStory, { format: "portrait", mode: "production" });
  assert.equal(conflict.animationId, "conflict-zone-hatch");
});

test("no geography means no map — decoration is rejected", () => {
  const result = selectStoryMapAnimation(noGeoStory, { format: "landscape", mode: "production" });
  assert.equal(result.animationId, null);
  assert.equal(result.reason, "no-verified-geography");
});

test("explicit mapAnimation override wins", () => {
  const story = { ...routeStory, mapAnimation: "city-lock" };
  const result = selectStoryMapAnimation(story, { format: "portrait", mode: "production" });
  assert.equal(result.animationId, "city-lock");
});

test("mapEvidence auto-selects only its validated ID and payload", () => {
  const story = {
    headline: "A verified shipping route is disrupted",
    source: "Verified route ledger",
    mapEvidence: {
      animationId: "route-disruption",
      source: "Verified route ledger",
      data: {
        routes: [{
          points: [{ coordinates: [56.45, 26.56] }, { coordinates: [72.8777, 19.076] }],
          value: 40,
          status: "blocked",
        }],
      },
    },
  };
  const portrait = selectStoryMapAnimation(story, { format: "portrait", mode: "production" });
  const landscape = selectStoryMapAnimation(story, { format: "landscape", mode: "production" });
  assert.equal(portrait.animationId, "route-disruption");
  assert.equal(landscape.animationId, "route-disruption");
  assert.equal(portrait.format, "portrait");
  assert.equal(landscape.format, "landscape");
  assert.deepEqual(portrait.data, landscape.data);
});

test("explicit choices take precedence over mapEvidence", () => {
  const result = selectStoryMapAnimation({
    ...routeStory,
    mapAnimation: "city-lock",
    mapEvidence: { animationId: "route-disruption", source: "Verified route ledger", data: {} },
  }, { format: "landscape", mode: "production" });
  assert.equal(result.animationId, "city-lock");
});

test("invalid mapEvidence fails closed without keyword guessing", () => {
  const result = selectStoryMapAnimation({
    ...routeStory,
    mapEvidence: { animationId: "route-disruption", source: "Verified route ledger", data: { routes: [] } },
  }, { format: "landscape", mode: "production" });
  assert.equal(result.animationId, null);
  assert.equal(result.reason, "map-evidence-route-disruption-not-verifiable");

  const unknown = selectStoryMapAnimation({
    ...routeStory,
    mapEvidence: { animationId: "made-up-map", source: "Verified route ledger", data: {} },
  }, { format: "landscape", mode: "production" });
  assert.equal(unknown.animationId, null);
  assert.equal(unknown.reason, "map-evidence-made-up-map-not-verifiable");
});

test("explicit disablement turns maps off", () => {
  for (const value of [MAP_ANIMATION_NONE, "disabled", false]) {
    const result = selectStoryMapAnimation({ ...routeStory, mapAnimation: value }, { format: "landscape", mode: "production" });
    assert.equal(result.animationId, null, `mapAnimation=${value} should disable`);
  }
  assert.equal(isMapDisabled({ mapAnimation: MAP_ANIMATION_NONE }), true);
  assert.equal(isMapDisabled({ mapAnimation: "disabled" }), true);
  assert.equal(isMapDisabled({ mapAnimation: false }), true);
  assert.equal(isMapDisabled({}), false);
});

test("explicit preset with custom verified mapData is honored", () => {
  const story = {
    ...routeStory,
    mapAnimation: "great-circle-route",
    mapData: {
      route: [
        { name: "Hormuz", coordinates: [56.45, 26.56] },
        { name: "India", coordinates: [72.8777, 19.076] },
      ],
    },
  };
  const result = selectStoryMapAnimation(story, { format: "landscape", mode: "production" });
  assert.equal(result.animationId, "great-circle-route");
  assert.deepEqual(result.data.route.map((point) => point.name), ["Hormuz", "India"]);
});

test("invalid or incomplete geographic data falls back instead of fabricating", () => {
  /* A storm with a bare coordinate but no track must not invent one. */
  const stormNoTrack = selectStoryMapAnimation(
    { ...stormStory, track: undefined },
    { format: "portrait", mode: "production" },
  );
  assert.equal(stormNoTrack.animationId, null);
  assert.ok(["no-verified-geography", "hazard-data-insufficient"].includes(stormNoTrack.reason));

  /* A route with a single point is not a route. */
  const shortRoute = selectStoryMapAnimation(
    { ...routeStory, routePoints: [{ label: "Only stop", coordinates: [10, 20] }] },
    { format: "landscape", mode: "production" },
  );
  assert.equal(shortRoute.animationId, null);

  /* An explicit preset that cannot be satisfied with verified data is rejected. */
  const explicitEmpty = selectStoryMapAnimation(
    { ...noGeoStory, mapAnimation: "storm-track" },
    { format: "landscape", mode: "production" },
  );
  assert.equal(explicitEmpty.animationId, null);
});

test("production mode never accepts the illustrative sample source", () => {
  const result = selectStoryMapAnimation(
    { ...routeStory, source: "Illustrative sample data — not reporting" },
    { format: "landscape", mode: "production" },
  );
  assert.equal(result.animationId, null);
});

test("output is deterministic for a given story and format", () => {
  const first = selectStoryMapAnimation(routeStory, { format: "landscape", mode: "production" });
  const second = selectStoryMapAnimation(routeStory, { format: "landscape", mode: "production" });
  assert.deepEqual(first, second);
  assert.deepEqual(JSON.stringify(first), JSON.stringify(second));
});

test("chapter resolution merges chapter geo with story and honors disablement", () => {
  const story = {
    ...routeStory,
    mapAnimation: "none",
  };
  const disabled = resolveChapterMapAnimation({}, story, { format: "landscape", mode: "production" });
  assert.equal(disabled.animationId, null);

  const chapter = {
    kicker: "01 / THE GATEWAY",
    globe: {
      countryCode: "IR",
      city: "Strait of Hormuz",
      coordinates: [56.45, 26.56],
      routePoints: [
        { label: "Hormuz", coordinates: [56.45, 26.56] },
        { label: "India", coordinates: [72.8777, 19.076] },
      ],
    },
  };
  const resolved = resolveChapterMapAnimation(chapter, routeStory, { format: "landscape", mode: "production" });
  assert.equal(resolved.animationId, "great-circle-route");
});

test("chapter resolution does not let a false override block inherited story geography", () => {
  const chapter = {
    mapAnimation: false,
    globe: {
      countryCode: "IR",
      city: "Strait of Hormuz",
      coordinates: [56.45, 26.56],
    },
  };
  const resolved = resolveChapterMapAnimation(chapter, routeStory, { format: "landscape", mode: "production" });
  assert.equal(resolved.animationId, "great-circle-route");
});

test("both formats resolve the same preset with format-specific framing", () => {
  const portrait = selectStoryMapAnimation(routeStory, { format: "portrait", mode: "production" });
  const landscape = selectStoryMapAnimation(routeStory, { format: "landscape", mode: "production" });
  assert.equal(portrait.animationId, landscape.animationId);
  assert.equal(portrait.format, "portrait");
  assert.equal(landscape.format, "landscape");
  assert.deepEqual(portrait.data, landscape.data);
});
