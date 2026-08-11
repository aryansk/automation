import {
  getGlobeMapAnimation,
  validateGlobeMapAnimationConfig,
} from "./globe-map-library.js";
import { EARTH_RADIUS, latLonVector } from "./globe.js";
import { clamp, smooth } from "./animation-math.js";

const EARTH_RADIUS_KM = 6371;
const COLORS = Object.freeze({
  accent: "#d49352",
  live: "#e37568",
  paper: "#f5f0df",
  copy: "#d8e1d4",
  muted: "#789488",
  blue: "#9fc7bd",
  dark: "rgba(25,53,45,0.86)",
});

export { clamp, smooth } from "./animation-math.js";
const reveal = (progress, start = 0, end = 0.72) => smooth((progress - start) / Math.max(0.001, end - start));
const TAU = Math.PI * 2;
const oscillate = (progress, phase = 0, cycles = 1) => 0.5 + 0.5 * Math.sin(clamp(progress) * TAU * cycles + phase);
const wrapUnit = (value) => ((Number(value) || 0) % 1 + 1) % 1;

function coordinates(value) {
  const candidate = Array.isArray(value) ? value : value?.coordinates;
  if (!Array.isArray(candidate) || candidate.length !== 2) return null;
  const point = candidate.map(Number);
  return point.every(Number.isFinite) ? point : null;
}

function point(value) {
  const parsed = coordinates(value);
  return parsed ? { ...(Array.isArray(value) ? {} : value), coordinates: parsed } : null;
}

function points(value) {
  return Array.isArray(value) ? value.map(point).filter(Boolean) : [];
}

function routePoints(route) {
  return points(route?.points || route);
}

function featureCode(feature) {
  return String(feature?.properties?.code || feature?.properties?.iso_a2 || "").toUpperCase();
}

function featureCollection(features) {
  const list = Array.isArray(features) ? features : features?.features || [];
  return {
    list,
    byCode: new Map(list.map((feature) => [featureCode(feature), feature]).filter(([code]) => code)),
  };
}

function routeSets(config) {
  const sets = [];
  if (Array.isArray(config?.beforeRoutes)) {
    sets.push(...config.beforeRoutes.map((route) => ({ ...route, points: routePoints(route), phase: "before" })));
  }
  if (Array.isArray(config?.afterRoutes)) {
    sets.push(...config.afterRoutes.map((route) => ({ ...route, points: routePoints(route), phase: "after" })));
  }
  if (Array.isArray(config?.routes)) {
    sets.push(...config.routes.map((route) => ({ ...route, points: routePoints(route) })));
  } else if (Array.isArray(config?.route)) {
    sets.push({ points: routePoints(config.route), value: 1 });
  }
  if (Array.isArray(config?.line)) sets.push({ points: points(config.line), value: config.value });
  if (Array.isArray(config?.track)) sets.push({ points: points(config.track), value: 1 });
  if (Array.isArray(config?.observed)) sets.push({ points: points(config.observed), status: "observed", value: 1 });
  if (Array.isArray(config?.forecast)) sets.push({ points: points(config.forecast), status: "forecast", value: 1 });

  if (Array.isArray(config?.nodes) && Array.isArray(config?.links)) {
    const byId = new Map(config.nodes.map((node) => [String(node.id), node]));
    config.links.forEach((link) => {
      const from = byId.get(String(link.from));
      const to = byId.get(String(link.to));
      if (from && to) sets.push({ points: [point(from), point(to)].filter(Boolean), ...link });
    });
  }

  if (Array.isArray(config?.sources) && Array.isArray(config?.sinks) && Array.isArray(config?.flows)) {
    const byId = new Map([...config.sources, ...config.sinks].map((node) => [String(node.id), node]));
    config.flows.forEach((flow) => {
      const from = byId.get(String(flow.from));
      const to = byId.get(String(flow.to));
      if (from && to) sets.push({ points: [point(from), point(to)].filter(Boolean), ...flow });
    });
  }

  return sets.filter((route) => route.points.length >= 2);
}

function countryCodes(config) {
  const codes = [
    ...(Array.isArray(config?.countryCodes) ? config.countryCodes : []),
    ...Object.keys(config?.values || {}),
    ...Object.keys(config?.results || {}),
    ...Object.keys(config?.target ? { [config.target.code]: true } : {}),
  ];
  return codes
    .map((code) => String(code || "").trim().toUpperCase())
    .filter((code, index, values) => code && values.indexOf(code) === index);
}

function statusColor(status) {
  const value = String(status || "active").toLowerCase();
  if (["blocked", "failed", "offline", "unverified", "negative"].includes(value)) return COLORS.live;
  if (["detour", "pending", "forecast", "reported", "review"].includes(value)) return COLORS.accent;
  if (["exempt", "inactive"].includes(value)) return COLORS.muted;
  return COLORS.paper;
}

