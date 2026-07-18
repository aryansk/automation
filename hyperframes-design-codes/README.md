# HyperFrames Design Codes

Scraped from **https://www.hyperframes.dev** (Design → "Browse premade frames") on **2026-06-20**.

These are the 12 official premade "frame.md" design systems used by HyperFrames. Each one is a
complete, reusable design language for video frames (1920×1080 primary; 9:16 + 1:1 documented).
Drop the `frame.md` into a HyperFrames composition to reuse the aesthetic.

> **Two collections here:**
> - **This folder (`<slug>/frame.md`)** — the 12 premade *design systems* (abstract aesthetics: color/type/layout rules).
> - **[`examples/`](examples/)** — the 15 full *example video projects* from the Community Playground → Examples tab
>   (complete runnable compositions: `index.html` + `compositions/*.html`). See [examples/README.md](examples/README.md).

## What's in each folder

| File | Purpose |
|------|---------|
| `frame.md` | **The design code.** Full spec — color tokens, typography ramp, layout/composition rules, frame scale. This is the reusable artifact. |
| `manifest.json` | Metadata/labels — slug, name, tagline, color scheme, density, font pairing, supported tones, color tokens. |
| `frame-showcase.html` | Self-contained rendered preview of the design (open in a browser to see it). |

Source asset URLs follow the pattern:
`https://www.hyperframes.dev/design-templates/<slug>/{frame.md,manifest.json,frame-showcase.html}`

---

## Catalog

| # | Name | Slug | Scheme · Density | Headline / Body fonts | Tones | Vibe |
|---|------|------|------------------|------------------------|-------|------|
| 1 | **Biennale Yellow** | `biennale-yellow` | light · medium | Instrument Serif / Archivo | editorial, warm | Warm parchment + solar-yellow bloom, indigo ink, 1px hairline rules |
| 2 | **BlockFrame** | `blockframe` | light · high | Inter / Space Grotesk | bold, playful | Maximalist neobrutalist — thick black borders, hard offset shadows, candy accents |
| 3 | **Blue Professional** | `blue-professional` | light · medium | Space Grotesk / Inter | editorial, technical | Corporate parchment + cobalt primary |
| 4 | **Bold Poster** | `bold-poster` | light · high | Shrikhand / Libre Baskerville | bold, editorial | Tilted Shrikhand display + red accent on cream — magazine-cover energy |
| 5 | **Broadside** | `broadside` | light · high | Barlow / IBM Plex Mono | bold, editorial, technical | Industrial newsprint poster — raw cream on ink, fire-orange register |
| 6 | **Capsule** | `capsule` | light · medium | Bodoni Moda / Space Grotesk | playful, editorial | Pill-shaped editorial — cream paper, candy palette, Bodoni serif headlines |
| 7 | **Cartesian** | `cartesian` | light · low | Playfair Display / Inter | editorial | Minimal sparse layout — warm parchment, ink display, taupe accents, hairlines |
| 8 | **Cobalt Grid** | `cobalt-grid` | light · medium | Newsreader / Hanken Grotesk | editorial, technical | Editorial parchment + cobalt grid system |
| 9 | **Coral** | `coral` | light · medium | Bebas Neue / Inter | bold, editorial | Bebas Neue uppercase headlines + coral on cream |
| 10 | **Creative Mode** | `creative-mode` | light · high | Archivo Black / Space Grotesk | bold, playful | Cream + saturated candy accents, JetBrains Mono data |
| 11 | **Daisy Days** | `daisy-days` | light · medium | Fredoka / Quicksand | playful, warm | Sunny-garden pastels, 3px charcoal outlines, hard offset shadows |
| 12 | **Editorial Forest** | `editorial-forest` | light · medium | Source Serif 4 / JetBrains Mono | editorial | Green/pink/cream editorial triad, hairline rules |

All 12 ship a `light` color scheme and consume the `primary`, `secondary`, `tertiary`, `accent` token slots.

---

## Quick picker by use case

- **Clean / corporate:** Blue Professional, Cobalt Grid, Cartesian
- **Editorial / magazine:** Biennale Yellow, Bold Poster, Capsule, Editorial Forest
- **Loud / bold / poster:** BlockFrame, Broadside, Coral, Creative Mode
- **Playful / warm / friendly:** Daisy Days, Capsule, BlockFrame
- **Minimal / sparse:** Cartesian
- **Data-heavy (mono ramp):** Broadside, Creative Mode, Editorial Forest, Biennale Yellow

> Note: "Loud Kids Club" (the Y2K sticker-poster aesthetic used for news shorts) is a separate
> in-house style and is **not** part of this scraped set — closest premade matches are BlockFrame
> / Creative Mode / Daisy Days.
