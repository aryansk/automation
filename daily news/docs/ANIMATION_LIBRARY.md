# Globe animation library

godandbaddaily now has a deterministic editorial geography system for
both Shorts and long-form news. The catalog contains **60 stable presets**
covering camera moves, geographic highlights, routes and systems,
change-over-time, and live-event explainers.

**Every video animation uses the historical Three.js globe as its one visible
globe surface.** The 60-preset library supplies deterministic claim
annotations—country fills, routes, hazard extents, choropleths and uncertainty
fields—through a transparent Canvas layer projected from that globe's actual
Three.js camera and rotation. It never paints a
second visible sphere or replaces the established globe with a flat map.

Every checked-in demo is visibly marked **Sample data only**. The catalog's
sample payloads exist to make each preset immediately previewable; they are not
reporting and must never be published as factual data.

## What is included

| Surface | Location | Purpose |
| --- | --- | --- |
| Catalog and schema | `assets/animations/globe-map-library.js` | Stable IDs, defaults, requirements, usage guidance, format profiles, validation and automatic suggestions |
| Script-to-animation plan | `assets/animations/globe-map-plan.js` | Stable plan schema for choosing a preset at each spoken script section |
| Deterministic annotation renderer | `assets/animations/globe-native-annotation-renderer.js` | Canvas drawing for all 60 presets from the historical globe's live camera/projection; transparent in video compositions |
| Shared showcase runtime | `assets/animations/globe-map-showcase.js` | Seek-safe gallery sequencing, labels and progress UI |
| Shared showcase styling | `assets/animations/globe-map-showcase.css` | godandbaddaily's drafting-map visual system |
| Long-form showcase | `globe-map-showcase-landscape/` | 1920x1080 catalog reel with every preset |
| Shorts showcase | `globe-map-showcase-portrait/` | 1080x1920 catalog reel with every preset and a 300 px bottom safe zone |
| Sequence example | `stories/templates/globe-map-sequence.example.json` | A six-scene, data-driven example timeline |
| v1.1 sequence example | `stories/templates/globe-map-sequence-v1.1.example.json` | Sample-only coverage of all 12 new evidence payload shapes |
| Sequence gate | `scripts/validate-globe-map-sequence.mjs` | Validates IDs, timing, format, source policy and preset data |
| Automated tests | `tests/globe-map-library.test.mjs`, `tests/globe-map-sequence.test.mjs` | Catalog, validation, suggestion and sequence invariants |

The system uses the explanatory grammar common to strong editorial map videos:
first orient the viewer, then reveal only the layer needed for the claim, then
move closer when detail matters. Its colors, typography, framing, data policy
and motion language remain original to godandbaddaily; it does not copy
another newsroom's branded visual identity.

## The 60 presets

### Camera and orientation (10)

| ID | Use it for |
| --- | --- |
| `world-orbit` | Establishing genuinely global scope |
| `hemisphere-reveal` | Bringing a relevant hemisphere into view |
| `country-lock` | Holding on a verified country |
| `city-lock` | Resolving country context into a precise city/site |
| `region-dive` | Moving from globe orientation into regional detail |
| `country-hop` | Comparing or connecting two countries without implying movement |
| `antipode-flip` | Emphasizing extreme geographic distance |
| `globe-pullback` | Expanding a local consequence into global context |
| `globe-to-flat-map` | Handing off from orientation to data layers |
| `flat-map-to-globe` | Restoring global context after regional detail |

### Areas, boundaries and emphasis (13)

| ID | Use it for |
| --- | --- |
| `country-fill` | Identifying one country at a glance |
| `country-outline` | Making a verified boundary readable without obscuring detail |
| `multi-country-sweep` | Revealing a sourced list of affected countries in order |
| `regional-choropleth` | Comparing numeric area values on one stable scale |
| `election-results-fill` | Attributed categorical results or explicitly labeled projections |
| `conflict-zone-hatch` | Showing a sourced activity/control zone without claiming a legal border |
| `disputed-boundary-dash` | Showing a sourced disputed or provisional line |
| `buffer-zone-band` | Showing a treaty, safety or evacuation corridor with stated width |
| `disaster-radius` | Showing a sourced impact or exclusion radius |
| `spotlight-dim` | Keeping a small place readable while retaining neighboring context |
| `policy-status-sweep` | Stepping through attributed policy states across countries |
| `geofenced-area` | Drawing a supplied restricted, protected or evacuation polygon |
| `evidence-confidence-fill` | Separating confirmed, reported and unverified geographic evidence |

