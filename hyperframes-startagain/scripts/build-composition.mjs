import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(here, "..");
const timeline = JSON.parse(fs.readFileSync(path.join(projectDir, "timeline.json"), "utf8"));

const COLORS = {
  paper: "#fffefb",
  paper2: "#f4f2ec",
  ink: "#121212",
  inkSoft: "#7a7873",
  accent: "#ed1c24",
  highlighter: "#ffe14d",
};

const ACCENTS = ["sparkle", "starburst", "star_outline", "scribble", "sparkles", "brush"];
const ACCENT_SLOTS = [
  { x: 12, y: 20 },
  { x: 90, y: 24 },
  { x: 9, y: 50 },
  { x: 92, y: 52 },
];
const WFACTOR = { punch: 0.46, sans: 0.54, serifI: 0.52 };

const research = [
  {
    start: timeline.articles.mark + 0.3,
    duration: 5.4,
    label: "RESEARCH · UC IRVINE",
    source: "Gloria Mark — The Cost of Interrupted Work (2008)",
    before: "It takes ",
    highlight: "23 minutes",
    after: " to refocus after an interruption.",
    logo: "uci.png",
  },
  {
    start: timeline.articles.leroy + 0.3,
    duration: 5.4,
    label: "STUDY · U. MINNESOTA",
    source: "Sophie Leroy — Organizational Behavior and Human Decision Processes (2009)",
    before: "Task-switching leaves ",
    highlight: "attention residue",
    after: " that drags down focus.",
    logo: "umn.png",
  },
  {
    start: timeline.articles.apa + 0.2,
    duration: 5.2,
    label: "RESEARCH · APA",
    source: "American Psychological Association — Multitasking: Switching Costs",
    before: "Switching tasks can cost up to ",
    highlight: "40%",
    after: " of productive time.",
    logo: "apa.png",
  },
];

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function num(value) {
  return Number(value.toFixed(3));
}

function estimateWidth(word) {
  return word.t.length * word.size * WFACTOR[word.font] + 6;
}

function layout(words, maxWidth = 1620, centerX = 960, centerY = 838) {
  const gap = 22;
  const lines = [];
  let line = [];
  let lineWidth = 0;

  for (const word of words) {
    const width = estimateWidth(word);
    if (line.length && lineWidth + gap + width > maxWidth) {
      lines.push(line);
      line = [];
      lineWidth = 0;
    }
    line.push(word);
    lineWidth += (line.length > 1 ? gap : 0) + width;
  }
  if (line.length) lines.push(line);

  const lineHeights = lines.map((lineWords) => Math.max(...lineWords.map((word) => word.size)) * 1.14);
  const totalHeight = lineHeights.reduce((sum, height) => sum + height, 0) + (lines.length - 1) * 8;
  let y = centerY - totalHeight / 2;
  const placed = [];

  lines.forEach((lineWords, lineIndex) => {
    const widths = lineWords.map(estimateWidth);
    const totalWidth = widths.reduce((sum, width) => sum + width, 0) + (lineWords.length - 1) * gap;
    let x = centerX - totalWidth / 2;

    lineWords.forEach((word, wordIndex) => {
      placed.push({
        ...word,
        width: widths[wordIndex],
        cx: x + widths[wordIndex] / 2,
        cy: y + lineHeights[lineIndex] / 2,
      });
      x += widths[wordIndex] + gap;
    });
    y += lineHeights[lineIndex] + 8;
  });

  return placed;
}

function accentDefs(index) {
  const count = 2 + (index % 2);
  return Array.from({ length: count }, (_, k) => ({
    name: ACCENTS[(index * 2 + k) % ACCENTS.length],
    x: ACCENT_SLOTS[(index + k) % ACCENT_SLOTS.length].x,
    y: ACCENT_SLOTS[(index + k) % ACCENT_SLOTS.length].y,
    size: 100 + ((index + k * 3) % 5) * 30,
    rotation: ((index * 17 + k * 53) % 36) - 18,
    spin: k % 2 ? 6 : -5,
  }));
}

