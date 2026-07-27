import * as THREE from "../vendor/three.module.js";

export const DEG = Math.PI / 180;
export const EARTH_RADIUS = 2.08;
export const TEXTURES = Object.freeze({
  day: "assets/textures/earth-day.jpg",
  clouds: "assets/textures/earth-clouds.jpg",
  normal: "assets/textures/earth-normal.png",
  specular: "assets/textures/earth-specular.png",
});

const clamp01 = (value) => Math.max(0, Math.min(1, value));
const mix = (from, to, progress) => from + (to - from) * progress;
const smooth = (value) => {
  const next = clamp01(value);
  return next * next * (3 - 2 * next);
};
const easeOutQuint = (value) => 1 - Math.pow(1 - clamp01(value), 5);

export function latLonVector(longitude, latitude, radius = EARTH_RADIUS) {
  const phi = (Number(longitude) + 180) * DEG;
  const latitudeRad = Number(latitude) * DEG;
  const cosLatitude = Math.cos(latitudeRad);
  return new THREE.Vector3(
    -radius * cosLatitude * Math.cos(phi),
    radius * Math.sin(latitudeRad),
    radius * cosLatitude * Math.sin(phi),
  );
}

function geometryRings(feature) {
  if (!feature?.geometry) return [];
  if (feature.geometry.type === "Polygon") return feature.geometry.coordinates;
  if (feature.geometry.type === "MultiPolygon") return feature.geometry.coordinates.flat();
  return [];
}

function pushArc(positions, fromCoordinate, toCoordinate, radius) {
  const start = latLonVector(fromCoordinate[0], fromCoordinate[1], 1).normalize();
  const end = latLonVector(toCoordinate[0], toCoordinate[1], 1).normalize();
  const angle = start.angleTo(end);
  if (!Number.isFinite(angle) || angle > Math.PI * 0.72) return;
  const steps = Math.max(1, Math.ceil(angle / (3.25 * DEG)));
  let previous = start;
  for (let index = 1; index <= steps; index += 1) {
    const next = start.clone().lerp(end, index / steps).normalize();
    positions.push(
      previous.x * radius,
      previous.y * radius,
      previous.z * radius,
      next.x * radius,
      next.y * radius,
      next.z * radius,
    );
    previous = next;
  }
}

/* Paint a country onto an equirectangular canvas so it can be mapped
   straight onto the globe as a filled region.

   The projection has to match SphereGeometry's UV layout, which is
   u = (longitude + 180) / 360 and v = (90 - latitude) / 180 — plate
   carree over a canvas that is exactly twice as wide as it is tall.
   d3 is used for the path so that countries crossing the antimeridian
   (Russia, Fiji) clip correctly instead of smearing across the map. */
