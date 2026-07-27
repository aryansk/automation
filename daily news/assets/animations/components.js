function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function valueOf(config, key, fallback = "") {
  return config[key] ?? config.data?.[key] ?? fallback;
}

function source(config) {
  const text = escapeHtml(config.source || "Verified source");
  return `<div class="ani-source"><span>Source</span><strong>${text}</strong></div>`;
}

function titleBlock(config) {
  return `
    <div class="ani-eyebrow">${escapeHtml(config.label || config.definition?.category || "Daily News")}</div>
    <h3>${escapeHtml(config.headline || config.text || config.definition?.title)}</h3>
  `;
}

function chartBars(config) {
  const left = valueOf(config, "left", { label: "A", value: "68" });
  const right = valueOf(config, "right", { label: "B", value: "42" });
  const leftNumber = Number.parseFloat(left.numericValue ?? left.value) || 68;
  const rightNumber = Number.parseFloat(right.numericValue ?? right.value) || 42;
  const max = Math.max(leftNumber, rightNumber, 1);
  return `
    <div class="ani-comparison">
      <div><span>${escapeHtml(left.label)}</span><b>${escapeHtml(left.value)}</b><i style="--bar:${leftNumber / max}"></i></div>
      <div><span>${escapeHtml(right.label)}</span><b>${escapeHtml(right.value)}</b><i style="--bar:${rightNumber / max}"></i></div>
    </div>
  `;
}

function timelineMarkup(config) {
  const events = valueOf(config, "events", [
    { label: "08:00", text: "First report" },
    { label: "12:30", text: "Official response" },
    { label: "18:00", text: "Next briefing" },
  ]);
  const safeEvents = Array.isArray(events) && events.length ? events.slice(0, 4) : [];
  return `<div class="ani-timeline">${safeEvents.map((event) => `
    <div><time>${escapeHtml(event.label || event.time)}</time><span>${escapeHtml(event.text || event.title)}</span></div>
  `).join("")}</div>`;
}