function maxValue(values) {
  const numbers = values.map((value) => Math.abs(Number(value) || 0)).filter(Number.isFinite);
  return Math.max(1, ...numbers);
}

function arcSamples(from, to, count = 28) {
  const start = latLonVector(from[0], from[1], 1).normalize();
  const end = latLonVector(to[0], to[1], 1).normalize();
  const angle = start.angleTo(end);
  if (!Number.isFinite(angle) || angle < 0.0001) return [from, to];
  const sinAngle = Math.sin(angle);
  const result = [];
  for (let index = 0; index <= count; index += 1) {
    const t = index / count;
    const first = Math.sin((1 - t) * angle) / sinAngle;
    const second = Math.sin(t * angle) / sinAngle;
    const vector = start.clone().multiplyScalar(first).add(end.clone().multiplyScalar(second)).normalize();
    const latitude = Math.asin(vector.y) * 180 / Math.PI;
    const longitude = Math.atan2(vector.z, -vector.x) * 180 / Math.PI - 180;
    result.push([longitude, latitude]);
  }
  return result;
}

const arcSamplesCache = new Map();
const ARC_CACHE_LIMIT = 192;

function cachedArcSamples(from, to, count) {
  const key = `${from[0].toFixed(4)},${from[1].toFixed(4)}:${to[0].toFixed(4)},${to[1].toFixed(4)}:${count}`;
  const hit = arcSamplesCache.get(key);
  if (hit) return hit;
  const value = arcSamples(from, to, count);
  if (arcSamplesCache.size >= ARC_CACHE_LIMIT) {
    const firstKey = arcSamplesCache.keys().next().value;
    arcSamplesCache.delete(firstKey);
  }
  arcSamplesCache.set(key, value);
  return value;
}

function expandedPath(route) {
  const result = [];
  route.forEach((entry, index) => {
    if (index === 0) result.push(entry.coordinates);
    else result.push(...cachedArcSamples(route[index - 1].coordinates, entry.coordinates, 24).slice(1));
  });
  return result;
}

function interpolateProjected(pointsList, progress) {
  if (!pointsList.length) return null;
  const scaled = clamp(progress) * (pointsList.length - 1);
  const lowerIndex = Math.floor(scaled);
  const upperIndex = Math.min(pointsList.length - 1, lowerIndex + 1);
  const mix = scaled - lowerIndex;
  const lower = pointsList[lowerIndex];
  const upper = pointsList[upperIndex];
  return {
    x: lower.x + (upper.x - lower.x) * mix,
    y: lower.y + (upper.y - lower.y) * mix,
  };
}

