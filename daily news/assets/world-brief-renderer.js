const stories = [
  {
    number: "01",
    region: "United States · Trade",
    code: "US",
    headline: "Trump rebuilds the tariff wall",
    deck: "New duties hit more than sixty trading partners, putting another shock through global commerce.",
    source: "AnewZ · Reuters",
  },
  {
    number: "02",
    region: "Iran · Middle East",
    code: "IR",
    headline: "The Iran war moves into a thirteenth night",
    deck: "Fresh U.S. strikes deepen the crisis, while tanker traffic drops and oil rises above one hundred dollars.",
    source: "AnewZ · AJ",
  },
  {
    number: "03",
    region: "Red Sea · Shipping",
    code: "YE",
    headline: "Houthis open a second maritime front",
    deck: "Attacks on Saudi oil tankers widen the pressure across the Red Sea and Bab al-Mandeb trade route.",
    source: "10 Things · AJ",
  },
  {
    number: "04",
    region: "Saudi Arabia · Diplomacy",
    code: "SA",
    headline: "The Saudi nuclear deal is in doubt",
    deck: "Washington now links civilian nuclear cooperation to Saudi recognition of Israel.",
    source: "10 Things · AJ",
  },
  {
    number: "05",
    region: "Ukraine · Europe",
    code: "UA",
    headline: "Ukraine resets its wartime command",
    deck: "A new army leadership faces the test of reform while fighting and diplomacy continue.",
    source: "10 Things · AJ",
  },
  {
    number: "06",
    region: "European Union · Russia",
    code: "RU",
    headline: "Europe tightens the Russia pressure",
    deck: "The EU unveils a tougher sanctions package and keeps Moscow’s oil trade in the spotlight.",
    source: "AnewZ · 10 Things",
  },
  {
    number: "07",
    region: "France · Climate",
    code: "FR",
    headline: "Wildfires force mass evacuations",
    deck: "More than ten thousand people flee southwestern France as heat and drought fuel the flames.",
    source: "AnewZ · Euronews",
  },
  {
    number: "08",
    region: "Venezuela · Disaster",
    code: "VE",
    headline: "Venezuela faces a fifty-billion-dollar quake bill",
    deck: "The World Bank says reconstruction after June’s earthquakes could cost close to fifty billion dollars.",
    source: "World Bank · 10 Things",
  },
  {
    number: "09",
    region: "China · Technology",
    code: "CN",
    headline: "China recasts AI as soft power",
    deck: "Beijing is pushing artificial intelligence as a strategic export and a new diplomatic tool.",
    source: "10 Things",
  },
  {
    number: "10",
    region: "Sweden · Resources",
    code: "SE",
    headline: "Sweden loosens rare-earth mining rules",
    deck: "Stockholm wants less dependence on China, but Sami communities warn of damage to reindeer routes.",
    source: "AnewZ · 10 Things",
  },
];

const root = document.getElementById("world-brief");
const storyCards = document.getElementById("story-cards");
const timeline = window.__timelines["world-brief"];
const storyStart = 3.5;
const storyDuration = 4.5;

function addText(parent, className, text) {
  const element = document.createElement("div");
  element.className = className;
  element.textContent = text;
  parent.appendChild(element);
  return element;
}

stories.forEach((story, index) => {
  const card = document.createElement("article");
  card.className = "story-card";
  card.setAttribute("aria-label", `${story.number}: ${story.headline}`);
  const top = document.createElement("div");
  top.className = "story-topline";
  const number = addText(top, "story-number", `Story / ${story.number}`);
  const region = addText(top, "story-region", story.region);
  card.appendChild(top);
  const headline = document.createElement("h2");
  headline.className = "story-headline";
  headline.textContent = story.headline;
  card.appendChild(headline);
  const deck = document.createElement("p");
  deck.className = "story-deck";
  deck.textContent = story.deck;
  card.appendChild(deck);
  const bottom = document.createElement("div");
  bottom.className = "story-bottom";
  addText(bottom, "story-source", `Source / ${story.source}`);
  addText(bottom, "story-code", story.code);
  card.appendChild(bottom);
  storyCards.appendChild(card);

  const start = storyStart + index * storyDuration;
  const end = start + storyDuration;
  const reveal = start + 1.6;
  timeline.fromTo(card, { x: 150, opacity: 0 }, { x: 0, opacity: 1, duration: 0.38, ease: "power4.out" }, reveal);
  timeline.fromTo(top, { y: -26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.32, ease: "expo.out" }, reveal + 0.16);
  timeline.fromTo(headline, { y: 56, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "expo.out" }, reveal + 0.28);
  timeline.fromTo(deck, { x: 46, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "power3.out" }, reveal + 0.62);
  timeline.fromTo(bottom, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.36, ease: "sine.out" }, reveal + 0.88);
  timeline.to(card, { x: -120, opacity: 0, duration: 0.34, ease: "power3.in" }, end - 0.38);
});

timeline.fromTo("#brief-header", { y: -54, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "expo.out" }, 0.16);
timeline.fromTo("#side-ticks", { x: 42, opacity: 0 }, { x: 0, opacity: 1, duration: 0.46, ease: "power3.out" }, 0.3);
timeline.fromTo("#hook-stage", { y: 92, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "expo.out" }, 0.2);
timeline.fromTo(".hook-subtitle", { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.42, ease: "power3.out" }, 0.8);
timeline.fromTo(".hook-rule", { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.52, ease: "expo.out" }, 1.16);
timeline.to("#hook-stage", { y: -100, opacity: 0, duration: 0.4, ease: "power3.in" }, storyStart - 0.4);