function renderPhoto(scene, index) {
  const photo = scene.photo;
  const boxWidth = Math.round(photo.h * Math.min(1.35, Math.max(0.72, photo.ar)));
  const frameWidth = boxWidth + 32;
  const frameHeight = photo.h + 38;
  return `
        <div class="subject-shell" style="left:${photo.x}%;top:${photo.y}%;width:${frameWidth}px;height:${frameHeight}px">
          <div id="scene-${index}-subject-motion" class="subject-motion">
            <div class="photo-tilt" style="transform:rotate(${photo.rot || 0}deg);width:${frameWidth}px;height:${frameHeight}px">
              <div class="photo-frame" style="width:${frameWidth}px;height:${frameHeight}px">
                <div class="photo-window" style="width:${boxWidth}px;height:${photo.h}px">
                  <img src="assets/photos/${esc(photo.src)}" alt="" />
                </div>
                <span class="tape" aria-hidden="true"></span>
              </div>
            </div>
          </div>
        </div>`;
}

function renderCutout(scene, index) {
  const cut = scene.cut;
  const width = Math.round(cut.h * 0.9);
  const marker = cut.mark === "none" ? "" : `<svg class="marker marker-${esc(cut.mark)}" viewBox="0 0 ${width + 52} ${cut.h + 52}" aria-hidden="true"><path d="${markerPath(cut.mark, width + 52, cut.h + 52)}"></path></svg>`;
  return `
        <div class="subject-shell" style="left:${cut.x}%;top:${cut.y}%;width:${width}px;height:${cut.h}px">
          <div id="scene-${index}-subject-motion" class="subject-motion">
            <div class="cutout-tilt" style="transform:rotate(${cut.rot || 0}deg);width:${width}px;height:${cut.h}px">
              <img class="cutout-image" src="assets/${esc(cut.src)}" alt="" style="height:${cut.h}px" />
              ${marker}
            </div>
          </div>
        </div>`;
}

function markerPath(kind, width, height) {
  const pad = 26;
  if (kind === "underline") {
    const y = height - pad;
    return `M ${pad - 6} ${y} C ${width * 0.3} ${y + 12}, ${width * 0.6} ${y - 10}, ${width - pad + 6} ${y + 4}`;
  }
  if (kind === "arrow") {
    return `M ${pad} ${height - pad} C ${width * 0.35} ${height * 0.5}, ${width * 0.6} ${pad + 10}, ${width - pad} ${pad} M ${width - pad} ${pad} L ${width - pad - 34} ${pad + 8} M ${width - pad} ${pad} L ${width - pad - 10} ${pad + 38}`;
  }
  if (kind === "box") {
    return `M ${pad - 8} ${pad} L ${width - pad + 6} ${pad - 6} L ${width - pad} ${height - pad + 6} L ${pad - 6} ${height - pad} L ${pad - 10} ${pad - 2}`;
  }
  const cx = width / 2;
  const cy = height / 2;
  const rx = width / 2 - 4;
  const ry = height / 2 - 4;
  return `M ${cx + rx} ${cy} C ${cx + rx} ${cy + ry * 0.6}, ${cx + rx * 0.5} ${cy + ry}, ${cx} ${cy + ry} C ${cx - rx * 0.55} ${cy + ry}, ${cx - rx} ${cy + ry * 0.5}, ${cx - rx} ${cy} C ${cx - rx} ${cy - ry * 0.6}, ${cx - rx * 0.5} ${cy - ry}, ${cx + 6} ${cy - ry} C ${cx + rx * 0.6} ${cy - ry}, ${cx + rx} ${cy - ry * 0.45}, ${cx + rx} ${cy - 2}`;
}

function renderAccents(index) {
  return accentDefs(index)
    .map(
      (accent, k) => `
            <div class="collage-accent-shell" data-layout-ignore style="left:${accent.x}%;top:${accent.y}%;width:${accent.size}px;height:${accent.size}px">
              <div id="scene-${index}-accent-${k}-motion" class="collage-accent-motion" style="width:${accent.size}px;height:${accent.size}px">
                <img src="assets/collage/${accent.name}.jpg" alt="" />
              </div>
            </div>`,
    )
    .join("");
}

