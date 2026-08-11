/* ============================================================
   Globe tour — one continuous globe that travels between countries.

   Different from createNewsGlobe, which flies a camera at a single
   target and is built to be used once per story. Here the globe remains one
   continuous instrument, while the lens can breathe between chapters and
   close shots can intentionally crop the sphere;
   the planet rotates on its own axis to bring each country round to face the
   viewer, and that country lights up while its headline is on screen.

   Rotation keeps the pole up. To bring (lon, lat) to face the camera:
     rotation.y = PI/2 - (lon + 180) * DEG
     rotation.x = lat * DEG
   The y term is unwrapped across stops so the globe always takes the
   short way round instead of unwinding through several turns.
   ============================================================ */

import * as THREE from "../vendor/three.module.js";
import {
  DEG,
  EARTH_RADIUS,
  TEXTURES,
  borderGeometry,
  countryFillTexture,
  latLonVector,
} from "./globe.js";

import { clamp01, easeInOutQuint, mix, smootherstep } from "./animation-math.js";
export { clamp, clamp01, easeInOutQuint, mix, smootherstep } from "./animation-math.js";
const POST_ARRIVAL_DRIFT = 0.006;
const GLOBE_RENDER_SCALE = 2 / 3;

function createGraticule(radius) {
  const positions = [];
  const addSegment = (from, to) => {
    positions.push(from.x, from.y, from.z, to.x, to.y, to.z);
  };

  for (let latitude = -60; latitude <= 60; latitude += 30) {
    let previous = latLonVector(-180, latitude, radius);
    for (let longitude = -176; longitude <= 180; longitude += 4) {
      const next = latLonVector(longitude, latitude, radius);
      addSegment(previous, next);
      previous = next;
    }
  }

  for (let longitude = -150; longitude <= 180; longitude += 30) {
    let previous = latLonVector(longitude, -72, radius);
    for (let latitude = -68; latitude <= 72; latitude += 4) {
      const next = latLonVector(longitude, latitude, radius);
      addSegment(previous, next);
      previous = next;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.LineBasicMaterial({
    color: 0x617b6e,
    transparent: true,
    opacity: 0.1,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
  const lines = new THREE.LineSegments(geometry, material);
  lines.renderOrder = 2.5;
  return lines;
}

function rotationFor(coordinates) {
  const [longitude, latitude] = coordinates;
  return {
    y: Math.PI / 2 - (Number(longitude) + 180) * DEG,
    x: Number(latitude) * DEG,
  };
}

/* Pick the equivalent angle nearest the previous one so the globe never
   spins the long way round to reach the next country. */
function unwrap(target, previous) {
  let next = target;
  while (next - previous > Math.PI) next -= Math.PI * 2;
  while (next - previous < -Math.PI) next += Math.PI * 2;
  return next;
}

function createRouteLayer(points, radius = EARTH_RADIUS + 0.045, showMarkers = true) {
  if (!Array.isArray(points) || points.length < 2) return null;

  const positions = [];
  const markerPositions = [];
  points.forEach((point) => {
    const coordinates = point?.coordinates || [0, 0];
    const marker = latLonVector(coordinates[0], coordinates[1], radius + 0.018);
    markerPositions.push(marker.x, marker.y, marker.z);
  });

  points.forEach((point, index) => {
    if (index === points.length - 1) return;
    const from = latLonVector(point.coordinates[0], point.coordinates[1], 1).normalize();
    const to = latLonVector(points[index + 1].coordinates[0], points[index + 1].coordinates[1], 1).normalize();
    const angle = from.angleTo(to);
    const steps = Math.max(8, Math.ceil(angle / (3.5 * DEG)));
    for (let step = 0; step <= steps; step += 1) {
      if (index > 0 && step === 0) continue;
      const progress = step / steps;
      const pointOnArc = from.clone().lerp(to, progress).normalize();
      const arcLift = 1 + Math.sin(Math.PI * progress) * 0.07;
      pointOnArc.multiplyScalar(radius * arcLift);
      positions.push(pointOnArc.x, pointOnArc.y, pointOnArc.z);
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setDrawRange(0, 0);
  const material = new THREE.LineBasicMaterial({
    color: 0xe37568,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const line = new THREE.Line(geometry, material);
  line.renderOrder = 5.5;
  line.frustumCulled = false;

  let markers = null;
  let markerMaterial = null;
  if (showMarkers) {
    const markerGeometry = new THREE.BufferGeometry();
    markerGeometry.setAttribute("position", new THREE.Float32BufferAttribute(markerPositions, 3));
    markerMaterial = new THREE.PointsMaterial({
      color: 0xf5f0df,
      size: 0.075,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    markers = new THREE.Points(markerGeometry, markerMaterial);
    markers.renderOrder = 5.6;
    markers.frustumCulled = false;
  }

  const group = new THREE.Group();
  group.add(line);
  if (markers) group.add(markers);
  return {
    group,
    geometry,
    material,
    markers,
    markerMaterial,
    totalVertices: positions.length / 3,
  };
}

function createCountryFillLayer(feature, { fill, glow }, renderOrder) {
  const texture = countryFillTexture(feature, { fill, glow });
  if (!texture) return { texture: null, material: null, mesh: null };

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: THREE.FrontSide,
    blending: THREE.NormalBlending,
  });
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS + 0.009, 96, 64),
    material,
  );
  mesh.renderOrder = renderOrder;
  mesh.visible = false;
  return { texture, material, mesh };
}

export function createGlobeTour(options) {
  const {
    canvas,
    features,
    stops = [],
    idleSpin = 0.034,
    baseHeight = 1.24,
    liftHeight = 1.46,
    onFallback,
  } = options;
  const showRouteMarkers = options.showRouteMarkers !== false;
  const showRouteLayers = options.showRouteLayers !== false;
  const showCountryHighlights = options.showCountryHighlights !== false;
  const onRender = typeof options.onRender === "function" ? options.onRender : null;
  const width = Number(options.width || canvas?.width || 1080);
  const height = Number(options.height || canvas?.height || 1920);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
    premultipliedAlpha: false,
  });
  /* The globe is a transparent instrument layer, not the full-resolution
     photographic surface. Rendering it at a reduced fixed scale and letting
     the canvas upscale keeps the globe responsive in both portrait and
     landscape editions without changing the final output size. */
  renderer.setSize(
    Math.round(width * GLOBE_RENDER_SCALE),
    Math.round(height * GLOBE_RENDER_SCALE),
    false,
  );
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x2d4b3c, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;

  const scene = new THREE.Scene();

  /* Keep the legacy globe tour at its original scale unless a composition
     opts into the closer long-form camera. Story explainers pass a smaller
     default and chapter-specific camera distances below. */
  const camera = new THREE.PerspectiveCamera(31, width / height, 0.1, 100);
  const CAMERA_Z = Number(options.defaultCameraZ) || 16.4;
  const OPENING_CAMERA_Z = Number(options.openingCameraZ) || CAMERA_Z;
  const requestedOpeningHeight = Number(options.openingHeight);
  const OPENING_HEIGHT = Number.isFinite(requestedOpeningHeight) ? requestedOpeningHeight : 0.72;
  camera.position.set(0, 0, OPENING_CAMERA_Z);
  camera.lookAt(0, 0, 0);

  const planet = new THREE.Group();
  planet.position.set(0, baseHeight, 0);
  scene.add(planet);

  const loadingManager = new THREE.LoadingManager();
  let readyResolve;
  let readyReject;
  const ready = new Promise((resolve, reject) => {
    readyResolve = resolve;
    readyReject = reject;
  });
  loadingManager.onLoad = () => {
    renderAt(lastTime);
    readyResolve();
  };
  loadingManager.onError = (url) => {
    readyReject(new Error(`Unable to load globe texture: ${url}`));
    if (onFallback) onFallback(url);
  };

  const loader = new THREE.TextureLoader(loadingManager);
  const dayTexture = loader.load(TEXTURES.day);
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  const cloudTexture = loader.load(TEXTURES.clouds);
  cloudTexture.colorSpace = THREE.SRGBColorSpace;
  [dayTexture, cloudTexture].forEach((texture) => {
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  });

  const earthMaterial = new THREE.MeshStandardMaterial({
    map: dayTexture,
    roughness: 0.97,
    metalness: 0,
    color: 0xffffff,
    emissive: new THREE.Color(0x30493e),
    emissiveIntensity: 0.018,
  });

  /* Reinterpret the satellite source as a topographic paper atlas. The
     source texture contributes coastlines and terrain detail while this
     material remaps it to parchment, sage ink, contour bands and hatching. */
  earthMaterial.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      `
        #ifdef USE_MAP
          vec4 sampledDiffuseColor = texture2D(map, vMapUv);
          #ifdef DECODE_VIDEO_TEXTURE
            sampledDiffuseColor = sRGBTransferEOTF(sampledDiffuseColor);
          #endif
          float sourceLuma = dot(sampledDiffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
          float blueLead =
            sampledDiffuseColor.b - max(sampledDiffuseColor.r, sampledDiffuseColor.g);
          float oceanMask = smoothstep(-0.015, 0.095, blueLead);
          float iceMask = smoothstep(0.68, 0.91, sourceLuma);

          vec3 oceanShadow = vec3(0.29, 0.37, 0.32);
          vec3 oceanLight = vec3(0.57, 0.64, 0.57);
          vec3 landShadow = vec3(0.50, 0.46, 0.35);
          vec3 landLight = vec3(0.91, 0.84, 0.66);
          vec3 atlasInk = vec3(0.188, 0.286, 0.243);

          vec3 oceanTone = mix(
            oceanShadow,
            oceanLight,
            smoothstep(0.02, 0.46, sourceLuma)
          );
          vec3 landTone = mix(
            landShadow,
            landLight,
            smoothstep(0.10, 0.72, sourceLuma)
          );
          vec3 modelTone = mix(landTone, oceanTone, oceanMask);
          modelTone = mix(modelTone, vec3(0.95, 0.91, 0.79), iceMask);

          float landMask = 1.0 - oceanMask;
          float elevationHint = smoothstep(0.10, 0.72, sourceLuma) * landMask;

          float contourPhase = fract(elevationHint * 10.0);
          float contourDistance = min(contourPhase, 1.0 - contourPhase);
          float contourLine =
            (1.0 - smoothstep(0.018, 0.055, contourDistance)) *
            smoothstep(0.08, 0.92, elevationHint) *
            landMask;

          float hatchPhaseA = fract((vMapUv.x + vMapUv.y * 0.62) * 132.0);
          float hatchDistanceA = min(hatchPhaseA, 1.0 - hatchPhaseA);
          float hatchA = 1.0 - smoothstep(0.025, 0.075, hatchDistanceA);

          float hatchPhaseB = fract((vMapUv.x - vMapUv.y * 0.74) * 104.0);
          float hatchDistanceB = min(hatchPhaseB, 1.0 - hatchPhaseB);
          float hatchB = 1.0 - smoothstep(0.022, 0.07, hatchDistanceB);

          float terrainShadow =
            (1.0 - smoothstep(0.20, 0.60, sourceLuma)) *
            landMask;
          float hatchInk = (hatchA * 0.62 + hatchB * 0.38) * terrainShadow;

          float paperFiber =
            sin(vMapUv.x * 430.0 + sin(vMapUv.y * 57.0) * 2.4) *
            sin(vMapUv.y * 360.0 + cos(vMapUv.x * 49.0) * 2.1);
          modelTone *= 0.988 + paperFiber * 0.012;
          modelTone = mix(
            modelTone,
            atlasInk,
            clamp(contourLine * 0.13 + hatchInk * 0.12, 0.0, 0.19)
          );
          modelTone *= 0.93 + sourceLuma * 0.13;

          diffuseColor *= vec4(modelTone, sampledDiffuseColor.a);
        #endif
      `,
    );
  };
  earthMaterial.customProgramCacheKey = () => "topographic-paper-atlas-earth-v1";

  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS, 112, 72),
    earthMaterial,
  );
  planet.add(earth);

  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS * 1.014, 96, 64),
    new THREE.MeshPhongMaterial({
      map: cloudTexture,
      alphaMap: cloudTexture,
      color: 0xf3eddb,
      transparent: true,
      opacity: 0.09,
      depthWrite: false,
      shininess: 0,
    }),
  );
  planet.add(clouds);

  /* Engraved coordinate and border linework makes the globe feel like a
     physical cartographic model instead of a glossy satellite render. */
  planet.add(createGraticule(EARTH_RADIUS * 1.006));
  const borders = new THREE.LineSegments(
    borderGeometry(features, EARTH_RADIUS * 1.008),
    new THREE.LineBasicMaterial({
      color: 0x587267,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
      blending: THREE.NormalBlending,
    }),
  );
  borders.renderOrder = 3;
  planet.add(borders);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS * 1.068, 72, 48),
    new THREE.ShaderMaterial({
      uniforms: {
        uLightDirection: { value: new THREE.Vector3(-5.8, 3.8, 5.2).normalize() },
      },
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        void main() {
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uLightDirection;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        void main() {
          vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
          float rim = pow(1.0 - max(dot(vWorldNormal, viewDirection), 0.0), 2.7);
          float sun = smoothstep(-0.15, 0.8, dot(vWorldNormal, normalize(uLightDirection)));
          vec3 nightColor = vec3(0.22, 0.38, 0.30);
          vec3 dayColor = vec3(0.83, 0.86, 0.74);
          vec3 atmosphereColor = mix(nightColor, dayColor, sun);
          gl_FragColor = vec4(atmosphereColor, rim * 0.2);
        }
      `,
    }),
  );
  planet.add(atmosphere);

  const keyLight = new THREE.DirectionalLight(0xfff3d6, 2.04);
  keyLight.position.set(-5.8, 3.8, 5.2);
  scene.add(keyLight);
  scene.add(new THREE.HemisphereLight(0xf4efd8, 0x3f5e50, 1.42));

  /* One primary fill layer plus any explicitly named related-country
     layers per stop. Related countries are authored from the narration, so
     the globe can show the full geographic scope without implying that every
     nearby country is part of the story. */
  const legs = stops.map((stop, index) => {
    const feature = features.find((entry) => entry.properties?.code === stop.countryCode);
    const primary = showCountryHighlights
      ? createCountryFillLayer(
        feature,
        {
          fill: "rgba(206,130,58,0.86)",
          glow: "rgba(255,244,211,0.98)",
        },
        5 + index,
      )
      : { texture: null, material: null, mesh: null };
    if (primary.mesh) planet.add(primary.mesh);

    const relatedCodes = [
      ...(Array.isArray(stop.mentionedCountryCodes) ? stop.mentionedCountryCodes : []),
      ...(Array.isArray(stop.affectedCountryCodes) ? stop.affectedCountryCodes : []),
    ]
      .map((code) => String(code || "").toUpperCase())
      .filter((code, codeIndex, codes) => code && code !== stop.countryCode && codes.indexOf(code) === codeIndex);
    const relatedLayers = showCountryHighlights ? relatedCodes.map((code, relatedIndex) => {
      const relatedFeature = features.find((entry) => entry.properties?.code === code);
      const layer = createCountryFillLayer(
        relatedFeature,
        {
          fill: "rgba(229,177,91,0.62)",
          glow: "rgba(255,239,186,0.92)",
        },
        4.4 + index + relatedIndex * 0.01,
      );
      if (layer.mesh) planet.add(layer.mesh);
      return { ...layer, countryCode: code };
    }) : [];

    const requestedCameraZ = Number(stop.cameraZ ?? stop.focusZoom);

    return {
      ...stop,
      texture: primary.texture,
      material: primary.material,
      mesh: primary.mesh,
      relatedLayers,
      cameraZ: Number.isFinite(requestedCameraZ) ? requestedCameraZ : CAMERA_Z,
      rotation: rotationFor(stop.coordinates),
    };
  });

  const routeLayers = showRouteLayers
    ? legs.map((leg) => createRouteLayer(leg.routePoints, EARTH_RADIUS + 0.045, showRouteMarkers))
    : legs.map(() => null);
  routeLayers.forEach((route) => {
    if (route) planet.add(route.group);
  });

  /* Unwrap each leg's target against the one before it. */
  let previousY = legs.length ? legs[0].rotation.y : 0;
  legs.forEach((leg, index) => {
    if (index === 0) {
      leg.rotation.y = unwrap(leg.rotation.y, 0);
    } else {
      leg.rotation.y = unwrap(leg.rotation.y, previousY);
    }
    previousY = leg.rotation.y;
  });

  const firstLeg = legs[0];
  /* Start a little west of the first country so the opening idle spin
     drifts toward it rather than away. */
  const openingRotation = {
    y: (firstLeg ? firstLeg.rotation.y : 0) - 0.95,
    x: (firstLeg ? firstLeg.rotation.x : 0) * 0.35,
  };

  let lastTime = 0;

  function projectWorldPoint(worldPoint) {
    const projected = worldPoint.clone().project(camera);
    return {
      x: (projected.x * 0.5 + 0.5) * width,
      y: (-projected.y * 0.5 + 0.5) * height,
      depth: projected.z,
    };
  }

  function projectCoordinate(coordinates, radiusScale = 1.006) {
    const longitude = Number(coordinates?.[0]);
    const latitude = Number(coordinates?.[1]);
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;

    const localPoint = latLonVector(longitude, latitude, EARTH_RADIUS * radiusScale);
    const localNormal = localPoint.clone().normalize();
    const worldPoint = localPoint.clone().applyEuler(planet.rotation).add(planet.position);
    const worldNormal = localNormal.applyEuler(planet.rotation).normalize();
    const cameraDirection = camera.position.clone().sub(planet.position).normalize();
    const projected = projectWorldPoint(worldPoint);
    const globeCenter = projectWorldPoint(planet.position);
    return {
      ...projected,
      visible: worldNormal.dot(cameraDirection) > 0.015,
      coordinates: [longitude, latitude],
      center: globeCenter,
    };
  }

  function createView() {
    camera.updateMatrixWorld();
    planet.updateMatrixWorld(true);
    const center = projectWorldPoint(planet.position);
    const focalLength = (height / 2) / Math.tan((camera.fov * DEG) / 2);
    const globeRadiusPx = Math.abs(focalLength * EARTH_RADIUS / Math.max(0.1, camera.position.z));
    return Object.freeze({
      time: lastTime,
      width,
      height,
      center,
      globeRadiusPx,
      cameraZ: camera.position.z,
      projectCoordinate,
      projectWorldPoint,
      projectRadiusKm: (radiusKm) => Math.max(
        8,
        Math.min(globeRadiusPx * 0.72, (Number(radiusKm) || 0) * globeRadiusPx / 1200),
      ),
    });
  }

  function renderAt(time) {
    lastTime = Number.isFinite(time) ? time : 0;

    let rotationY = openingRotation.y + lastTime * idleSpin;
    let rotationX = openingRotation.x;
    let cameraZ = OPENING_CAMERA_Z;
    let lift = 0;

    legs.forEach((leg, index) => {
      const previous = index === 0 ? null : legs[index - 1];
      const fromY = previous
        ? previous.rotation.y + Math.max(0, leg.travelStart - previous.arrive) * POST_ARRIVAL_DRIFT
        : openingRotation.y + leg.travelStart * idleSpin;
      const fromX = previous ? previous.rotation.x : openingRotation.x;
      const fromZ = previous ? previous.cameraZ : OPENING_CAMERA_Z;

      if (lastTime >= leg.travelStart) {
        const travel = easeInOutQuint(
          (lastTime - leg.travelStart) / Math.max(0.1, leg.arrive - leg.travelStart),
        );
        rotationY = mix(fromY, leg.rotation.y, travel);
        rotationX = mix(fromX, leg.rotation.x, travel);
        cameraZ = mix(fromZ, leg.cameraZ, travel);

        /* Once settled, keep a barely-there drift so the globe never
           looks like a frozen still. */
        if (lastTime > leg.arrive) {
          rotationY = leg.rotation.y + (lastTime - leg.arrive) * POST_ARRIVAL_DRIFT;
          cameraZ = leg.cameraZ + Math.sin((lastTime - leg.arrive) * 0.55) * 0.045;
        }
      }

      if (leg.material) {
        const highlight =
          smootherstep(leg.arrive - 0.85, leg.arrive + 0.25, lastTime) *
          (1 - smootherstep(leg.holdUntil - 0.35, leg.holdUntil + 0.3, lastTime));
        const breath = 1 + Math.sin(lastTime * 1.8) * 0.035;
        leg.material.opacity = highlight * 0.86 * breath;
        leg.mesh.visible = leg.material.opacity > 0.004;

        leg.relatedLayers.forEach((related) => {
          if (!related.material || !related.mesh) return;
          related.material.opacity = highlight * 0.62 * breath;
          related.mesh.visible = related.material.opacity > 0.004;
        });
      }

      const route = routeLayers[index];
      if (route) {
        const routeIn = smootherstep(leg.arrive - 0.05, leg.arrive + 0.42, lastTime);
        const routeOut = 1 - smootherstep(leg.holdUntil - 0.38, leg.holdUntil + 0.18, lastTime);
        const routeOpacity = routeIn * routeOut;
        const drawProgress = smootherstep(leg.arrive - 0.02, leg.arrive + 2.8, lastTime);
        route.geometry.setDrawRange(0, Math.floor(route.totalVertices * drawProgress));
        route.material.opacity = routeOpacity * 0.96;
        if (route.markerMaterial) route.markerMaterial.opacity = routeOpacity * 0.94;
        route.group.visible = routeOpacity > 0.004;
      }

      lift = Math.max(
        lift,
        smootherstep(leg.arrive - 0.6, leg.arrive + 0.2, lastTime) *
          (1 - smootherstep(leg.holdUntil - 0.2, leg.holdUntil + 0.4, lastTime)),
      );
    });

    const openerBlend = firstLeg
      ? 1 - smootherstep(firstLeg.arrive - 0.35, firstLeg.arrive + 0.45, lastTime)
      : 1;
    planet.rotation.y = rotationY;
    planet.rotation.x = rotationX;
    planet.position.y = mix(mix(baseHeight, liftHeight, lift), OPENING_HEIGHT, openerBlend);
    camera.position.z = cameraZ;

    clouds.rotation.y = lastTime * 0.006;

    renderer.render(scene, camera);
    const view = createView();
    if (onRender) onRender(view);
    return view;
  }

  function dispose() {
    scene.traverse((object) => {
      object.geometry?.dispose?.();
      if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose?.());
      else object.material?.dispose?.();
    });
    [
      dayTexture,
      cloudTexture,
      ...legs.flatMap((leg) => [
        leg.texture,
        ...leg.relatedLayers.map((related) => related.texture),
      ]),
    ]
      .filter(Boolean)
      .forEach((texture) => texture.dispose());
    renderer.dispose();
  }

  renderAt(0);
  return Object.freeze({ ready, renderAt, dispose });
}
