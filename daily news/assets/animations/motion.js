const ENTRY_PRESETS = Object.freeze({
  "editorial-rise": { from: { y: 42, opacity: 0 }, to: { y: 0, opacity: 1 }, ease: "power3.out" },
  "editorial-slide": { from: { x: -54, opacity: 0 }, to: { x: 0, opacity: 1 }, ease: "power4.out" },
  "camera-push": { from: { scale: 0.92, opacity: 0 }, to: { scale: 1, opacity: 1 }, ease: "expo.out" },
  "hard-cut": { from: { opacity: 0 }, to: { opacity: 1 }, ease: "steps(1)" },
  "quiet-fade": { from: { opacity: 0 }, to: { opacity: 1 }, ease: "sine.out" },
});

const EXIT_PRESETS = Object.freeze({
  "editorial-fade": { to: { opacity: 0, y: -24 }, ease: "power2.in" },
  "editorial-slide": { to: { opacity: 0, x: 58 }, ease: "power3.in" },
  "camera-pull": { to: { opacity: 0, scale: 1.04 }, ease: "power2.in" },
  "hard-cut": { to: { opacity: 0 }, ease: "steps(1)" },
  "quiet-fade": { to: { opacity: 0 }, ease: "sine.in" },
});

export function addAnimationMotion(timeline, target, config = {}, start = 0) {
  if (!timeline || !target) return timeline;
  const reduced = config.reducedMotion === true || config.reducedMotion === "always";
  const totalDuration = Math.max(0.4, Number(config.duration || 4));
  const entrance = ENTRY_PRESETS[config.entry] || ENTRY_PRESETS["editorial-rise"];
  const exit = EXIT_PRESETS[config.exit] || EXIT_PRESETS["editorial-fade"];
  const enterDuration = reduced ? 0.01 : Math.min(0.65, totalDuration * 0.18);
  const exitDuration = reduced ? 0.01 : Math.min(0.5, totalDuration * 0.15);
  const exitStart = start + totalDuration - exitDuration;

  timeline.fromTo(
    target,
    reduced ? { opacity: 0 } : entrance.from,
    {
      ...(reduced ? { opacity: 1 } : entrance.to),
      duration: enterDuration,
      ease: reduced ? "none" : entrance.ease,
      immediateRender: false,
    },
    start,
  );
  timeline.to(
    target,
    {
      ...exit.to,
      duration: exitDuration,
      ease: reduced ? "none" : exit.ease,
    },
    exitStart,
  );
  return timeline;
}

export function addNumberCount(timeline, element, value, start, duration = 1.1, formatter) {
  const numeric = Number(value);
  if (!timeline || !element || !Number.isFinite(numeric)) return timeline;
  const proxy = { value: 0 };
  const format = formatter || ((next) => Math.round(next).toLocaleString("en-US"));
  timeline.to(proxy, {
    value: numeric,
    duration,
    ease: "power3.out",
    onUpdate: () => {
      element.textContent = format(proxy.value);
    },
  }, start);
  return timeline;
}

export const motionPresets = Object.freeze({
  entries: ENTRY_PRESETS,
  exits: EXIT_PRESETS,
});
