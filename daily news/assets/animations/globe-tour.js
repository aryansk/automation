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
import { DEG, EARTH_RADIUS, TEXTURES, countryFillTexture } from "./globe.js";

const clamp01 = (value) => Math.max(0, Math.min(1, value));
const mix = (from, to, progress) => from + (to - from) * progress;
const easeInOutCubic = (value) => {
  const t = clamp01(value);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const smoothstep = (edge0, edge1, value) => {
  const t = clamp01((value - edge0) / Math.max(1e-6, edge1 - edge0));
  return t * t * (3 - 2 * t);
};

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
    idleSpin = 0.055,
    baseHeight = 1.18,
    liftHeight = 1.54,
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

  /* 15.5 units back with a 31-degree vertical field of view leaves the
     globe about 86% of the frame width, so it never crops. The original
     composition sat at 10.6 and deliberately ran off both edges. */
  const camera = new THREE.PerspectiveCamera(31, 1080 / 1920, 0.1, 100);
  camera.position.set(0, 0, 15.5);
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

  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS, 128, 96),
    new THREE.MeshPhongMaterial({
      map: dayTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(0.62, 0.62),
      specularMap: specularTexture,
      specular: new THREE.Color(0x335b73),
      shininess: 18,
    }),
  );
  planet.add(earth);

  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS * 1.012, 112, 80),
    new THREE.MeshPhongMaterial({
      map: cloudTexture,
      alphaMap: cloudTexture,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
    }),
  );
  planet.add(clouds);

  const atmosphere = new THREE.Mesh(
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
  planet.add(atmosphere);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.28);
  keyLight.position.set(-4.2, 2.4, 6.4);
  scene.add(keyLight);
  scene.add(new THREE.AmbientLight(0x3f6d8c, 0.72));

  /* One fill layer per stop. Kept hidden until it has some opacity so
     the renderer is not blending three full spheres every frame. */
  const legs = stops.map((stop, index) => {
    const feature = features.find((entry) => entry.properties?.code === stop.countryCode);
    const texture = countryFillTexture(feature, {
      fill: "rgba(244,184,96,0.62)",
      glow: "rgba(255,226,178,0.95)",
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
        blending: THREE.AdditiveBlending,
      });
      mesh = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS + 0.008, 128, 96), material);
      mesh.renderOrder = 2 + index;
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

    legs.forEach((leg, index) => {
      const previous = index === 0 ? null : legs[index - 1];
      const fromY = previous ? previous.rotation.y : openingRotation.y + leg.travelStart * idleSpin;
      const fromX = previous ? previous.rotation.x : openingRotation.x;

      if (lastTime >= leg.travelStart) {
        const travel = easeInOutCubic(
          (lastTime - leg.travelStart) / Math.max(0.1, leg.arrive - leg.travelStart),
        );
        rotationY = mix(fromY, leg.rotation.y, travel);
        rotationX = mix(fromX, leg.rotation.x, travel);

        /* Once settled, keep a barely-there drift so the globe never
           looks like a frozen still. */
        if (lastTime > leg.arrive) {
          rotationY = leg.rotation.y + (lastTime - leg.arrive) * 0.006;
        }
      }

      if (leg.material) {
        const highlight =
          smoothstep(leg.arrive - 0.85, leg.arrive + 0.25, lastTime) *
          (1 - smoothstep(leg.holdUntil - 0.35, leg.holdUntil + 0.3, lastTime));
        const breath = 1 + Math.sin(lastTime * 2.2) * 0.05;
        leg.material.opacity = highlight * 0.74 * breath;
        leg.mesh.visible = leg.material.opacity > 0.004;
      }

      lift = Math.max(
        lift,
        smoothstep(leg.arrive - 0.6, leg.arrive + 0.2, lastTime) *
          (1 - smoothstep(leg.holdUntil - 0.2, leg.holdUntil + 0.4, lastTime)),
      );
    });

    planet.rotation.y = rotationY;
    planet.rotation.x = rotationX;
    planet.position.y = mix(baseHeight, liftHeight, lift);

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
