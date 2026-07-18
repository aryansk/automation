# HyperFrames Community Playground — Examples

Scraped from **https://www.hyperframes.dev** → Community Playground → **Examples** tab, on **2026-06-20**.
These are the 15 full example video projects (not the abstract `frame.md` design systems in the
parent folder — these are complete, runnable compositions).

## Structure of a HyperFrames project

Every project is the same shape:

```
<project>/
  index.html              # root composition — declares tracks, timing, audio, and
                          # references sub-compositions via data-composition-src="compositions/*.html"
  compositions/*.html     # the per-beat/scene sub-compositions (the bulk of the design code)
  assets/ …               # media (mp4/mp3/wav/fonts/images) — present only for the zip-sourced ones
  _label.json             # metadata (name, description, dimensions, duration, source)
```

The **design code** = `index.html` + `compositions/*.html`. They use GSAP (via jsDelivr CDN) and
`window.__timelines` for animation. To reuse: open `index.html` in HyperFrames, or copy a
`compositions/*.html` beat into your own project.

`_templates-metadata.json` = the raw `/api/templates` response (all 15, with original showcase
video + zip URLs).

## The 15 examples

| Name | Folder | Dur | Dims | Source | Notes |
|------|--------|-----|------|--------|-------|
| Notion Showcase | `notion-showcase` | 15s | 1920×1080 | zip (full + assets) | Clean product walkthrough inspired by Notion |
| Dribbble Showcase | `dribbble-showcase` | 20s | 1920×1080 | zip (full + assets) | Playful design showcase, Dribbble-inspired motion |
| Stripe Showcase | `stripe-showcase` | 25s | 1920×1080 | zip (full + assets) | Polished fintech product video (5 beats) |
| Raycast Showcase | `raycast-showcase` | 15s | 1920×1080 | zip (full + assets) | Developer-productivity tool showcase |
| Fitness App Showcase | `fitness-app-showcase` | 5.5s | 1920×1080 | zip | Three floating phone screens, 3D |
| Spotify Bento | `spotify-bento` | 26.5s | 1920×1080 | zip (full + assets) | Infinite bento pan album showcase |
| UI 3D Reveal | `ui-3d-reveal` | 13s | 1920×1080 | zip | UI 3D perspective reveal animation |
| hermes-hyperframes | `hermes-hyperframes` | 41s | 1080×1080 | preview API (html only) | 20-beat parade + lower-third captions |
| ycombinator | `ycombinator` | 15s | 1920×1080 | preview API (html only) | Single self-contained composition |
| blue-sweater-intro-video | `blue-sweater-intro-video` | 12s | 1920×1080 | preview API (html only) | Single self-contained composition |
| may-financial-recap-cathedral-light | `may-financial-recap-cathedral-light` | 80s | 1920×1080 | preview API (html only) | Long financial recap, "cathedral light" look |
| agentbook-launch-video | `agentbook-launch-video` | 24s | 1920×1080 | preview API (html only) | Product launch video |
| California News | `california-news` | 16.5s | 1080×1920 | preview API (html only) | Portrait/vertical news short |
| avatar-explainer | `avatar-explainer` | 16s | 1920×1080 | preview API (html only) | JP avatar training overlay, 5 layered comps |
| airbnb-reel | `airbnb-reel` | 31.6s | 1920×1080 | preview API (html only) | 6-beat brand reel, Airbnb Cereal font |

**Source notes**
- *zip* projects are the official HeyGen showcase templates — downloaded complete (HTML + media assets).
- *preview API* projects are community-submitted ("Claimed by …"). Only the HTML composition tree
  (the design code) was captured — their media assets (audio/video) stream from the live preview API
  and were intentionally skipped. The HTML references them by relative path, so re-attach media if rendering.

Original per-item live preview: `https://www.hyperframes.dev/api/projects/<uuid>/preview/` (see `_label.json` / metadata).