function drawFlowParticles(state, segments, progress, options = {}) {
  const usableSegments = segments.filter((segment) => segment.length > 1);
  if (!usableSegments.length) return;
  const count = Math.max(1, Math.min(4, Math.round(Number(options.count) || 1)));
  const speed = Number(options.speed || 1);
  const phase = Number(options.phase || 0);
  const color = options.color || COLORS.paper;
  const radius = Math.max(1.5, Number(options.radius || 3));
  const alpha = Number(options.alpha ?? 0.8);
  const ctx = state.ctx;
  usableSegments.forEach((segment, segmentIndex) => {
    for (let index = segmentIndex; index < count; index += usableSegments.length) {
      const travel = wrapUnit(clamp(progress) * speed + phase + index / count);
      const projected = interpolateProjected(segment, travel);
      const previous = interpolateProjected(segment, wrapUnit(travel - 0.055));
      if (!projected || !previous) continue;
      const shimmer = 0.86 + oscillate(progress, phase + index * 0.45, 1.4) * 0.14;
      ctx.save();
      ctx.lineCap = "round";
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, radius * 1.05);
      ctx.globalAlpha = alpha * 0.34;
      ctx.beginPath();
      ctx.moveTo(previous.x, previous.y);
      ctx.lineTo(projected.x, projected.y);
      ctx.stroke();
      ctx.globalAlpha = alpha * shimmer;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(projected.x, projected.y, radius, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  });
}

function lineColor(route, fallback = COLORS.accent) {
  if (route.phase === "before") return COLORS.muted;
  if (route.phase === "after") return COLORS.accent;
  return statusColor(route.status) || fallback;
}

function drawProjectedPath(state, route, progress, options = {}) {
  const path = expandedPath(route);
  if (path.length < 2) return [];
  const ctx = state.ctx;
  const visiblePoints = [];
  const visibleSegments = [];
  const count = Math.max(1, Math.floor(path.length * clamp(progress)));
  ctx.save();
  ctx.globalAlpha = Number(options.alpha ?? 0.92);
  ctx.strokeStyle = options.color || lineColor(route);
  ctx.lineWidth = Number(options.width || 3);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (options.dash) ctx.setLineDash(options.dash);
  if (options.glow && count > 2) {
    ctx.shadowColor = options.color || COLORS.accent;
    ctx.shadowBlur = 12;
  }
  ctx.beginPath();
  let drawing = false;
  let currentSegment = [];
  for (let index = 0; index < count; index += 1) {
    const projected = state.view.projectCoordinate(path[index], 1.018);
    if (!projected || !projected.visible) {
      if (currentSegment.length > 1) visibleSegments.push(currentSegment);
      currentSegment = [];
      drawing = false;
      continue;
    }
    visiblePoints.push(projected);
    currentSegment.push(projected);
    if (!drawing) {
      ctx.moveTo(projected.x, projected.y);
      drawing = true;
    } else {
      ctx.lineTo(projected.x, projected.y);
    }
  }
  if (currentSegment.length > 1) visibleSegments.push(currentSegment);
  ctx.stroke();
  ctx.restore();
  if (options.particles && visibleSegments.length) {
    drawFlowParticles(state, visibleSegments, progress, {
      count: options.particles,
      speed: options.particleSpeed,
      phase: options.particlePhase,
      color: options.particleColor || options.color || lineColor(route),
      radius: options.particleRadius,
      alpha: options.particleAlpha ?? options.alpha ?? 0.8,
    });
  }
  return visiblePoints;
}

function drawMarker(state, projected, progress, options = {}) {
  if (!projected?.visible) return;
  const ctx = state.ctx;
  const alpha = clamp(progress) * Number(options.alpha ?? 1);
  const radius = Number(options.radius || 5);
  const ring = Number(options.ring || radius * 2.4);
  const color = options.color || COLORS.accent;
  const phase = Number(options.phase || 0);
  const bounce = clamp(Number(options.bounce || 0));
  const motion = oscillate(progress, phase, Number(options.cycles || 1));
  const markerRadius = radius * (1 - bounce * 0.08 + motion * bounce * 0.16);
  const markerRing = ring * (1 - bounce * 0.04 + motion * bounce * 0.08);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = color;
  ctx.shadowBlur = options.glow === false ? 0 : 12;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(projected.x, projected.y, markerRadius, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(projected.x, projected.y, markerRing, 0, TAU);
  ctx.stroke();
  if (options.pulse) {
    const pulseProgress = clamp(Number(options.pulse) || clamp(progress));
    const pulseWave = oscillate(progress, phase + 0.35, 1.6);
    const pulse = markerRing + pulseProgress * 20 + pulseWave * 6;
    ctx.globalAlpha = alpha * (0.18 + pulseWave * 0.16);
    ctx.beginPath();
    ctx.arc(projected.x, projected.y, pulse, 0, TAU);
    ctx.stroke();
  }
  if (options.orbit) {
    const orbit = options.orbit === true ? {} : options.orbit;
    const orbitRadius = Number(orbit?.radius || markerRing + 18);
    const orbitPhase = Number(orbit?.phase ?? phase);
    const orbitCycles = Number(orbit?.cycles || 0.8);
    const orbitAngle = orbitPhase + clamp(progress) * TAU * orbitCycles;
    ctx.globalAlpha = alpha * 0.24;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 7]);
    ctx.beginPath();
    ctx.arc(projected.x, projected.y, orbitRadius, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = alpha * 0.92;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(
      projected.x + Math.cos(orbitAngle) * orbitRadius,
      projected.y + Math.sin(orbitAngle) * orbitRadius,
      Math.max(2, markerRadius * 0.58),
      0,
      TAU,
    );
    ctx.fill();
  }
  ctx.restore();
  if (options.label) placeLabel(state, projected, options.label, color, alpha);
}

function placeLabel(state, projected, text, color, alpha) {
  if (!projected?.visible || !text) return;
  const ctx = state.ctx;
  const size = state.format === "portrait" ? 20 : 16;
  ctx.save();
  ctx.font = `700 ${size}px "IBM Plex Mono", monospace`;
  const label = String(text).toUpperCase();
  const textWidth = ctx.measureText(label).width;
  const width = textWidth + 18;
  const height = size + 14;
  const center = state.view.center;
  const dx = projected.x - center.x;
  const dy = projected.y - center.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const inward = { x: -dx / length, y: -dy / length };
  const candidates = [
    { x: projected.x + inward.x * 22, y: projected.y + inward.y * 22 - height / 2 },
    { x: projected.x + 18, y: projected.y - height - 10 },
    { x: projected.x - width - 18, y: projected.y - height - 10 },
    { x: projected.x + 18, y: projected.y + 10 },
    { x: projected.x - width - 18, y: projected.y + 10 },
  ];
  const safe = candidates.find((candidate) => {
    const box = { x: candidate.x, y: candidate.y, width, height };
    const distance = Math.hypot(candidate.x + width / 2 - center.x, candidate.y + height / 2 - center.y);
    return distance < state.view.globeRadiusPx * 0.94
      && box.x > 18 && box.y > 18 && box.x + box.width < state.width - 18 && box.y + box.height < state.height - 18
      && !state.safeRects.some((rect) => (
        box.x < rect.x + rect.width
        && box.x + box.width > rect.x
        && box.y < rect.y + rect.height
        && box.y + box.height > rect.y
      ))
      && state.labels.every((other) => box.x > other.x + other.width + 8 || box.x + box.width + 8 < other.x || box.y > other.y + other.height + 8 || box.y + box.height + 8 < other.y);
  });
  if (!safe) {
    ctx.restore();
    return;
  }
  state.labels.push({ x: safe.x, y: safe.y, width, height });
  ctx.globalAlpha = alpha * 0.96;
  ctx.fillStyle = COLORS.dark;
  ctx.fillRect(safe.x, safe.y, width, height);
  ctx.fillStyle = color;
  ctx.fillRect(safe.x, safe.y, 4, height);
  ctx.fillStyle = COLORS.paper;
  ctx.textBaseline = "middle";
  ctx.fillText(label, safe.x + 10, safe.y + height / 2 + 1);
  ctx.restore();
}

function drawRadius(state, target, radiusKm, progress, color = COLORS.accent, dashed = false) {
  const projected = state.view.projectCoordinate(coordinates(target), 1.019);
  if (!projected?.visible) return;
  const ctx = state.ctx;
  const radiusScale = 0.78 + clamp(progress) * 0.22;
  ctx.save();
  ctx.globalAlpha = clamp(progress) * 0.56;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  if (dashed) ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.arc(projected.x, projected.y, state.view.projectRadiusKm(radiusKm) * radiusScale, 0, TAU);
  ctx.stroke();
  ctx.globalAlpha *= 0.12;
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawFeature(state, feature, progress, options = {}) {
  if (!feature?.geometry) return;
  const polygons = feature.geometry.type === "Polygon"
    ? [feature.geometry.coordinates]
    : feature.geometry.type === "MultiPolygon" ? feature.geometry.coordinates : [];
  const ctx = state.ctx;
  polygons.flat().forEach((ring) => {
    const projected = ring.map((entry) => state.view.projectCoordinate(entry, 1.012));
    const visible = projected.filter((entry) => entry?.visible);
    if (visible.length < 2) return;
    ctx.save();
    ctx.globalAlpha = clamp(progress) * Number(options.alpha ?? 0.68);
    ctx.strokeStyle = options.stroke || COLORS.accent;
    ctx.lineWidth = Number(options.width || 2.4);
    if (options.dash) ctx.setLineDash(options.dash);
    if (options.fill && visible.length === projected.length) {
      ctx.fillStyle = options.fill;
      ctx.beginPath();
      projected.forEach((entry, index) => index ? ctx.lineTo(entry.x, entry.y) : ctx.moveTo(entry.x, entry.y));
      ctx.closePath();
      ctx.fill();
    }
    ctx.beginPath();
    let drawing = false;
    projected.forEach((entry) => {
      if (!entry?.visible) {
        drawing = false;
        return;
      }
      if (!drawing) {
        ctx.moveTo(entry.x, entry.y);
        drawing = true;
      } else ctx.lineTo(entry.x, entry.y);
    });
    ctx.stroke();
    ctx.restore();
  });
}

function drawCountryHighlights(state, config, progress) {
  const codes = countryCodes(config);
  const values = config?.values || config?.results || {};
  const valueList = Object.values(values);
  const valueMax = maxValue(valueList.map((value) => typeof value === "object" ? value.value : value));
  codes.forEach((code, index) => {
    const feature = state.features.byCode.get(code);
    const value = values[code];
    const status = typeof value === "object" ? value.group : value;
    const tone = typeof value === "string" ? statusColor(value) : index === 0 ? COLORS.accent : COLORS.live;
    const magnitude = typeof value === "object" ? Number(value.value) : Number(value);
    const alpha = Number.isFinite(magnitude) ? 0.18 + Math.abs(magnitude) / valueMax * 0.52 : 0.45;
    drawFeature(state, feature, reveal(progress, index * 0.08, 0.62 + index * 0.08), {
      stroke: statusColor(status) || tone,
      fill: `${tone}33`,
      alpha,
      dash: status === "unverified" ? [8, 8] : undefined,
    });
  });
}

function drawTarget(state, target, progress, options = {}) {
  const parsed = coordinates(target);
  const projected = state.view.projectCoordinate(parsed, 1.02);
  if (!projected?.visible) return projected;
  drawMarker(state, projected, progress, {
    color: options.color || COLORS.accent,
    ring: options.ring || 12,
    radius: options.radius || 5,
    pulse: options.pulse === undefined ? progress : options.pulse,
    orbit: options.orbit,
    bounce: options.bounce === undefined ? 0.34 : options.bounce,
    phase: options.phase,
    cycles: options.cycles,
    label: options.label || target?.name || "",
  });
  return projected;
}

function drawRoutes(state, config, progress, options = {}) {
  const routes = routeSets(config);
  routes.forEach((route, index) => {
    const local = clamp(progress * routes.length - index);
    const value = Math.abs(Number(route.value) || 1);
    const width = Number(options.width || (2.2 + Math.min(5, value / 20)));
    const visible = drawProjectedPath(state, route.points, local, {
      color: options.color || lineColor(route),
      width,
      alpha: options.alpha || 0.86,
      dash: route.status === "blocked" || route.status === "forecast" ? [10, 8] : options.dash,
      glow: options.glow !== false,
      particles: options.particles === false
        ? false
        : Math.min(3, Math.max(1, Math.round(value / 22) + 1)),
      particlePhase: index * 0.17 + (route.phase === "after" ? 0.23 : 0),
      particleSpeed: 0.72 + (index % 3) * 0.1,
      particleAlpha: Number(options.particleAlpha ?? Math.min(0.92, Number(options.alpha ?? 0.86) * 1.08)),
    });
    const endpoints = route.points.length ? [route.points[0], route.points[route.points.length - 1]] : [];
    endpoints.forEach((entry, endpointIndex) => {
      const marker = state.view.projectCoordinate(entry.coordinates, 1.022);
      drawMarker(state, marker, reveal(local, 0.28, 0.74), {
        color: lineColor(route),
        ring: endpointIndex === 0 ? 7 : 10,
        radius: 3.5,
        bounce: 0.55,
        phase: index * 0.38 + endpointIndex * 0.7,
        orbit: endpointIndex === 1 && index === routes.length - 1
          ? { radius: 22, cycles: 0.65, phase: index * 0.4 }
          : false,
        label: endpointIndex === 1 || route.points.length === 2 ? entry.name || entry.label : "",
      });
    });
    if (visible.length && route.label && index === routes.length - 1) {
      placeLabel(state, visible[Math.floor(visible.length / 2)], route.label, lineColor(route), local);
    }
  });
}

function drawNetwork(state, config, progress) {
  const nodes = Array.isArray(config?.nodes) ? config.nodes : [];
  const links = Array.isArray(config?.links) ? config.links : [];
  const byId = new Map(nodes.map((node) => [String(node.id), node]));
  links.forEach((link, index) => {
    const from = byId.get(String(link.from));
    const to = byId.get(String(link.to));
    if (!from || !to) return;
    drawProjectedPath(state, [from, to], reveal(progress, index * 0.1, 0.75), {
      color: statusColor(link.status),
      width: 2 + Math.min(4, Math.abs(Number(link.value) || 0) / 24),
      dash: link.status === "blocked" ? [9, 8] : undefined,
      particles: 1,
      particlePhase: index * 0.21,
      particleSpeed: 0.8,
      particleRadius: 2.6,
    });
  });
  nodes.forEach((node, index) => {
    drawTarget(state, node, reveal(progress, index * 0.08, 0.72), {
      color: statusColor(node.status),
      label: node.name,
      ring: 9,
      pulse: progress,
      bounce: 0.78,
      phase: index * 0.4,
      orbit: index === nodes.length - 1 ? { radius: 22, cycles: 0.7, phase: 0.2 } : false,
    });
  });
}

function drawBubbles(state, entries, progress) {
  const values = entries.map((entry) => Number(entry.delta ?? entry.after ?? entry.value) || 0);
  const maximum = maxValue(values);
  entries.forEach((entry, index) => {
    const projected = state.view.projectCoordinate(coordinates(entry), 1.022);
    const value = Number(entry.delta ?? entry.after ?? entry.value) || 0;
    const local = reveal(progress, index * 0.08, 0.68 + index * 0.08);
    if (!projected?.visible) return;
    const baseRadius = 8 + Math.abs(value) / maximum * (state.format === "portrait" ? 28 : 24);
    const radius = baseRadius * (0.9 + oscillate(local, index * 0.58, 1.35) * 0.16);
    const color = value < 0 ? COLORS.live : COLORS.accent;
    const ctx = state.ctx;
    ctx.save();
    ctx.globalAlpha = local * 0.78;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(projected.x, projected.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = local * 0.5;
    ctx.fillStyle = COLORS.paper;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(projected.x - radius * 0.28, projected.y - radius * 0.28, Math.max(1.4, radius * 0.11), 0, TAU);
    ctx.fill();
    ctx.restore();
    drawMarker(state, projected, local, {
      color: COLORS.paper,
      radius: 3,
      ring: radius + 5,
      bounce: 0.55,
      phase: index * 0.58,
      label: entry.name,
    });
  });
}

function drawGlobeHalo(state, progress, options = {}) {
  const center = state.view.center;
  const revealProgress = reveal(progress, 0.02, 0.42);
  if (!center || !Number.isFinite(state.view.globeRadiusPx)) return;
  const color = options.color || COLORS.accent;
  const intensity = Number(options.intensity ?? 1);
  const radius = state.view.globeRadiusPx * 1.045;
  const sweep = clamp(progress) * TAU * 0.72 - Math.PI / 2;
  const orbitAngle = sweep + Math.PI / 2;
  const ctx = state.ctx;
  ctx.save();
  ctx.globalAlpha = revealProgress * 0.38 * intensity;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([3, 16]);
  ctx.lineDashOffset = -clamp(progress) * 90;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = revealProgress * 0.82 * intensity;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(center.x + Math.cos(orbitAngle) * radius, center.y + Math.sin(orbitAngle) * radius, 4, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function renderCamera(state, definition, config, progress) {
  const target = config?.target;
  const from = config?.from;
  if (["world-orbit", "globe-pullback", "globe-to-flat-map", "flat-map-to-globe"].includes(definition.id)) {
    drawGlobeHalo(state, progress, { color: definition.id === "world-orbit" ? COLORS.blue : COLORS.accent });
  }
  if (["country-hop", "antipode-flip"].includes(definition.id) && from && target) {
    drawProjectedPath(state, [from, target], reveal(progress, 0.12, 0.86), {
      width: 3,
      glow: true,
      particles: 2,
      particlePhase: 0.18,
      particleSpeed: 0.84,
    });
    drawTarget(state, from, reveal(progress, 0.05, 0.3), { color: COLORS.muted, label: from.name });
  }
  if (definition.id === "globe-pullback" || definition.id === "globe-to-flat-map") drawRoutes(state, config, progress, { alpha: 0.74 });
  if (definition.id === "flat-map-to-globe") drawCountryHighlights(state, config, progress);
  if (target && definition.id !== "world-orbit") drawTarget(state, target, reveal(progress, 0.24, 0.78), {
    color: COLORS.accent,
    label: target.name,
    ring: definition.id === "city-lock" ? 14 : 10,
    bounce: 0.7,
    phase: 0.2,
    orbit: ["city-lock", "country-hop", "antipode-flip"].includes(definition.id)
      ? { radius: definition.id === "city-lock" ? 28 : 22, cycles: 0.72, phase: 0.15 }
      : false,
  });
}

function renderHighlight(state, definition, config, progress) {
  if (definition.id === "geofenced-area" && Array.isArray(config?.polygon)) {
    drawProjectedPath(state, points(config.polygon), reveal(progress, 0.1, 0.78), { color: COLORS.live, width: 3, dash: [10, 8] });
  } else if (definition.id === "disputed-boundary-dash" || definition.id === "buffer-zone-band") {
    drawProjectedPath(state, points(config?.line), reveal(progress, 0.1, 0.78), { color: COLORS.live, width: 3, dash: [9, 8] });
  } else {
    drawCountryHighlights(state, config, progress);
  }
  if (config?.target) {
    drawTarget(state, config.target, reveal(progress, 0.22, 0.74), {
      color: COLORS.live,
      label: config.target.name,
      ring: 11,
      bounce: 0.72,
      phase: 0.2,
      orbit: definition.id === "geofenced-area" ? { radius: 24, cycles: 0.68, phase: 0.1 } : false,
    });
  }
  if (["buffer-zone-band", "disaster-radius"].includes(definition.id) && config?.target) {
    drawRadius(state, config.target, config.radiusKm, reveal(progress, 0.2, 0.86), COLORS.live, definition.id === "buffer-zone-band");
  }
}

function renderRoute(state, definition, config, progress) {
  if (definition.id === "network-branch") drawNetwork(state, config, progress);
  else drawRoutes(state, config, progress, { alpha: definition.id === "route-disruption" ? 0.78 : 0.9 });
  if (["source-sink-flow", "flight-network"].includes(definition.id)) {
    [...(config?.sources || []), ...(config?.sinks || []), ...(config?.hub ? [config.hub] : [])].forEach((node, index) => {
      drawTarget(state, node, reveal(progress, index * 0.06, 0.7), {
        color: COLORS.paper,
        label: node.name,
        ring: 8,
        bounce: 0.62,
        phase: index * 0.45,
        orbit: definition.id === "source-sink-flow" && index === 0
          ? { radius: 20, cycles: 0.72, phase: 0.2 }
          : false,
      });
    });
  }
  if (config?.target && definition.id === "chokepoint-focus") drawTarget(state, config.target, reveal(progress, 0.35, 0.78), {
    color: COLORS.live,
    label: config.target.name,
    ring: 16,
    pulse: progress,
    bounce: 0.9,
    phase: 0.14,
    orbit: { radius: 28, cycles: 0.72, phase: 0.1 },
  });
}

function renderChange(state, definition, config, progress) {
  if (["proportional-bubbles", "delta-bubbles"].includes(definition.id)) {
    drawBubbles(state, config.points || [], progress);
  } else if (definition.id === "ranking-wave") {
    drawBubbles(state, config.rankedPoints || [], progress);
  } else if (definition.id === "rank-shift") {
    const before = new Map((config.before || []).map((entry) => [String(entry.id), entry]));
    (config.after || []).forEach((entry, index) => {
      const previous = before.get(String(entry.id));
      if (previous) drawProjectedPath(state, [previous, entry], reveal(progress, index * 0.08, 0.76), {
        color: COLORS.accent,
        width: 3,
        glow: true,
        particles: 1,
        particlePhase: index * 0.22,
        particleSpeed: 0.82,
      });
      drawTarget(state, entry, reveal(progress, index * 0.08, 0.8), {
        color: COLORS.accent,
        label: `${entry.name} · #${entry.rank}`,
        ring: 9,
        bounce: 0.82,
        phase: index * 0.52,
        orbit: { radius: 20, cycles: 0.7, phase: index * 0.35 },
      });
    });
  } else if (definition.id === "before-after-swipe") {
    drawCountryHighlights(state, { values: config.before?.values || {} }, clamp(progress * 2));
    drawCountryHighlights(state, { values: config.after?.values || {} }, clamp((progress - 0.38) * 2));
  } else if (definition.id === "uncertainty-cloud") {
    drawRadius(state, config.target, config.radiusKm, reveal(progress, 0.1, 0.8), COLORS.accent, true);
    drawRadius(state, config.target, config.radiusKm * 0.55, reveal(progress, 0.25, 0.88), COLORS.live, true);
  } else if (definition.id === "comparison-split-map") {
    drawCountryHighlights(state, { values: config.left?.values || {} }, clamp(progress * 1.8));
    drawCountryHighlights(state, { values: config.right?.values || {} }, clamp((progress - 0.34) * 1.8));
    drawTarget(state, config.left?.target, reveal(progress, 0.15, 0.62), { color: COLORS.muted, label: config.left?.label, ring: 9 });
    drawTarget(state, config.right?.target, reveal(progress, 0.34, 0.82), { color: COLORS.accent, label: config.right?.label, ring: 9 });
  } else if (definition.id === "small-multiple-regions") {
    (config.panels || []).forEach((panel, index) => drawTarget(state, panel.target, reveal(progress, index * 0.1, 0.72), { color: COLORS.accent, label: panel.label, ring: 8 }));
  } else if (definition.id === "time-lapse-choropleth") {
    const stage = config.stages?.[Math.min(config.stages.length - 1, Math.floor(progress * config.stages.length))];
    drawCountryHighlights(state, stage || {}, progress);
  } else if (definition.id === "historical-border-morph") {
    const stage = config.stages?.[Math.min(config.stages.length - 1, Math.floor(progress * config.stages.length))];
    drawCountryHighlights(state, stage || {}, progress);
  } else {
    drawCountryHighlights(state, config, progress);
  }
  if (config?.target) drawTarget(state, config.target, reveal(progress, 0.22, 0.76), { color: COLORS.accent, label: config.target.name, ring: 10 });
}

function renderEvent(state, definition, config, progress) {
  if (definition.id === "earthquake-ripple") {
    const rings = 3;
    for (let index = 0; index < rings; index += 1) drawRadius(state, config.target, 28 + index * 34, reveal(progress, index * 0.12, 0.72 + index * 0.08), COLORS.live);
  } else if (["storm-track", "forecast-cone"].includes(definition.id)) {
    if (definition.id === "forecast-cone" && config?.cone) {
      drawProjectedPath(state, points(config.cone.left), reveal(progress, 0.28, 0.82), {
        color: COLORS.accent,
        width: 2,
        dash: [9, 8],
        particles: 1,
        particlePhase: 0.12,
        particleSpeed: 0.62,
        particleRadius: 2.4,
      });
      drawProjectedPath(state, points(config.cone.right), reveal(progress, 0.28, 0.82), {
        color: COLORS.accent,
        width: 2,
        dash: [9, 8],
        particles: 1,
        particlePhase: 0.54,
        particleSpeed: 0.62,
        particleRadius: 2.4,
      });
    }
    drawRoutes(state, config, progress, { color: COLORS.accent, alpha: 0.86 });
  } else if (["wildfire-spread", "flood-inundation", "impact-layers"].includes(definition.id)) {
    (config.stages || config.layers || []).forEach((stage, index) => drawRadius(state, config.target, stage.radiusKm, reveal(progress, index * 0.12, 0.66 + index * 0.1), index % 2 ? COLORS.live : COLORS.accent, index % 2 === 1));
  } else if (definition.id === "satellite-orbit") {
    const route = points(config.points);
    drawProjectedPath(state, route, progress, {
      color: COLORS.blue,
      width: 2,
      dash: [8, 8],
      particles: 2,
      particlePhase: 0.12,
      particleSpeed: 0.68,
      particleRadius: 2.8,
    });
    const current = route[Math.min(route.length - 1, Math.floor(progress * route.length))];
    drawTarget(state, current, 1, {
      color: COLORS.paper,
      ring: 7,
      label: current?.name,
      bounce: 0.7,
      phase: 0.25,
      orbit: { radius: 18, cycles: 0.9, phase: 0.3 },
    });
  } else if (definition.id === "day-night-terminator") {
    const longitude = Number(config.solar?.startLongitude || 0) + (Number(config.solar?.endLongitude || 0) - Number(config.solar?.startLongitude || 0)) * progress;
    const line = [[longitude, -75], [longitude, 75]];
    drawProjectedPath(state, points(line), 1, { color: COLORS.blue, width: 2, dash: [7, 9] });
  } else if (definition.id === "outage-cascade") {
    drawRoutes(state, config, progress, { color: COLORS.live, alpha: 0.82 });
  } else if (definition.id === "event-cluster") {
    (config.points || []).forEach((entry, index) => drawTarget(state, entry, reveal(progress, index * 0.14, 0.76), {
      color: statusColor(entry.status),
      label: entry.label || entry.name,
      ring: 8,
      pulse: progress,
      bounce: 0.8,
      phase: index * 0.6,
    }));
  } else {
    drawRoutes(state, config, progress, { color: COLORS.live });
  }
  if (config?.target) drawTarget(state, config.target, reveal(progress, 0.24, 0.76), {
    color: COLORS.live,
    label: config.target.name,
    ring: 12,
    pulse: progress,
    bounce: 0.9,
    phase: 0.18,
    orbit: { radius: 26, cycles: 0.72, phase: 0.1 },
  });
}

function renderPreset(state, definition, config, progress) {
  if (definition.family !== "camera") {
    const familyColor = definition.family === "event"
      ? COLORS.live
      : definition.family === "route" ? COLORS.blue : COLORS.accent;
    drawGlobeHalo(state, progress, { color: familyColor, intensity: 0.44 });
  }
  if (definition.family === "camera") renderCamera(state, definition, config, progress);
  else if (definition.family === "highlight") renderHighlight(state, definition, config, progress);
  else if (definition.family === "route") renderRoute(state, definition, config, progress);
  else if (definition.family === "change") renderChange(state, definition, config, progress);
  else if (definition.family === "event") renderEvent(state, definition, config, progress);
}

export function createGlobeNativeAnnotationRenderer({
  canvas,
  features,
  width,
  height,
  format,
  safeRects = [],
} = {}) {
  if (!canvas || typeof canvas.getContext !== "function") throw new Error("createGlobeNativeAnnotationRenderer requires a canvas element");
  const resolvedWidth = Number(width || canvas.width || 1920);
  const resolvedHeight = Number(height || canvas.height || 1080);
  const resolvedFormat = format || (resolvedHeight > resolvedWidth ? "portrait" : "landscape");
  const ctx = canvas.getContext("2d", { alpha: true });
  canvas.width = resolvedWidth;
  canvas.height = resolvedHeight;
  const indexedFeatures = featureCollection(features);
  const reservedRects = (Array.isArray(safeRects) ? safeRects : [])
    .map((rect) => ({
      x: Number(rect?.x) || 0,
      y: Number(rect?.y) || 0,
      width: Math.max(0, Number(rect?.width) || 0),
      height: Math.max(0, Number(rect?.height) || 0),
    }))
    .filter((rect) => rect.width > 0 && rect.height > 0);

  function clear() {
    ctx.clearRect(0, 0, resolvedWidth, resolvedHeight);
  }

  function render(animationId, timeSeconds, overrides = {}, view = null) {
    const definition = getGlobeMapAnimation(animationId);
    const validation = validateGlobeMapAnimationConfig(animationId, overrides);
    if (!validation.valid) {
      const details = [...validation.missing, ...validation.issues].join(", ");
      throw new Error(`Cannot render ${animationId}: ${details}`);
    }
    clear();
    const progress = clamp(Number(timeSeconds) / Math.max(0.001, definition.duration));
    if (!view?.projectCoordinate) return Object.freeze({ definition, config: validation.config, progress, native: true, unavailable: true });
    const state = {
      ctx,
      view,
      width: resolvedWidth,
      height: resolvedHeight,
      format: resolvedFormat,
      features: indexedFeatures,
      labels: [],
      safeRects: reservedRects,
    };
    renderPreset(state, definition, validation.config, progress);
    return Object.freeze({ definition, config: validation.config, progress, native: true, unavailable: false });
  }

  function renderHeroFrame(animationId, overrides = {}, view = null) {
    const definition = getGlobeMapAnimation(animationId);
    return render(animationId, definition.duration * 0.78, overrides, view);
  }

  return Object.freeze({
    render,
    renderHeroFrame,
    clear,
    width: resolvedWidth,
    height: resolvedHeight,
    format: resolvedFormat,
    featureCount: indexedFeatures.list.length,
    native: true,
  });
}
