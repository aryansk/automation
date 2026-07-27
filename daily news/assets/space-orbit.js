import * as THREE from "./vendor/three.module.js";

const spaceCanvas = document.getElementById("space-layer");
const spaceRenderer = new THREE.WebGLRenderer({
  canvas: spaceCanvas,
  alpha: true,
  antialias: true,
  premultipliedAlpha: false,
});
spaceRenderer.setSize(1080, 1920, false);
spaceRenderer.setPixelRatio(1);
spaceRenderer.setClearColor(0x08131f, 0);
spaceRenderer.outputColorSpace = THREE.SRGBColorSpace;

const spaceScene = new THREE.Scene();
const spaceCamera = new THREE.PerspectiveCamera(32, 1080 / 1920, 0.1, 100);
spaceCamera.position.set(0, 0, 12);

const moonTextureCanvas = document.createElement("canvas");
moonTextureCanvas.width = 512;
moonTextureCanvas.height = 512;
const moonTextureContext = moonTextureCanvas.getContext("2d");
moonTextureContext.fillStyle = "#B8C6C9";
moonTextureContext.fillRect(0, 0, 512, 512);
for (let index = 0; index < 54; index += 1) {
  const x = (index * 83 + index * index * 7 + 41) % 512;
  const y = (index * 137 + index * index * 11 + 97) % 512;
  const radius = 7 + ((index * 19) % 42);
  const crater = moonTextureContext.createRadialGradient(
    x - radius * 0.24,
    y - radius * 0.22,
    radius * 0.08,
    x,
    y,
    radius,
  );
  crater.addColorStop(0, "rgba(243,236,216,0.28)");
  crater.addColorStop(0.42, "rgba(120,149,165,0.24)");
  crater.addColorStop(0.78, "rgba(8,19,31,0.36)");
  crater.addColorStop(1, "rgba(120,149,165,0)");
  moonTextureContext.beginPath();
  moonTextureContext.arc(x, y, radius, 0, Math.PI * 2);
  moonTextureContext.fillStyle = crater;
  moonTextureContext.fill();
}
const moonTexture = new THREE.CanvasTexture(moonTextureCanvas);
moonTexture.colorSpace = THREE.SRGBColorSpace;

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(0.44, 64, 64),
  new THREE.MeshStandardMaterial({
    color: 0xb8c6c9,
    map: moonTexture,
    bumpMap: moonTexture,
    bumpScale: 0.055,
    roughness: 0.96,
    metalness: 0,
  }),
);
spaceScene.add(moon);

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(0.74, 64, 64),
  new THREE.MeshStandardMaterial({
    color: 0xf4b860,
    emissive: 0xf4b860,
    emissiveIntensity: 0.28,
    roughness: 0.92,
    metalness: 0,
  }),
);
spaceScene.add(sun);

const glowCanvas = document.createElement("canvas");
glowCanvas.width = 256;
glowCanvas.height = 256;
const glowContext = glowCanvas.getContext("2d");
const glowGradient = glowContext.createRadialGradient(128, 128, 12, 128, 128, 126);
glowGradient.addColorStop(0, "rgba(243,236,216,0.88)");
glowGradient.addColorStop(0.18, "rgba(244,184,96,0.72)");
glowGradient.addColorStop(0.54, "rgba(244,184,96,0.22)");
glowGradient.addColorStop(1, "rgba(244,184,96,0)");
glowContext.fillStyle = glowGradient;
glowContext.fillRect(0, 0, 256, 256);
const glowTexture = new THREE.CanvasTexture(glowCanvas);
glowTexture.colorSpace = THREE.SRGBColorSpace;
const sunGlow = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: glowTexture,
    color: 0xf4b860,
    transparent: true,
    opacity: 0.58,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }),
);
sunGlow.scale.set(3.2, 3.2, 1);
spaceScene.add(sunGlow);

const hemisphereLight = new THREE.HemisphereLight(0xf3ecd8, 0x08131f, 0.52);
spaceScene.add(hemisphereLight);
const sunLight = new THREE.PointLight(0xf4b860, 18, 40, 1.5);
spaceScene.add(sunLight);

function renderSpaceAt(time) {
  const angle = -1.18 + time * 0.228;
  const sunX = Math.sin(angle) * 3.9;
  const sunY = 3.02 + Math.cos(angle * 0.82) * 0.38;
  const sunZ = -2.8 + Math.cos(angle) * 0.9;
  sun.position.set(sunX, sunY, sunZ);
  sunGlow.position.copy(sun.position);
  sunLight.position.copy(sun.position);
  sun.rotation.y = time * 0.16;

  const moonAngle = angle + Math.PI;
  moon.position.set(
    Math.sin(moonAngle) * 3.15,
    -2.72 + Math.cos(moonAngle * 0.9) * 0.44,
    -1.7 + Math.cos(moonAngle) * 0.72,
  );
  moon.rotation.y = time * 0.31;
  moon.rotation.x = 0.18 + Math.sin(time * 0.21) * 0.08;

  spaceRenderer.render(spaceScene, spaceCamera);
}

window.addEventListener("hf-seek", (event) => renderSpaceAt(event.detail.time));
renderSpaceAt(window.__hfThreeTime || 0);
