# White-Cutout Long-Form Video — Template

A reusable Remotion template for **landscape (1920×1080) long-form video essays** in the
QuietArgumentError aesthetic: pure-white canvas, vivid red (#ED1C24) + black, red asterisk motif,
hand-drawn marker accents, scrapbook collage elements, **framed full photos + transparent cutouts**,
straight kinetic captions (red on the main word only), a calming synth music bed, and
**research-citation cards with highlighted headlines + institution badges**.

First built as `remotion-startagain` (the "why it's so hard to start again" essay). To make a new
video, clone the folder and walk the steps below — most are scripted.

## Clone

```bash
cp -R remotion-startagain remotion-<new-topic>
cd remotion-<new-topic>
# reuse deps without reinstalling:
rm -rf node_modules && ln -s ../remotion-startagain/node_modules node_modules
rm -rf out/* audio/* public/audio/* public/img/* public/photos/* public/logos/* pool-raw pin-raw photo-raw 2>/dev/null
```

## 1. Script  → `script.txt`
Write the narration. Spell numbers out for clean TTS ("twenty-three minutes", "forty percent").
**Weave any research you'll cite into the spoken lines** so the citation card can sync to it.

## 2. Narration (Kokoro TTS) → `audio/narration.wav`
```bash
/tmp/kokoro-venv/bin/python -c "from kokoro_onnx import Kokoro; import soundfile as sf, numpy as np; \
k=Kokoro('/tmp/kokoro-v1.0.onnx','/tmp/voices-v1.0.bin'); \
s,sr=k.create(open('script.txt').read(), voice='af_heart', speed=0.96, lang='en-us'); \
sf.write('audio/narration.wav', np.concatenate([np.zeros(int(sr*0.3),s.dtype),s]), sr)"
cp audio/narration.wav public/audio/final_audio.wav
```
`af_heart` is the most natural voice; swap for `bm_george`/`am_michael` (male) if preferred.

## 3. Word timing → `audio/transcript.json`
```bash
npx hyperframes transcribe audio/narration.wav   # writes audio/transcript.json (run with </dev/null in loops)
```

## 4. Music bed → `public/audio/bgm.wav`
Synth pad must be **≥ narration length**. Edit `total=<sec>` and run the numpy synth (see the
`bgm.wav` recipe in memory `remotion-white-cutout-longform`). Mixed in `Video.tsx` at `volume={0.13}`.

## 5. Images (the slow, creative step)
Pull from Pinterest via Apify actor `automation-lab/pinterest-scraper`
(`{searchQueries:[...], maxPins:6}`), download the `i.pinimg.com/originals/...` URLs, contact-sheet
them, and curate. Two kinds:
- **Cutouts** (objects) → `npx hyperframes remove-background IN -o public/img/<name>.png` then trim
  to the alpha bbox. **Background removal eats white/low-contrast subjects** — pick colored/high-
  contrast versions. Run with `< /dev/null` inside `while read` loops (hyperframes eats stdin).
- **Full photos** (people / scenes) → save straight to `public/photos/<name>.jpg` (no bg removal);
  `PhotoFrame` shows them as taped prints.
- **Collage accents** → `public/collage/*.jpg` (black/red-on-white shapes; rendered with
  `mixBlendMode:multiply`, no bg removal needed).

## 6. Research badges (if citing studies) → `public/logos/<org>.png`
Fetch official seals from Wikimedia Commons; pass `logo` on each article in `Video.tsx`.
See the **`research-citation-cards` skill** — it has the full badge-fetch + highlight + timing recipe.

## 7. Build the timeline → `src/timeline.json`
```bash
python3 scripts/generate-timeline.py
```
**Edit the `PHOTO_GROUPS` / `CUT_GROUPS` keyword maps and the `articles` detectors at the top of the
script to match your new script's vocabulary** — they are topic-specific. The script prints a sanity
line (scene count, photo/cutout split, article timestamps); verify the article times land on the
right words.

## 8. Article cards → `src/Video.tsx`
Edit the `ARTICLES` array: `{ s: AT.<key>+0.3, dur, label, source, parts:[{t},{t,hl:true},{t}], logo }`.
Use **real** studies only.

## 9. Preview & render
```bash
npx remotion still src/index.ts StartAgain /tmp/check.png --frame=900     # spot-check before rendering
npx remotion render src/index.ts StartAgain out/final.mp4 --concurrency=4
```
A file appears while still encoding — wait on the **process** exiting (or ffprobe "moov atom"), not
on file presence.

## 10. Upload (optional)
`python3 <insta-to-youtube skill>/references/youtube-upload.py --file out/final.mp4 --title "…"
--privacy public --category howto` (token at `~/.insta_to_yt_token.json`).

---

## Architecture
```
src/
  Root.tsx          1920×1080 composition, fonts (Anton / Playfair / Inter)
  Video.tsx         maps timeline.scenes -> <Scene>, renders <ArticleOverlay>, mixes voice + bgm
  timeline.json     generated; { fps, total, scenes[], articles{} }
  theme.ts          palette (paper #fff, ink #111, accent #ED1C24) + fonts
  components/
    Scene.tsx       per-scene layout: collage accents (back) · photo|cutout (mid) · captions (front)
    PhotoFrame.tsx  full photo as a taped white-border print
    Cutout.tsx      transparent cutout + Marker + shake/float
    Marker.tsx      hand-drawn red annotation that draws itself on (circle/box/underline/arrow)
    CollageAccent.tsx  scrapbook element via mixBlendMode:multiply
    Asterisk.tsx    the red ✱ motif
    Brand.tsx       persistent channel mark
    ArticleCard.tsx research citation card (headline + highlighter + badge)   ← also a standalone skill
scripts/generate-timeline.py   transcript + assets -> timeline.json
```

## Knobs
- Pacing: `SCENE_LEN` in `generate-timeline.py` (4.2s default).
- Photo/cutout ratio: the `PHOTO_GROUPS` vs `CUT_GROUPS` coverage.
- Caption emphasis: red is applied to KEY-set words + the longest content word per line.
- Palette/fonts: `theme.ts`. Highlighter colour: `MARK` in `ArticleCard.tsx`.
