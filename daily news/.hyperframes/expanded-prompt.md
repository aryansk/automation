# Daily News Vertical Short — Production Breakdown

## Style block

Build an 18-second, 1080 × 1920 YouTube Short using the exact visual system in `frame.md`: ink `#08131F`, ocean `#0D2638`, land `#18374A`, outline `#7895A5`, newsprint `#F3ECD8`, muted copy `#B8C6C9`, signal amber `#F4B860`, and panel `#0B1C2A`. Use League Gothic 400 for display copy and IBM Plex Mono 400/700 for every other voice. The mood is an international wire desk crossed with a cartographic broadcast instrument. When the optional affected-country fields are populated, use the opening section for the global sweep before the location lock.

## Rhythm

`scan-BUILD-LOCK-PUSH-HOLD-source`

## Global rules

- One seek-safe globe canvas persists for the full composition.
- A separate local Three.js canvas carries a real 3D sun and cratered moon on opposing seek-safe orbital paths behind the globe.
- All countries are drawn from local Natural Earth-derived data.
- The selected country is resolved from `countryCode`; an optional `cityName` is resolved from the bundled GeoNames major-city index and receives the exact lock-on crosshair.
- Every required image is local. The daily story is changed through HyperFrames variables.
- The visual hierarchy stays consistent: geography first, headline second, source last.
- When `affectedCountryCodes` is populated, the globe completes a fast global
  sweep before locking on the reporting city. The primary vertical push lands
  at 10.2 seconds for sweep stories.
- Keep essential copy within the vertical Shorts safe zone.

## Beat 1 — Location lock / 0.0–6.55 s normally; 0.0–10.9 s with global sweep

### Concept

The viewer drops into a live global newsroom already in motion. Normally the
globe moves directly to the chosen reporting city or country. For a verified
multi-country story only, it first spins twice and illuminates every affected
country or mapped member state, then settles on the reporting location.

### Mood direction

International wire service, cartographic plotting table, quiet urgency rather than sci-fi spectacle.

### Depth layers

- BG: ink field, deterministic pin-light texture, low amber radial bloom, passing 3D sun and moon
- MG: ocean sphere, graticule, all-country land geometry, selected-country fill
- FG: world-desk masthead, edition metadata, scan status, country name, ISO code, coordinate rail, reticle, registration ticks

### Animation choreography

- Canvas FADES UP while the globe ROTATES and EASES into the target.
- Masthead SLIDES down and rule DRAWS across.
- Scan label TYPES ON visually through staggered character/opacity timing.
- Country name RISES with a condensed impact.
- ISO badge SNAPS into place.
- Reticle ASSEMBLES and PULSES at lock.
- Coordinate values STEP toward the final location.

### Transition out

Vertical push, 0.75 s, `power3.inOut`: the scan scene moves up as the story front page rises from below. The globe simultaneously scales toward the selected country or city.

## Beat 2 — Story front page / 5.8–18.0 s normally; 10.2–18.0 s with global sweep

### Concept

The locked geography becomes context while the news itself takes over. Two photos arrive with editorial depth, followed by a large phone-readable headline, a concise summary, and source/date metadata.

### Mood direction

Premium Sunday front page compressed into a fast vertical broadcast package.

### Depth layers

- BG: enlarged locked globe, graticule, amber target bloom
- MG: primary photo plate, secondary inset photo, deep ink copy panel
- FG: category kicker, country tag, story number rail, headline, summary, source line, date, thin registration rules

### Animation choreography

- Primary photo PUSHES upward in its frame while the image SLOWLY SCALES.
- Secondary photo SLOTS in from the right with a slight perspective-like offset.
- Kicker CUTS in from the left.
- Headline BUILDS upward in one strong block.
- Summary FADES and SLIDES from a different direction.
- Source and date LOCK into the bottom metadata rail.
- Amber rule FILLS across the reading column.
- Final ink wash CLOSES the piece without adding a new scene.

### Transition out

Final ink wash, 0.45 s, `power2.in`, permitted only at the composition end.

## Recurring motifs

- Amber country fill and location pulse
- Thin cartographic rules and registration ticks
- IBM Plex Mono coordinates and issue metadata
- Large condensed League Gothic headlines
- One strong photographic plate plus one offset corroborating image

## Negative prompt

Avoid web-dashboard cards, generic blue-purple gradients, centered layouts, flag-led geography, tiny copy, stock tickers unrelated to the story, remote image URLs, live APIs, non-deterministic canvas motion, and decorative claims such as “breaking” unless the provided story copy explicitly says so.
