# Hygen Daily News — reusable YouTube Shorts format

This project is an 18-second-compatible story template and a three-story
vertical 9:16 HyperFrames daily-news tour. Each final Short contains exactly
three distinct current stories, locks onto either a country or a major city,
then reveals two local photos, a headline, summary, source and edition
metadata. The Earth is a textured,
satellite-style Three.js sphere with atmosphere, clouds, surface relief,
accurate Natural Earth borders and an animated country or city target. A real
3D sun and cratered moon travel behind it on deterministic orbital paths.

The renderer keeps the historical Three.js globe (`createGlobeTour`) as the
visible surface everywhere. The shared 60-preset globe-map library contributes
deterministic transparent annotations above it. Agents can author an
`animationPlan` before writing the narration so each script section names its
preset and start time. Open the
library showcases and read [`docs/ANIMATION_LIBRARY.md`](docs/ANIMATION_LIBRARY.md)
for the reusable API.

Feature renders expose the same catalog through `window.__featureGlobeMapOptions`
and four optional HyperFrames variables: `globeAnimationId`,
`globeAnimationPlan`, `globeMapData` and `globeMapSource`. Use
[`stories/templates/feature-globe-choice.example.json`](stories/templates/feature-globe-choice.example.json)
as the starting shape. The selected annotations are projected from the same
historical globe; production still requires verified payloads and attribution.

For a genuinely multi-country story, copy
`stories/templates/global-affected-sweep.example.json`. Populating
`affectedCountryCodes` and `affectedCount` enables the optional global sweep and
uses the opening section for the spin before the location lock. Do not add those
fields to a single-location story.

## Preview

```bash
npm install
npm run build:data
npm run dev
```

Open the Studio URL printed by the preview command. The default story is the United States demo.

## Make a daily story

Future agents must read [`DAILY_NEWS_AGENT_GUIDE.md`](DAILY_NEWS_AGENT_GUIDE.md)
before researching, downloading images, writing copy, generating narration, or
rendering. Use `stories/story-history.json` to prevent repeats. Source news
images are allowed under the user-authorized workflow; generated art-style
images are not. A last-resort generated image must be realistic and vertical.

1. Duplicate `stories/us-space.json`.
2. Change `countryCode` to any ISO alpha-2 code such as `US`, `IN`, `JP`, `GB` or `BR`.
3. Set `cityName` to a major city such as `Delhi`, `New York City`, `D.C.` or `Berlin`. Use an empty string to target the whole country.
4. Replace the copy fields.
5. Put two vertical or square images in `assets/` and update `imageOne` and `imageTwo`.
6. Create exactly three distinct stories per tone, rank them 1–3, and run the
   no-repeat gate.
7. Validate the stories and generate their TTS narration.
8. Render the continuous tour:

```bash
npm run validate:bundle -- --tone good --stories stories/good-01.json,stories/good-02.json,stories/good-03.json
npm run setup:tts
npm run build:globe -- --tone good --opener-title "Good morning, good news" \
  --stories stories/good-01.json,stories/good-02.json,stories/good-03.json \
  --output renders/good-YYYY-MM-DD.mp4
```

For the standalone distribution test, render one story per Short without
changing the three-story edition contract:

```bash
npm run build:standalone -- \
  --stories stories/good-01.json,stories/good-02.json,stories/bad-01.json \
  --output-dir renders/standalone-YYYY-MM-DD \
  --skip-narrate
```

The command validates every story, reuses or generates its narration, keeps the
tone-specific opener (`Good morning, good news` or `Good morning, bad news`),
checks the 1080×1920 result, and writes `standalone-manifest.json`. The
manifest is the handoff for a later upload step; this command does not publish
anything. Portrait outputs are intended to be mirrored to both YouTube and
Instagram.

The globe uses the country code to find the correct Natural Earth geometry. When `cityName` is present, the resolver searches the bundled city index within that country and uses the exact city coordinates. No map editing is needed.

