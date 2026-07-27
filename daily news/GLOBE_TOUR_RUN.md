# IndieHouse.io News — globe tour

One continuous 48s film. The globe never leaves the frame: it turns on
its axis from country to country, each one lights up as its story is
read, and a small card carries the headline. No photography, no summary,
no statistics.

Built as `index-globe.html`. Your `index.html` is untouched.

## Run it

```bash
cd "daily news"

npm run build:globe -- \
  --stories stories/top3-2026-07-25-03-us-tariffs.json,stories/top3-2026-07-25-01-iran-oil.json,stories/top3-2026-07-25-02-icc-khan.json \
  --output renders/globe-tour-2026-07-25.mp4 \
  --skip-narrate
```

Story order is the order of `--stories`. Drop `--skip-narrate` to
regenerate the voice tracks.

## How the timing works

The build script narrates the cold open and each story as separate
clips, measures every one with ffprobe, and lays them on a single
timeline — so the globe finishes arriving 0.35s before each line starts,
rather than being hand-tuned to a guess. The clips are then delayed onto
one continuous track so the pauses are real silence.

Current cut:

| | | |
| --- | --- | --- |
| Cold open | speaks 0.45s, clears 2.6s | "Good morning, bad news." |
| Washington | turns 0.9s, arrives 2.9s, speaks 3.2s | tariffs |
| Tehran | turns 15.4s, arrives 17.6s, speaks 18.0s | oil / strikes |
| The Hague | turns 28.9s, arrives 31.1s, speaks 31.5s | world court |
| Total | 48.1s | |

Tuning knobs: `--travel` (seconds spent rotating, default 2.2), `--lead`
(settle time before the line, 0.35), `--gap` (silence between stories,
0.45), `--opener-hold` (beat after the cold open, 1.35), `--opener` to
change the line.

## What changed in the globe

`assets/animations/globe-tour.js` is new and sits alongside
`createNewsGlobe`, which is still what `index.html` uses.

The camera never moves. It sits 15.5 units back instead of 10.6, which
leaves the globe about 86% of the frame width — your original
composition sat closer and deliberately ran off both edges. The planet
rotates instead, bringing each country round to face the viewer:

```
rotation.y = PI/2 - (longitude + 180) * DEG
rotation.x = latitude * DEG
```

The y term is unwrapped against the previous stop so the globe always
takes the short way round rather than unwinding through several turns,
and because only these two axes move, the pole stays up — it turns
rather than tumbles. The globe lifts slightly (1.18 → 1.54 units) as
each card comes in.

Country highlighting is the fill added earlier, one layer per stop,
hidden until it has opacity so the renderer isn't blending three full
spheres every frame.

The orbiting moon and planet from `space-orbit.js` are gone — at this
globe size they read as stray blobs in the corners. The backdrop is now
a static star field drawn once, which also costs nothing per frame.

## Rendering

`renders/globe-tour-preview-21s.mp4` covers the cold open, the America
highlight and the turn to Iran, so you can check the motion.

The full 48s render has to run on your Mac. Under software WebGL here
the globe manages ~2.5 fps, so the whole film is around ten minutes of
continuous rendering against a 45-second cap per command. Your GPU path
makes it a few minutes.

## Still open

The three headlines are the ones already written for these stories. Now
that the card carries the headline alone with nothing under it, they
could stand to be shorter — "New tariffs now reach almost all of US
trade" runs to two lines and the Iran one to three. Say the word and
I'll tighten them to a single line each.