### Routes, movement and systems (14)

| ID | Use it for |
| --- | --- |
| `great-circle-route` | One verified movement between distant places |
| `multi-leg-journey` | Ordered movement with meaningful intermediate stops |
| `bilateral-flow` | Two-way exchange, with values when directions differ |
| `trade-flow-ribbons` | Comparable flow magnitudes across several routes |
| `migration-flow` | Ethically appropriate, verified directional movement |
| `shipping-lanes` | Maritime systems and chokepoints, not simulated live tracking |
| `flight-network` | Aviation connections and hub concentration |
| `pipeline-trace` | A verified infrastructure alignment |
| `supply-chain-hop` | Known production/logistics stages |
| `chokepoint-focus` | Explaining why a narrow passage matters to a larger system |
| `route-disruption` | Showing an active, blocked or verified detour route |
| `network-branch` | Building a sourced dependency network around named nodes |
| `flow-shift` | Comparing baseline and changed flows on one globe |
| `source-sink-flow` | Connecting identified origins to destinations with proportional flow |

### Change, comparison and quantitative maps (12)

| ID | Use it for |
| --- | --- |
| `before-after-swipe` | Comparing the same geography at two sourced dates |
| `historical-border-morph` | Explaining documented historical change without implying a present claim |
| `time-lapse-choropleth` | Showing comparable values over regular time stages |
| `ranking-wave` | Showing how ranks change while preserving values and ties |
| `proportional-bubbles` | Comparing point values through area-scaled circles |
| `dot-density` | Showing a sourced statistical distribution rather than exact addresses |
| `heatmap-bloom` | Showing a genuine density or intensity field |
| `uncertainty-cloud` | Making estimate confidence or location uncertainty explicit |
| `comparison-split-map` | Comparing two scenarios or dates on a common scale |
| `small-multiple-regions` | Comparing several regions without animated camera hopping |
| `delta-bubbles` | Showing signed before/after point change with area-scaled bubbles |
| `rank-shift` | Linking the same places across two comparable ranked states |

### Events, hazards and environmental context (11)

| ID | Use it for |
| --- | --- |
| `earthquake-ripple` | A verified epicenter, magnitude and event time |
| `storm-track` | Separating observed and forecast storm positions |
| `weather-front` | A sourced meteorological boundary or system path |
| `wildfire-spread` | Timestamped observed or modeled perimeter stages |
| `flood-inundation` | Sourced observed/modelled extent stages |
| `outage-cascade` | A known network dependency or outage sequence |
| `day-night-terminator` | Time zones, daylight and simultaneous events using a real timestamp |
| `satellite-orbit` | Sourced observation coverage or orbital paths |
| `event-cluster` | Revealing a sourced sequence of related event sites |
| `forecast-cone` | Separating observed and forecast paths from an uncertainty envelope |
| `impact-layers` | Showing multiple measured impact bands around one verified site |

Each definition also carries `summary`, `required`, `useWhen`, `avoidWhen`,
`projection`, `duration`, `tags`, supported formats and an illustrative sample.
Use those fields to help an agent select a preset; do not infer facts from them.

## Quick start

Load the local world feature collection and the historical globe before the
annotation module. The renderer does not request network media.

```html
<canvas id="map" width="1920" height="1080"></canvas>
<script src="assets/data/world-data.js"></script>
<script type="module" src="composition.js"></script>
```

```js
import {
  validateProductionGlobeMapAnimationConfig,
} from "./assets/animations/globe-map-library.js";
import { createGlobeTour } from "./assets/animations/globe-tour.js";
import { createGlobeNativeAnnotationRenderer } from "./assets/animations/globe-native-annotation-renderer.js";

const data = {
  label: "Delhi",
  source: "Reporting source and retrieval date",
  target: {
    name: "Delhi",
    country: "India",
    code: "IN",
    coordinates: [77.209, 28.6139],
  },
};

const gate = validateProductionGlobeMapAnimationConfig("city-lock", data);
if (!gate.valid) {
  throw new Error([...gate.missing, ...gate.issues].join("; "));
}

const globe = createGlobeTour({
  canvas: document.querySelector("#globe-layer"),
  features: window.DAILY_NEWS_GEO.features,
  width: 1920,
  height: 1080,
  stops: [],
});
const renderer = createGlobeNativeAnnotationRenderer({
  canvas: document.querySelector("#map"),
  features: window.DAILY_NEWS_GEO,
  width: 1920,
  height: 1080,
  format: "landscape",
});

const duration = gate.definition.duration;
window.addEventListener("hf-seek", (event) => {
  const localTime = Math.max(0, event.detail.time - sceneStart);
  const view = globe.renderAt(localTime);
  renderer.render("city-lock", Math.min(localTime, duration), data, view);
});
```

