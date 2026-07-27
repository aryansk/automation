# Daily News — Vertical Shorts Design Spec

## Format

- Canvas: 1080 × 1920 px
- Aspect ratio: 9:16 vertical
- Frame rate: 30 fps
- Default duration: 18 seconds per story
- Title-safe area: x 72–1008, y 120–1650
- YouTube UI reserve: keep essential copy away from the bottom 270 px and rightmost 90 px

## Concept

A live world desk finds the country or city first, then turns geographic context into an editorial news front page. The globe behaves like a broadcast instrument: always moving, precise at lock-on, and never decorative-only. The Earth is a textured Three.js sphere with satellite imagery, normal/specular relief, clouds, atmosphere, accurate Natural Earth borders and an animated country or city target. A real 3D sun and cratered moon pass behind it.

## Palette

- Ink background: `#08131F`
- Ocean: `#0D2638`
- Land: `#18374A`
- Land outline: `#7895A5`
- Newsprint foreground: `#F3ECD8`
- Muted copy: `#B8C6C9`
- Signal accent: `#F4B860`
- Deep panel: `#0B1C2A`

Use the signal accent for the selected country, live indicators, and one key phrase only. Do not introduce additional accent hues.

## Typography

- Display/headlines: `League Gothic`, weight 400
- Body, labels, metadata, and numbers: `IBM Plex Mono`, weights 400 and 700
- Headlines are condensed, uppercase, tightly tracked, and large enough to read on a phone.
- Metadata uses tabular numerals.

## Shape and Depth

- Corners: clipped editorial geometry; 0–18 px radius only
- Borders: 2–3 px, visible at phone scale
- Depth: layered panels, hard offset shadows, restrained amber glow around the country lock
- Texture: satellite Earth, cloud shell, registration ticks, coordinate readouts, subtle deterministic grain
- Space layer: seek-safe Three.js Earth, sun and moon using only local licensed or procedural materials

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
- No centered web-card stack.
- No tiny UI labels.
- No flags as the primary location cue.
- No live network assets at render time.
- No invented source logos or unverifiable breaking-news claims.
