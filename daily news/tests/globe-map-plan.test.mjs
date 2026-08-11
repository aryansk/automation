import test from "node:test";
import assert from "node:assert/strict";

import {
  getActiveGlobeMapPlanSegment,
  normalizeGlobeMapPlan,
} from "../assets/animations/globe-map-plan.js";
import { resolveMapPlanForScene } from "../assets/animations/globe-map-runtime.js";

const routeStory = {
  headline: "Why the Strait of Hormuz still matters",
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

test("an authored plan maps script sections to stable catalog IDs", () => {
  const plan = normalizeGlobeMapPlan({
    version: 1,
    library: "globe-map-library",
    policy: "required",
    segments: [
      { id: "orientation", scriptSection: "opener", start: 0, animationId: "world-orbit" },
      { id: "route", scriptSection: "why-it-matters", start: 3.5, animationId: "great-circle-route", scriptCue: "The line fans out toward Asia." },
    ],
  }, { duration: 18 });

  assert.equal(plan.valid, true, plan.errors.join("\n"));
  assert.deepEqual(plan.segments.map((segment) => segment.animationId), ["world-orbit", "great-circle-route"]);
  assert.equal(getActiveGlobeMapPlanSegment(plan, 1).id, "orientation");
  assert.equal(getActiveGlobeMapPlanSegment(plan, 4).id, "route");
});

test("production plans reject unknown presets, disabled beats and missing script sections", () => {
  const plan = normalizeGlobeMapPlan({
    segments: [
      { start: 0, animationId: "made-up-preset" },
      { start: 1, animationId: "none", scriptSection: "disabled" },
    ],
  }, { duration: 18 });

  assert.equal(plan.valid, false);
  assert.match(plan.errors.join(" "), /not a registered globe\/map animation/);
  assert.match(plan.errors.join(" "), /cannot disable the library/);
  assert.match(plan.errors.join(" "), /scriptSection is required/);
});

test("the runtime resolves authored beats and stays library-only without a plan", () => {
  const authored = resolveMapPlanForScene({
    story: {
      ...routeStory,
      animationPlan: {
        version: 1,
        library: "globe-map-library",
        policy: "required",
        segments: [
          { id: "open", scriptSection: "opener", start: 0, animationId: "world-orbit" },
          { id: "route", scriptSection: "route", start: 2.4, animationId: "great-circle-route" },
        ],
      },
    },
    format: "landscape",
    mode: "production",
    duration: 18,
  });
  assert.deepEqual(authored.segments.map((segment) => segment.resolved.animationId), ["world-orbit", "great-circle-route"]);

  const fallback = resolveMapPlanForScene({
    story: { headline: "A non-geographic desk note", source: "Desk ledger" },
    format: "portrait",
    mode: "production",
    duration: 18,
  });
  assert.equal(fallback.authored, false);
  assert.equal(fallback.segments[0].resolved.animationId, "world-orbit");

  const illustrative = resolveMapPlanForScene({
    story: { headline: "Sample-only desk note", source: "Illustrative sample data — not reporting" },
    format: "portrait",
    mode: "production",
    duration: 18,
  });
  assert.equal(illustrative.segments[0].resolved.animationId, "world-orbit");
});

test("an authored claim preset reports missing verified data before fallback", () => {
  const result = resolveMapPlanForScene({
    story: {
      headline: "A route without verified points",
      source: "Desk ledger",
      animationPlan: {
        version: 1,
        library: "globe-map-library",
        policy: "required",
        segments: [{ id: "route", scriptSection: "route", start: 0, animationId: "great-circle-route" }],
      },
    },
    format: "landscape",
    mode: "production",
    duration: 18,
  });
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /could not resolve great-circle-route/);
  assert.equal(result.segments[0].resolved.animationId, "world-orbit");
});