export function countryFillTexture(feature, { fill, glow }) {
  if (!feature || !window.d3?.geoEquirectangular) return null;

  const width = 2048;
  const height = width / 2;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) return null;

  const projection = window.d3
    .geoEquirectangular()
    .translate([width / 2, height / 2])
    .scale(width / (2 * Math.PI));
  const path = window.d3.geoPath(projection, context);

  context.clearRect(0, 0, width, height);
  context.beginPath();
  path(feature);

  context.fillStyle = fill;
  context.fill();

  /* A rim slightly brighter than the fill keeps the shape legible once
     it curves away toward the limb of the globe. */
  context.lineJoin = "round";
  context.lineWidth = 5;
  context.strokeStyle = glow;
  context.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function borderGeometry(features, radius = EARTH_RADIUS + 0.014) {
  const positions = [];
  features.forEach((feature) => {
    geometryRings(feature).forEach((ring) => {
      for (let index = 1; index < ring.length; index += 1) {
        pushArc(positions, ring[index - 1], ring[index], radius);
      }
    });
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

function ringTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const glow = context.createRadialGradient(128, 128, 8, 128, 128, 124);
  glow.addColorStop(0, "rgba(243,236,216,1)");
  glow.addColorStop(0.07, "rgba(244,184,96,0.96)");
  glow.addColorStop(0.13, "rgba(244,184,96,0.12)");
  glow.addColorStop(0.42, "rgba(244,184,96,0)");
  glow.addColorStop(0.7, "rgba(244,184,96,0.2)");
  glow.addColorStop(0.73, "rgba(244,184,96,0.9)");
  glow.addColorStop(0.77, "rgba(244,184,96,0.08)");
  glow.addColorStop(1, "rgba(244,184,96,0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeAtmosphere() {
  return new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS * 1.052, 96, 64),
    new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
          vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
          float rim = pow(1.0 - max(dot(vNormal, viewDirection), 0.0), 2.25);
          gl_FragColor = vec4(0.20, 0.58, 0.92, rim * 0.50);
        }
      `,
    }),
  );
}

function createThreeGlobe(options) {
  const {
    canvas,
    features,
    countryCode = "US",
    coordinates = [0, 0],
    fromCoordinates,
    affectedCountryCodes = [],
    duration = 5.8,
    transitionTime = 5.8,
    highlightStyle = "outline-pulse",
    cameraAngle = "editorial",
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
  renderer.setClearColor(0x08131f, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(31, 1080 / 1920, 0.1, 100);
  camera.position.set(0, 0.15, 10.6);

  const planet = new THREE.Group();
  planet.position.set(0, 1.02, 0);
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

  const earthMaterial = new THREE.MeshPhongMaterial({
    map: dayTexture,
    normalMap: normalTexture,
    normalScale: new THREE.Vector2(0.62, 0.62),
    specularMap: specularTexture,
    specular: new THREE.Color(0x335b73),
    shininess: 18,
  });
  const earth = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS, 128, 96), earthMaterial);
  earth.rotation.y = 0;
  planet.add(earth);

  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS * 1.012, 112, 80),
    new THREE.MeshPhongMaterial({
      map: cloudTexture,
      alphaMap: cloudTexture,
      transparent: true,
      opacity: 0.27,
      depthWrite: false,
      blending: THREE.NormalBlending,
    }),
  );
  planet.add(clouds);

  const globalBorders = new THREE.LineSegments(
    borderGeometry(features, EARTH_RADIUS + 0.017),
    new THREE.LineBasicMaterial({
      color: 0xc2d2d5,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
    }),
  );
  planet.add(globalBorders);

  const selectedFeature = features.find((feature) => feature.properties?.code === countryCode);
  const highlightMaterial = new THREE.LineBasicMaterial({
    color: 0xf4b860,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const selectedOutline = new THREE.LineSegments(
    borderGeometry(selectedFeature ? [selectedFeature] : [], EARTH_RADIUS + 0.043),
    highlightMaterial,
  );
  planet.add(selectedOutline);

  /* Filled country highlight. The outline alone is a hairline at this
     camera distance; the fill is what actually reads as "this is where
     the story is". Front side only, so the far hemisphere is culled. */
  const countryFill = countryFillTexture(selectedFeature, {
    fill: "rgba(244,184,96,0.62)",
    glow: "rgba(255,226,178,0.95)",
  });
  const countryFillMaterial = countryFill
    ? new THREE.MeshBasicMaterial({
        map: countryFill,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
      })
    : null;
  const countryFillMesh = countryFillMaterial
    ? new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS + 0.008, 128, 96), countryFillMaterial)
    : null;
  if (countryFillMesh) {
    countryFillMesh.renderOrder = 2;
    planet.add(countryFillMesh);
  }

  const affectedSet = new Set(affectedCountryCodes);
  const affectedFeatures = features.filter((feature) => affectedSet.has(feature.properties?.code));
  const affectedMaterial = new THREE.LineBasicMaterial({
    color: 0xf4b860,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const affectedOutlines = new THREE.LineSegments(
    borderGeometry(affectedFeatures, EARTH_RADIUS + 0.038),
    affectedMaterial,
  );
  planet.add(affectedOutlines);

  const targetSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: ringTexture(),
      color: 0xf4b860,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  const targetVector = latLonVector(coordinates[0], coordinates[1], EARTH_RADIUS + 0.075);
  targetSprite.position.copy(targetVector);
  targetSprite.scale.set(0.62, 0.62, 1);
  planet.add(targetSprite);

  const locationBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.046, 0.54, 20, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xf4b860,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  locationBeam.position.copy(latLonVector(coordinates[0], coordinates[1], EARTH_RADIUS + 0.32));
  locationBeam.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    targetVector.clone().normalize(),
  );
  planet.add(locationBeam);

  const atmosphere = makeAtmosphere();
  planet.add(atmosphere);

  scene.add(new THREE.HemisphereLight(0x9cc9e5, 0x02070c, 1.42));
  const keyLight = new THREE.DirectionalLight(0xffe2ad, 3.7);
  keyLight.position.set(-4.2, 4.8, 7);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0x4ba6dc, 1.65);
  rimLight.position.set(5.8, -2.4, -4);
  scene.add(rimLight);

  const front = new THREE.Vector3(0, 0, 1);
  const hasVerifiedOrigin = Array.isArray(fromCoordinates)
    && fromCoordinates.length === 2
    && fromCoordinates.every((value) => Number.isFinite(Number(value)));
  const originCoordinates = hasVerifiedOrigin
    ? fromCoordinates.map(Number)
    : [Number(coordinates[0]) - 128, Number(coordinates[1]) * 0.18];
  const startVector = latLonVector(originCoordinates[0], originCoordinates[1], 1).normalize();
  const endVector = targetVector.clone().normalize();
  const startQuaternion = new THREE.Quaternion().setFromUnitVectors(startVector, front);
  const endQuaternion = new THREE.Quaternion().setFromUnitVectors(endVector, front);
  const workingQuaternion = new THREE.Quaternion();
  const cameraTilt = new THREE.Quaternion().setFromAxisAngle(
    front,
    cameraAngle === "high" ? -0.02 : cameraAngle === "low" ? 0.018 : 0,
  );
  const hasSweep = affectedFeatures.length > 0;
  let lastTime = 0;

  function renderAt(time = 0) {
    lastTime = Number.isFinite(Number(time)) ? Number(time) : 0;
    const lockStart = hasSweep ? 4.65 : 0.18;
    const lockDuration = hasSweep ? 4.1 : Math.max(2.8, duration - 0.85);
    const lock = smooth((lastTime - lockStart) / lockDuration);
    const story = smooth((lastTime - transitionTime) / 1.05);
    const sweep = smooth((lastTime - 0.25) / 4.2);

    workingQuaternion.slerpQuaternions(startQuaternion, endQuaternion, lock);
    if (hasSweep && lastTime < lockStart) {
      const spin = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        sweep * Math.PI * 3.2,
      );
      workingQuaternion.premultiply(spin);
    }
    planet.quaternion.copy(cameraTilt).multiply(workingQuaternion);
    planet.position.x = mix(0, -0.64, story);
    planet.position.y = mix(1.02, 1.28, story);

    camera.position.z = mix(hasSweep ? 11.4 : 10.7, 8.55, easeOutQuint(lock));
    camera.position.z = mix(camera.position.z, 7.92, story);
    camera.position.y = cameraAngle === "low" ? -0.18 : cameraAngle === "high" ? 0.42 : 0.12;
    camera.lookAt(planet.position.x, planet.position.y, 0);

    clouds.rotation.y = lastTime * 0.008;
    clouds.rotation.z = Math.sin(lastTime * 0.11) * 0.006;
    highlightMaterial.opacity = highlightStyle === "spotlight"
      ? 0.52 * easeOutQuint((lock - 0.66) / 0.34)
      : 0.95 * easeOutQuint((lock - 0.58) / 0.42);
    affectedMaterial.opacity = hasSweep ? 0.78 * sweep * (1 - lock) : 0;
    if (countryFillMaterial) {
      /* Comes up just ahead of the outline so the shape reads as it
         fills, then holds with a slow breath rather than a hard on. */
      const fillIn = easeOutQuint((lock - 0.48) / 0.42);
      countryFillMaterial.opacity =
        fillIn * (highlightStyle === "spotlight" ? 0.5 : 0.72) * (1 + Math.sin(lastTime * 2.2) * 0.06);
    }
    targetSprite.material.opacity = easeOutQuint((lock - 0.68) / 0.32);
    locationBeam.material.opacity = 0;
    const pulse = 1 + Math.sin(lastTime * 4.1) * 0.12;
    targetSprite.scale.setScalar((0.58 + lock * 0.18) * pulse);
    globalBorders.material.opacity = mix(0.18, 0.34, lock);
    atmosphere.material.opacity = mix(0.72, 1, lock);

    renderer.render(scene, camera);
  }

  function dispose() {
    scene.traverse((object) => {
      object.geometry?.dispose?.();
      if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose?.());
      else object.material?.dispose?.();
    });
    [dayTexture, cloudTexture, normalTexture, specularTexture, countryFill]
      .filter(Boolean)
      .forEach((texture) => texture.dispose());
    renderer.dispose();
  }

  renderAt(0);
  return Object.freeze({
    mode: "webgl",
    ready,
    renderAt,
    dispose,
    config: Object.freeze({
      countryCode,
      coordinates: Object.freeze([...coordinates]),
      fromCoordinates: hasVerifiedOrigin ? Object.freeze([...originCoordinates]) : null,
      highlightStyle,
      cameraAngle,
      duration,
    }),
  });
}

function createCanvasFallback(options) {
  const {
    canvas,
    features,
    countryCode = "US",
    coordinates = [0, 0],
    fromCoordinates,
    duration = 5.8,
    transitionTime = 5.8,
  } = options;
  const context = canvas.getContext("2d");
  const image = new Image();
  image.src = TEXTURES.day;
  const selectedFeature = features.find((feature) => feature.properties?.code === countryCode);
  const hasVerifiedOrigin = Array.isArray(fromCoordinates)
    && fromCoordinates.length === 2
    && fromCoordinates.every((value) => Number.isFinite(Number(value)));
  const originCoordinates = hasVerifiedOrigin
    ? fromCoordinates.map(Number)
    : [Number(coordinates[0]) - 128, 0];
  const d3 = window.d3;
  const projection = d3?.geoOrthographic?.().clipAngle(90).precision(0.4);
  const geoPath = projection ? d3.geoPath(projection, context) : null;
  let lastTime = 0;
  let readyResolve;
  const ready = new Promise((resolve) => {
    readyResolve = resolve;
  });
  image.addEventListener("load", () => {
    renderAt(lastTime);
    readyResolve();
  }, { once: true });
  image.addEventListener("error", () => readyResolve(), { once: true });

  function renderAt(time = 0) {
    lastTime = Number(time) || 0;
    const lock = smooth((lastTime - 0.18) / Math.max(2.8, duration - 0.85));
    const story = smooth((lastTime - transitionTime) / 1.05);
    const radius = mix(382, 492, lock);
    const centerX = mix(540, 350, story);
    const centerY = mix(658, 600, story);
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.save();
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.clip();
    if (image.complete && image.naturalWidth) {
      const sourceWidth = Math.min(image.naturalWidth, image.naturalHeight * 1.12);
      const sourceX = ((Number(coordinates[0]) + 180) / 360) * image.naturalWidth - sourceWidth / 2;
      context.drawImage(
        image,
        Math.max(0, Math.min(image.naturalWidth - sourceWidth, sourceX)),
        0,
        sourceWidth,
        image.naturalHeight,
        centerX - radius,
        centerY - radius,
        radius * 2,
        radius * 2,
      );
    } else {
      context.fillStyle = "#0D2638";
      context.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
    }
    const shade = context.createRadialGradient(
      centerX - radius * 0.34,
      centerY - radius * 0.34,
      radius * 0.08,
      centerX,
      centerY,
      radius,
    );
    shade.addColorStop(0, "rgba(255,238,197,0.18)");
    shade.addColorStop(0.62, "rgba(8,19,31,0.08)");
    shade.addColorStop(1, "rgba(2,7,12,0.78)");
    context.fillStyle = shade;
    context.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
    context.restore();

    if (projection && geoPath) {
      projection
        .rotate([
          -mix(originCoordinates[0], Number(coordinates[0]), lock),
          -mix(originCoordinates[1], Number(coordinates[1]), lock),
          0,
        ])
        .scale(radius)
        .translate([centerX, centerY]);
      context.beginPath();
      geoPath({ type: "Sphere" });
      context.strokeStyle = "rgba(194,210,213,0.64)";
      context.lineWidth = 2.2;
      context.stroke();
      context.beginPath();
      features.forEach((feature) => geoPath(feature));
      context.strokeStyle = "rgba(194,210,213,0.28)";
      context.lineWidth = 1.1;
      context.stroke();
      if (selectedFeature && lock > 0.58) {
        context.save();
        context.beginPath();
        geoPath(selectedFeature);
        context.strokeStyle = `rgba(244,184,96,${easeOutQuint((lock - 0.58) / 0.42)})`;
        context.shadowColor = "#F4B860";
        context.shadowBlur = 24;
        context.lineWidth = 5;
        context.stroke();
        context.restore();
      }
    }

    context.beginPath();
    context.arc(centerX, centerY, radius * 1.012, 0, Math.PI * 2);
    context.strokeStyle = "rgba(75,166,220,0.58)";
    context.shadowColor = "rgba(75,166,220,0.7)";
    context.shadowBlur = 36;
    context.lineWidth = 6;
    context.stroke();
    context.shadowBlur = 0;
  }

  renderAt(0);
  return Object.freeze({
    mode: "canvas-fallback",
    ready,
    renderAt,
    dispose() {},
    config: Object.freeze({
      countryCode,
      coordinates: Object.freeze([...coordinates]),
      fromCoordinates: hasVerifiedOrigin ? Object.freeze([...originCoordinates]) : null,
      duration,
    }),
  });
}

export function createNewsGlobe(options) {
  if (!options?.canvas) throw new Error("createNewsGlobe requires a canvas");
  if (!Array.isArray(options.features)) throw new Error("createNewsGlobe requires GeoJSON features");
  let active;
  let lastTime = 0;
  let fallbackReason = "";
  try {
    active = createThreeGlobe(options);
    const ready = active.ready.catch((error) => {
      fallbackReason = error?.message || "texture-load-failure";
      active.dispose();
      active = createCanvasFallback(options);
      active.renderAt(lastTime);
      options.onTextureError?.();
      return active.ready;
    });
    return Object.freeze({
      get mode() {
        return active.mode;
      },
      get fallbackReason() {
        return fallbackReason;
      },
      ready,
      renderAt(time) {
        lastTime = Number(time) || 0;
        active.renderAt(lastTime);
      },
      dispose() {
        active.dispose();
      },
      config: active.config,
    });
  } catch (error) {
    fallbackReason = error?.message || "webgl-initialization-failure";
    options.onFallback?.(error);
    active = createCanvasFallback(options);
    return Object.freeze({
      get mode() {
        return active.mode;
      },
      get fallbackReason() {
        return fallbackReason;
      },
      ready: active.ready,
      renderAt(time) {
        lastTime = Number(time) || 0;
        active.renderAt(lastTime);
      },
      dispose() {
        active.dispose();
      },
      config: active.config,
    });
  }
}

export function createCountryGlobeTransition(options) {
  const coordinates = options?.toCoordinates ?? options?.coordinates;
  if (!Array.isArray(options?.fromCoordinates)) {
    throw new Error("createCountryGlobeTransition requires fromCoordinates");
  }
  if (!Array.isArray(coordinates)) {
    throw new Error("createCountryGlobeTransition requires toCoordinates");
  }
  return createNewsGlobe({ ...options, coordinates });
}

export const globeTexturePaths = TEXTURES;