const renderers = {
  "country-globe-reveal": (config) => `
    <div class="ani-globe"><div class="ani-earth"></div><div class="ani-target"></div></div>
    <div class="ani-location"><small>Target acquired</small><strong>${escapeHtml(config.city || config.country)}</strong></div>`,
  "country-globe-transition": (config) => `
    <div class="ani-globe transition"><div class="ani-earth"></div><div class="ani-route"></div></div>
    <div class="ani-location"><small>Global handoff</small><strong>${escapeHtml(config.fromCountry)} → ${escapeHtml(config.country)}</strong></div>`,
  "breaking-news-intro": (config) => `
    <div class="ani-breaking"><span>Breaking</span>${titleBlock(config)}<div class="ani-scanline"></div></div>`,
  "headline-reveal": (config) => `<div class="ani-headline">${titleBlock(config)}<div class="ani-rule"></div></div>`,
  "lower-third-title": (config) => `<div class="ani-lower-third"><span>${escapeHtml(config.label || "Technology")}</span><strong>${escapeHtml(config.headline)}</strong></div>`,
  "presenter-id": (config) => `<div class="ani-presenter"><div class="ani-avatar">${escapeHtml((config.name || "AR").slice(0, 2))}</div><div><strong>${escapeHtml(config.name)}</strong><span>${escapeHtml(config.role)}</span></div></div>`,
  "quote-card": (config) => `<div class="ani-quote"><b>“</b><blockquote>${escapeHtml(config.quote)}</blockquote><cite>${escapeHtml(config.attribution)}</cite></div>${source(config)}`,
  "statistic-counter": (config) => `<div class="ani-stat"><strong>${escapeHtml(config.value)}</strong><span>${escapeHtml(config.label)}</span><small>${escapeHtml(config.data?.delta || "")}</small></div>${source(config)}`,
  "percentage-visualization": (config) => `<div class="ani-percent" style="--value:${Number.parseFloat(config.value) || 64}"><div><strong>${escapeHtml(config.value)}%</strong><span>${escapeHtml(config.label)}</span></div></div>`,
  "comparison-chart": (config) => `${titleBlock(config)}${chartBars(config)}${source(config)}`,
  "timeline": (config) => `${titleBlock(config)}${timelineMarkup(config)}`,
  "location-label": (config) => `<div class="ani-location-card"><span>${escapeHtml(config.city || "Regional desk")}</span><strong>${escapeHtml(config.country)}</strong><small>${escapeHtml(config.data?.coordinates || "Live location")}</small></div>`,
  "map-route": (config) => `<div class="ani-map-route"><span>${escapeHtml(config.from)}</span><i></i><span>${escapeHtml(config.to)}</span></div>`,
  "source-attribution": (config) => `<div class="ani-source-card"><small>Reporting & data</small><strong>${escapeHtml(config.source)}</strong><span>${escapeHtml(config.text || "Source checked at publication time")}</span></div>`,
  "image-reveal": (config) => `<div class="ani-media-frame"><img src="${escapeHtml(config.images?.[0] || "assets/sample-primary.jpg")}" alt=""><span>${escapeHtml(config.label || "Editorial image")}</span></div>`,
  "video-reveal": (config) => `<div class="ani-video-frame"><div class="ani-play">▶</div><strong>${escapeHtml(config.headline || "Field footage")}</strong><span>${escapeHtml(config.label || "Video")}</span></div>`,
  "split-screen-comparison": (config) => `<div class="ani-split"><div><strong>${escapeHtml(config.left?.label || "Then")}</strong></div><div><strong>${escapeHtml(config.right?.label || "Now")}</strong></div></div>`,
  "before-after-transition": (config) => `<div class="ani-before-after"><div><span>Before</span></div><div><span>After</span></div><i></i></div>`,
  "social-post": (config) => `<div class="ani-social"><header><span>@</span><strong>${escapeHtml(config.author)}</strong></header><p>${escapeHtml(config.post)}</p><footer>Original post · ${escapeHtml(config.source)}</footer></div>`,
  "market-movement": (config) => `<div class="ani-market"><header><strong>${escapeHtml(config.symbol)}</strong><span>${escapeHtml(config.data?.period || "1D")}</span></header><b>${escapeHtml(config.value)}</b><i class="${String(config.change).startsWith("-") ? "down" : "up"}">${escapeHtml(config.change)}</i><svg viewBox="0 0 300 84" aria-hidden="true"><path d="M0 70 L42 58 L78 62 L110 36 L150 44 L190 18 L226 28 L260 8 L300 16"></path></svg></div>${source(config)}`,
  "weather-card": (config) => `<div class="ani-weather"><span class="ani-weather-icon">◒</span><div><small>${escapeHtml(config.location)}</small><strong>${escapeHtml(config.temperature)}</strong><span>${escapeHtml(config.condition || "Cloud cover")}</span></div></div>`,
  "conflict-election-map": (config) => `<div class="ani-election"><div class="ani-map-shape"></div><div><small>Live map</small><strong>${escapeHtml(config.country)}</strong><span>${escapeHtml(config.regions || "Regional results")}</span></div></div>`,
  "topic-divider": (config) => `<div class="ani-divider"><span>Next</span><strong>${escapeHtml(config.label)}</strong><i></i></div>`,
  "chapter-transition": (config) => `<div class="ani-chapter"><b>${escapeHtml(config.data?.chapter || "02")}</b><div><span>Chapter</span><strong>${escapeHtml(config.label)}</strong></div></div>`,
  "story-transition": (config) => `<div class="ani-story-end"><span>Story complete</span><strong>${escapeHtml(config.label || "Continue the briefing")}</strong><i></i></div>`,
  "daily-news-outro": (config) => `<div class="ani-outro"><small>${escapeHtml(config.edition)}</small><strong>INDIEHOUSE.IO<br>NEWS</strong><span>Context first. Every day.</span></div>`,
  "follow-cta": (config) => `<div class="ani-cta"><span>Stay informed</span><strong>${escapeHtml(config.label || "Follow for tomorrow’s brief")}</strong><button>${escapeHtml(config.text || "Follow")}</button></div>`,
};

export function renderAnimationComponent(descriptor, target) {
  const config = { ...descriptor.config, definition: descriptor.definition };
  const renderer = renderers[descriptor.definition.type];
  if (!renderer) throw new Error(`No renderer for ${descriptor.definition.type}`);
  const html = renderer(config);
  if (!target) return html;
  [...target.classList]
    .filter((className) => className.startsWith("news-animation--"))
    .forEach((className) => target.classList.remove(className));
  target.classList.add("news-animation", `news-animation--${descriptor.definition.type}`);
  target.style.setProperty("--ani-accent", config.accent);
  target.dataset.animationType = descriptor.definition.type;
  target.dataset.reducedMotion = String(config.reducedMotion);
  target.innerHTML = html;
  return target;
}

export function hasAnimationRenderer(type) {
  return Boolean(renderers[type]);
}