`globe.renderAt(time)` returns the live view used by the annotation renderer.
`renderer.render(id, time, data, view)` expects animation-local time in seconds
and the current historical-globe view. `renderer.renderHeroFrame(id, data,
view)` renders a useful representative frame.
Rendering is deterministic at a given time and payload.

The renderer's convenience path merges illustrative defaults so that a preset
can always be previewed. **Production compositions must run
`validateProductionGlobeMapAnimationConfig()` first.** That strict gate does not
borrow sample values, requires a visible source, and rejects the built-in
illustrative source label.

## Discovery and automatic selection

```js
import {
  getGlobeMapAnimation,
  listGlobeMapAnimations,
  suggestGlobeMapAnimation,
} from "./assets/animations/globe-map-library.js";

const routePresets = listGlobeMapAnimations({ category: "Routes" });
const definition = getGlobeMapAnimation("storm-track");
const suggestedId = suggestGlobeMapAnimation({
  cityName: "Delhi",
  countryCode: "IN",
  coordinates: [77.209, 28.6139],
}); // city-lock
```

Automatic suggestions are intentionally conservative. Explicit
`animationPlan`, `mapAnimation`, `mapData` or `visualType` wins. A supplied
`mapEvidence` envelope is considered only when its exact ID, source and payload
pass production validation. Structured evidence such as uncertainty,
before/after values, stages, routes, radii and coordinates is considered before
generic geography. The result is a visual recommendation, never a factual
validation of the story.

## Choose the library before writing the script

Every production Short and long-form composition now runs through the
`globe-map-library` plan. Agents can choose the visual vocabulary before
writing narration by adding an `animationPlan` to the story JSON. Each segment
starts at a time relative to that story or chapter's narration and remains
active until the next segment starts. `scriptSection` and `scriptCue` keep the
visual decision tied to the words rather than to a late renderer guess.

```json
{
  "animationPlan": {
    "version": 1,
    "library": "globe-map-library",
    "policy": "required",
    "segments": [
      {
        "id": "orient",
        "scriptSection": "opener",
        "scriptCue": "Establish the wider geography.",
        "start": 0,
        "animationId": "world-orbit"
      },
      {
        "id": "focus",
        "scriptSection": "verified-location",
        "scriptCue": "Name the city where the event occurs.",
        "start": 2.4,
        "animationId": "city-lock"
      },
      {
        "id": "claim",
        "scriptSection": "why-it-matters",
        "scriptCue": "Follow the verified movement described in the next sentence.",
        "start": 6.8,
        "animationId": "great-circle-route",
        "mapSource": "Source / retrieval date",
        "mapData": {
          "route": [
            { "name": "Origin", "coordinates": [56.45, 26.56] },
            { "name": "Destination", "coordinates": [72.8777, 19.076] }
          ]
        }
      }
    ]
  }
}
```

Use `npm run animations:list` to browse all stable IDs, or add `--json` for
machine-readable definitions. `animationId: "auto"` delegates one segment to
the verified story selector. If no plan is authored, the render pipeline
materializes that same automatic library beat. `none`/`disabled` is not valid
inside a production plan; use `world-orbit` for a neutral, non-claim-bearing
library beat.

## Data-driven sequences

Use the checked-in sequence format when a story needs several geography beats.
The sample demonstrates country and city orientation, trade flows, temporal
comparison, uncertainty and a forecast track.

```bash
node scripts/validate-globe-map-sequence.mjs \
  stories/templates/globe-map-sequence.example.json
```

Set `mode` to `production` before publication. A production sequence fails when
a scene has an unknown animation ID, invalid timing, missing required data,
missing source, illustrative source, invalid format, or unsupported frame rate.
Gaps are warnings; overlaps are errors. Every scene should repeat the source
needed to interpret its own claim.

