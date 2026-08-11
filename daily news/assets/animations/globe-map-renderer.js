import {
  GLOBE_MAP_FORMATS,
  GLOBE_MAP_THEME,
  getGlobeMapAnimation,
  validateGlobeMapAnimationConfig,
} from "./globe-map-library.js";

import { clamp, mix, smootherstep, smooth, easeOutCubic, easeOutQuint, easeInOutQuint } from "./animation-math.js";

export { clamp, mix, smootherstep, smooth, easeOutCubic, easeOutQuint, easeInOutQuint } from "./animation-math.js";
export const clamp01 = clamp;

const TAU = Math.PI * 2;
const drawSurfaceByContext = new WeakMap();

function unwrapLongitude(target, previous) {
  let next = Number(target) || 0;
  while (next - previous > 180) next -= 360;
  while (next - previous < -180) next += 360;
  return next;
}

function seededUnit(index, salt = 0) {
  const value = Math.sin((index + 1) * 12.9898 + (salt + 1) * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function asCoordinates(value, fallback = [0, 15]) {
  if (!Array.isArray(value) || value.length !== 2) return fallback;
  const coordinates = value.map(Number);
  return coordinates.every(Number.isFinite) ? coordinates : fallback;
}

function asPoint(value) {
  if (Array.isArray(value)) return { coordinates: asCoordinates(value), name: "" };
  return {
    ...value,
    coordinates: asCoordinates(value?.coordinates),
  };
}

function normalizeRoute(route = []) {
  return Array.isArray(route) ? route.map(asPoint) : [];
}

function geometryFocus(d3, definition, config) {
  if (Array.isArray(config.target?.coordinates)) return asCoordinates(config.target.coordinates);

  let candidates = [];
  if (["storm-track", "forecast-cone"].includes(definition.id)) {
    candidates = (config.track || []).map((point) => point?.coordinates);
    if (definition.id === "forecast-cone") candidates = [...(config.observed || []), ...(config.forecast || [])];
  } else if (["event-cluster", "delta-bubbles"].includes(definition.id)) {
    candidates = (config.points || []).map((point) => point?.coordinates);
  } else if (definition.id === "rank-shift") {
    candidates = (config.after || config.before || []).map((point) => point?.coordinates);
  } else if (definition.id === "network-branch") {
    candidates = (config.nodes || []).map((point) => point?.coordinates);
  } else if (definition.id === "source-sink-flow") {
    candidates = [...(config.sources || []), ...(config.sinks || [])].map((point) => point?.coordinates);
  } else if (definition.id === "impact-layers") {
    candidates = [config.target?.coordinates];
  } else if (Array.isArray(config.line)) {
    candidates = config.line;
  } else if (Array.isArray(config.polygon)) {
    candidates = config.polygon;
  }

  const coordinates = candidates.filter((point) => (
    Array.isArray(point) &&
    point.length === 2 &&
    point.map(Number).every(Number.isFinite)
  )).map((point) => point.map(Number));

  if (coordinates.length === 1) return coordinates[0];
  if (coordinates.length > 1) {
    const centroid = d3.geoCentroid({ type: "MultiPoint", coordinates });
    if (centroid.every(Number.isFinite)) return centroid;
  }
  return [20, 20];
}

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value ?? "");
  return Math.round(number).toLocaleString("en-US");
}

function makeFeatureCollection(features) {
  if (features?.type === "FeatureCollection") return features;
  if (Array.isArray(features)) return { type: "FeatureCollection", features };
  return { type: "FeatureCollection", features: [] };
}

function makeFeatureIndex(features) {
  const index = new Map();
  features.features.forEach((feature) => {
    const code = String(feature?.properties?.code || "").toUpperCase();
    if (code) index.set(code, feature);
  });
  return index;
}