function renderWords(scene, index) {
  return layout(scene.words)
    .map((word, wordIndex) => {
      const fontClass = word.font === "punch" ? "word-punch" : word.font === "serifI" ? "word-serif" : "word-sans";
      const colorClass = word.color === "accent" ? "word-accent" : word.color === "inkSoft" ? "word-soft" : "word-ink";
      return `
              <span class="word-shell" style="left:${num(word.cx)}px;top:${num(word.cy)}px;width:${num(word.width)}px;height:${num(word.size * 1.12)}px">
                <span id="scene-${index}-word-${wordIndex}" class="word ${fontClass} ${colorClass}" style="font-size:${word.size}px" data-layout-allow-overflow>${esc(word.t)}</span>
              </span>`;
    })
    .join("");
}

function renderScene(scene, index) {
  const subject = scene.photo ? renderPhoto(scene, index) : scene.cut ? renderCutout(scene, index) : "";
  const asteriskPosition = [
    { x: 84, y: 24 },
    { x: 16, y: 26 },
    { x: 82, y: 56 },
    { x: 18, y: 54 },
  ][index % 4];
  const asterisk = scene.aster
    ? `<div class="asterisk-shell" data-layout-ignore style="left:${asteriskPosition.x}%;top:${asteriskPosition.y}%"><span id="scene-${index}-asterisk-motion" class="asterisk-motion">✱</span></div>`
    : "";
  return `
      <section id="scene-${index}" class="clip scene" data-start="${num(scene.s)}" data-duration="${num(scene.e - scene.s)}" data-track-index="1" data-layout-allow-caption-zone>
        <div id="scene-${index}-motion" class="scene-motion" data-layout-allow-overflow>
          <div class="accent-layer">${renderAccents(index)}</div>
          <div class="subject-layer">${subject}${asterisk}</div>
          <div class="caption-layer">${renderWords(scene, index)}</div>
        </div>
      </section>`;
}

function renderResearchCard(card, index) {
  return `
      <section id="research-${index}" class="clip research-card" data-start="${num(card.start)}" data-duration="${num(card.duration)}" data-track-index="20" data-layout-allow-occlusion>
        <div class="research-scrim" data-layout-ignore></div>
        <div id="research-${index}-motion" class="research-card-motion">
          <div class="research-panel">
            <div class="research-topline">
              <span class="research-label"><span class="research-mark">✱</span>${esc(card.label)}</span>
              <img src="assets/logos/${esc(card.logo)}" alt="" />
            </div>
            <div class="research-headline">${esc(card.before)}<span class="highlight-wrap"><span id="research-${index}-highlight" class="highlight">${esc(card.highlight)}</span></span>${esc(card.after)}</div>
            <div class="research-source">${esc(card.source)}</div>
          </div>
        </div>
      </section>`;
}

const motion = [];
timeline.scenes.forEach((scene, index) => {
  const start = num(scene.s);
  const end = num(scene.e);
  motion.push(`tl.fromTo("#scene-${index}-motion", { y: 28, scale: 0.985, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.62, ease: "back.out(1.25)" }, ${start});`);
  motion.push(`tl.to("#scene-${index}-motion", { y: -10, opacity: 0, duration: 0.28, ease: "power1.in" }, ${Math.max(start + 3.85, end - 0.28)});`);
  motion.push(`tl.set("#scene-${index}-motion", { opacity: 0 }, ${end});`);
  layout(scene.words).forEach((word, wordIndex) => {
    const at = num(Math.max(scene.s, word.s - 0.05));
    const duration = word.font === "punch" ? 0.3 : 0.24;
    const offset = word.up ? 24 : 14;
    motion.push(`tl.fromTo("#scene-${index}-word-${wordIndex}", { y: ${offset}, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: ${duration}, ease: "back.out(1.45)" }, ${at});`);
  });
  accentDefs(index).forEach((accent, k) => {
    const at = num(start + 0.12 + k * 0.1);
    motion.push(`tl.fromTo("#scene-${index}-accent-${k}-motion", { y: 12, scale: 0.22, rotation: ${accent.rotation - 12}, opacity: 0 }, { y: 0, scale: 1, rotation: ${accent.rotation}, opacity: 0.9, duration: 0.7, ease: "back.out(1.3)" }, ${at});`);
    motion.push(`tl.to("#scene-${index}-accent-${k}-motion", { y: 8, rotation: ${accent.rotation + accent.spin}, duration: 1.6, ease: "sine.inOut", repeat: 1, yoyo: true }, ${num(start + 0.95 + k * 0.08)});`);
  });
  if (scene.aster) {
    motion.push(`tl.fromTo("#scene-${index}-asterisk-motion", { scale: 0.15, rotation: -18, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.55, ease: "back.out(1.7)" }, ${num(start + 0.18)});`);
    motion.push(`tl.to("#scene-${index}-asterisk-motion", { rotation: ${index % 2 ? 7 : -7}, duration: 1.8, ease: "sine.inOut", repeat: 1, yoyo: true }, ${num(start + 0.9)});`);
  }
});