The sequence gate accepts both catalog `1.0.0` and `1.1.0`; the authored
`animationPlan` schema remains at version `1`. The new
`globe-map-sequence-v1.1.example.json` is sample-only and demonstrates the 12
new payload shapes without making reporting claims.

## Editorial recipes

### One-place breaking story

1. `world-orbit` only if global orientation is genuinely useful.
2. `country-lock` for national context.
3. `city-lock` for the verified event site.
4. `disaster-radius`, `earthquake-ripple`, or another event layer only when its
   geometry and units are sourced.

In a Short, omit the first step when the hook needs to land immediately.

### Relationship between two places

- Use `country-hop` when the story compares two locations but no movement is
  being claimed.
- Use `great-circle-route` only when something actually travels between them.
- Use `bilateral-flow` only when both directions are supported; width should
  encode magnitude when the directions differ.

### Global system explainer

1. Establish scope with `globe-pullback`.
2. Reveal verified legs with `shipping-lanes`, `flight-network`,
   `trade-flow-ribbons`, or `supply-chain-hop`.
3. Isolate the consequential passage with `chokepoint-focus`.
4. Return to a flat regional map if the explanation needs labels or data.

### Change over time

- Use `before-after-swipe` for two dates.
- Use `time-lapse-choropleth` for three or more comparable periods.
- Use `comparison-split-map` when simultaneous viewing matters more than
  animation.
- Keep bins, units and geographic boundaries stable across the comparison.

### Conflict, elections and uncertainty

- Make source and date visible in-frame.
- Use hatching and dashed lines for attributed zones or disputed boundaries;
  avoid solid styling that implies settled sovereignty.
- Separate observed, forecast, projected and modeled states in both color and
  labels.
- Use `uncertainty-cloud` when precision is unknown instead of choosing a
  falsely exact point.

## Portrait and landscape composition

Both formats share the same preset IDs and data, but they are separate authored
compositions—not crops.

| Format | Canvas | Default map frame | Safe-area intent |
| --- | --- | --- | --- |
| `portrait` | 1080x1920 | x 54, y 270, 972x1150 | 150 px top inset and 300 px bottom platform-safe area |
| `landscape` | 1920x1080 | x 62, y 118, 1796x830 | 72–88 px broadcast-safe insets |

For Shorts, favor a single geographic claim per beat, larger labels and fewer
simultaneous routes. For long-form, use the additional width for comparison,
legends and regional detail; never stretch the portrait scene or crop away its
labels.

## One canonical globe surface

Every video composition uses the established Three.js `createGlobeTour()` as
the sole visible globe surface. It owns the textured Earth, relief,
atmosphere, clouds, borders and camera travel. The native annotation renderer
projects claim fills, routes, rings and labels from that same live globe view;
`#map-layer` contributes only transparent annotations above `#globe-layer`.

Do not hide `#globe-layer` when a map plan resolves, and do not make the map
canvas opaque. A composition may use the historical globe with no annotations,
or add fills, routes, uncertainty, comparisons and sourced quantities over it;
the visible globe must remain the same throughout the animation.

Keep only one dominant camera move at a time. The map should clarify the
reporting, not become decorative spectacle.

## Motion, determinism and performance rules

- All playback comes from one paused HyperFrames/GSAP timeline or `hf-seek`.
- No `Date.now()`, `performance.now()`, timers or uncontrolled random values
  affect a frame.
- Entrances and camera moves settle into readable holds.
- Repeated motion is finite, and hero frames remain informative when paused.
- Canvas dimensions are explicit and do not depend on the browser viewport.
- Geography and fonts are local; rendering does not depend on network access.
- Decorative grain is seeded and deterministic.
- The renderer falls back to a clear unavailable-map card if D3 or geography is
  missing, rather than producing a misleading blank frame.

## Production pipeline integration

The daily-news pipeline now routes every future story through a shared
script-to-animation adapter. It resolves the 60-preset payloads from verified
story fields and renders the active plan segment in both formats. The
historical Three.js globe is always the visible base layer; the shared map
runtime adds only the validated transparent annotation layer.

