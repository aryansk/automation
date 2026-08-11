import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");

test("production map runtimes keep the historical globe visible", () => {
  for (const path of [
    "../assets/globe-tour-renderer.js",
    "../assets/story-explainer-renderer.js",
  ]) {
    const source = read(path);
    assert.match(source, /createGlobeTour/);
    assert.match(source, /drawGlobeSurface:\s*false/);
    assert.match(source, /showRouteLayers:\s*false/);
    assert.doesNotMatch(source, /showCountryHighlights:\s*false/);
    assert.match(source, /tour\.renderAt\(time\)|globe\.renderAt\(time\)/);
    assert.doesNotMatch(source, /globeCanvas\.style\.display\s*=\s*["']none["']/);
  }
});

test("showcase and sample compositions use transparent annotations over the historical globe", () => {
  for (const path of [
    "../assets/animations/globe-map-showcase.js",
    "../assets/animations/globe-sample.js",
  ]) {
    const source = read(path);
    assert.match(source, /createHistoricalGlobeGallery/);
    assert.match(source, /createGlobeNativeAnnotationRenderer/);
    assert.match(source, /historicalGlobe\.renderAt/);
    assert.match(source, /renderer\.render\([^;]*view/);
  }
});

test("native annotations receive the historical globe camera view", () => {
  const runtime = read("../assets/animations/globe-map-runtime.js");
  const tour = read("../assets/animations/globe-tour.js");
  assert.match(runtime, /createGlobeNativeAnnotationRenderer/);
  assert.match(runtime, /segment\.resolved\.data, view/);
  assert.match(tour, /projectCoordinate/);
  assert.match(tour, /return Object\.freeze\(\{\s*time: lastTime/);
});

test("the historical globe texture stays local and module-relative", () => {
  const source = read("../assets/animations/globe.js");
  assert.match(source, /new URL\("\.\.\/textures\/earth-day\.jpg", import\.meta\.url\)/);
  assert.match(source, /new URL\("\.\.\/textures\/earth-clouds\.jpg", import\.meta\.url\)/);
  assert.match(source, /new URL\("\.\.\/textures\/earth-normal\.png", import\.meta\.url\)/);
});
