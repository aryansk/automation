# Design specification — Buttered-style positive collage

## Concept angle

Tiny evidence pieces orbit a shared idea: when a small mark lands on paper, it can become a ripple across the whole frame.

## Visual identity

- Mood: curious editorial scrapbook; tactile, found, handmade, lightly strange, optimistic.
- Base paper: `#F2EEE1`.
- Ink: `#24252B`.
- Ocean blue: `#39B8D6`.
- Moss green: `#4C8C45`.
- Coral red: `#D96D58`.
- Butter yellow: `#F2D476`.
- Space black: `#090B0D`.
- Warm photo white: `#FFF9ED`.

## Typography

- `EB Garamond` italic/regular for editorial statements and loose word fragments.
- `IBM Plex Mono` regular/bold for source-like metadata, labels, dates, and tiny annotations.
- `League Gothic` regular only for occasional compressed punch words.

## Composition grammar

- Canvas: 1080×1920, 30 fps, 49.7 seconds.
- A full-bleed world fills every scene; content is never presented as a centered web card.
- Backgrounds use solid fields plus fixed, deterministic texture: paper fibres, halftone dots, grain bands, registration marks, and soft color pools.
- Foreground objects are slightly misregistered, rotated, taped, clipped, or offset; every scene has at least two focal points.
- Text fragments appear word-by-word with slightly different baselines and colors, preserving readability while feeling hand-placed.

## Motion language

- Words `type on`, `snap`, `drift`, and `re-seat`.
- Cutouts `float`, `slide`, `orbit`, `drop`, and `settle`.
- Photos `push in` with a slow Ken Burns move and a small, imperfect rotation.
- Scene handoffs alternate between hard cuts, white flashes, and short blur-through moves.
- Motion remains seek-safe and deterministic: one paused GSAP timeline per composition, local media only, finite loops only.

## Audio identity

- Soft analog music bed under the full piece.
- Paper/key clicks on text beats, short whooshes on cutout entrances, one low impact at the message turn, and a clean chime on the close.
