# Hygen Daily News — reusable YouTube Shorts format

This project is an 18-second vertical 9:16 HyperFrames news template. It locks
onto either a country or a major city, then reveals two local photos, a
headline, summary, source and edition metadata. The Earth is a textured,
satellite-style Three.js sphere with atmosphere, clouds, surface relief,
accurate Natural Earth borders and an animated country or city target. A real
3D sun and cratered moon travel behind it on deterministic orbital paths.

The renderer selects a supporting visual from semantic story metadata. The
shared animation registry includes geography, breaking, typography, identity,
quotes, statistics, charts, timelines, media, market, weather, transition and
outro components. Open `gallery.html` to preview all 27 components and read
[`docs/ANIMATION_LIBRARY.md`](docs/ANIMATION_LIBRARY.md) for the reusable API.

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
rendering.

1. Duplicate `stories/us-space.json`.
2. Change `countryCode` to any ISO alpha-2 code such as `US`, `IN`, `JP`, `GB` or `BR`.
3. Set `cityName` to a major city such as `Delhi`, `New York City`, `D.C.` or `Berlin`. Use an empty string to target the whole country.
4. Replace the copy fields.
5. Put two vertical or square images in `assets/` and update `imageOne` and `imageTwo`.
6. Validate the story and generate its TTS narration.
7. Render:

```bash
npm run validate:story -- --story stories/your-story.json
npm run setup:tts
npm run narrate -- --story stories/your-story.json --provider kokoro --voice af_heart
npm run render -- --variables-file stories/your-story.json --output renders/your-story.mp4
```

The globe uses the country code to find the correct Natural Earth geometry. When `cityName` is present, the resolver searches the bundled city index within that country and uses the exact city coordinates. No map editing is needed.

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
| `visualType` | Optional animation-registry override |
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