For planned visual beats, copy
`stories/templates/animation-plan.example.json` into the story and replace
each `scriptSection`, `start`, `animationId`, `mapSource` and `mapData` with
the choices that match the narration. Browse the catalog with
`npm run animations:list`. If a plan is omitted, the production renderer still
creates an automatic library beat; it never silently switches to a legacy
non-library production path.

For one optional evidence-led automatic beat, use `mapEvidence` with an exact
catalog ID, a verified source and a fully populated payload. Explicit
`animationPlan`, `mapAnimation` and `mapData` choices take precedence; an
invalid evidence envelope fails closed instead of triggering keyword guessing.

If WebGL or a texture fails, the same globe API automatically switches to a
shaded canvas renderer that keeps local satellite imagery and accurate
orthographic borders. No story authoring changes are required.

## Story fields

| Field | Purpose |
| --- | --- |
| `countryCode` | ISO alpha-2 code used to select and highlight the country |
| `countryName` | Viewer-facing country name |
| `cityName` | Optional city target; blank falls back to the country center |
| `coordinates` | Optional `[longitude, latitude]` JSON override |
| `mentionedCountryCodes` | Optional ISO codes for countries named in the story; rendered as secondary globe highlights |
| `affectedCountryCodes` | Optional space-separated ISO codes highlighted during the global sweep |
| `affectedCount` | Viewer-facing affected-economy count |
| `sweepLabel` | Short statistic shown during the global sweep |
| `region` | Region label shown during the globe scan |
| `kicker` | Short category line |
| `headline` | Main story headline; maximum 14 words and 85 characters |
| `summary` | One supporting sentence; maximum 30 words and 180 characters |
| `script` | Spoken TTS narration; maximum 42 words |
| `source` | Your source or desk name |
| `edition` | Date or edition label |
| `imageOne` | Main local photo path |
| `imageTwo` | Secondary local photo path |
| `narrationAudio` | Generated local TTS audio path |
| `storyNumber` | Two-digit story index |
| `storyType` | `auto`, `geographic`, `breaking`, `statistics`, `comparison`, `quote`, `financial`, `timeline`, `weather`, `product` or `editorial` |
| `mapAnimation` | Optional globe/map preset override: a library ID (e.g. `city-lock`, `great-circle-route`, `storm-track`), `none` or `disabled` to turn maps off, or omitted for conservative automatic selection |
| `animationId` | Feature-chapter convenience alias for `mapAnimation` |
| `mapData` | Optional fully verified custom payload for the selected preset (never illustrative sample data) |
| `mapSource` | Optional attribution for the map data; falls back to `source` |
| `mapEvidence` | Optional `{ animationId, source, data }` envelope for conservative automatic selection; exact IDs and production validation are required |
| `visualType` | Legacy alias for `mapAnimation` (globe/map preset override); see `mapAnimation` |
| `animationPlan` | Preferred script-to-library plan; segments use `scriptSection`, relative `start`, `animationId`, optional `scriptCue`, `mapSource` and verified `mapData` |
| `urgency` | `standard` or `breaking` |
| `statValue`, `statLabel`, `statDelta`, `statPeriod` | Numeric story metadata |
| `comparisonLeft*`, `comparisonRight*` | Paired comparison labels and values |
| `quoteText`, `quoteAttribution`, `quoteRole` | Quote treatment metadata |
| `marketSymbol`, `marketValue`, `marketChange`, `marketPeriod` | Financial direction, period and value |

## Commands

```bash
npm run check
npm run snapshot
npm test
npm run validate:examples
npm run validate:story -- --story stories/us-space.json
npm run narrate -- --story stories/us-space.json --provider kokoro
npm run render -- --variables-file stories/us-space.json
```

The two included demo images are local project assets so validation and rendering never depend on an external image URL.

Five example inputs live in `stories/examples/` and demonstrate geographic,
breaking, statistics-heavy, comparison and quote-led stories. Existing story
JSON without the new optional fields remains backward compatible.

## City coverage and attribution

The bundled index contains 16,808 cities with populations of at least 50,000 plus national and major administrative capitals. It is generated from the GeoNames `cities15000` export and runs entirely offline during preview and rendering.

City data: [GeoNames](https://www.geonames.org/), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