timeline.fromTo("#end-stage", { y: 90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "expo.out" }, 49.0);
timeline.to("#end-wash", { opacity: 0.46, duration: 0.7, ease: "power2.in" }, 53.3);

const canvas = document.getElementById("globe-layer");
const context = canvas.getContext("2d");
const features = window.DAILY_NEWS_GEO.features;
const projection = d3.geoOrthographic().clipAngle(90).precision(0.4);
const path = d3.geoPath(projection, context);
const graticule = d3.geoGraticule10();
const sphere = { type: "Sphere" };
const stars = Array.from({ length: 88 }, (_, index) => ({
  x: (index * 197 + 71) % 1080,
  y: (index * index * 29 + index * 47 + 113) % 1920,
  radius: 0.7 + ((index * 13) % 17) / 12,
  alpha: 0.12 + ((index * 7) % 11) / 34,
}));

const clamp01 = (value) => Math.max(0, Math.min(1, value));
const easeInOutCubic = (value) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
const normalizeAngle = (value) => ((value + 180) % 360 + 360) % 360 - 180;

function targetForStory(story) {
  const selected = features.find((item) => item.properties.code === story.code);
  const center = selected?.properties?.latlng
    ? [Number(selected.properties.latlng[1]), Number(selected.properties.latlng[0])]
    : [0, 10];
  return {
    center,
    rotation: [-center[0], -center[1], 0],
  };
}

const targets = stories.map(targetForStory);

function interpolateRotation(start, end, amount) {
  return [
    start[0] + normalizeAngle(end[0] - start[0]) * amount,
    start[1] + (end[1] - start[1]) * amount,
    0,
  ];
}

function currentStoryIndex(time) {
  if (time < storyStart) return -1;
  const index = Math.floor((time - storyStart) / storyDuration);
  return Math.max(-1, Math.min(stories.length - 1, index));
}

function currentStoryState(time) {
  const index = currentStoryIndex(time);
  if (index < 0) {
    return {
      index,
      story: null,
      localTime: time,
      rotation: [-40 + time * 18, -10, 0],
      scale: 318,
      lockProgress: 0,
      center: [0, 10],
    };
  }

  const localTime = time - (storyStart + index * storyDuration);
  const startRotation = index === 0 ? [40, -10, 0] : targets[index - 1].rotation;
  const endRotation = targets[index].rotation;
  const lockProgress = easeInOutCubic(clamp01((localTime - 0.08) / 1.85));
  const zoomProgress = easeInOutCubic(clamp01((localTime - 0.12) / 1.95));
  return {
    index,
    story: stories[index],
    localTime,
    rotation: interpolateRotation(startRotation, endRotation, lockProgress),
    scale: 318 + zoomProgress * 148,
    lockProgress,
    center: targets[index].center,
  };
}

function drawGlobe(time) {
  context.clearRect(0, 0, 1080, 1920);
  stars.forEach((star, index) => {
    const pulse = 0.76 + 0.24 * Math.sin(time * 0.72 + index * 0.58);
    context.beginPath();
    context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(184,198,201,${star.alpha * pulse})`;
    context.fill();
  });

  const state = currentStoryState(time);
  const { index, story } = state;
  const highlighted = new Set(story ? [story.code] : []);
  projection.rotate(state.rotation).scale(state.scale).translate([540, 560]);

  context.save();
  context.shadowColor = "rgba(244,184,96,0.18)";
  context.shadowBlur = 46;
  context.beginPath();
  path(sphere);
  context.fillStyle = "#0D2638";
  context.fill();
  context.restore();

  context.beginPath();
  path(graticule);
  context.strokeStyle = "rgba(120,149,165,0.31)";
  context.lineWidth = 1.35;
  context.stroke();

  features.forEach((country) => {
    context.beginPath();
    path(country);
    const code = country.properties.code;
    context.fillStyle = highlighted.has(code) ? "#F4B860" : "#18374A";
    context.fill();
    context.strokeStyle = highlighted.has(code) ? "#F3ECD8" : "#7895A5";
    context.lineWidth = highlighted.has(code) ? 2.5 : 1.05;
    context.stroke();
  });

  context.beginPath();
  path(sphere);
  context.strokeStyle = "#7895A5";
  context.lineWidth = 3;
  context.stroke();

  if (story && state.lockProgress > 0.52 && time < 49.0) {
    const marker = projection(state.center);
    if (marker) {
      const pulse = 28 + 8 * Math.sin(time * 4.6);
      context.beginPath();
      context.arc(marker[0], marker[1], pulse + (1 - state.lockProgress) * 34, 0, Math.PI * 2);
      context.strokeStyle = `rgba(244,184,96,${0.34 + state.lockProgress * 0.48})`;
      context.lineWidth = 4;
      context.stroke();
      context.beginPath();
      context.moveTo(marker[0] - 30, marker[1]);
      context.lineTo(marker[0] + 30, marker[1]);
      context.moveTo(marker[0], marker[1] - 30);
      context.lineTo(marker[0], marker[1] + 30);
      context.strokeStyle = "#F4B860";
      context.lineWidth = 2;
      context.stroke();
      context.beginPath();
      context.arc(marker[0], marker[1], 8, 0, Math.PI * 2);
      context.fillStyle = "#F3ECD8";
      context.fill();
      context.font = "700 21px IBM Plex Mono, monospace";
      context.fillStyle = "#F4B860";
      context.fillText(`TARGET LOCK / ${story.code}`, 72, 980);
    }
  }
}

window.addEventListener("hf-seek", (event) => drawGlobe(event.detail.time));
drawGlobe(window.__hfThreeTime || 0);
