const COMMON_DEFAULTS = Object.freeze({
  text: "",
  headline: "",
  subhead: "",
  label: "",
  images: [],
  video: "",
  duration: 4,
  entry: "editorial-rise",
  exit: "editorial-fade",
  layout: "portrait",
  fontSize: "auto",
  brand: "hygen",
  accent: "#F4B860",
  data: {},
  source: "",
  safeArea: "vertical",
  reducedMotion: "respect",
});

const definitions = [
  ["country-globe-reveal", "Geography", "3D globe country reveal", 5, ["country"]],
  ["country-globe-transition", "Geography", "Country-to-country globe transition", 5, ["fromCountry", "country"]],
  ["breaking-news-intro", "Openers", "Breaking-news intro", 3.2, ["headline"]],
  ["headline-reveal", "Typography", "Headline reveal", 3.8, ["headline"]],
  ["lower-third-title", "Identity", "Lower-third title", 4.5, ["headline"]],
  ["presenter-id", "Identity", "Reporter or presenter identification", 4.5, ["name", "role"]],
  ["quote-card", "Editorial", "Quote card", 5.5, ["quote", "attribution"]],
  ["statistic-counter", "Data", "Statistic counter", 4.5, ["value", "label"]],
  ["percentage-visualization", "Data", "Percentage visualisation", 4.5, ["value", "label"]],
  ["comparison-chart", "Data", "Comparison chart", 5.5, ["left", "right"]],
  ["timeline", "Data", "Timeline", 6, ["events"]],
  ["location-label", "Geography", "Location label", 3.8, ["country"]],
  ["map-route", "Geography", "Map route or movement path", 5.5, ["from", "to"]],
  ["source-attribution", "Editorial", "Source attribution card", 4, ["source"]],
  ["image-reveal", "Media", "Image reveal", 5, ["images"]],
  ["video-reveal", "Media", "Video reveal", 5, ["video"]],
  ["split-screen-comparison", "Media", "Split-screen comparison", 6, ["left", "right"]],
  ["before-after-transition", "Media", "Before-and-after transition", 6, ["before", "after"]],
  ["social-post", "Editorial", "Social-media post display", 5.5, ["author", "post"]],
  ["market-movement", "Markets", "Stock or market movement card", 5, ["symbol", "value", "change"]],
  ["weather-card", "Weather", "Weather card", 5, ["location", "temperature"]],
  ["conflict-election-map", "Geography", "Conflict or election map", 6, ["country", "regions"]],
  ["topic-divider", "Transitions", "Topic divider", 3.2, ["label"]],
  ["chapter-transition", "Transitions", "Chapter transition", 3.5, ["label"]],
  ["story-transition", "Transitions", "End-of-story transition", 3.2, ["label"]],
  ["daily-news-outro", "Closers", "Daily-news outro", 4, ["edition"]],
  ["follow-cta", "Closers", "Subscribe or follow call-to-action", 4, ["label"]],
];

const aliases = Object.freeze({
  "breaking-intro": "breaking-news-intro",
  "country-reveal": "country-globe-reveal",
  "country-transition": "country-globe-transition",
  "lower-third": "lower-third-title",
  "reporter-id": "presenter-id",
  "stat-counter": "statistic-counter",
  "percentage": "percentage-visualization",
  "comparison": "comparison-chart",
  "source-card": "source-attribution",
  "market-card": "market-movement",
  "end-of-story-transition": "story-transition",
  "subscribe-cta": "follow-cta",
});

function freezeDefinition([type, category, title, defaultDuration, required]) {
  return Object.freeze({
    type,
    category,
    title,
    defaultDuration,
    required: Object.freeze(required),
    apiVersion: 1,
  });
}

export class AnimationRegistry {
  constructor(items = definitions) {
    this.items = new Map(items.map((item) => {
      const definition = freezeDefinition(item);
      return [definition.type, definition];
    }));
  }

  resolveType(type) {
    const normalized = String(type || "").trim().toLowerCase();
    return aliases[normalized] || normalized;
  }

  has(type) {
    return this.items.has(this.resolveType(type));
  }

  getDefinition(type) {
    const resolved = this.resolveType(type);
    const definition = this.items.get(resolved);
    if (!definition) {
      throw new Error(`Unknown news animation "${type}". Use listAnimations() to discover valid names.`);
    }
    return definition;
  }

  create(options = {}) {
    const definition = this.getDefinition(options.type);
    const config = {
      ...COMMON_DEFAULTS,
      duration: definition.defaultDuration,
      ...options,
      type: definition.type,
      data: { ...COMMON_DEFAULTS.data, ...(options.data || {}) },
      images: Array.isArray(options.images) ? [...options.images] : options.image ? [options.image] : [],
    };

    const missing = definition.required.filter((key) => {
      const value = config[key] ?? config.data[key];
      return value === undefined || value === null || value === "" ||
        (Array.isArray(value) && value.length === 0);
    });

    return Object.freeze({
      definition,
      config: Object.freeze(config),
      missing: Object.freeze(missing),
      valid: missing.length === 0,
    });
  }

  list({ category } = {}) {
    const values = [...this.items.values()];
    return category
      ? values.filter((definition) => definition.category.toLowerCase() === String(category).toLowerCase())
      : values;
  }

  categories() {
    return [...new Set(this.list().map((definition) => definition.category))];
  }
}

export const animationRegistry = new AnimationRegistry();
export const animationDefaults = COMMON_DEFAULTS;
export const animationAliases = aliases;

export function listAnimations(filters) {
  return animationRegistry.list(filters);
}

export function createAnimationDescriptor(options) {
  return animationRegistry.create(options);
}