| Surface | Location | Purpose |
| --- | --- | --- |
| Selector adapter | `assets/animations/globe-map-selector.js` | Conservative story classification, payload building, explicit override/disable, strict production validation |
| Runtime bridge | `assets/animations/globe-map-runtime.js` | Shared plan resolution + transparent Canvas annotations used by all compositions |
| Feature render bridge | `assets/animations/feature-globe-map-runtime.js` | Exposes all 60 selectable presets, resolves per-chapter choices and keeps authored plans ahead of optional defaults |
| Landscape renderers | `rare-earth-explainer/renderer.js`, `ai-electricity-explainer/renderer.js`, `landscape-trend-explainer/renderer.js`, `trade-trend-explainer/renderer.js`, `assets/story-explainer-renderer.js` | Keep the historical `#globe-layer` visible and draw the selected preset on transparent `#map-layer` |
| Portrait renderer | `assets/globe-tour-renderer.js` | Keeps the historical globe visible and draws each stop's selected annotations in portrait format |
| Story validator | `scripts/validate-story.mjs` | Validates `mapAnimation`/`mapData`/`mapSource` and authored plans against the library gate |
| Demo-story validator | `scripts/validate-demo-story.mjs` | Validates a landscape story's chapter map configuration |

### Story configuration

A story (or chapter) may carry:

```json
{
  "mapEvidence": {
    "animationId": "route-disruption",
    "source": "Verified reporting source",
    "data": {
      "routes": [
        {
          "points": [
            { "coordinates": [56.45, 26.56] },
            { "coordinates": [72.8777, 19.076] }
          ],
          "status": "blocked"
        }
      ]
    }
  },
  "mapAnimation": "storm-track",
  "mapSource": "IMD bulletin / 04 Aug 2026",
  "mapLabel": "ILLUSTRATIVE TRACK / OBSERVED → FORECAST",
  "mapData": {
    "track": [
      { "coordinates": [88.5, 13.2], "status": "observed", "label": "T-24" },
      { "coordinates": [86.9, 14.8], "status": "forecast", "label": "+24" }
    ]
  }
}
```

- `mapEvidence` — optional exact-ID automatic envelope with `animationId`,
  verified `source` and a complete `data` payload. It is rejected when the ID,
  source or payload fails production validation; it never performs keyword
  matching.
- `mapAnimation` — explicit preset ID (e.g. `city-lock`, `great-circle-route`,
  `storm-track`), `none`/`disabled`/`false` to turn maps off, or omit it for
  conservative automatic selection. `visualType` is a legacy alias.
- `mapData` — a fully verified custom payload for the preset. Never use the
  library's illustrative sample values here.
- `mapSource` — attribution shown on the map; falls back to the story `source`.
  Production resolution rejects the built-in illustrative source label.
- Chapter-level fields reuse the existing `chapter.globe` /
  `chapter.focus` verified geography (coordinates, routePoints,
  mentionedCountryCodes, affectedCountryCodes, stages) and may also carry their
  own `mapAnimation`/`animationId`/`mapData`/`mapSource`. `animationId` is the
  feature-render convenience alias; `mapAnimation` remains the canonical
  story-field name.
- `animationPlan` is the preferred production interface when a story needs
  more than one library preset. The same shape is accepted on a chapter; a
  chapter plan overrides the story plan. Segment `start` values are relative
  to that story/chapter's narration, so the plan works for both 18-second
  Shorts and long-form chapters whose absolute starts are calculated later by
  the builder.

### Feature-render choices

All feature compositions expose the same four optional HyperFrames variables:

```text
globeAnimationId    one preset ID, or auto
globeAnimationPlan  JSON animationPlan override
globeMapData        JSON verified payload for the selected preset
globeMapSource      verified attribution for that payload
```

The browser runtime also exposes `window.__featureGlobeMapOptions`, a
60-entry catalog with each preset's title, summary, use/avoid guidance,
required fields and portrait/landscape support. A host UI can populate its
selector from that list; the chosen ID is then passed through the normal
production validation gate. Use `npm run animations:list -- --json` for the
same catalog outside the browser.

A feature chapter can choose a different beat directly:

```json
{
  "animationId": "route-disruption",
  "mapSource": "Verified route ledger",
  "mapData": {
    "routes": [
      {
        "points": [
          { "coordinates": [56.45, 26.56] },
          { "coordinates": [72.8777, 19.076] }
        ],
        "status": "blocked",
        "value": 40
      },
      {
        "points": [
          { "coordinates": [56.45, 26.56] },
          { "coordinates": [103.8198, 1.3521] }
        ],
        "status": "detour",
        "value": 24
      }
    ]
  }
}
```

