import { animationRegistry, getAnimation } from "./animations/index.js";

const sampleByType = {
  "country-globe-reveal": { country: "India", city: "Delhi", label: "Geography" },
  "country-globe-transition": { fromCountry: "Japan", country: "United States", label: "Global handoff" },
  "breaking-news-intro": { headline: "Major vote reshapes the coalition", label: "Developing" },
  "headline-reveal": { headline: "The next chapter in commercial space", label: "Technology" },
  "lower-third-title": { headline: "Maya Rao reports", label: "New Delhi bureau" },
  "presenter-id": { name: "Maya Rao", role: "Senior correspondent" },
  "quote-card": { quote: "The next phase will depend on execution, not promises.", attribution: "Finance minister", source: "Official briefing" },
  "statistic-counter": { value: "68M", label: "people affected", data: { delta: "+12%" }, source: "National statistics office" },
  "percentage-visualization": { value: "64", label: "support the proposal" },
  "comparison-chart": {
    headline: "Capacity compared",
    left: { label: "Company A", value: "68", numericValue: 68 },
    right: { label: "Company B", value: "42", numericValue: 42 },
    source: "Company filings",
  },
  timeline: {
    headline: "How the day unfolded",
    events: [
      { label: "08:00", text: "Initial filing" },
      { label: "12:30", text: "Cabinet response" },
      { label: "18:00", text: "Next briefing" },
    ],
  },
  "location-label": { country: "Germany", city: "Berlin", data: { coordinates: "52.52°N / 13.40°E" } },
  "map-route": { from: "Shanghai", to: "Rotterdam" },
  "source-attribution": { source: "Election Commission", text: "Results updated at 18:00 local time" },
  "image-reveal": { images: ["assets/sample-primary.jpg"], label: "Launch complex / file image" },
  "video-reveal": { headline: "Watch the launch sequence", label: "Field footage" },
  "split-screen-comparison": { left: { label: "2025" }, right: { label: "2026" } },
  "before-after-transition": { before: "Before", after: "After" },
  "social-post": { author: "Space Agency", post: "The mission has reached its planned orbit.", source: "Verified account" },
  "market-movement": { symbol: "NIFTY 50", value: "24,611", change: "+1.8%", data: { period: "1D" }, source: "Exchange close" },
  "weather-card": { location: "Delhi", temperature: "34°", condition: "Haze clearing" },
  "conflict-election-map": { country: "National vote", regions: "142 of 180 reporting" },
  "topic-divider": { label: "Technology" },
  "chapter-transition": { label: "What changes next", data: { chapter: "03" } },
  "story-transition": { label: "Markets are next" },
  "daily-news-outro": { edition: "25 Jul 2026" },
  "follow-cta": { label: "Follow tomorrow’s brief", text: "Follow" },
};

const gallery = document.getElementById("animation-gallery");
const count = document.getElementById("visible-count");
const filters = document.getElementById("category-filters");
const search = document.getElementById("animation-search");
const definitions = animationRegistry.list();
let activeCategory = "All";

function renderItems() {
  definitions.forEach((definition) => {
    const sample = sampleByType[definition.type] || {};
    const animation = getAnimation({ type: definition.type, ...sample });
    const article = document.createElement("article");
    article.className = "gallery-item";
    article.dataset.category = definition.category;
    article.dataset.search = `${definition.type} ${definition.title} ${definition.category}`.toLowerCase();

    const preview = document.createElement("div");
    preview.className = "gallery-item__preview";
    animation.mount(preview);

    const meta = document.createElement("div");
    meta.className = "gallery-item__meta";
    const title = document.createElement("h2");
    title.textContent = definition.title;
    const category = document.createElement("span");
    category.textContent = definition.category;
    const type = document.createElement("code");
    type.textContent = definition.type;
    meta.append(title, category, type);
    article.append(preview, meta);
    gallery.append(article);
  });
}

function renderFilters() {
  ["All", ...animationRegistry.categories()].forEach((category) => {
    const button = document.createElement("button");
    button.className = "filter-button";
    button.type = "button";
    button.textContent = category;
    button.dataset.category = category;
    button.setAttribute("aria-pressed", String(category === activeCategory));
    button.addEventListener("click", () => {
      activeCategory = category;
      filters.querySelectorAll("button").forEach((item) => {
        item.setAttribute("aria-pressed", String(item.dataset.category === activeCategory));
      });
      applyFilters();
    });
    filters.append(button);
  });
}

function applyFilters() {
  const query = search.value.trim().toLowerCase();
  let visible = 0;
  gallery.querySelectorAll(".gallery-item").forEach((article) => {
    const categoryMatches = activeCategory === "All" || article.dataset.category === activeCategory;
    const searchMatches = !query || article.dataset.search.includes(query);
    article.hidden = !(categoryMatches && searchMatches);
    if (!article.hidden) visible += 1;
  });
  count.textContent = String(visible).padStart(2, "0");
}

renderItems();
renderFilters();
search.addEventListener("input", applyFilters);
applyFilters();
