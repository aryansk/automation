# Hygen Daily News animation library

The reusable library lives in `assets/animations/`. Open `gallery.html` for a
developer-facing visual catalog of all 27 registered animations.

## Quick start

```js
import { getAnimation } from "./assets/animations/index.js";

const animation = getAnimation({
  type: "country-globe-reveal",
  country: "India",
  city: "Delhi",
  duration: 5,
  entry: "editorial-rise",
  exit: "editorial-fade",
  safeArea: "vertical",
  reducedMotion: "respect",
});

animation.mount(document.querySelector("#visual"));
animation.addToTimeline(window.__timelines["daily-news"], "#visual", 2);
```

The browser also exposes `window.getAnimation()` and
`window.HygenNewsAnimations` for agents working directly in a composition.

## Shared configuration contract

Every registry item accepts the same base fields:

| Field | Purpose |
| --- | --- |
| `text`, `headline`, `subhead`, `label` | Copy surfaces |
| `images`, `video` | Local media inputs |
| `duration` | Total component duration in seconds |
| `entry`, `exit` | Named motion presets |
| `layout` | Portrait, split, inset or other component layout |
| `fontSize` | Optional type-scale override |
| `brand`, `accent` | Brand preset and accent color |
| `data` | Component-specific structured values |
| `source` | Visible attribution |
| `safeArea` | Vertical-safe behavior by default |
| `reducedMotion` | `respect`, `always` or a boolean |

`getAnimation()` returns a descriptor with `valid` and `missing` fields, a
`mount(target)` method, and an `addToTimeline(timeline, target, start)` method.
Unknown animation names fail loudly and direct the agent to `listAnimations()`.

## Registry names and appropriate use

### Geography

- `country-globe-reveal` — establish one country or city before the story.
- `country-globe-transition` — move between verified locations.
- `location-label` — compact place identification without a full map beat.
- `map-route` — show origin, destination and directional movement.
- `conflict-election-map` — regional result or status framing; data must be sourced.

The production globe API is exported separately:

```js
import {
  createCountryGlobeTransition,
  createNewsGlobe,
} from "./assets/animations/globe.js";

const globe = createNewsGlobe({
  canvas,
  features: window.DAILY_NEWS_GEO.features,
  countryCode: "IN",
  city: "Delhi",
  coordinates: [77.209, 28.6139],
  affectedCountryCodes: ["IN", "JP"],
  highlightStyle: "outline-pulse",
  cameraAngle: "editorial",
  duration: 5,
  labelText: "Delhi",
});

window.addEventListener("hf-seek", (event) => globe.renderAt(event.detail.time));

const transition = createCountryGlobeTransition({
  canvas,
  features: window.DAILY_NEWS_GEO.features,
  fromCoordinates: [-0.1276, 51.5072],
  toCoordinates: [77.209, 28.6139],
  countryCode: "IN",
  duration: 5,
});
```

The renderer prefers WebGL and uses the satellite surface, normal/specular maps,
cloud shell, atmosphere, accurate Natural Earth borders and a country/city
target pulse. If WebGL initialization or texture loading fails, the same API
switches to a shaded canvas renderer with local satellite imagery and accurate
orthographic borders.

### Openers, typography and identity

- `breaking-news-intro` — verified urgent stories only.
- `headline-reveal` — normal lead statement or story hook.
- `lower-third-title` — short name, topic or segment identification.
- `presenter-id` — reporter name and role.

### Editorial and source context

- `quote-card` — exact quote plus speaker and source.
- `source-attribution` — foreground a source, filing or dataset.
- `social-post` — reproduce a verified post with author and source.

### Data, finance and chronology

- `statistic-counter` — one primary measure with unit, period and source.
- `percentage-visualization` — a bounded 0–100 measure.
- `comparison-chart` — two values on a common scale.
- `timeline` — chronological events with verified times.
- `market-movement` — symbol, current value, direction, period and source.
- `weather-card` — place, temperature and condition.

### Media

- `image-reveal` and `video-reveal` — clean editorial media showcases.
- `split-screen-comparison` — two subjects visible together.
- `before-after-transition` — one continuous before/after relationship.

### Transitions and closing

- `topic-divider`, `chapter-transition`, `story-transition` — structural beats.
- `daily-news-outro` — edition close.
- `follow-cta` — restrained follow or subscribe request.

## Story metadata and automatic selection

Existing story JSON remains valid. Add `storyType` to choose a semantic route:

```json
{
  "storyType": "statistics",
  "statValue": "68%",
  "statLabel": "firms planning to hire",
  "statDelta": "+9 pts",
  "statPeriod": "versus prior period"
}
```

Supported routes are `auto`, `geographic`, `breaking`, `statistics`,
`comparison`, `quote`, `financial`, `timeline`, `weather`, `product` and
`editorial`. `visualType` can override the chosen registry animation.

When `storyType` is `auto`, the selector prioritizes exact structured metadata,
then interprets the headline, kicker, summary and script. Missing or malformed
optional metadata falls back to a headline treatment rather than breaking the
render.

## Motion rules

- All production motion is driven from the single paused HyperFrames timeline
  or from `hf-seek` time.
- Entrances use `power3`/`power4`/`expo` families; overshoot is intentionally
  absent from the serious newsroom register.
- Data counters use deterministic proxy values and tabular numerals.
- Repeated movement is finite.
- Reduced-motion mode keeps information visible and removes spatial travel.

## Validation

```bash
npm test
npm run validate:examples
npm run check
npm run snapshot
```

The registry tests assert that every documented name has a renderer and the
shared configuration surface. Story validation checks both the legacy required
fields and optional metadata contracts.
