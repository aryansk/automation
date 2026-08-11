#!/usr/bin/env node

import { listGlobeMapAnimations } from "../assets/animations/globe-map-library.js";

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback = "") => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith("--")
    ? args[index + 1]
    : fallback;
};

const animations = listGlobeMapAnimations({
  category: option("category"),
  family: option("family"),
  format: option("format"),
});

if (flag("json")) {
  console.log(JSON.stringify(animations, null, 2));
} else {
  console.log("Globe-map library presets (use animationId in animationPlan segments)\n");
  animations.forEach((animation) => {
    console.log(`${animation.id.padEnd(28)} ${animation.category.padEnd(12)} ${animation.title} — ${animation.useWhen}`);
  });
  console.log(`\n${animations.length} preset${animations.length === 1 ? "" : "s"}`);
}
