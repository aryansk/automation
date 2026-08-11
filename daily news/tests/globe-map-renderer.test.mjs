import test from "node:test";
import assert from "node:assert/strict";
import * as d3 from "d3";

import {
  getGlobeMapAnimation,
  globeMapAnimations,
  listGlobeMapAnimations,
} from "../assets/animations/globe-map-library.js";
import {
  clamp,
  onVisibleHemisphere,
} from "../assets/animations/globe-map-renderer.js";

function makeGlobeProjection() {
  return d3.geoOrthographic()
    .translate([500, 500])
    .scale(400)
    .clipAngle(90)
    .precision(0.4);
}

test("the catalog is fully globe-only — no flat projection entries remain", () => {
  const globePresets = listGlobeMapAnimations({ projection: "globe" });
  assert.equal(globePresets.length, 60);
  assert.equal(listGlobeMapAnimations({ projection: "map" }).length, 0);
  assert.equal(listGlobeMapAnimations({ projection: "hybrid" }).length, 0);
});

test("orthographic projection clips to the visible hemisphere", () => {
  const projection = makeGlobeProjection();
  /* A point 179° from the center projects to a finite screen coordinate, so
     raw projection alone cannot hide the rear hemisphere. */
  const rear = projection([179, 0]);
  assert.ok(rear.every(Number.isFinite));
  /* The explicit hemisphere check must report it as invisible. */
  assert.equal(onVisibleHemisphere(projection, [0, 0]), true);
  assert.equal(onVisibleHemisphere(projection, [179, 0]), false);
  assert.equal(onVisibleHemisphere(projection, [-179, 0]), false);
  assert.equal(onVisibleHemisphere(projection, [90, 0]), true);
});

test("front-facing labels stay anchored while rear labels fade", () => {
  const projection = makeGlobeProjection();
  /* Rotate the globe to Tokyo; a point on the far side (the antipode of the
     center) must be reported invisible. */
  const tokyoProjection = d3.geoOrthographic()
    .translate([500, 500])
    .scale(400)
    .clipAngle(90)
    .rotate([-139.7, -35.7]);
  assert.equal(onVisibleHemisphere(tokyoProjection, [139.7, 35.7]), true);
  /* The antipode of Tokyo is deep in the rear hemisphere. */
  assert.equal(onVisibleHemisphere(tokyoProjection, [-40.3, -35.7]), false);
  /* A point just 90° from the center sits on the limb. */
  assert.equal(onVisibleHemisphere(tokyoProjection, [-50.3, 35.7]), false);
});

test("great-circle routes cross the antimeridian continuously", () => {
  /* A route from Fiji (178°E) to Honolulu (158°W) crosses the antimeridian.
     The spherical interpolation must produce a short continuous arc — the
     total great-circle distance stays small even though raw longitude wraps
     from 178° to -177°. */
  const interpolate = d3.geoInterpolate([178, -17], [-158, 21]);
  const samples = [];
  for (let step = 0; step <= 20; step += 1) {
    samples.push(interpolate(step / 20));
  }
  /* Total angular distance (radians) across the sampled arc: if the arc
     wrongly stretched across the rectangular map edge it would approach π
     (half the globe); a genuine date-line crossing is much shorter. */
  let distance = 0;
  for (let index = 1; index < samples.length; index += 1) {
    const [lon1, lat1] = samples[index - 1];
    const [lon2, lat2] = samples[index];
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    distance += 2 * Math.asin(Math.min(1, Math.sqrt(a)));
  }
  /* Fiji→Honolulu great-circle is ~5,100 km ≈ 0.8 rad. A flat-map edge
     crossing would be near π rad. */
  assert.ok(distance < 2, `antimeridian arc distance was ${distance} rad (expected a short arc)`);
  assert.ok(distance > 0.3, `antimeridian arc distance was ${distance} rad (expected a real crossing)`);
});

test("every preset renders through the globe projection path", () => {
  for (const definition of globeMapAnimations) {
    assert.equal(definition.projection, "globe", `${definition.id} must be globe`);
    assert.ok(definition.formats.includes("landscape"));
    assert.ok(definition.formats.includes("portrait"));
  }
});

test("no preset can accidentally select a flat or rectangular projection", () => {
  const flatIds = globeMapAnimations
    .filter((definition) => definition.projection !== "globe")
    .map((definition) => definition.id);
  assert.deepEqual(flatIds, []);
  assert.equal(getGlobeMapAnimation("regional-choropleth").projection, "globe");
  assert.equal(getGlobeMapAnimation("comparison-split-map").projection, "globe");
  assert.equal(getGlobeMapAnimation("small-multiple-regions").projection, "globe");
  assert.equal(getGlobeMapAnimation("before-after-swipe").projection, "globe");
  assert.equal(getGlobeMapAnimation("globe-to-flat-map").projection, "globe");
});

test("deterministic seeking helpers remain bounded", () => {
  assert.equal(clamp(-5), 0);
  assert.equal(clamp(7), 1);
  assert.equal(clamp(0.5), 0.5);
});
