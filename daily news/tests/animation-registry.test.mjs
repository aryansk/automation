import test from "node:test";
import assert from "node:assert/strict";

import {
  animationDefaults,
  animationRegistry,
  createAnimationDescriptor,
} from "../assets/animations/registry.js";
import {
  chooseStoryAnimation,
  normalizeStoryMetadata,
} from "../assets/animations/story-selector.js";
import { hasAnimationRenderer } from "../assets/animations/components.js";

test("registry exposes every documented reusable animation", () => {
  const definitions = animationRegistry.list();
  assert.equal(definitions.length, 27);
  definitions.forEach((definition) => {
    assert.equal(typeof definition.type, "string");
    assert.equal(typeof definition.category, "string");
    assert.equal(hasAnimationRenderer(definition.type), true, `${definition.type} needs a renderer`);
  });
});

test("every descriptor receives the shared configuration contract", () => {
  const descriptor = createAnimationDescriptor({
    type: "headline-reveal",
    headline: "A verified headline",
  });
  for (const key of Object.keys(animationDefaults)) {
    assert.ok(key in descriptor.config, `shared config key ${key} is missing`);
  }
  assert.equal(descriptor.valid, true);
  assert.equal(descriptor.config.safeArea, "vertical");
  assert.equal(descriptor.config.reducedMotion, "respect");
});

test("aliases resolve to stable canonical names", () => {
  const descriptor = createAnimationDescriptor({
    type: "stat-counter",
    value: "68%",
    label: "support",
  });
  assert.equal(descriptor.definition.type, "statistic-counter");
  assert.equal(descriptor.valid, true);
});

test("story metadata chooses numeric, comparison and quote visuals", () => {
  assert.equal(normalizeStoryMetadata({ storyType: "stats" }).visualType, "statistic-counter");
  assert.equal(
    normalizeStoryMetadata({
      comparisonLeftValue: "68",
      comparisonRightValue: "42",
    }).storyType,
    "comparison",
  );
  assert.equal(normalizeStoryMetadata({ quoteText: "A quote" }).visualType, "quote-card");
});

test("financial metadata preserves direction, period and source-ready values", () => {
  const animation = chooseStoryAnimation({
    storyType: "financial",
    headline: "Markets close higher",
    marketSymbol: "NIFTY 50",
    marketValue: "24,611",
    marketChange: "+1.8%",
    marketPeriod: "1D",
    source: "Exchange close",
  });
  assert.equal(animation.type, "market-movement");
  assert.equal(animation.symbol, "NIFTY 50");
  assert.equal(animation.change, "+1.8%");
  assert.equal(animation.data.period, "1D");
  assert.equal(animation.source, "Exchange close");
});

test("malformed optional JSON degrades to an empty deterministic value", () => {
  const metadata = normalizeStoryMetadata({
    storyType: "timeline",
    timelineEvents: "{not-json",
    coordinates: "[77.2, 28.6]",
  });
  assert.deepEqual(metadata.timelineEvents, []);
});
