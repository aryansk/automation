const TYPE_ALIASES = Object.freeze({
  geo: "geographic",
  location: "geographic",
  breaking: "breaking",
  developing: "breaking",
  stats: "statistics",
  stat: "statistics",
  numeric: "statistics",
  versus: "comparison",
  vs: "comparison",
  markets: "financial",
  finance: "financial",
  quotation: "quote",
});

const VISUAL_BY_STORY_TYPE = Object.freeze({
  geographic: "country-globe-reveal",
  breaking: "breaking-news-intro",
  statistics: "statistic-counter",
  comparison: "comparison-chart",
  quote: "quote-card",
  financial: "market-movement",
  timeline: "timeline",
  weather: "weather-card",
  product: "image-reveal",
  editorial: "headline-reveal",
});

function clean(value) {
  return String(value ?? "").trim();
}

function parseJson(value, fallback) {
  if (value && typeof value === "object") return value;
  const source = clean(value);
  if (!source) return fallback;
  try {
    return JSON.parse(source);
  } catch {
    return fallback;
  }
}

function parseNumberish(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const match = clean(value).replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function inferType(story) {
  const explicit = TYPE_ALIASES[clean(story.storyType).toLowerCase()] ||
    clean(story.storyType).toLowerCase();
  if (explicit && explicit !== "auto") return explicit;

  const text = [
    story.kicker,
    story.headline,
    story.summary,
    story.script,
  ].map(clean).join(" ").toLowerCase();

  if (clean(story.quoteText)) return "quote";
  if (clean(story.comparisonLeftValue) && clean(story.comparisonRightValue)) return "comparison";
  if (clean(story.marketSymbol) || /\b(stock|shares|market|index|yield|currency|bitcoin|price)\b/.test(text)) {
    return "financial";
  }
  if (clean(story.statValue) || /\b(percent|percentage|million|billion|trillion|record|rose|fell)\b/.test(text)) {
    return "statistics";
  }
  if (clean(story.timelineEvents)) return "timeline";
  if (clean(story.urgency).toLowerCase() === "breaking" || /\bbreaking\b/.test(text)) return "breaking";
  if (clean(story.cityName) || clean(story.countryCode)) return "geographic";
  return "editorial";
}

export function normalizeStoryMetadata(story = {}) {
  const storyType = inferType(story);
  const visualType = clean(story.visualType) || VISUAL_BY_STORY_TYPE[storyType] || "headline-reveal";
  const chartData = parseJson(story.chartData, []);
  const timelineEvents = parseJson(story.timelineEvents, []);
  const affectedCountryCodes = clean(story.affectedCountryCodes)
    .split(/[\s,]+/)
    .filter((code) => /^[A-Za-z]{2}$/.test(code))
    .map((code) => code.toUpperCase());

  return Object.freeze({
    storyType,
    visualType,
    urgency: clean(story.urgency) || (storyType === "breaking" ? "breaking" : "standard"),
    geography: Object.freeze({
      countryCode: clean(story.countryCode).toUpperCase() || "US",
      countryName: clean(story.countryName) || "United States",
      cityName: clean(story.cityName),
      coordinates: parseJson(story.coordinates, null),
      affectedCountryCodes: Object.freeze(affectedCountryCodes),
      highlightStyle: clean(story.highlightStyle) || "outline-pulse",
      cameraAngle: clean(story.cameraAngle) || "editorial",
    }),
    statistic: Object.freeze({
      value: clean(story.statValue),
      numericValue: parseNumberish(story.statValue),
      label: clean(story.statLabel),
      unit: clean(story.statUnit),
      delta: clean(story.statDelta),
      period: clean(story.statPeriod),
    }),
    comparison: Object.freeze({
      left: Object.freeze({
        label: clean(story.comparisonLeftLabel),
        value: clean(story.comparisonLeftValue),
        numericValue: parseNumberish(story.comparisonLeftValue),
      }),
      right: Object.freeze({
        label: clean(story.comparisonRightLabel),
        value: clean(story.comparisonRightValue),
        numericValue: parseNumberish(story.comparisonRightValue),
      }),
    }),
    quote: Object.freeze({
      text: clean(story.quoteText),
      attribution: clean(story.quoteAttribution),
      role: clean(story.quoteRole),
    }),
    market: Object.freeze({
      symbol: clean(story.marketSymbol),
      value: clean(story.marketValue),
      change: clean(story.marketChange || story.statDelta),
      period: clean(story.marketPeriod || story.statPeriod),
    }),
    chartData: Object.freeze(Array.isArray(chartData) ? chartData : []),
    timelineEvents: Object.freeze(Array.isArray(timelineEvents) ? timelineEvents : []),
  });
}

export function chooseStoryAnimation(story = {}) {
  const metadata = normalizeStoryMetadata(story);
  const common = {
    type: metadata.visualType,
    headline: clean(story.headline),
    text: clean(story.summary),
    source: clean(story.source),
    accent: clean(story.accent) || "#F4B860",
  };

  switch (metadata.storyType) {
    case "statistics":
      return {
        ...common,
        value: metadata.statistic.value || "—",
        label: metadata.statistic.label || clean(story.kicker),
        data: metadata.statistic,
      };
    case "comparison":
      return {
        ...common,
        left: metadata.comparison.left,
        right: metadata.comparison.right,
        data: metadata.comparison,
      };
    case "quote":
      return {
        ...common,
        quote: metadata.quote.text || clean(story.summary),
        attribution: metadata.quote.attribution || clean(story.source),
        data: metadata.quote,
      };
    case "financial":
      return {
        ...common,
        symbol: metadata.market.symbol || clean(story.kicker),
        value: metadata.market.value || metadata.statistic.value || "—",
        change: metadata.market.change || "—",
        data: metadata.market,
      };
    case "timeline":
      return { ...common, events: metadata.timelineEvents, data: { events: metadata.timelineEvents } };
    default:
      return {
        ...common,
        country: metadata.geography.countryName,
        city: metadata.geography.cityName,
        data: metadata.geography,
      };
  }
}

export const storyVisualMap = VISUAL_BY_STORY_TYPE;