research.forEach((card, index) => {
  motion.push(`tl.fromTo("#research-${index}-motion", { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 0.58, ease: "back.out(1.35)" }, ${num(card.start)});`);
  motion.push(`tl.fromTo("#research-${index}-highlight", { scaleX: 0, opacity: 0.5 }, { scaleX: 1, opacity: 1, duration: 0.5, ease: "power2.out" }, ${num(card.start + 0.72)});`);
  motion.push(`tl.to("#research-${index}-motion", { y: -24, opacity: 0, duration: 0.34, ease: "power1.in" }, ${num(card.start + card.duration - 0.34)});`);
});

const html = `<!doctype html>
<html lang="en" data-resolution="landscape">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>The Cost of Starting Again — godandbaddaily</title>
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
      @font-face { font-family: "League Gothic"; src: url("assets/fonts/LeagueGothic-Regular.ttf") format("truetype"); font-weight: 400; font-display: block; }
      @font-face { font-family: "IBM Plex Mono"; src: url("assets/fonts/IBMPlexMono-Regular.ttf") format("truetype"); font-weight: 400; font-display: block; }
      @font-face { font-family: "IBM Plex Mono"; src: url("assets/fonts/IBMPlexMono-Bold.ttf") format("truetype"); font-weight: 700; font-display: block; }
      * { box-sizing: border-box; }
      html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: ${COLORS.paper}; }
      body { font-family: "IBM Plex Mono", monospace; color: ${COLORS.ink}; }
      #root { position: relative; width: 1920px; height: 1080px; overflow: hidden; }
      #paper, #paper-grid { position: absolute; inset: 0; }
      #paper { background: ${COLORS.paper}; }
      #paper-grid { opacity: 0.62; background-image: linear-gradient(rgba(18,18,18,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(18,18,18,0.055) 1px, transparent 1px); background-size: 120px 120px; }
      #brand { position: absolute; z-index: 300; top: 46px; left: 60px; display: flex; align-items: center; gap: 12px; }
      #brand .brand-mark { color: ${COLORS.accent}; font-family: "IBM Plex Mono", monospace; font-size: 38px; font-weight: 700; line-height: 1; }
      #brand .brand-name { color: ${COLORS.ink}; font-family: "IBM Plex Mono", monospace; font-size: 20px; font-weight: 700; letter-spacing: 0.02em; }
      .scene, .research-card { position: absolute; inset: 0; overflow: hidden; }
      .scene-motion { position: absolute; inset: 0; }
      .accent-layer, .subject-layer, .caption-layer { position: absolute; inset: 0; }
      .collage-accent-shell, .asterisk-shell, .subject-shell { position: absolute; transform: translate(-50%, -50%); }
      .collage-accent-motion, .subject-motion, .asterisk-motion, .research-card-motion { display: block; }
      .collage-accent-motion { mix-blend-mode: multiply; }
      .collage-accent-motion img { display: block; width: 100%; height: 100%; object-fit: contain; }
      .asterisk-motion { color: ${COLORS.accent}; font-family: "IBM Plex Mono", monospace; font-size: 56px; font-weight: 700; line-height: 1; }
      .photo-frame { position: relative; padding: 16px 16px 22px; background: #fff; box-shadow: 0 24px 34px rgba(20,20,20,0.22); }
      .photo-window { overflow: hidden; background: ${COLORS.paper2}; }
      .photo-window img { display: block; width: 100%; height: 100%; object-fit: cover; }
      .tape { position: absolute; top: -14px; left: 50%; width: 116px; height: 30px; background: rgba(237,28,36,0.78); transform: translateX(-50%) rotate(-3deg); }
      .cutout-tilt { position: relative; filter: drop-shadow(0 22px 26px rgba(20,20,20,0.18)); }
      .cutout-image { display: block; width: auto; }
      .marker { position: absolute; left: -26px; top: -26px; width: calc(100% + 52px); height: calc(100% + 52px); overflow: visible; pointer-events: none; }
      .marker path { fill: none; stroke: ${COLORS.accent}; stroke-width: 9; stroke-linecap: round; stroke-linejoin: round; }
      .caption-layer { z-index: 20; }
      .word-shell { position: absolute; display: block; transform: translate(-50%, -50%); text-align: center; }
      .word { display: block; white-space: nowrap; line-height: 1; }
      .word-punch { font-family: "League Gothic", sans-serif; font-size: 78px; letter-spacing: -0.02em; text-transform: uppercase; }
      .word-sans { font-family: "IBM Plex Mono", monospace; font-size: 44px; font-weight: 400; letter-spacing: -0.04em; }
      .word-serif { font-family: "Playfair Display", serif; font-size: 58px; font-style: italic; font-weight: 700; }
      .word-accent { color: ${COLORS.accent}; }
      .word-ink { color: ${COLORS.ink}; }
      .word-soft { color: ${COLORS.inkSoft}; }
      .research-card { z-index: 100; }
      .research-scrim { position: absolute; inset: 0; background: rgba(255,254,251,0.94); }
      .research-card-motion { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
      .research-panel { position: relative; width: 1180px; padding: 44px 56px 40px; background: #fff; border: 2px solid ${COLORS.ink}; box-shadow: 14px 16px 0 rgba(17,17,17,0.12); transform: rotate(-1.3deg); }
      .research-topline { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
      .research-label { display: flex; align-items: center; gap: 10px; color: ${COLORS.accent}; font-family: "IBM Plex Mono", monospace; font-size: 19px; font-weight: 700; letter-spacing: 0.1em; }
      .research-mark { font-size: 26px; }
      .research-topline img { display: block; width: auto; height: 78px; object-fit: contain; }
      .research-headline { color: ${COLORS.ink}; font-family: "Playfair Display", Georgia, serif; font-size: 60px; font-weight: 800; line-height: 1.16; }
      .highlight-wrap { position: relative; display: inline-block; padding: 0 6px; }
      .highlight { position: relative; z-index: 0; display: block; transform-origin: left center; background: ${COLORS.highlighter}; border-radius: 2px; }
      .highlight-wrap::after { content: ""; position: absolute; z-index: -1; left: 0; right: 0; bottom: 4px; height: 0.74em; background: ${COLORS.highlighter}; border-radius: 2px; }
      .research-source { margin-top: 26px; padding-top: 18px; border-top: 1.5px solid ${COLORS.paper2}; color: ${COLORS.inkSoft}; font-family: "IBM Plex Mono", monospace; font-size: 21px; font-style: italic; line-height: 1.35; }
      audio { display: none; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${num(timeline.total / timeline.fps)}" data-width="1920" data-height="1080">
      <div id="paper" data-layout-ignore></div>
      <div id="paper-grid" data-layout-ignore></div>
      <div id="brand" aria-label="godandbaddaily">
        <span class="brand-mark">✱</span>
        <span class="brand-name">godandbaddaily</span>
      </div>
${timeline.scenes.map(renderScene).join("\n")}
${research.map(renderResearchCard).join("\n")}
      <audio id="narration" class="clip" src="assets/audio/narration.wav" data-start="0" data-duration="247.745" data-track-index="30" data-volume="1"></audio>
      <audio id="bgm" class="clip" src="assets/audio/bgm.wav" data-start="0" data-duration="248" data-track-index="31" data-volume="0.12"></audio>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
${motion.map((line) => `      ${line}`).join("\n")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;

fs.writeFileSync(path.join(projectDir, "index.html"), html);
console.log(`Wrote ${timeline.scenes.length} scenes, ${research.length} research cards, and ${timeline.total / timeline.fps}s to index.html`);
