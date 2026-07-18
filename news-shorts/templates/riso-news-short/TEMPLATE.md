# Riso News Short — Template

Reusable HyperFrames template for finance/news explainer Shorts in the **riso/paper-collage** style
(bright "Riso Pop" palette, halftone cutouts, bold Anton/Archivo type, karaoke captions, beat-cut motion,
animated number-graphics, synthesized cinematic BGM). Reference build: `../buffett-cash` (Warren Buffett, $381B cash).

1080×1920, hard-cut scene stack, ~38s. Lint-clean (0 errors). Preview audio is silent by design — **audio only plays in the rendered MP4.**

## How to make a new video from this

1. **Copy the folder**: `cp -R templates/riso-news-short news-shorts/<new-topic>`
2. **Write the script** → `script.txt`. Spell out numbers for clean TTS ("two hundred thirty percent").
3. **Narration** (Kokoro TTS):
   ```
   /tmp/kokoro-venv/bin/python -c "from kokoro_onnx import Kokoro; import soundfile as sf, numpy as np; \
   k=Kokoro('/tmp/kokoro-v1.0.onnx','/tmp/voices-v1.0.bin'); \
   s,sr=k.create(open('script.txt').read(), voice='am_michael', speed=1.05, lang='en-us'); \
   sf.write('narration.wav', np.concatenate([np.zeros(int(sr*0.2),s.dtype),s]), sr)"
   ```
4. **Caption timing**: `npx hyperframes transcribe narration.wav` → writes `transcript.json` (CWD). Then inject:
   `python3 -c "import json;w=json.load(open('transcript.json'));print(json.dumps([{'text':x['text'],'start':round(x['start'],2),'end':round(x['end'],2)} for x in w],separators=(',',':')))"`
   → paste into `window.CAPTION_WORDS = [...]` in index.html (replace the array).
5. **Images** (relevant cutouts): Pexels/Wikimedia → `npx hyperframes remove-background IN.jpg -o capture/assets/images/OUT.png` (run sequentially). Buildings mask poorly — prefer people/objects/flags. Wikimedia flags: use the `/thumb/.../960px-*.png` URL, NOT the `.svg` page.
6. **Rewrite the 12 scenes** in index.html — swap text, numbers, images, and per-scene background colors. Update the `S=[...]` scene-timing array + the `data-duration` on `#root`, `#vo`, `#bgm` to your narration length.
7. **BGM**: reuse `bgm.wav` (cinematic tension bed) or regenerate (see memory `news-shorts-techniques`). Mixed at `data-volume="0.5"` on track 11; VO on track 10.
8. **Validate + render**: `npx hyperframes lint` (only act on `✗ error` lines) → `npx hyperframes render -o out.mp4`.

## Palette (CSS vars in `#root`)
red `#FF4332` · paper `#FBF4DE` · green `#2FBE5C` · electric-navy `#16264F` · blue `#2F6BFF` · crimson `#A81B2E` · yellow `#FFC627` · ink `#15140F`

## Scene treatments to mix & match
riso radiating rings + cutout · cream paper compare · solid bold-type card · green graph-paper · electric-navy chalkboard · split-color · big "WHY?" · gold frame on damask · number gauge/chart · final question card.

## Number graphics (the key stat as a visual, not flat text)
- **Rising line chart** (% gain): SVG `<polyline>` with `stroke-dasharray/offset` draw-on + arrowhead. See scene 5.
- **Overshoot gauge** (ratio > 100%): track + dashed "100%" baseline + red `<rect>` fill animated via `attr:{width}` past the marker. See scene 9.

## Motion rules (keep it from "bouncing")
- Cut-in: `scale 1.09→1.0`, `expo.out`, 0.28s — punchy, NO overshoot.
- Drift: `scale 1.0→1.045`, `sine.inOut`, rest of scene.
- **Avoid** `back.out`/`bounce.out`/`elastic` on the `.zoom` frame wrapper and on dip-then-overshoot "jolts" — that's what reads as the video bouncing. Overshoot eases are OK only on small element entrances.
