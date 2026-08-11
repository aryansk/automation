import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

import {
  isMapDisabled,
  resolveChapterMapAnimation,
} from "../assets/animations/globe-map-selector.js";

function loadDemo(slug) {
  return JSON.parse(fs.readFileSync(new URL(`../stories/${slug}.json`, import.meta.url), "utf8"));
}

const routeDemo = loadDemo("demo-route-hormuz-reopening");
const stormDemo = loadDemo("demo-storm-cyclone-track");

test("route demo story carries an explicit verified map configuration", () => {
  assert.equal(routeDemo.mapAnimation, "great-circle-route");
  assert.ok(!isMapDisabled(routeDemo));
  assert.match(routeDemo.mapSource, /illustrative demo source/i);
  assert.ok(Array.isArray(routeDemo.mapData.route));
  assert.ok(routeDemo.mapData.route.length >= 2);
  /* Illustrative demo data must still carry a real-looking source and never
     the built-in library sample source. */
  assert.ok(!/illustrative sample data/i.test(routeDemo.mapSource));
});

test("storm demo story carries an explicit verified map configuration", () => {
  assert.equal(stormDemo.mapAnimation, "storm-track");
  assert.ok(!isMapDisabled(stormDemo));
  assert.ok(Array.isArray(stormDemo.mapData.track));
  assert.ok(stormDemo.mapData.track.length >= 2);
  assert.ok(stormDemo.mapData.track.some((point) => point.status === "observed"));
  assert.ok(stormDemo.mapData.track.some((point) => point.status === "forecast"));
});

test("route demo chapters all resolve to the great-circle preset in landscape", () => {
  const resolved = routeDemo.chapters.map((chapter) => resolveChapterMapAnimation(chapter, routeDemo, {
    format: "landscape",
    mode: "production",
  }));
  assert.deepEqual(resolved.map((r) => r.animationId), ["great-circle-route", "great-circle-route"]);
  for (const r of resolved) {
    assert.equal(r.format, "landscape");
    assert.ok(r.data.source.length > 0);
  }
});

test("storm demo chapters all resolve to the storm-track preset in portrait", () => {
  const resolved = stormDemo.chapters.map((chapter) => resolveChapterMapAnimation(chapter, stormDemo, {
    format: "portrait",
    mode: "production",
  }));
  assert.deepEqual(resolved.map((r) => r.animationId), ["storm-track", "storm-track"]);
  for (const r of resolved) {
    assert.equal(r.format, "portrait");
    assert.ok(r.data.track.length >= 2);
  }
});

test("demo resolution is deterministic", () => {
  const first = routeDemo.chapters.map((chapter) => JSON.stringify(resolveChapterMapAnimation(chapter, routeDemo, { format: "landscape", mode: "production" })));
  const second = routeDemo.chapters.map((chapter) => JSON.stringify(resolveChapterMapAnimation(chapter, routeDemo, { format: "landscape", mode: "production" })));
  assert.deepEqual(first, second);
});