function colorWithAlpha(hex, alpha) {
  const normalized = String(hex).replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return `rgba(212,147,82,${alpha})`;
  const value = Number.parseInt(normalized, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red},${green},${blue},${alpha})`;
}

function colorScale(theme, value, min = 0, max = 100) {
  const progress = clamp((Number(value) - Number(min)) / Math.max(1e-6, Number(max) - Number(min)));
  const low = [154, 174, 159];
  const high = [212, 147, 82];
  const channels = low.map((channel, index) => Math.round(mix(channel, high[index], progress)));
  return `rgb(${channels[0]},${channels[1]},${channels[2]})`;
}

function drawFallback(ctx, rect, theme, label = "MAP DATA UNAVAILABLE") {
  const radius = Math.min(rect.width, rect.height) * 0.28;
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  ctx.save();
  ctx.strokeStyle = theme.border;
  ctx.fillStyle = colorWithAlpha(theme.ocean, 0.24);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([8, 12]);
  for (let index = -2; index <= 2; index += 1) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius * (1 - Math.abs(index) * 0.12), radius * 0.35, 0, 0, TAU);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.fillStyle = theme.copy;
  ctx.font = `700 ${Math.max(18, rect.width * 0.017)}px "IBM Plex Mono", monospace`;
  ctx.textAlign = "center";
  ctx.fillText(label, cx, cy + radius + 52);
  ctx.restore();
}

function drawDraftingBackground(ctx, width, height, theme) {
  ctx.save();
  ctx.fillStyle = theme.mat;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = colorWithAlpha(theme.copy, 0.075);
  ctx.lineWidth = 1;
  const step = Math.max(48, Math.round(Math.min(width, height) / 15));
  ctx.beginPath();
  for (let x = 0; x <= width; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = 0; y <= height; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();

  ctx.fillStyle = colorWithAlpha(theme.paper, 0.026);
  for (let index = 0; index < 180; index += 1) {
    const x = seededUnit(index, 1) * width;
    const y = seededUnit(index, 2) * height;
    ctx.fillRect(x, y, 1 + seededUnit(index, 3) * 2, 1);
  }
  ctx.restore();
}

function projectionRect(format, width, height) {
  const profile = GLOBE_MAP_FORMATS[format] || GLOBE_MAP_FORMATS.landscape;
  const sx = width / profile.width;
  const sy = height / profile.height;
  return {
    x: profile.mapFrame.x * sx,
    y: profile.mapFrame.y * sy,
    width: profile.mapFrame.width * sx,
    height: profile.mapFrame.height * sy,
  };
}

function makeGlobeProjection(d3, rect, rotation = [0, -12, 0], scale = 1) {
  const radius = Math.min(rect.width * 0.46, rect.height * 0.48) * scale;
  return d3.geoOrthographic()
    .translate([rect.x + rect.width / 2, rect.y + rect.height / 2])
    .scale(radius)
    .rotate(rotation)
    .clipAngle(90)
    .precision(0.4);
}

function beginGeoPath(ctx, path, object) {
  ctx.beginPath();
  path(object);
}

function drawBaseMap(ctx, d3, projection, features, theme, { globe = false, alpha = 1, muted = false } = {}) {
  const path = d3.geoPath(projection, ctx);
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (drawSurfaceByContext.get(ctx) === false) {
    ctx.restore();
    return path;
  }
  if (globe) {
    beginGeoPath(ctx, path, { type: "Sphere" });
    const bounds = path.bounds({ type: "Sphere" });
    const gradient = ctx.createRadialGradient(
      bounds[0][0] + (bounds[1][0] - bounds[0][0]) * 0.35,
      bounds[0][1] + (bounds[1][1] - bounds[0][1]) * 0.28,
      0,
      (bounds[0][0] + bounds[1][0]) / 2,
      (bounds[0][1] + bounds[1][1]) / 2,
      Math.max(1, (bounds[1][0] - bounds[0][0]) * 0.58),
    );
    gradient.addColorStop(0, muted ? colorWithAlpha(theme.ocean, 0.48) : "#C2CEBD");
    gradient.addColorStop(0.68, muted ? colorWithAlpha(theme.ocean, 0.4) : theme.ocean);
    gradient.addColorStop(1, theme.matShadow);
    ctx.fillStyle = gradient;
    ctx.shadowColor = colorWithAlpha(theme.matShadow, 0.65);
    ctx.shadowBlur = 44;
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    ctx.fillStyle = muted ? colorWithAlpha(theme.ocean, 0.34) : colorWithAlpha(theme.ocean, 0.5);
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  const graticule = d3.geoGraticule10();
  beginGeoPath(ctx, path, graticule);
  ctx.strokeStyle = colorWithAlpha(theme.border, muted ? 0.16 : 0.3);
  ctx.lineWidth = globe ? 1.25 : 1;
  ctx.stroke();

  beginGeoPath(ctx, path, features);
  ctx.fillStyle = muted ? colorWithAlpha(theme.land, 0.52) : theme.land;
  ctx.fill();
  ctx.strokeStyle = muted ? colorWithAlpha(theme.landOutline, 0.4) : theme.landOutline;
  ctx.lineWidth = globe ? 1.2 : 1.4;
  ctx.stroke();

  if (globe) {
    beginGeoPath(ctx, path, { type: "Sphere" });
    ctx.strokeStyle = colorWithAlpha(theme.paper, 0.48);
    ctx.lineWidth = 2.2;
    ctx.stroke();
  }
  ctx.restore();
  return path;
}

function drawFeature(ctx, path, feature, { fill, stroke, lineWidth = 3, alpha = 1, dash = [] } = {}) {
  if (!feature) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  beginGeoPath(ctx, path, feature);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.setLineDash(dash);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHatchedFeature(ctx, path, feature, rect, theme, alpha = 1) {
  if (!feature) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  beginGeoPath(ctx, path, feature);
  ctx.clip();
  ctx.strokeStyle = colorWithAlpha(theme.live, 0.8);
  ctx.lineWidth = 4;
  const gap = 22;
  for (let x = rect.x - rect.height; x < rect.x + rect.width + rect.height; x += gap) {
    ctx.beginPath();
    ctx.moveTo(x, rect.y + rect.height);
    ctx.lineTo(x + rect.height, rect.y);
    ctx.stroke();
  }
  ctx.restore();
  drawFeature(ctx, path, feature, { stroke: theme.live, lineWidth: 3, alpha });
}

/* For an orthographic globe, a coordinate on the rear hemisphere must fade
   out. D3's clipAngle clips path fills/strokes but raw point projections still
   return finite screen coordinates, so labels and markers check visibility
   explicitly. The visible center of an orthographic projection is derived from
   its rotation: rotate([-lon, -lat]) centers the globe on [lon, lat]. */
export function onVisibleHemisphere(projection, coordinates) {
  const rotation = projection.rotate?.();
  const center = Array.isArray(rotation) && rotation.length >= 2
    ? [-Number(rotation[0]), -Number(rotation[1])]
    : null;
  if (!center) return true;
  const [longitude, latitude] = asCoordinates(coordinates);
  const [centerLongitude, centerLatitude] = center;
  const sinLatitude = Math.sin((latitude * Math.PI) / 180) * Math.sin((centerLatitude * Math.PI) / 180);
  const cosLatitude = Math.cos((latitude * Math.PI) / 180) * Math.cos((centerLatitude * Math.PI) / 180) * Math.cos(((longitude - centerLongitude) * Math.PI) / 180);
  return sinLatitude + cosLatitude >= -0.08;
}

function drawProjectedPoint(ctx, projection, point, theme, {
  radius = 9,
  alpha = 1,
  ring = 0,
  fill = theme.paper,
  stroke = theme.accent,
  label = "",
  labelSide = 1,
} = {}) {
  const coordinates = asCoordinates(point?.coordinates || point);
  const projected = projection(coordinates);
  if (!projected || !projected.every(Number.isFinite)) return null;
  const visible = onVisibleHemisphere(projection, coordinates);
  const [x, y] = projected;
  ctx.save();
  ctx.globalAlpha *= alpha * (visible ? 1 : 0.08);
  if (ring > 0) {
    ctx.beginPath();
    ctx.arc(x, y, radius + ring, 0, TAU);
    ctx.strokeStyle = colorWithAlpha(stroke, 0.65);
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 3;
  ctx.stroke();
  if (label && visible) {
    ctx.font = `700 ${Math.max(16, ctx.canvas.width * 0.012)}px "IBM Plex Mono", monospace`;
    ctx.fillStyle = theme.paper;
    ctx.textAlign = labelSide > 0 ? "left" : "right";
    ctx.textBaseline = "middle";
    ctx.fillText(label.toUpperCase(), x + labelSide * (radius + 14), y - 1);
  }
  ctx.restore();
  return [x, y];
}

function drawCrosshair(ctx, projection, target, theme, progress) {
  const projected = projection(asCoordinates(target?.coordinates));
  if (!projected) return;
  const [x, y] = projected;
  const reveal = easeOutCubic(progress);
  const size = 34 + (1 - reveal) * 24;
  ctx.save();
  ctx.globalAlpha *= reveal;
  ctx.strokeStyle = theme.live;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.58, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size, y);
  ctx.lineTo(x - 9, y);
  ctx.moveTo(x + 9, y);
  ctx.lineTo(x + size, y);
  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y - 9);
  ctx.moveTo(x, y + 9);
  ctx.lineTo(x, y + size);
  ctx.stroke();
  ctx.fillStyle = theme.paper;
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function routeCoordinates(d3, route, samplesPerLeg = 42) {
  const points = normalizeRoute(route);
  const coordinates = [];
  points.forEach((point, index) => {
    if (index === points.length - 1) return;
    const interpolate = d3.geoInterpolate(point.coordinates, points[index + 1].coordinates);
    for (let step = 0; step <= samplesPerLeg; step += 1) {
      if (index > 0 && step === 0) continue;
      coordinates.push(interpolate(step / samplesPerLeg));
    }
  });
  return coordinates;
}

function partialCoordinates(coordinates, progress) {
  if (!coordinates.length) return [];
  const exact = clamp(progress) * (coordinates.length - 1);
  const count = Math.floor(exact);
  const result = coordinates.slice(0, count + 1);
  if (count < coordinates.length - 1) {
    const within = exact - count;
    const from = coordinates[count];
    const to = coordinates[count + 1];
    result.push([mix(from[0], to[0], within), mix(from[1], to[1], within)]);
  }
  return result;
}

function drawRoute(ctx, d3, path, projection, route, theme, {
  progress = 1,
  alpha = 1,
  width = 5,
  color = theme.live,
  dash = [],
  marker = true,
  glow = true,
  labels = false,
} = {}) {
  const full = routeCoordinates(d3, route);
  const coordinates = partialCoordinates(full, progress);
  if (coordinates.length < 2) return null;
  const line = { type: "LineString", coordinates };
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (glow) {
    beginGeoPath(ctx, path, line);
    ctx.strokeStyle = colorWithAlpha(color, 0.18);
    ctx.lineWidth = width * 3.2;
    ctx.lineCap = "round";
    ctx.stroke();
  }
  beginGeoPath(ctx, path, line);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.setLineDash(dash);
  ctx.stroke();
  ctx.setLineDash([]);

  if (marker) {
    const tip = coordinates[coordinates.length - 1];
    drawProjectedPoint(ctx, projection, tip, theme, { radius: width + 2, alpha, ring: 6, fill: theme.paper, stroke: color });
  }
  if (labels) {
    normalizeRoute(route).forEach((point, index) => {
      const revealAt = index / Math.max(1, route.length - 1);
      drawProjectedPoint(ctx, projection, point, theme, {
        radius: 7,
        alpha: smootherstep(revealAt - 0.12, revealAt + 0.05, progress),
        label: point.name || String(index + 1),
        labelSide: index % 2 ? -1 : 1,
      });
    });
  }
  ctx.restore();
  return coordinates[coordinates.length - 1];
}

function drawGeoLine(ctx, path, coordinates, theme, {
  progress = 1,
  color = theme.live,
  width = 4,
  dash = [],
  alpha = 1,
} = {}) {
  const normalized = Array.isArray(coordinates) ? coordinates.map((point) => asCoordinates(point)) : [];
  if (normalized.length < 2) return;
  const count = Math.max(2, Math.ceil(normalized.length * clamp(progress)));
  const line = { type: "LineString", coordinates: normalized.slice(0, count) };
  ctx.save();
  ctx.globalAlpha *= alpha;
  beginGeoPath(ctx, path, line);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.setLineDash(dash);
  ctx.stroke();
  ctx.restore();
}

function polygonFeature(coordinates) {
  const points = Array.isArray(coordinates)
    ? coordinates.map((point) => asCoordinates(point)).filter((point) => point.every(Number.isFinite))
    : [];
  if (points.length < 3) return null;
  const first = points[0];
  const last = points.at(-1);
  if (first[0] !== last[0] || first[1] !== last[1]) points.push([...first]);
  return {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [points] },
    properties: {},
  };
}

function drawStatusLegend(ctx, rect, theme, entries, alpha = 1) {
  const items = Object.entries(entries || {});
  if (!items.length) return;
  const x = rect.x + 22;
  const y = rect.y + rect.height - 52;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = `700 ${Math.max(14, ctx.canvas.width * 0.008)}px "IBM Plex Mono", monospace`;
  ctx.textBaseline = "middle";
  let cursor = x;
  items.forEach(([label, color]) => {
    ctx.fillStyle = color;
    ctx.fillRect(cursor, y - 6, 12, 12);
    ctx.fillStyle = theme.paper;
    ctx.textAlign = "left";
    ctx.fillText(String(label).toUpperCase(), cursor + 18, y);
    cursor += 26 + ctx.measureText(String(label).toUpperCase()).width;
  });
  ctx.restore();
}

function statusColor(theme, status) {
  switch (String(status || "").toLowerCase()) {
    case "active":
    case "confirmed":
      return theme.accent;
    case "reported":
    case "pending":
    case "detour":
      return theme.uncertainty;
    case "blocked":
    case "unverified":
    case "forecast":
      return theme.live;
    case "exempt":
    case "protected":
      return theme.secondary;
    default:
      return theme.paper;
  }
}

function drawLegend(ctx, rect, theme, { min = 0, max = 100, unit = "index" } = {}, alpha = 1) {
  const width = Math.min(360, rect.width * 0.28);
  const height = 18;
  const x = rect.x + 22;
  const y = rect.y + rect.height - 44;
  const gradient = ctx.createLinearGradient(x, y, x + width, y);
  gradient.addColorStop(0, "rgb(154,174,159)");
  gradient.addColorStop(1, "rgb(212,147,82)");
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = colorWithAlpha(theme.panel, 0.84);
  ctx.fillRect(x - 14, y - 30, width + 28, 70);
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = theme.paper;
  ctx.font = `700 ${Math.max(15, ctx.canvas.width * 0.009)}px "IBM Plex Mono", monospace`;
  ctx.textBaseline = "bottom";
  ctx.textAlign = "left";
  ctx.fillText(`${formatNumber(min)} ${unit}`, x, y - 6);
  ctx.textAlign = "right";
  ctx.fillText(`${formatNumber(max)} ${unit}`, x + width, y - 6);
  ctx.restore();
}

function drawChoropleth(ctx, path, featureIndex, values, theme, legend, progress = 1) {
  const entries = Object.entries(values || {});
  const numbers = entries.map(([, value]) => Number(value?.value ?? value)).filter(Number.isFinite);
  const min = Number(legend?.min ?? Math.min(...numbers, 0));
  const max = Number(legend?.max ?? Math.max(...numbers, 100));
  entries.forEach(([code, value], index) => {
    const reveal = smootherstep(index / Math.max(1, entries.length) - 0.18, index / Math.max(1, entries.length) + 0.12, progress);
    const numeric = Number(value?.value ?? value);
    drawFeature(ctx, path, featureIndex.get(code.toUpperCase()), {
      fill: colorScale(theme, numeric, min, max),
      stroke: theme.paper,
      lineWidth: 2,
      alpha: reveal * 0.94,
    });
  });
}

function geoCircle(d3, coordinates, radiusKm) {
  return d3.geoCircle().center(asCoordinates(coordinates)).radius(Number(radiusKm || 1) / 111.2)();
}

function drawRadius(ctx, d3, path, coordinates, radiusKm, theme, {
  progress = 1,
  fill = colorWithAlpha(theme.live, 0.15),
  stroke = theme.live,
  dash = [],
} = {}) {
  const circle = geoCircle(d3, coordinates, Number(radiusKm) * easeOutCubic(progress));
  drawFeature(ctx, path, circle, { fill, stroke, lineWidth: 3, alpha: progress, dash });
}

function drawMetric(ctx, x, y, value, label, theme, alpha = 1, align = "left") {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.textAlign = align;
  ctx.fillStyle = theme.paper;
  ctx.font = `400 ${Math.max(46, ctx.canvas.width * 0.04)}px "League Gothic", sans-serif`;
  ctx.fillText(String(value).toUpperCase(), x, y);
  ctx.fillStyle = theme.copy;
  ctx.font = `700 ${Math.max(15, ctx.canvas.width * 0.009)}px "IBM Plex Mono", monospace`;
  ctx.fillText(String(label).toUpperCase(), x, y + 28);
  ctx.restore();
}

function drawPresetMetric(ctx, rect, value, label, theme, alpha = 1) {
  const portrait = rect.height > rect.width;
  drawMetric(
    ctx,
    portrait ? rect.x + rect.width - 24 : rect.x + 24,
    rect.y + 82,
    value,
    label,
    theme,
    alpha,
    portrait ? "right" : "left",
  );
}

function baseProjectionForDefinition(d3, definition, config, rect, features, progress) {
  const target = geometryFocus(d3, definition, config);
  const start = asCoordinates(config.from?.coordinates, [target[0] - 72, target[1] * 0.35]);
  const targetLongitude = unwrapLongitude(target[0], start[0]);
  let longitude = mix(start[0], targetLongitude, easeInOutQuint(progress));
  let latitude = mix(start[1], target[1], easeInOutQuint(progress));
  let scale = mix(0.82, 1, smootherstep(0.08, 0.78, progress));
  let tilt = 0;

  if (definition.id === "world-orbit") {
    longitude = mix(-28, 104, easeInOutQuint(progress));
    latitude = mix(12, -8, progress);
    scale = 0.86 + Math.sin(progress * Math.PI) * 0.07;
  } else if (definition.id === "hemisphere-reveal") {
    longitude = mix(target[0] - 150, target[0], easeInOutQuint(progress));
  } else if (definition.id === "antipode-flip") {
    longitude = mix(start[0], start[0] + 180, easeInOutQuint(progress));
    latitude = mix(start[1], target[1], progress);
  } else if (definition.id === "globe-pullback") {
    longitude = target[0] + Math.sin(progress * Math.PI) * 10;
    latitude = target[1];
    scale = mix(1.28, 0.78, easeInOutQuint(progress));
  }

  /* All presets render on an orthographic globe. Regional presets zoom in
     while retaining visible curvature; the orthographic clipAngle(90) clips
     every overlay to the visible hemisphere. */
  const detailZoom = {
    "city-lock": 1.5,
    "country-lock": 1.35,
    "region-dive": 2.6,
    "chokepoint-focus": 2.4,
    "disputed-boundary-dash": 2.6,
    "buffer-zone-band": 2.4,
    "disaster-radius": 2.3,
    "uncertainty-cloud": 2.5,
    "earthquake-ripple": 2.4,
    "storm-track": 2.2,
    "weather-front": 2.4,
    "wildfire-spread": 2.6,
    "flood-inundation": 2.6,
    "pipeline-trace": 2.4,
    "spotlight-dim": 2.2,
    "geofenced-area": 2.15,
    "route-disruption": 1.45,
    "network-branch": 1.25,
    "source-sink-flow": 1.2,
    "event-cluster": 1.45,
    "forecast-cone": 2.15,
    "impact-layers": 2.35,
  }[definition.id] || 1;
  if (detailZoom > 1) {
    scale = mix(1, detailZoom, smootherstep(0.1, 0.7, progress));
  }

  return {
    projection: makeGlobeProjection(d3, rect, [-longitude, -latitude, tilt], scale),
    globe: true,
  };
}

function renderCamera(state, definition, config, progress) {
  const { ctx, d3, features, featureIndex, rect, theme } = state;
  if (definition.id === "globe-to-flat-map" || definition.id === "flat-map-to-globe" || definition.id === "region-dive") {
    /* Globe-only handoff: both "sides" are orthographic globe views. The
       flat-map crossfade is removed; the camera simply rotates from a wider
       to a closer globe framing (or back), always on the globe. */
    const target = asCoordinates(config.target?.coordinates, [20, 20]);
    const reverse = definition.id === "flat-map-to-globe";
    const globeProgress = reverse ? 1 - progress : progress;
    const projection = makeGlobeProjection(d3, rect, [
      -mix(target[0] - 70, target[0], easeInOutQuint(globeProgress)),
      -mix(target[1] * 0.3, target[1], easeInOutQuint(globeProgress)),
      0,
    ], mix(0.8, 1.6, smootherstep(0, 0.75, globeProgress)));
    const path = drawBaseMap(ctx, d3, projection, features, theme, { globe: true });
    drawFeature(ctx, path, featureIndex.get(String(config.target?.code || "").toUpperCase()), {
      fill: colorWithAlpha(theme.accent, 0.7),
      stroke: theme.paper,
      lineWidth: 3,
      alpha: smootherstep(0.55, 0.85, reverse ? 1 - progress : progress),
    });
    drawCrosshair(ctx, projection, config.target, theme, smootherstep(0.55, 0.85, progress));
    return;
  }

  const { projection, globe } = baseProjectionForDefinition(d3, definition, config, rect, features, progress);
  const path = drawBaseMap(ctx, d3, projection, features, theme, { globe });
  const targetFeature = featureIndex.get(String(config.target?.code || "").toUpperCase());
  const lock = smootherstep(0.58, 0.86, progress);
  if (["country-lock", "city-lock", "country-hop", "antipode-flip", "globe-pullback", "hemisphere-reveal"].includes(definition.id)) {
    drawFeature(ctx, path, targetFeature, {
      fill: colorWithAlpha(theme.accent, 0.78),
      stroke: theme.paper,
      lineWidth: 3.2,
      alpha: lock,
    });
  }
  if (definition.id === "country-hop" && config.from?.code) {
    drawFeature(ctx, path, featureIndex.get(String(config.from.code).toUpperCase()), {
      fill: colorWithAlpha(theme.secondary, 0.5),
      stroke: theme.paper,
      lineWidth: 2,
      alpha: 1 - smootherstep(0.35, 0.68, progress),
    });
  }
  if (definition.id === "city-lock") drawCrosshair(ctx, projection, config.target, theme, lock);
  if (definition.id === "globe-pullback" && config.route) {
    drawRoute(ctx, d3, path, projection, config.route, theme, { progress: smootherstep(0.45, 0.9, progress), width: 4, labels: true });
  }
}

function renderHighlight(state, definition, config, progress) {
  const { ctx, d3, features, featureIndex, rect, theme } = state;
  const { projection, globe } = baseProjectionForDefinition(d3, definition, config, rect, features, progress);
  const path = drawBaseMap(ctx, d3, projection, features, theme, { globe, muted: definition.id === "spotlight-dim" });
  const targetCode = String(config.target?.code || "").toUpperCase();
  const reveal = smootherstep(0.12, 0.72, progress);

  switch (definition.id) {
    case "country-fill":
      drawFeature(ctx, path, featureIndex.get(targetCode), { fill: theme.accent, stroke: theme.paper, lineWidth: 3, alpha: reveal });
      break;
    case "country-outline": {
      const feature = featureIndex.get(targetCode);
      drawFeature(ctx, path, feature, { stroke: colorWithAlpha(theme.accent, 0.18), lineWidth: 10, alpha: reveal });
      drawFeature(ctx, path, feature, { stroke: theme.accent, lineWidth: 3.5, alpha: reveal });
      break;
    }
    case "multi-country-sweep": {
      const codes = config.countryCodes || [];
      codes.forEach((code, index) => {
        const start = 0.08 + index * (0.62 / Math.max(1, codes.length));
        const alpha = smootherstep(start, start + 0.2, progress);
        drawFeature(ctx, path, featureIndex.get(String(code).toUpperCase()), {
          fill: colorWithAlpha(theme.accent, 0.68), stroke: theme.paper, lineWidth: 2.2, alpha,
        });
      });
      break;
    }
    case "policy-status-sweep": {
      const stages = config.stages || [];
      const exact = reveal * Math.max(0, stages.length - 1);
      const activeIndex = Math.min(stages.length - 1, Math.floor(exact));
      const nextIndex = Math.min(stages.length - 1, activeIndex + 1);
      const blend = exact - activeIndex;
      [
        [stages[activeIndex], 1 - blend],
        [stages[nextIndex], blend],
      ].forEach(([stage, stageAlpha]) => {
        Object.entries(stage?.states || {}).forEach(([code, status]) => {
          drawFeature(ctx, path, featureIndex.get(code.toUpperCase()), {
            fill: statusColor(theme, status),
            stroke: theme.paper,
            lineWidth: 2.2,
            alpha: stageAlpha * 0.86,
          });
        });
      });
      drawPresetMetric(ctx, rect, stages[blend > 0.5 ? nextIndex : activeIndex]?.label || "STATUS", "POLICY STATE / SAMPLE", theme, reveal);
      drawStatusLegend(ctx, rect, theme, { active: theme.accent, pending: theme.uncertainty, blocked: theme.live, exempt: theme.secondary }, reveal);
      break;
    }
    case "geofenced-area": {
      const feature = polygonFeature(config.polygon);
      const fill = config.mode === "protected" ? theme.secondary : config.mode === "evacuate" ? theme.live : theme.accent;
      drawFeature(ctx, path, feature, { fill: colorWithAlpha(fill, 0.22), stroke: fill, lineWidth: 4, alpha: reveal, dash: config.mode === "restricted" ? [12, 9] : [] });
      if (feature) drawHatchedFeature(ctx, path, feature, rect, theme, reveal * 0.7);
      drawPresetMetric(ctx, rect, config.label || "ZONE", `${String(config.mode || "restricted").toUpperCase()} / SAMPLE`, theme, reveal);
      break;
    }
    case "evidence-confidence-fill": {
      Object.entries(config.values || {}).forEach(([code, status], index) => {
        drawFeature(ctx, path, featureIndex.get(code.toUpperCase()), {
          fill: statusColor(theme, status),
          stroke: theme.paper,
          lineWidth: 2,
          alpha: smootherstep(index * 0.08, 0.52 + index * 0.08, reveal) * 0.88,
        });
      });
      drawStatusLegend(ctx, rect, theme, { confirmed: theme.accent, reported: theme.uncertainty, unverified: theme.live }, reveal);
      drawPresetMetric(ctx, rect, "STATUS", "EVIDENCE COVERAGE / SAMPLE", theme, reveal);
      break;
    }
    case "regional-choropleth":
      drawChoropleth(ctx, path, featureIndex, config.values, theme, config.legend, progress);
      drawLegend(ctx, rect, theme, config.legend, reveal);
      break;
    case "election-results-fill":
      Object.entries(config.results || {}).forEach(([code, result], index) => {
        drawFeature(ctx, path, featureIndex.get(code.toUpperCase()), {
          fill: result.group === "A" ? theme.accent : theme.live,
          stroke: theme.paper,
          lineWidth: 2,
          alpha: smootherstep(index * 0.12, index * 0.12 + 0.34, progress) * 0.88,
        });
      });
      break;
    case "conflict-zone-hatch":
      (config.countryCodes || []).forEach((code, index) => {
        drawHatchedFeature(ctx, path, featureIndex.get(String(code).toUpperCase()), rect, theme, smootherstep(0.14 + index * 0.12, 0.52 + index * 0.12, progress));
      });
      break;
    case "disputed-boundary-dash":
      drawGeoLine(ctx, path, config.line, theme, { progress: reveal, color: theme.live, width: 4, dash: [12, 10] });
      break;
    case "buffer-zone-band":
      drawGeoLine(ctx, path, config.line, theme, { progress: reveal, color: colorWithAlpha(theme.accent, 0.22), width: 42 });
      drawGeoLine(ctx, path, config.line, theme, { progress: reveal, color: theme.accent, width: 3, dash: [10, 8] });
      break;
    case "disaster-radius":
      drawRadius(ctx, d3, path, config.target?.coordinates, config.radiusKm, theme, { progress: reveal });
      drawCrosshair(ctx, projection, config.target, theme, reveal);
      break;
    case "spotlight-dim":
      drawFeature(ctx, path, featureIndex.get(targetCode), { fill: theme.land, stroke: theme.accent, lineWidth: 5, alpha: reveal });
      break;
    default:
      break;
  }
}

function renderRoutes(state, definition, config, progress) {
  const { ctx, d3, features, rect, theme } = state;
  const { projection, globe } = baseProjectionForDefinition(d3, definition, config, rect, features, progress);
  const path = drawBaseMap(ctx, d3, projection, features, theme, { globe, muted: true });
  const drawProgress = smootherstep(0.08, 0.86, progress);

  if (definition.id === "great-circle-route") {
    drawRoute(ctx, d3, path, projection, config.route, theme, { progress: drawProgress, width: 5.5, labels: true });
  } else if (definition.id === "multi-leg-journey") {
    drawRoute(ctx, d3, path, projection, config.route, theme, { progress: drawProgress, width: 5, labels: true });
  } else if (definition.id === "bilateral-flow") {
    drawRoute(ctx, d3, path, projection, config.route, theme, { progress: drawProgress, width: 5, color: theme.accent, labels: true });
    drawRoute(ctx, d3, path, projection, [...normalizeRoute(config.route)].reverse(), theme, {
      progress: smootherstep(0.28, 0.94, progress), width: 3, color: theme.live, dash: [8, 10], marker: true,
    });
  } else if (["trade-flow-ribbons", "shipping-lanes"].includes(definition.id)) {
    const routes = config.routes || [];
    const maxValue = Math.max(...routes.map((route) => Number(route.value) || 1), 1);
    routes.forEach((route, index) => {
      const local = smootherstep(index * 0.1, 0.72 + index * 0.08, progress);
      drawRoute(ctx, d3, path, projection, route.points, theme, {
        progress: local,
        width: 2.5 + Math.sqrt((Number(route.value) || 1) / maxValue) * 8,
        color: index % 2 ? theme.live : theme.accent,
        marker: false,
        alpha: 0.82,
      });
    });
    (config.points || []).forEach((point, index) => drawProjectedPoint(ctx, projection, point, theme, { radius: 8, ring: 8, alpha: smootherstep(0.55 + index * 0.05, 0.78 + index * 0.05, progress), label: point.name }));
  } else if (definition.id === "migration-flow") {
    (config.routes || []).forEach((route, index) => {
      const local = smootherstep(index * 0.09, 0.82 + index * 0.05, progress);
      const tip = drawRoute(ctx, d3, path, projection, route.points, theme, { progress: local, width: 3, color: theme.accent, dash: [8, 12], marker: false, alpha: 0.72 });
      if (tip) {
        for (let dot = 0; dot < 4; dot += 1) {
          const delayed = clamp(local - dot * 0.08);
          const coords = partialCoordinates(routeCoordinates(d3, route.points), delayed).at(-1);
          if (coords) drawProjectedPoint(ctx, projection, coords, theme, { radius: 4.5, alpha: 0.88 - dot * 0.13, fill: theme.paper, stroke: theme.live });
        }
      }
    });
  } else if (definition.id === "flight-network") {
    (config.routes || []).forEach((route, index) => {
      drawRoute(ctx, d3, path, projection, route.points, theme, {
        progress: smootherstep(index * 0.08, 0.7 + index * 0.08, progress),
        width: 3 + (Number(route.value) || 1) / 32,
        color: index % 2 ? theme.accent : theme.live,
        marker: true,
      });
    });
    drawProjectedPoint(ctx, projection, config.hub, theme, { radius: 12, ring: 16, label: config.hub?.name || "HUB" });
  } else if (definition.id === "pipeline-trace") {
    drawGeoLine(ctx, path, config.line, theme, { progress: drawProgress, color: colorWithAlpha(theme.accent, 0.22), width: 18 });
    drawGeoLine(ctx, path, config.line, theme, { progress: drawProgress, color: theme.paper, width: 4, dash: [14, 8] });
    drawMetric(ctx, rect.x + 24, rect.y + 82, `${formatNumber(config.value)}%`, config.unit || "capacity", theme, smootherstep(0.55, 0.82, progress));
  } else if (definition.id === "supply-chain-hop") {
    drawRoute(ctx, d3, path, projection, config.route, theme, { progress: drawProgress, width: 5, labels: false });
    normalizeRoute(config.route).forEach((point, index) => {
      const stage = config.stages?.[index] || `STAGE ${index + 1}`;
      drawProjectedPoint(ctx, projection, point, theme, {
        radius: 10,
        ring: 8,
        alpha: smootherstep(index / Math.max(1, config.route.length) - 0.08, index / Math.max(1, config.route.length) + 0.12, drawProgress),
        label: stage,
        labelSide: index % 2 ? -1 : 1,
      });
    });
  } else if (definition.id === "chokepoint-focus") {
    (config.routes || []).forEach((route, index) => drawRoute(ctx, d3, path, projection, route.points, theme, { progress: drawProgress, width: 3 + index * 2, color: index ? theme.live : theme.accent, marker: false }));
    drawCrosshair(ctx, projection, config.target, theme, smootherstep(0.52, 0.82, progress));
  } else if (definition.id === "route-disruption") {
    const routes = config.routes || [];
    const maxValue = Math.max(...routes.map((route) => Number(route.value) || 1), 1);
    routes.forEach((route, index) => {
      const local = smootherstep(index * 0.1, 0.68 + index * 0.08, progress);
      const status = String(route.status || "active");
      drawRoute(ctx, d3, path, projection, route.points, theme, {
        progress: local,
        width: status === "blocked" ? 5 : 2.5 + Math.sqrt((Number(route.value) || 1) / maxValue) * 7,
        color: statusColor(theme, status),
        dash: status === "blocked" ? [14, 10] : status === "detour" ? [8, 9] : [],
        marker: status !== "blocked",
        alpha: status === "blocked" ? 0.9 : 0.78,
      });
    });
    drawPresetMetric(ctx, rect, "DISRUPTION", "ROUTE STATUS / SAMPLE", theme, smootherstep(0.42, 0.72, progress));
  } else if (definition.id === "network-branch") {
    const nodes = new Map((config.nodes || []).map((node) => [String(node.id), node]));
    const links = config.links || [];
    links.forEach((link, index) => {
      const from = nodes.get(String(link.from));
      const to = nodes.get(String(link.to));
      if (!from || !to) return;
      const local = smootherstep(index * 0.08, 0.58 + index * 0.08, progress);
      drawRoute(ctx, d3, path, projection, [from, to], theme, {
        progress: local,
        width: 2.5 + Math.sqrt(Number(link.value) || 1) / 8,
        color: statusColor(theme, link.status || "active"),
        dash: link.status === "blocked" ? [14, 10] : link.status === "detour" ? [8, 9] : [],
        marker: true,
        alpha: 0.82,
      });
    });
    (config.nodes || []).forEach((node, index) => drawProjectedPoint(ctx, projection, node, theme, {
      radius: 9,
      ring: 9,
      fill: statusColor(theme, node.status || "active"),
      stroke: theme.paper,
      alpha: smootherstep(index * 0.08, 0.54 + index * 0.08, progress),
      label: node.name || node.id,
      labelSide: index % 2 ? -1 : 1,
    }));
    drawPresetMetric(ctx, rect, "NETWORK", "DEPENDENCY BRANCH / SAMPLE", theme, smootherstep(0.45, 0.75, progress));
  } else if (definition.id === "flow-shift") {
    const transition = smootherstep(0.24, 0.76, progress);
    const drawFlowSet = (routes, alpha, color) => {
      const maxValue = Math.max(...(routes || []).map((route) => Number(route.value) || 1), 1);
      (routes || []).forEach((route, index) => drawRoute(ctx, d3, path, projection, route.points, theme, {
        progress: smootherstep(index * 0.1, 0.68 + index * 0.08, progress),
        width: 2.5 + Math.sqrt((Number(route.value) || 1) / maxValue) * 7,
        color,
        marker: false,
        alpha,
      }));
    };
    drawFlowSet(config.beforeRoutes, 1 - transition, theme.secondary);
    drawFlowSet(config.afterRoutes, transition, theme.accent);
    drawPresetMetric(ctx, rect, transition > 0.5 ? "UPDATED" : "BASELINE", "COMPARABLE FLOW STATE / SAMPLE", theme, transition);
  } else if (definition.id === "source-sink-flow") {
    const sources = new Map((config.sources || []).map((node) => [String(node.id), node]));
    const sinks = new Map((config.sinks || []).map((node) => [String(node.id), node]));
    const maxValue = Math.max(...(config.flows || []).map((flow) => Number(flow.value) || 1), 1);
    (config.flows || []).forEach((flow, index) => {
      const from = sources.get(String(flow.from));
      const to = sinks.get(String(flow.to));
      if (!from || !to) return;
      drawRoute(ctx, d3, path, projection, [from, to], theme, {
        progress: smootherstep(index * 0.08, 0.68 + index * 0.08, progress),
        width: 2.5 + Math.sqrt((Number(flow.value) || 1) / maxValue) * 8,
        color: index % 2 ? theme.live : theme.accent,
        marker: true,
        alpha: 0.8,
      });
    });
    [...(config.sources || []), ...(config.sinks || [])].forEach((node, index) => drawProjectedPoint(ctx, projection, node, theme, {
      radius: 8,
      ring: 8,
      fill: index < (config.sources || []).length ? theme.accent : theme.paper,
      stroke: index < (config.sources || []).length ? theme.paper : theme.live,
      alpha: smootherstep(0.22, 0.62, progress),
      label: node.name || node.id,
      labelSide: index % 2 ? -1 : 1,
    }));
    drawPresetMetric(ctx, rect, "FLOW", "SOURCE → SINK / SAMPLE", theme, smootherstep(0.45, 0.75, progress));
  }
}

function renderChange(state, definition, config, progress) {
  const { ctx, d3, features, featureIndex, rect, theme } = state;
  const { projection, globe } = baseProjectionForDefinition(d3, definition, config, rect, features, progress);
  const path = drawBaseMap(ctx, d3, projection, features, theme, { globe, muted: true });
  const reveal = smootherstep(0.1, 0.86, progress);

  if (definition.id === "before-after-swipe") {
    /* Split-time states on one rotating globe: the "before" state fades as
       the "after" state sweeps in along the globe surface. */
    drawChoropleth(ctx, path, featureIndex, config.before?.values, theme, { min: 0, max: 100 }, 1);
    const sweep = easeInOutQuint(reveal);
    ctx.save();
    ctx.beginPath();
    ctx.arc(rect.x + rect.width / 2, rect.y + rect.height / 2, Math.max(rect.width, rect.height), 0, TAU);
    ctx.clip();
    ctx.globalAlpha = sweep;
    drawBaseMap(ctx, d3, projection, features, theme, { globe, muted: true });
    drawChoropleth(ctx, path, featureIndex, config.after?.values, theme, { min: 0, max: 100 }, 1);
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = theme.paper;
    ctx.lineWidth = 5;
    ctx.beginPath();
    const divider = rect.x + rect.width * mix(0.08, 0.92, sweep);
    ctx.moveTo(divider, rect.y + 8);
    ctx.lineTo(divider, rect.y + rect.height - 8);
    ctx.stroke();
    ctx.restore();
  } else if (definition.id === "historical-border-morph") {
    const stages = config.stages || [];
    const exact = reveal * Math.max(0, stages.length - 1);
    const active = Math.min(stages.length - 1, Math.floor(exact));
    const next = Math.min(stages.length - 1, active + 1);
    const blend = exact - active;
    (stages[active]?.countryCodes || []).forEach((code) => drawFeature(ctx, path, featureIndex.get(code), { fill: theme.accent, stroke: theme.paper, lineWidth: 3, alpha: 0.82 * (1 - blend) }));
    (stages[next]?.countryCodes || []).forEach((code) => drawFeature(ctx, path, featureIndex.get(code), { fill: theme.live, stroke: theme.paper, lineWidth: 3, alpha: 0.82 * blend }));
    drawMetric(ctx, rect.x + 24, rect.y + 78, stages[blend > 0.5 ? next : active]?.label || "PHASE", "SUPPLIED GEOMETRY STATE", theme, 1);
  } else if (definition.id === "time-lapse-choropleth") {
    const stages = config.stages || [];
    const exact = reveal * Math.max(0, stages.length - 0.001);
    const active = Math.min(stages.length - 1, Math.floor(exact));
    drawChoropleth(ctx, path, featureIndex, stages[active]?.values, theme, config.legend, 1);
    drawLegend(ctx, rect, theme, config.legend, 1);
    drawMetric(ctx, rect.x + rect.width - 24, rect.y + 82, stages[active]?.label || "", "FIXED SCALE", theme, 1, "right");
  } else if (definition.id === "ranking-wave") {
    (config.rankedPoints || []).forEach((point, index) => {
      const local = smootherstep(index * 0.1, index * 0.1 + 0.3, reveal);
      const projected = drawProjectedPoint(ctx, projection, point, theme, { radius: 8 + Math.sqrt(Number(point.value) || 1) * 0.8 * local, ring: 8, alpha: local, label: `#${point.rank} ${point.name}` });
      if (projected) drawMetric(ctx, projected[0], projected[1] - 22, formatNumber(point.value), "", theme, local, "center");
    });
  } else if (definition.id === "proportional-bubbles") {
    const max = Math.max(...(config.points || []).map((point) => Number(point.value) || 1), 1);
    (config.points || []).forEach((point, index) => {
      const local = smootherstep(index * 0.06, 0.52 + index * 0.06, reveal);
      drawProjectedPoint(ctx, projection, point, theme, { radius: 7 + Math.sqrt((Number(point.value) || 1) / max) * 32 * local, ring: 0, alpha: local * 0.8, fill: colorWithAlpha(theme.accent, 0.75), stroke: theme.paper, label: `${point.name} ${point.value}` });
    });
  } else if (definition.id === "delta-bubbles") {
    const points = config.points || [];
    const maxDelta = Math.max(...points.map((point) => Math.abs(Number(point.delta) || 0)), 1);
    points.forEach((point, index) => {
      const local = smootherstep(index * 0.08, 0.58 + index * 0.08, reveal);
      const delta = Number(point.delta) || 0;
      const signed = `${delta >= 0 ? "+" : ""}${formatNumber(delta)}`;
      drawProjectedPoint(ctx, projection, point, theme, {
        radius: 7 + Math.sqrt(Math.abs(delta) / maxDelta) * 34 * local,
        ring: 8,
        alpha: local * 0.9,
        fill: colorWithAlpha(delta >= 0 ? theme.accent : theme.live, 0.8),
        stroke: theme.paper,
        label: `${point.name || point.label || "POINT"} ${signed}`,
        labelSide: index % 2 ? -1 : 1,
      });
    });
    drawPresetMetric(ctx, rect, "DELTA", config.unit || "SIGNED CHANGE / SAMPLE", theme, reveal);
  } else if (definition.id === "rank-shift") {
    const before = new Map((config.before || []).map((point) => [String(point.id), point]));
    const transition = smootherstep(0.18, 0.82, reveal);
    (config.after || []).forEach((point, index) => {
      const previous = before.get(String(point.id));
      const local = smootherstep(index * 0.08, 0.56 + index * 0.08, reveal);
      if (previous) drawGeoLine(ctx, path, [previous.coordinates, point.coordinates], theme, { progress: transition, color: colorWithAlpha(theme.secondary, 0.7), width: 3, dash: [8, 8], alpha: local });
      if (previous) drawProjectedPoint(ctx, projection, previous, theme, { radius: 7, alpha: local * (1 - transition) * 0.7, fill: theme.secondary, stroke: theme.paper, label: `#${previous.rank}` });
      drawProjectedPoint(ctx, projection, point, theme, {
        radius: 8 + Math.sqrt(Math.max(1, Number(point.value) || 1)) * 0.7,
        ring: 8,
        alpha: local * transition,
        fill: theme.accent,
        stroke: theme.paper,
        label: `#${point.rank} ${point.name || point.id}`,
        labelSide: index % 2 ? -1 : 1,
      });
      if (previous && Number(previous.rank) !== Number(point.rank)) {
        const projected = projection(asCoordinates(point.coordinates));
        if (projected) drawMetric(ctx, projected[0], projected[1] - 26, `#${previous.rank} → #${point.rank}`, "RANK", theme, local * transition, "center");
      }
    });
    drawPresetMetric(ctx, rect, "RANK SHIFT", "COMPARABLE ORDER / SAMPLE", theme, reveal);
  } else if (definition.id === "dot-density") {
    Object.entries(config.values || {}).forEach(([code, value], countryIndex) => {
      const feature = featureIndex.get(code);
      const centroid = feature ? path.centroid(feature) : null;
      if (!centroid || !centroid.every(Number.isFinite)) return;
      const count = Math.min(22, Math.max(1, Math.round(Number(value) / Number(config.dotUnit || 5))));
      for (let index = 0; index < count; index += 1) {
        const angle = index * 2.399963;
        const radius = 5 + Math.sqrt(index) * 7;
        const x = centroid[0] + Math.cos(angle) * radius;
        const y = centroid[1] + Math.sin(angle) * radius;
        ctx.save();
        ctx.globalAlpha = smootherstep((countryIndex + index / count) * 0.035, 0.58 + countryIndex * 0.035, reveal);
        ctx.fillStyle = theme.live;
        ctx.beginPath();
        ctx.arc(x, y, 3.2, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
    });
  } else if (definition.id === "heatmap-bloom") {
    (config.points || []).forEach((point, index) => {
      const projected = projection(asCoordinates(point.coordinates));
      if (!projected) return;
      const local = smootherstep(index * 0.08, 0.58 + index * 0.08, reveal);
      const radius = (40 + Number(point.value || 1) * 1.2) * local;
      const gradient = ctx.createRadialGradient(projected[0], projected[1], 0, projected[0], projected[1], Math.max(1, radius));
      gradient.addColorStop(0, colorWithAlpha(theme.live, 0.64));
      gradient.addColorStop(0.45, colorWithAlpha(theme.accent, 0.32));
      gradient.addColorStop(1, colorWithAlpha(theme.accent, 0));
      ctx.fillStyle = gradient;
      ctx.fillRect(projected[0] - radius, projected[1] - radius, radius * 2, radius * 2);
    });
  } else if (definition.id === "uncertainty-cloud") {
    /* Uncertainty renders as a radial field clipped to the globe surface. */
    const point = projection(asCoordinates(config.target?.coordinates));
    const radius = Math.min(rect.width, rect.height) * 0.16 * reveal;
    const gradient = ctx.createRadialGradient(point[0], point[1], radius * 0.12, point[0], point[1], Math.max(1, radius));
    gradient.addColorStop(0, colorWithAlpha(theme.uncertainty, 0.48));
    gradient.addColorStop(Number(config.confidence || 0.7), colorWithAlpha(theme.uncertainty, 0.2));
    gradient.addColorStop(1, colorWithAlpha(theme.uncertainty, 0));
    ctx.save();
    ctx.beginPath();
    ctx.arc(rect.x + rect.width / 2, rect.y + rect.height / 2, Math.max(rect.width, rect.height), 0, TAU);
    ctx.clip();
    ctx.fillStyle = gradient;
    ctx.fillRect(point[0] - radius, point[1] - radius, radius * 2, radius * 2);
    ctx.restore();
    drawPresetMetric(ctx, rect, `${Math.round(Number(config.confidence || 0) * 100)}%`, "CONFIDENCE / SAMPLE", theme, reveal);
  } else if (definition.id === "comparison-split-map") {
    /* Two globe states shown sequentially on one rotating globe, rather than
       side-by-side flat panels. */
    const phase = reveal < 0.5 ? 0 : 1;
    const local = phase === 0 ? reveal * 2 : (reveal - 0.5) * 2;
    const panel = phase === 0 ? config.left : config.right;
    if (panel) {
      const panelProjection = makeGlobeProjection(d3, rect, [
        -asCoordinates(panel.target?.coordinates)[0],
        -asCoordinates(panel.target?.coordinates)[1],
        0,
      ], 1.35);
      const panelPath = drawBaseMap(ctx, d3, panelProjection, features, theme, { globe: true, muted: true, alpha: 1 });
      drawChoropleth(ctx, panelPath, featureIndex, panel.values, theme, { min: 0, max: 100 }, local);
      drawMetric(ctx, rect.x + 22, rect.y + 70, panel.label, phase ? "RIGHT" : "LEFT", theme, local);
    }
  } else if (definition.id === "small-multiple-regions") {
    /* Multiple small globes side by side: each panel is its own orthographic
       globe focused on the region. */
    const gap = 18;
    const panelWidth = (rect.width - gap) / 2;
    const panelHeight = (rect.height - gap) / 2;
    (config.panels || []).slice(0, 4).forEach((panel, index) => {
      const panelRect = { x: rect.x + (index % 2) * (panelWidth + gap), y: rect.y + Math.floor(index / 2) * (panelHeight + gap), width: panelWidth, height: panelHeight };
      ctx.save();
      ctx.beginPath();
      ctx.rect(panelRect.x, panelRect.y, panelRect.width, panelRect.height);
      ctx.clip();
      const panelProjection = makeGlobeProjection(d3, panelRect, [
        -asCoordinates(panel.target?.coordinates)[0],
        -asCoordinates(panel.target?.coordinates)[1],
        0,
      ], 1.1);
      const panelPath = drawBaseMap(ctx, d3, panelProjection, features, theme, { globe: true, muted: true, alpha: smootherstep(index * 0.09, 0.48 + index * 0.09, reveal) });
      drawChoropleth(ctx, panelPath, featureIndex, panel.values, theme, { min: 0, max: 100 }, reveal);
      ctx.restore();
      drawMetric(ctx, panelRect.x + 18, panelRect.y + 52, panel.label, `PANEL ${index + 1}`, theme, smootherstep(index * 0.09, 0.48 + index * 0.09, reveal));
    });
  }
}

function renderEvents(state, definition, config, progress) {
  const { ctx, d3, features, rect, theme } = state;
  const { projection, globe } = baseProjectionForDefinition(d3, definition, config, rect, features, progress);
  const path = drawBaseMap(ctx, d3, projection, features, theme, { globe, muted: true });
  const reveal = smootherstep(0.08, 0.86, progress);

  if (definition.id === "earthquake-ripple") {
    for (let ring = 0; ring < 4; ring += 1) {
      const local = clamp(reveal * 1.35 - ring * 0.18);
      drawRadius(ctx, d3, path, config.target?.coordinates, 40 + ring * 52, theme, { progress: local, fill: colorWithAlpha(theme.live, 0.025), stroke: colorWithAlpha(theme.live, 1 - local * 0.45) });
    }
    drawCrosshair(ctx, projection, config.target, theme, reveal);
    drawMetric(ctx, rect.x + 24, rect.y + 80, `M${config.magnitude}`, "ILLUSTRATIVE MAGNITUDE", theme, reveal);
  } else if (definition.id === "storm-track") {
    const observed = (config.track || []).filter((point) => point.status === "observed");
    const forecast = (config.track || []).filter((point) => point.status === "forecast");
    drawGeoLine(ctx, path, observed.map((point) => point.coordinates), theme, { progress: reveal, color: theme.live, width: 6 });
    if (observed.length && forecast.length) forecast.unshift(observed.at(-1));
    drawGeoLine(ctx, path, forecast.map((point) => point.coordinates), theme, { progress: smootherstep(0.35, 0.95, reveal), color: theme.accent, width: 4, dash: [12, 10] });
    (config.track || []).forEach((point, index) => drawProjectedPoint(ctx, projection, point, theme, { radius: 7 + index * 1.5, ring: point.status === "forecast" ? 9 : 0, alpha: smootherstep(index * 0.12, 0.42 + index * 0.12, reveal), label: point.label }));
  } else if (definition.id === "weather-front") {
    drawGeoLine(ctx, path, config.line, theme, { progress: reveal, color: theme.paper, width: 7 });
    const line = Array.isArray(config.line) ? config.line : [];
    line.forEach((point, index) => {
      if (index % 2 || index / Math.max(1, line.length - 1) > reveal) return;
      const projected = projection(point);
      if (!projected) return;
      ctx.save();
      ctx.translate(projected[0], projected[1]);
      ctx.fillStyle = index % 4 ? theme.accent : theme.live;
      ctx.beginPath();
      ctx.moveTo(-9, 10);
      ctx.lineTo(0, -10);
      ctx.lineTo(9, 10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  } else if (["wildfire-spread", "flood-inundation"].includes(definition.id)) {
    const stages = config.stages || [];
    stages.forEach((stage, index) => {
      const local = smootherstep(index * 0.16, 0.5 + index * 0.16, reveal);
      drawRadius(ctx, d3, path, config.target?.coordinates, stage.radiusKm, theme, {
        progress: local,
        fill: definition.id === "wildfire-spread" ? colorWithAlpha(theme.live, 0.08 + index * 0.04) : colorWithAlpha(theme.ocean, 0.12 + index * 0.05),
        stroke: definition.id === "wildfire-spread" ? theme.live : theme.ocean,
        dash: definition.id === "wildfire-spread" ? [8, 7] : [],
      });
    });
    drawCrosshair(ctx, projection, config.target, theme, reveal);
    const active = Math.min(stages.length - 1, Math.floor(reveal * stages.length));
    drawMetric(ctx, rect.x + 24, rect.y + 82, stages[active]?.label || "", definition.id === "wildfire-spread" ? "OBSERVED PERIMETER / SAMPLE" : "MODELED EXTENT / SAMPLE", theme, reveal);
  } else if (definition.id === "outage-cascade") {
    drawRoute(ctx, d3, path, projection, config.route, theme, { progress: reveal, width: 4, color: theme.secondary, marker: false });
    normalizeRoute(config.route).forEach((point, index) => {
      const local = smootherstep(index * 0.14, index * 0.14 + 0.28, reveal);
      drawProjectedPoint(ctx, projection, point, theme, { radius: 11, ring: 10, alpha: local, fill: local > 0.7 ? theme.live : theme.accent, stroke: theme.paper, label: config.stages?.[index] || point.name, labelSide: index % 2 ? -1 : 1 });
    });
  } else if (definition.id === "day-night-terminator") {
    const start = Number(config.solar?.startLongitude || -30);
    const end = Number(config.solar?.endLongitude || 55);
    const longitude = mix(start, end, easeInOutQuint(reveal));
    const night = d3.geoCircle().center([longitude + 180, 0]).radius(90)();
    drawFeature(ctx, path, night, { fill: colorWithAlpha(theme.matShadow, 0.68), stroke: colorWithAlpha(theme.paper, 0.34), lineWidth: 2, alpha: 1 });
    drawCrosshair(ctx, projection, config.target, theme, smootherstep(0.55, 0.82, reveal));
  } else if (definition.id === "satellite-orbit") {
    const inclination = Number(config.orbit?.inclination || 51.6);
    const laps = Number(config.orbit?.laps || 1.25);
    const orbitPoints = [];
    for (let index = 0; index <= 180; index += 1) {
      const phase = index / 180 * TAU * laps;
      orbitPoints.push([((phase * 180 / Math.PI) - 180) % 360, Math.sin(phase) * inclination]);
    }
    const partial = partialCoordinates(orbitPoints, reveal);
    drawGeoLine(ctx, path, partial, theme, { progress: 1, color: theme.accent, width: 3, dash: [7, 8] });
    const tip = partial.at(-1);
    if (tip) drawProjectedPoint(ctx, projection, tip, theme, { radius: 9, ring: 12, fill: theme.paper, stroke: theme.live, label: "SAT / SAMPLE" });
    (config.points || []).forEach((point, index) => drawProjectedPoint(ctx, projection, point, theme, { radius: 6, ring: 8, alpha: smootherstep(0.45 + index * 0.06, 0.72 + index * 0.06, reveal), label: point.name }));
  } else if (definition.id === "event-cluster") {
    const points = config.points || [];
    points.forEach((point, index) => {
      const local = smootherstep(index * 0.1, 0.5 + index * 0.1, reveal);
      const status = point.status || "reported";
      drawProjectedPoint(ctx, projection, point, theme, {
        radius: 7 + index * 1.4,
        ring: 10 + index * 2,
        alpha: local,
        fill: statusColor(theme, status),
        stroke: theme.paper,
        label: point.label || point.name || `EVENT ${index + 1}`,
        labelSide: index % 2 ? -1 : 1,
      });
    });
    drawPresetMetric(ctx, rect, `${points.length} EVENTS`, "CHRONOLOGICAL CLUSTER / SAMPLE", theme, reveal);
  } else if (definition.id === "forecast-cone") {
    const left = config.cone?.left || [];
    const right = config.cone?.right || [];
    const cone = polygonFeature([...left, ...[...right].reverse()]);
    drawFeature(ctx, path, cone, { fill: colorWithAlpha(theme.uncertainty, 0.2), stroke: colorWithAlpha(theme.uncertainty, 0.8), lineWidth: 2.5, alpha: reveal });
    drawGeoLine(ctx, path, config.observed, theme, { progress: reveal, color: theme.live, width: 6 });
    const forecastLine = config.observed?.length ? [config.observed.at(-1), ...(config.forecast || []).slice(1)] : config.forecast;
    drawGeoLine(ctx, path, forecastLine, theme, { progress: smootherstep(0.32, 0.94, reveal), color: theme.accent, width: 4, dash: [12, 10] });
    (config.forecast || []).forEach((point, index) => drawProjectedPoint(ctx, projection, { coordinates: point, label: `FCST ${index + 1}` }, theme, {
      radius: 6,
      ring: index === (config.forecast || []).length - 1 ? 11 : 0,
      alpha: smootherstep(0.38 + index * 0.1, 0.68 + index * 0.1, reveal),
      fill: theme.paper,
      stroke: theme.accent,
      label: index === (config.forecast || []).length - 1 ? "FORECAST" : "",
    }));
    drawPresetMetric(ctx, rect, `${Math.round(Number(config.confidence || 0) * 100)}%`, "FORECAST CONFIDENCE / SAMPLE", theme, reveal);
  } else if (definition.id === "impact-layers") {
    const layers = [...(config.layers || [])].sort((a, b) => Number(b.radiusKm) - Number(a.radiusKm));
    layers.forEach((layer, index) => {
      const local = smootherstep(index * 0.12, 0.54 + index * 0.12, reveal);
      const fill = index % 2 ? colorWithAlpha(theme.live, 0.1) : colorWithAlpha(theme.accent, 0.12);
      drawRadius(ctx, d3, path, config.target?.coordinates, layer.radiusKm, theme, {
        progress: local,
        fill,
        stroke: index % 2 ? theme.live : theme.accent,
        dash: index % 2 ? [9, 8] : [],
      });
    });
    drawCrosshair(ctx, projection, config.target, theme, reveal);
    drawProjectedPoint(ctx, projection, config.target, theme, { radius: 6, ring: 10, fill: theme.paper, stroke: theme.live, alpha: reveal, label: config.target?.name || "IMPACT SITE" });
    const active = layers[Math.min(layers.length - 1, Math.floor(reveal * layers.length))];
    drawPresetMetric(ctx, rect, active?.label || "IMPACT", `${active?.value ?? ""} ${active?.unit || ""}`.trim() || "MEASURED EXTENT / SAMPLE", theme, reveal);
  }
}

export function createGlobeMapRenderer({
  canvas,
  features,
  width,
  height,
  format,
  theme = {},
  drawBackground = true,
  drawGlobeSurface = true,
} = {}) {
  if (!canvas || typeof canvas.getContext !== "function") {
    throw new Error("createGlobeMapRenderer requires a canvas element");
  }
  const resolvedWidth = Number(width || canvas.width || 1920);
  const resolvedHeight = Number(height || canvas.height || 1080);
  const resolvedFormat = format || (resolvedHeight > resolvedWidth ? "portrait" : "landscape");
  const resolvedTheme = Object.freeze({ ...GLOBE_MAP_THEME, ...theme });
  const collection = makeFeatureCollection(features);
  const featureIndex = makeFeatureIndex(collection);
  const d3 = globalThis.d3;
  const ctx = canvas.getContext("2d", { alpha: !(drawBackground || drawGlobeSurface) });
  canvas.width = resolvedWidth;
  canvas.height = resolvedHeight;
  drawSurfaceByContext.set(ctx, drawGlobeSurface !== false);

  // Legacy D3-based renderer — retained for catalog previews and showcase diffs only.
  // Production video compositions should use the native renderer (globe-native-annotation-renderer.js).
  function clear() {
    ctx.clearRect(0, 0, resolvedWidth, resolvedHeight);
    if (drawBackground) drawDraftingBackground(ctx, resolvedWidth, resolvedHeight, resolvedTheme);
  }

  function render(animationId, timeSeconds, overrides = {}) {
    const definition = getGlobeMapAnimation(animationId);
    const validation = validateGlobeMapAnimationConfig(animationId, overrides);
    if (!validation.valid) {
      const details = [...validation.missing, ...validation.issues].join(", ");
      throw new Error(`Cannot render ${animationId}: ${details}`);
    }
    const config = validation.config;
    const progress = clamp(Number(timeSeconds) / Math.max(0.001, definition.duration));
    const rect = projectionRect(resolvedFormat, resolvedWidth, resolvedHeight);

    ctx.save();
    ctx.clearRect(0, 0, resolvedWidth, resolvedHeight);
    if (drawBackground) drawDraftingBackground(ctx, resolvedWidth, resolvedHeight, resolvedTheme);
    if (!d3 || collection.features.length === 0) {
      if (drawGlobeSurface) drawFallback(ctx, rect, resolvedTheme);
      ctx.restore();
      return Object.freeze({ definition, config, progress, fallback: true });
    }

    const state = {
      ctx,
      d3,
      features: collection,
      featureIndex,
      rect,
      theme: resolvedTheme,
      width: resolvedWidth,
      height: resolvedHeight,
      format: resolvedFormat,
    };

    if (definition.family === "camera") renderCamera(state, definition, config, progress);
    else if (definition.family === "highlight") renderHighlight(state, definition, config, progress);
    else if (definition.family === "route") renderRoutes(state, definition, config, progress);
    else if (definition.family === "change") renderChange(state, definition, config, progress);
    else if (definition.family === "event") renderEvents(state, definition, config, progress);

    ctx.restore();
    return Object.freeze({ definition, config, progress, fallback: false });
  }

  function renderHeroFrame(animationId, overrides = {}) {
    const definition = getGlobeMapAnimation(animationId);
    return render(animationId, definition.duration * 0.78, overrides);
  }

  return Object.freeze({
    render,
    renderHeroFrame,
    clear,
    width: resolvedWidth,
    height: resolvedHeight,
    format: resolvedFormat,
    featureCount: collection.features.length,
    drawGlobeSurface: drawGlobeSurface !== false,
  });
}
