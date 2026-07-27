# Top 3 — 25 Jul 2026

Three stories rendered through your existing `index.html`, unchanged,
then concatenated. 18s per segment, ~54s total.

## Run it

```bash
cd "daily news"

npm run build:top3 -- \
  --stories stories/top3-2026-07-25-01-iran-oil.json,stories/top3-2026-07-25-02-icc-khan.json,stories/top3-2026-07-25-03-us-tariffs.json \
  --output renders/top3-2026-07-25.mp4 \
  --skip-narrate
```

Drop `--skip-narrate` to regenerate the voice tracks. `--resume` skips
segments that already exist, so a failed run costs one segment, not all
three. `--quality high` and `--fps 30` are the defaults worth keeping.

## Status

Ready except the render itself. Done and verified:

- Three stories researched and cross-checked against two or more outlets
- Story JSONs written to `index.html`'s variable schema; all three pass
  `npm run validate:story`
- Narration generated: 13.0s, 15.3s, 14.3s — all inside the 18s segment
- `renders/globe-highlight-proof-8s.mp4` — an 8s clip of story 1 through
  the camera lock, confirming the globe, the filled country highlight,
  the renamed heading, the story bindings and the audio

**The full render has to happen on your Mac.** In this Linux sandbox
Chrome falls back to software WebGL and the globe renders at ~2.5 fps, so
one 18s segment takes about three and a half minutes of continuous
rendering — longer than the 45-second cap on any single command I can
run here. On your machine the GPU path makes this a couple of minutes.

## Template changes

**Country highlight.** `assets/animations/globe.js` only outlined the
story's country, which is a hairline at that camera distance. It now also
fills it: `countryFillTexture()` paints the country onto an
equirectangular canvas and maps it to a sphere just above the earth, so
the shape lights up as the camera locks on. The projection matches
SphereGeometry's UV layout, and d3 handles the path so countries crossing
the antimeridian clip correctly. `highlightStyle: "spotlight"` gives a
softer fill than the default `outline-pulse`.

**Heading.** "Hygen world desk" and "Hygen daily dispatch" are both now
"IndieHouse.io News", and the outro card reads "IndieHouse.io / News".
Also updated in `assets/animations/components.js` and `gallery.html`.
One internal identifier, `window.HygenNewsAnimations` in
`assets/animations/index.js`, is left alone — it is a code symbol rather
than anything on screen, so renaming it risks breaking references for no
visible gain. Say the word if you want it changed too.

## One bug worth knowing about

`assets/news-renderer.js` sets the narration source at runtime:

```js
document.getElementById("narration-track").src =
  variables.narrationAudio || "assets/narration/silence.wav";
```

The render pipeline extracts audio from the static composition *before*
the page executes, so that assignment is never seen and the output comes
out silent — it uses the `src="assets/narration/silence.wav"` baked into
the markup. I hit this on every render until I traced it.

`build-top3.mjs` works around it by writing the correct `src` into a
temporary copy of the composition (`index.__render.html`, deleted after)
rather than touching `index.html`. If you'd rather fix it at the source,
the durable version is to make the audio path a composition variable that
lands in the markup, and drop the runtime assignment.

## Stories

| # | Story | Location | Sources |
| --- | --- | --- | --- |
| 01 | Oil tops $100 as strikes on Iran enter a fourteenth night | Tehran, IR | Reuters, NYT, CENTCOM |
| 02 | World court removes its chief prosecutor for the first time | The Hague, NL | Reuters, CNN, UN News |
| 03 | New tariffs now reach almost all of US trade | Washington, US | WSJ, USTR, Reuters |

Stories 01 and 02 still point at `sample-primary.jpg` /
`sample-secondary.jpg` — only the tariff story had real photography in
`assets/`. Worth swapping before publishing.
