/* ============================================================
   Globe tour — one continuous globe that travels between countries.

   Different from createNewsGlobe, which flies a camera at a single
   target and is built to be used once per story. Here the camera never
   moves and the whole globe stays inside the frame for the entire film;
   the planet rotates on its own axis to bring each country round to
   face the viewer, and that country lights up while its headline is on
   screen.

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

const clamp01 = (value) => Math.max(0, Math.min(1, value));
const mix = (from, to, progress) => from + (to - from) * progress;
const easeInOutQuint = (value) => {
  const t = clamp01(value);
  return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
};
const smootherstep = (edge0, edge1, value) => {
  const t = clamp01((value - edge0) / Math.max(1e-6, edge1 - edge0));
  return t * t * t * (t * (t * 6 - 15) + 10);
};
const POST_ARRIVAL_DRIFT = 0.006;

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

export function createGlobeTour(options) {
  const {
    canvas,
    features,
    stops = [],
    idleSpin = 0.034,
    baseHeight = 0.68,
    liftHeight = 0.92,
    onFallback,
  } = options;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
    premultipliedAlpha: false,
  });
  renderer.setSize(1080, 1920, false);
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x2d4b3c, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;

  const scene = new THREE.Scene();

  /* 17.2 units back with a 31-degree vertical field of view leaves a
     deliberate breathing band for the photographic story panel below.
     The original composition sat at 15.5 and let the globe dominate the
     full vertical frame. */
  const camera = new THREE.PerspectiveCamera(31, 1080 / 1920, 0.1, 100);
  const WIDE_Z = 17.2;
  camera.position.set(0, 0, WIDE_Z);
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
  const normalTexture = loader.load(TEXTURES.normal);
  const specularTexture = loader.load(TEXTURES.specular);
  [dayTexture, cloudTexture, normalTexture, specularTexture].forEach((texture) => {
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  });

  const earthMaterial = new THREE.MeshStandardMaterial({
    map: dayTexture,
    normalMap: normalTexture,
    normalScale: new THREE.Vector2(0.72, 0.72),
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

          #ifdef USE_NORMALMAP
            vec3 reliefSample = texture2D(normalMap, vNormalMapUv).xyz * 2.0 - 1.0;
            float etchedRelief = clamp((1.0 - reliefSample.z) * 0.34, 0.0, 0.11);
            modelTone = mix(modelTone, atlasInk, etchedRelief * landMask);
          #endif

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
    new THREE.SphereGeometry(EARTH_RADIUS, 192, 128),
    earthMaterial,
  );
  planet.add(earth);

  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS * 1.014, 160, 112),
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
    new THREE.SphereGeometry(EARTH_RADIUS * 1.068, 128, 88),
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

  /* One fill layer per stop. Kept hidden until it has some opacity so
     the renderer is not blending three full spheres every frame. */
  const legs = stops.map((stop, index) => {
    const feature = features.find((entry) => entry.properties?.code === stop.countryCode);
    const texture = countryFillTexture(feature, {
      fill: "rgba(206,130,58,0.86)",
      glow: "rgba(255,244,211,0.98)",
    });
    let mesh = null;
    let material = null;
    if (texture) {
      material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.FrontSide,
        blending: THREE.NormalBlending,
      });
      mesh = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS + 0.009, 160, 112), material);
      mesh.renderOrder = 4 + index;
      mesh.visible = false;
      planet.add(mesh);
    }
    return { ...stop, texture, material, mesh, rotation: rotationFor(stop.coordinates) };
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

  function renderAt(time) {
    lastTime = Number.isFinite(time) ? time : 0;

    let rotationY = openingRotation.y + lastTime * idleSpin;
    let rotationX = openingRotation.x;
    let lift = 0;
    let cameraZ = WIDE_Z;

    legs.forEach((leg, index) => {
      const previous = index === 0 ? null : legs[index - 1];
      const fromY = previous
        ? previous.rotation.y + Math.max(0, leg.travelStart - previous.arrive) * POST_ARRIVAL_DRIFT
        : openingRotation.y + leg.travelStart * idleSpin;
      const fromX = previous ? previous.rotation.x : openingRotation.x;

      if (lastTime >= leg.travelStart) {
        const travel = easeInOutQuint(
          (lastTime - leg.travelStart) / Math.max(0.1, leg.arrive - leg.travelStart),
        );
        rotationY = mix(fromY, leg.rotation.y, travel);
        rotationX = mix(fromX, leg.rotation.x, travel);

        /* Once settled, keep a barely-there drift so the globe never
           looks like a frozen still. */
        if (lastTime > leg.arrive) {
          rotationY = leg.rotation.y + (lastTime - leg.arrive) * POST_ARRIVAL_DRIFT;
        }
      }

      if (leg.material) {
        const highlight =
          smootherstep(leg.arrive - 0.85, leg.arrive + 0.25, lastTime) *
          (1 - smootherstep(leg.holdUntil - 0.35, leg.holdUntil + 0.3, lastTime));
        const breath = 1 + Math.sin(lastTime * 1.8) * 0.035;
        leg.material.opacity = highlight * 0.86 * breath;
        leg.mesh.visible = leg.material.opacity > 0.004;
      }

      /* The globe stays wide for the handoff, then closes on the country
         only after the rotation has arrived. Before the next leg starts,
         the current focus releases back to the wide establishing view. */
      if (lastTime >= leg.arrive) {
        const zoomIn = smootherstep(leg.arrive - 0.55, leg.arrive + 0.45, lastTime);
        const nextTravelStart = legs[index + 1]?.travelStart;
        const zoomOut =
          nextTravelStart == null
            ? 1
            : 1 - smootherstep(nextTravelStart - 0.55, nextTravelStart + 0.15, lastTime);
        const focusBlend = zoomIn * zoomOut;
        cameraZ = mix(WIDE_Z, Number(leg.focusZoom) || 14.9, focusBlend);
      }

      lift = Math.max(
        lift,
        smootherstep(leg.arrive - 0.6, leg.arrive + 0.2, lastTime) *
          (1 - smootherstep(leg.holdUntil - 0.2, leg.holdUntil + 0.4, lastTime)),
      );
    });

    planet.rotation.y = rotationY;
    planet.rotation.x = rotationX;
    planet.position.y = mix(baseHeight, liftHeight, lift);
    camera.position.z = cameraZ;

    clouds.rotation.y = lastTime * 0.008;

    renderer.render(scene, camera);
  }

  function dispose() {
    scene.traverse((object) => {
      object.geometry?.dispose?.();
      if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose?.());
      else object.material?.dispose?.();
    });
    [dayTexture, cloudTexture, normalTexture, specularTexture, ...legs.map((leg) => leg.texture)]
      .filter(Boolean)
      .forEach((texture) => texture.dispose());
    renderer.dispose();
  }

  renderAt(0);
  return Object.freeze({ ready, renderAt, dispose });
}
