import { createGlobeTour } from "./assets/animations/globe-tour.js";

const root = document.getElementById("root");
const canvasWidth = Number(root?.dataset.width || 2560);
const canvasHeight = Number(root?.dataset.height || 1440);
const isAvatar = root?.classList.contains("brand-avatar");

document.documentElement.style.setProperty("--canvas-width", `${canvasWidth}px`);
document.documentElement.style.setProperty("--canvas-height", `${canvasHeight}px`);

function paintMatteTexture() {
  const canvas = document.getElementById("space-layer");
  const context = canvas?.getContext("2d");
  if (!context) return;

  let seed = isAvatar ? 2026080301 : 2026080302;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  context.clearRect(0, 0, canvasWidth, canvasHeight);
  for (let index = 0; index < (isAvatar ? 280 : 720); index += 1) {
    const x = random() * canvasWidth;
    const y = random() * canvasHeight;
    const length = random() * 5.4 + 0.8;
    const angle = random() * Math.PI;
    const alpha = 0.025 + random() * 0.075;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    context.strokeStyle = `rgba(226,235,221,${alpha.toFixed(3)})`;
    context.lineWidth = random() * 0.8 + 0.25;
    context.stroke();
  }
}

paintMatteTexture();

window.__timelines = window.__timelines || {};
window.__timelines[root.dataset.compositionId] = window.__timelines[root.dataset.compositionId]
  || gsap.timeline({ paused: true });

const globe = createGlobeTour({
  canvas: document.getElementById("globe-layer"),
  width: canvasWidth,
  height: canvasHeight,
  features: window.DAILY_NEWS_GEO?.features || [],
  /* Face the Middle East by default so the avatar reads as Europe → Middle
     East → Asia, matching the geographic language of the explainers. The
     empty country code keeps the mark unbranded and avoids a false country
     highlight in a channel-level asset. */
  stops: [{
    countryCode: "",
    coordinates: [56.5, 26.6],
    travelStart: 0,
    arrive: 0,
    holdUntil: 0.02,
    cameraZ: isAvatar ? 8.7 : 11.15,
    routePoints: [],
  }],
  baseHeight: 0,
  liftHeight: 0,
  openingHeight: 0,
  defaultCameraZ: isAvatar ? 8.7 : 11.15,
  openingCameraZ: isAvatar ? 8.7 : 11.15,
  idleSpin: 0.022,
});

const renderTime = isAvatar ? 0.9 : 1.15;
window.__brandGlobeReady = globe.ready.then(() => globe.renderAt(renderTime));
