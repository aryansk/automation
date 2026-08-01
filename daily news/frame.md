# Daily News — Vertical Shorts Design Spec

## Format

- Canvas: 1080 × 1920 px
- Aspect ratio: 9:16 vertical
- Frame rate: 30 fps
- Default duration: 18 seconds per story
- Title-safe area: x 72–1008, y 120–1650
- YouTube UI reserve: keep essential copy away from the bottom 270 px and rightmost 90 px

## Concept

A live world desk finds the country or city first, then turns geographic context into an editorial news front page. The globe behaves like a broadcast instrument: always moving, precise at lock-on, and never decorative-only. The Earth combines a physical topographic relief model with a printed paper atlas: warm parchment terrain, muted sage oceans, raking-light mountain relief, engraved Natural Earth borders, fine graticules, contour bands, restrained cartographic hatching, and a warm brass country lock. The composition sits on a deep green drafting-mat field with measured grid lines, registration marks, and tactile print grain.

## Palette

- Drafting-mat background: `#2D4B3C`
- Drafting-mat shadow: `#20372D`
- Ocean: `#A9B9AA`
- Land: `#E5DFC9`
- Land outline: `#617B6E`
- Engraved border: `#587267`
- Model shadow: `#30493E`
- Newsprint foreground: `#EEE9D8`
- Bright paper: `#F5F0DF`
- Cloud relief: `#F3EDDB`
- Warm key light: `#FFF3D6`
- Ambient light: `#F4EFD8`
- Ambient ground: `#3F5E50`
- Pressed ink: `#17372F`
- Mat copy: `#D8E1D4`
- Paper copy: `#526D64`
- Signal accent: `#D49352`
- Live indicator: `#E37568`
- Deep panel: `#19352D`

Use the signal accent for the selected country, live indicators, and one key phrase only. Do not introduce additional accent hues.

## Typography

- Display/headlines: `League Gothic`, weight 400
- Body, labels, metadata, and numbers: `IBM Plex Mono`, weights 400 and 700
- Headlines are condensed, uppercase, tightly tracked, and large enough to read on a phone.
- Metadata uses tabular numerals.

## Shape and Depth

- Corners: clipped editorial geometry; 0–18 px radius only
- Borders: 2–3 px, visible at phone scale
- Depth: layered paper panels, hard offset shadows, restrained brass glow around the country lock
- Texture: raking-light terrain relief, paper fibers, engraved borders, contour bands, cartographic hatching, drafting grid, registration ticks, coordinate readouts, and deterministic print grain
- Space layer: seek-safe Three.js architectural Earth using only local licensed or procedural materials

## Motion

- Energy: medium-high newsroom urgency
- Primary transition: vertical push, 0.7–0.8 s, `power3.inOut`
- Entrances: directional, staggered, and mechanically precise
- Globe: optional affected-country sweep, quaternion country or city lock, satellite context and eased camera push
- Orbit: sun and moon cross behind the globe on deterministic opposing paths
- Photos: wrapper entrance plus independent slow image push

## Do

- Keep the country or city visible before the headline.
- During a global sweep, use amber for affected economies; after the sweep,
  make the selected country the only filled amber land mass.
- Use a precise crosshair when a city target is resolved.
- Keep photo crops generous and readable.
- Preserve the same structure across stories so the format becomes recognizable.

## Do Not

- No cyan/purple neon gradients.
- No glossy blue-marble satellite treatment.
- No centered web-card stack.
- No tiny UI labels.
- No flags as the primary location cue.
- No live network assets at render time.
- No invented source logos or unverifiable breaking-news claims.
