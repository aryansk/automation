/*
 * Shared deterministic math for every globe/map animation.
 *
 * All helpers are pure, side-effect-free and seeded only by the caller's
 * `time` argument. No Date.now(), Math.random() or layout reads.
 * Extracted so the Three.js globe, the native annotation renderer and the
 * legacy D3 helper share one implementation.
 */

export function clamp(value, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, Number(value) || 0));
}

export const clamp01 = clamp;

export function mix(from, to, progress) {
  return Number(from) + (Number(to) - Number(from)) * clamp(progress);
}

export function mixUnclamped(from, to, progress) {
  return Number(from) + (Number(to) - Number(from)) * Number(progress);
}

export function smootherstep(edge0, edge1, value) {
  if (edge0 === edge1) return value >= edge1 ? 1 : 0;
  const x = clamp((value - edge0) / (edge1 - edge0));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

export function smooth(value) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

export function easeOutCubic(value) {
  const x = clamp(value);
  return 1 - (1 - x) ** 3;
}

export function easeOutQuint(value) {
  const x = clamp(value);
  return 1 - (1 - x) ** 5;
}

export function easeInOutQuint(value) {
  const x = clamp(value);
  return x < 0.5 ? 16 * x ** 5 : 1 - (-2 * x + 2) ** 5 / 2;
}

export function lerpAngle(from, to, t) {
  let delta = Number(to) - Number(from);
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return Number(from) + delta * clamp(t);
}
