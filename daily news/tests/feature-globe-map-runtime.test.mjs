import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  createFeatureGlobeMapRuntime,
  getFeatureGlobeAnimationOptions,
  mergeFeatureGlobeSelection,
} from "../assets/animations/feature-globe-map-runtime.js";
import { resolveMapPlanForScene } from "../assets/animations/globe-map-runtime.js";
import { globeMapAnimations } from "../assets/animations/globe-map-library.js";

const verifiedSource = "Verified feature reporting ledger";
const routeChapter = {
  animationId: "great-circle-route",
  mapSource: verifiedSource,
  globe: {
    countryCode: "IR",
    coordinates: [56.45, 26.56],
    routePoints: [
      { label: "HORMUZ", coordinates: [56.45, 26.56] },
      { label: "MUMBAI", coordinates: [72.8777, 19.076] },
    ],
  },
};

test("feature render options expose every globe-only preset in both formats", () => {
  const portrait = getFeatureGlobeAnimationOptions("portrait");
  const landscape = getFeatureGlobeAnimationOptions("landscape");
  assert.equal(portrait.length, globeMapAnimations.length);
  assert.equal(landscape.length, globeMapAnimations.length);
  assert.deepEqual(portrait.map((option) => option.id), landscape.map((option) => option.id));
  assert.ok(portrait.every((option) => option.projection === "globe"));
  assert.ok(portrait.every((option) => !Object.hasOwn(option, "sample")));
});

test("feature chapter animationId is an explicit selection alias", () => {
  const plan = resolveMapPlanForScene({
    chapter: routeChapter,
    story: { source: verifiedSource, sources: [{ label: verifiedSource }] },
    format: "landscape",
    mode: "production",
    duration: 18,
    requireLibrary: true,
  });
  assert.equal(plan.valid, true);
  assert.equal(plan.segments[0].resolved.animationId, "great-circle-route");
});

test("feature runtime resolves the selected plan before a canvas is available", () => {
  const runtime = createFeatureGlobeMapRuntime({
    canvas: null,
    story: { source: verifiedSource, sources: [{ label: verifiedSource }] },
    chapters: [routeChapter],
    starts: [0],
    chapterEnd: () => 12,
    format: "landscape",
  });
  assert.equal(runtime.availableAnimations.length, 60);
  assert.equal(runtime.selected[0].ids[0], "great-circle-route");
  assert.equal(runtime.layer, null);
});

test("feature render override applies to unconfigured chapters while authored choices win", () => {
  const selection = mergeFeatureGlobeSelection({
    story: { headline: "Feature", source: verifiedSource },
    chapters: [
      { title: "Default beat" },
      { title: "Authored beat", mapAnimation: "city-lock" },
      { title: "Authored plan", animationPlan: { version: 1, library: "globe-map-library", policy: "required", segments: [{ id: "beat", scriptSection: "beat", start: 0, animationId: "world-orbit" }] } },
    ],
    animationId: "country-lock",
  });
  assert.equal(selection.chapters[0].mapAnimation, "country-lock");
  assert.equal(selection.chapters[1].mapAnimation, "city-lock");
  assert.equal(selection.chapters[2].animationPlan.segments[0].animationId, "world-orbit");
});

test("all feature compositions declare the same selectable globe inputs", () => {
  const projects = [
    "rare-earth-explainer",
    "ai-electricity-explainer",
    "landscape-trend-explainer",
    "trade-trend-explainer",
    "story-explainer-landscape",
  ];
  for (const project of projects) {
    const html = readFileSync(`${project}/index.html`, "utf8");
    for (const id of ["globeAnimationId", "globeAnimationPlan", "globeMapData", "globeMapSource"]) {
      assert.match(html, new RegExp(`\\"id\\":\\"${id}\\"`), `${project} must expose ${id}`);
    }
  }
});
