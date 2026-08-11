import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

import { validateGlobeMapSequence } from "../scripts/validate-globe-map-sequence.mjs";

const example = JSON.parse(fs.readFileSync(
  new URL("../stories/templates/globe-map-sequence.example.json", import.meta.url),
  "utf8",
));
const v11Example = JSON.parse(fs.readFileSync(
  new URL("../stories/templates/globe-map-sequence-v1.1.example.json", import.meta.url),
  "utf8",
));

test("the checked-in sample sequence is contiguous and valid", () => {
  const result = validateGlobeMapSequence(example);
  assert.equal(result.valid, true, result.errors.join("\n"));
  assert.equal(result.sceneCount, 6);
  assert.equal(result.duration, 30.4);
  assert.deepEqual(result.warnings, []);
});

test("the v1.1 sample evidence sequence validates every new payload family", () => {
  const result = validateGlobeMapSequence(v11Example);
  assert.equal(result.valid, true, result.errors.join("\n"));
  assert.equal(result.sceneCount, 12);
  assert.equal(result.duration, 68.8);
  assert.deepEqual(result.warnings, []);
});

test("the legacy v1.0 sequence remains accepted", () => {
  assert.equal(validateGlobeMapSequence({ ...example, libraryVersion: "1.0.0" }).valid, true);
});

test("production mode rejects illustrative sources", () => {
  const result = validateGlobeMapSequence({
    ...example,
    mode: "production",
    scenes: [example.scenes[0]],
  });
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /replace the illustrative sample source/);
});

test("the sequence gate catches overlaps and unknown animation IDs", () => {
  const result = validateGlobeMapSequence({
    ...example,
    scenes: [
      example.scenes[0],
      { ...example.scenes[1], start: 2 },
      { ...example.scenes[2], start: 9, animation: "made-up-map" },
    ],
  });
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /overlaps the previous scene/);
  assert.match(result.errors.join(" "), /Unknown globe\/map animation/);
});
