import test from "node:test";
import assert from "node:assert/strict";

import {
  globeMapAnimations,
  validateGlobeMapAnimationConfig,
} from "../assets/animations/globe-map-library.js";
import { createGlobeNativeAnnotationRenderer } from "../assets/animations/globe-native-annotation-renderer.js";

function makeContext() {
  return {
    save() {},
    restore() {},
    clearRect() {},
    beginPath() {},
    closePath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    fill() {},
    fillRect() {},
    arc() {},
    fillText() {},
    measureText(value) { return { width: String(value).length * 9 }; },
    setLineDash() {},
  };
}

function makeView() {
  return {
    center: { x: 540, y: 960 },
    globeRadiusPx: 480,
    projectRadiusKm(radiusKm) { return Math.max(8, Number(radiusKm) || 8); },
    projectCoordinate(coordinates) {
      const longitude = Number(coordinates?.[0]) || 0;
      const latitude = Number(coordinates?.[1]) || 0;
      return {
        x: 540 + longitude * 2,
        y: 960 - latitude * 2,
        depth: 0,
        visible: true,
        coordinates: [longitude, latitude],
        center: this.center,
      };
    },
  };
}

test("every catalog sample renders through the historical-globe annotation API", () => {
  const canvas = {
    width: 1080,
    height: 1920,
    getContext() { return makeContext(); },
  };
  const renderer = createGlobeNativeAnnotationRenderer({
    canvas,
    features: [],
    width: 1080,
    height: 1920,
    format: "portrait",
  });

  for (const definition of globeMapAnimations) {
    const sample = validateGlobeMapAnimationConfig(definition.id).config;
    assert.doesNotThrow(
      () => renderer.render(definition.id, definition.duration * 0.78, sample, makeView()),
      definition.id,
    );
  }
});

test("the native renderer clears and reports unavailable without a globe view", () => {
  let clearCount = 0;
  const canvas = {
    width: 1920,
    height: 1080,
    getContext() {
      const context = makeContext();
      context.clearRect = () => { clearCount += 1; };
      return context;
    },
  };
  const renderer = createGlobeNativeAnnotationRenderer({ canvas, features: [] });
  const result = renderer.render(
    "world-orbit",
    1,
    validateGlobeMapAnimationConfig("world-orbit").config,
  );
  assert.equal(result.unavailable, true);
  assert.equal(clearCount, 1);
});