The selection is rendered as transparent annotations projected from the
historical Three.js globe. An authored chapter plan or chapter ID remains
ahead of a broad feature default; invalid or unattributed production payloads
fail closed and never substitute illustrative sample data.

### Automatic selection rules

`selectStoryMapAnimation(story, { format, mode: "production" })` is deliberately
conservative. Geography is only used when it materially improves understanding,
and a map is **never** added for decoration. The rules, in priority order:

1. Explicit `animationPlan`, `mapAnimation` and `mapData` choices — always win.
2. Explicit disablement (`none`/`disabled`/`false`) — always wins.
3. Valid `mapEvidence` exact ID and payload — use it, otherwise fail closed.
4. Structured event data: `track` → `storm-track`; radius `stages` + wildfire
   copy → `wildfire-spread`; radius `stages` + flood copy → `flood-inundation`;
   `magnitude`/quake copy → `earthquake-ripple`.
5. Route data: `routePoints`/`route` (≥2 verified points) →
   `great-circle-route` / `multi-leg-journey`; `routes` (≥2) →
   `trade-flow-ribbons`, or `migration-flow` when the copy says migration.
6. Election (`results`), conflict (`affectedCountryCodes`), uncertainty
   (`coordinates` + `radiusKm`/`confidence`), comparison (`before`/`after`),
   change (`stages` of values).
7. Library suggestion fallback (`city-lock`/`country-lock` for a verified
   location), then `world-orbit` only for genuinely global stories.

### Fallback behavior

When an authored claim-bearing segment lacks the verified structured data for
its chosen preset, validation fails before narration/rendering. An automatic
segment keeps the same conservative selector. If the story has no verified
geography yet, production uses the neutral `world-orbit` preset so the
composition still uses the library without inventing a target, route or data
claim. The selector-level API remains conservative and may return no map; the
production render bridge is the layer that enforces library coverage.

### Demonstration stories

Two labeled demonstration stories exercise the real pipeline path end to end:

- `stories/demo-route-hormuz-reopening.json` — `great-circle-route` (landscape)
- `stories/demo-storm-cyclone-track.json` — `storm-track` (portrait-capable)

Both use clearly labeled illustrative data (`ILLUSTRATIVE DEMO ... NOT
REPORTING` markers) and pass `npm run validate:demo-story` plus the automated
demo-story tests. Rendered samples:

- `renders/demo-route-hormuz-reopening.mp4` (22s, 1920×1080)
- `renders/demo-storm-cyclone-track.mp4` (22s, 1920×1080)

## Verification

Targeted code and data checks:

```bash
node --check assets/animations/globe-map-library.js
node --check assets/animations/globe-native-annotation-renderer.js
node --check assets/animations/globe-map-selector.js
node --check assets/animations/globe-map-runtime.js
node --check assets/animations/globe-map-plan.js
node --check scripts/validate-globe-map-sequence.mjs
node scripts/list-globe-map-animations.mjs --json > /tmp/globe-map-library.json
node --test \
  tests/globe-map-library.test.mjs \
  tests/globe-map-plan.test.mjs \
  tests/globe-map-selector.test.mjs \
  tests/globe-map-sequence.test.mjs \
  tests/globe-map-demo-stories.test.mjs
node scripts/validate-globe-map-sequence.mjs \
  stories/templates/globe-map-sequence.example.json
node scripts/validate-demo-story.mjs \
  --story stories/demo-route-hormuz-reopening.json
node scripts/validate-demo-story.mjs \
  --story stories/demo-storm-cyclone-track.json
```

HyperFrames checks and representative snapshots:

```bash
cd globe-map-showcase-landscape
npx hyperframes@0.7.90 lint . --json
npx hyperframes@0.7.90 check . --strict --samples 9 \
  --at 2,31.2,60.4,89.6,118.8,155.5 --snapshots --json

cd ../globe-map-showcase-portrait
npx hyperframes@0.7.90 lint . --json
npx hyperframes@0.7.90 check . --strict --samples 9 \
  --at 2,31.2,60.4,89.6,118.8,155.5 --snapshots --json
```

The showcase timeline assigns 2.6 seconds to every catalog entry so all 60 can
be reviewed quickly. Those showcase cuts are not recommended editorial
durations; use each definition's `duration` as the starting point in a real
story and leave enough hold time for the label, legend and source to be read.
