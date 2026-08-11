# Daily News agent production guide

This is the operating contract for every agent that creates a story with this
template. Read it before changing a story, downloading media, generating
narration, or rendering.

## What to produce

Each daily edition is a single vertical 9:16 YouTube Short containing exactly
three distinct current stories. Produce one constructive edition and one
adverse edition, so each run contains six different story events. The story
card remains an 18-second-compatible unit, while the globe-tour builder joins
the three units into one continuous Short. The sequence is fixed:

1. The historical textured 3D Earth rotates while the 3D sun and moon cross the background.
2. The globe locks onto the country or requested city with an accurate outline and target pulse.
3. Two relevant photographs enter.
4. The shared globe-map library follows the authored script plan: each section selects a stable preset, whose transparent annotations sit over the same historical globe before the category, headline, summary, source, and edition appear.
5. A text-to-speech narration tells the story.

The multi-country sweep is optional. Use it only when the story itself affects
several countries and the affected list is verified. Copy
`stories/templates/global-affected-sweep.example.json`, populate
`affectedCountryCodes`, `affectedCount`, and `sweepLabel`, and the template will
insert the fast global sweep before the target lock. Leave those fields out for
ordinary single-country or single-city stories.

Do not change the composition or animation timing for routine daily stories.
Create three new JSON files per edition in `stories/`, add local media, then
render them with `scripts/build-globe-tour.mjs`. The separate
`scripts/build-one-topic.mjs` path is for optional standalone distribution: it
renders each selected story as its own Short and must not replace the two
three-story daily editions.

### Choose animation beats before narration

Every future Short and long-form story is library-backed. Before generating
voice, choose the globe-map preset for each part of the script in
`animationPlan`. Use `npm run animations:list` to browse the 60 stable IDs and
copy `stories/templates/animation-plan.example.json` for the shape. Segment
`start` values are seconds relative to the story narration for a Short or the
chapter narration for long-form; `scriptSection` and `scriptCue` record why the
visual belongs at that point.

```json
"animationPlan": {
  "version": 1,
  "library": "globe-map-library",
  "policy": "required",
  "segments": [
    { "id": "open", "scriptSection": "opener", "start": 0, "animationId": "world-orbit" },
    { "id": "place", "scriptSection": "verified-location", "start": 2.4, "animationId": "city-lock" },
    { "id": "claim", "scriptSection": "why-it-matters", "start": 6.8, "animationId": "auto" }
  ]
}
```

`auto` uses the verified story fields and source ledger. If the plan is
omitted, the builders materialize one automatic library beat. The production
renderers do not fall back to a non-library globe scene; a story without
claim-bearing geography uses the neutral `world-orbit` library preset.

An optional evidence envelope can request one exact automatic preset:

```json
"mapEvidence": {
  "animationId": "route-disruption",
  "source": "Verified reporting source",
  "data": { "routes": [] }
}
```

Use a complete verified payload in production. Explicit `animationPlan`,
`mapAnimation` and `mapData` choices win; an invalid envelope is rejected and
does not fall through to broad keyword guessing.

For a long-form video, put the plan on the chapter when the visual changes
within that chapter. A chapter plan overrides the story-level plan. Keep
claim-bearing `mapData` and `mapSource` next to the segment that uses them.

The reusable feature compositions expose the same choices directly to the
render host: `globeAnimationId` selects a default preset for unconfigured
chapters, while `globeAnimationPlan`, `globeMapData` and `globeMapSource` let a
render supply an authored beat and its verified payload. The runtime publishes
all 60 choices at `window.__featureGlobeMapOptions`; use
`stories/templates/feature-globe-choice.example.json` for the variables shape.
Chapter plans and chapter-level IDs remain higher priority than a broad
feature default.

### Daily bundle and no-repeat gate

Every story must have a stable `eventId`, a `selection.trendRank` of 1, 2 or 3,
at least two source records, and caption groups. The three records must use the
unique ranks 1, 2 and 3 and must not collide with
`stories/story-history.json` by event ID, normalized headline, or source URL.
Run the structural gate before narration:

```bash
npm run validate:bundle -- \
  --tone good \
  --stories stories/good-01.json,stories/good-02.json,stories/good-03.json
```

`build-globe-tour.mjs` repeats the gate and records the stories in the history
ledger only after a successful render. This prevents a failed render from
consuming a story and prevents a later run from silently repeating one.

Use the optional `storyType` and structured fields when the story benefits from
a statistic, comparison, quote, market card or timeline. The complete field
contract and registry names are documented in
[`docs/ANIMATION_LIBRARY.md`](docs/ANIMATION_LIBRARY.md). Leave `storyType` as
`auto` when the default geographic/editorial inference is sufficient.

## Research and factual writing

Use at least two credible sources when possible. Prefer the original reporting,
official documents, public statements, government releases, company releases,
court filings, or first-party data over summaries and reposts.

Before writing:

- Confirm the event happened and that the date is current.
- Confirm every name, place, title, number, and quotation.
- Distinguish reported facts from analysis, allegations, and projections.
- Do not invent a city because it makes the animation more interesting. Target
  the city only when the report is actually tied to that city.
- Keep the source name honest. Do not label a secondary article as an official
  source.

## Image selection and acquisition

Use two images that add different information:

### Primary image

- Directly shows the event, principal person, location, or object in the story.
- Prefer a portrait or 4:5 image at 1080 px wide or larger.
- Keep the important subject near the center because the template crops with
  `object-fit: cover`.
- Avoid images where critical text, faces, or logos sit against an edge.

### Secondary image

- Adds context rather than repeating the primary image.
- Good choices include a second person, a building, a product, a map detail, a
  crowd, a document, or the consequence of the event.
- Prefer square or portrait media at 800 px wide or larger.

### Rights and provenance

Do not copy the first image returned by search. Image search is discovery, not
permission.

Use, in order of preference:

1. User-provided or commissioned media.
2. Official press, government, institutional, or company media explicitly
   released for editorial use.
3. A licensed news-agency or publisher image that the user is permitted to use.
4. Creative Commons or public-domain media with compatible commercial-use and
   attribution terms.
5. Properly licensed stock photography when no event photo is available.

Do not bypass paywalls, remove watermarks, hotlink remote files, or assume that
an image is reusable merely because it appears in a news article. Do not use an
article screenshot when the original photograph is available.

For each downloaded image:

1. Open the article and identify the image credit.
2. Follow the credit to the original publisher or asset page.
3. Confirm the license or the user's right to use it.
4. Download the highest-resolution original available; do not take a browser
   screenshot.
5. Record the source page, direct asset URL, creator/agency, license, and access
   date in `assets/stories/YYYY-MM-DD/story-slug/image-sources.md`.
6. Save the files as `primary.jpg` and `secondary.jpg` in that same folder.

For this workspace, the user has authorized direct source images from news
stories and first-party media even when the image license has not been
independently cleared. Download the source file locally, record the article
page, direct asset URL, credit, access date and rights status in the source
ledger, and never describe an unverified image as licensed. Do not use
stylized or art-looking generated images. If a source image is genuinely
unavailable and an image is truly necessary, the only generation fallback is a
realistic vertical 9:16 image, clearly marked as generated in metadata. The
final video itself remains 1080×1920; source images should be framed for the
existing photo windows rather than stretched or distorted.

## On-screen text limits

These are safe hard limits for the current 1080×1920 layout. Both the word and
character limit must pass. A validator enforces them.

| Field | Recommended writing | Hard maximum before overflow risk |
| --- | --- | --- |
| `countryName` | Normal country name | 5 words / 32 characters |
| `cityName` | Exact major-city name, or blank | 5 words / 32 characters |
| `region` | Geographic region | 4 words / 28 characters |
| `kicker` | Two short categories separated by `·` | 4 words / 32 characters |
| `headline` | Active, factual, specific | 14 words / 85 characters |
| `summary` | One sentence adding the key consequence | 30 words / 180 characters |
| `source` | Publisher, agency, or desk name | 4 words / 28 characters |
| `edition` | `24 Jul 2026` style | 4 words / 20 characters |
| `storyNumber` | Zero-padded index | 2 characters |
| `script` | Spoken narration, not on-screen copy | 42 words / 300 characters |

Run this before narration or rendering:

```bash
npm run validate:story -- --story stories/your-story.json
```

The headline should say what happened. The summary should explain what is new,
why it matters, or what happens next. Do not repeat the headline in the summary.
Avoid clickbait, editorial adjectives, unsupported certainty, and long clauses.

## Narration script

The `script` field is the source text for text-to-speech. It is not displayed in
the composition. Write 36–40 words when possible and never exceed 42 words at
normal speed. This keeps the narration concise and leaves room for natural
pauses inside the 18-second video.

Use this structure:

1. **Hook:** one precise opening sentence that states the development.
2. **Context:** the most important verified detail.
3. **Why it matters:** the likely consequence or next step, attributed when
   necessary.

Write for speech:

- Use short sentences and contractions.
- Spell pronunciation rather than visual shorthand: write “one point nine
  billion dollars,” not `$1.9B`.
- Expand acronyms when pronunciation may be ambiguous.
- Round numbers in speech while preserving the exact number on screen if needed.
- Never put URLs, hashtags, citations, or stage directions in the spoken text.
- Never speak source names or attribution phrases such as “according to AP,”
  “the BBC reports,” or “officials said.” Keep source names in the on-screen
  source line, source ledger and description instead.
- Read the script aloud before synthesizing it.

## Generate narration with a TTS model

The project includes one command for local and cloud voices:

```bash
npm run setup:tts
npm run narrate -- \
  --story stories/your-story.json \
  --provider kokoro \
  --voice af_heart \
  --speed 1.0
```

The command extracts `script`, writes the spoken text beside the generated
audio, creates `assets/narration/<story-name>.wav`, and updates
`narrationAudio` in the story JSON.

Run `npm run setup:tts` once per checkout before the first Kokoro synthesis.
It creates a project-local `.venv-tts` and installs `kokoro-onnx` and
`soundfile`; the generator detects that environment automatically. Kokoro
requires Python 3.10–3.12. If more than one Python is installed, setup selects a
compatible version; set `DAILY_NEWS_TTS_PYTHON=/path/to/python3.11` to override
that choice.

Choose a provider deliberately:

| Need | Provider | Requirements |
| --- | --- | --- |
| Offline, repeatable daily production | `kokoro` | No API key; default |
| Strong cloud voice plus word timestamps | `heygen` | `HEYGEN_API_KEY` or HyperFrames login |
| Large cloud voice catalog | `elevenlabs` | `ELEVENLABS_API_KEY` and a voice ID |

Examples:

```bash
# Local Kokoro
npm run narrate -- --story stories/your-story.json \
  --provider kokoro --voice af_heart --speed 1.0

# HeyGen Starfish; omit --voice to select an English public voice
npm run narrate -- --story stories/your-story.json \
  --provider heygen --speed 1.0

# ElevenLabs; use a voice ID from the user's ElevenLabs account
npm run narrate -- --story stories/your-story.json \
  --provider elevenlabs --voice VOICE_ID
```

Voice IDs are provider-specific. Never pass a Kokoro name such as `af_heart` to
HeyGen or ElevenLabs. Do not store API keys in a story file or commit them to the
project.

After synthesis, check the duration:

```bash
ffprobe -v error -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 assets/narration/your-story.wav
```

The narration must be 18 seconds or shorter. If it is too long, shorten the
script first. Increasing speed above 1.2 is not an acceptable substitute for
editing.

## Story file shape

Duplicate an existing file in `stories/` and keep every field:

```json
{
  "countryCode": "DE",
  "countryName": "Germany",
  "cityName": "Berlin",
  "region": "Europe",
  "kicker": "Technology · Policy",
  "headline": "Berlin sets out a new technology policy agenda",
  "summary": "The proposals focus on infrastructure, investment and industrial competitiveness.",
  "script": "Berlin has set out a new technology policy agenda. The proposals focus on infrastructure, investment and industrial competitiveness. Officials say the next phase will determine how quickly the plans move from consultation into implementation.",
  "source": "Daily Brief",
  "edition": "24 Jul 2026",
  "imageOne": "assets/stories/2026-07-24/berlin-tech/primary.jpg",
  "imageTwo": "assets/stories/2026-07-24/berlin-tech/secondary.jpg",
  "narrationAudio": "assets/narration/berlin-tech.wav",
  "storyNumber": "03"
}
```

Use a blank `cityName` to target the country as a whole.

Existing files without story metadata remain valid. Example geographic,
breaking, statistics, comparison and quote stories live in
`stories/examples/`.

## Final production checklist

1. Facts and publication date are verified.
2. The edition contains exactly three distinct current stories, ranked 1–3.
3. The bundle passes `npm run validate:bundle` against `stories/story-history.json`.
4. City and country codes are correct.
5. Both images are relevant and local; no stylized generated art is used.
6. Image provenance and the user-authorized rights status are recorded.
7. Each story passes `npm run validate:story`.
8. The authored `animationPlan` (when present) uses registered library IDs and
   passes the verified-data gate; omitted plans resolve to the automatic
   library beat.
9. TTS audio is no longer than 18 seconds and has been listened to once.
10. `narrationAudio` points to the generated local file.
11. The visible opener is exactly centered `Good morning, good news` or
    `Good morning, bad news`.
12. `npm run check` passes.
13. `npm test` and `npm run validate:examples` pass after changing shared components.
14. Render with strict variables:

```bash
npm run render -- \
  --variables-file stories/your-story.json \
  --strict-variables \
  --output renders/your-story.mp4
```

Watch the complete MP4 before delivery. Check pronunciation, cropping, target
location, text wrapping, attribution, and audio/video timing.

## Social publishing gate

For Instagram Reels, the Crop step is a release blocker. Never accept the
default crop: explicitly select `Original` or `9:16` for every 1080×1920 MP4
before advancing. The live post must report portrait video dimensions (for
example, 720×1280 or 1080×1920); 720×720 means the Reel was uploaded wrong and
the batch must stop.

Publish one file at a time from an exact manifest row containing the story
number, headline, caption, and absolute MP4 path. Before sharing, confirm the
caption counter is non-zero and the caption contains the expected story
summary/source. After sharing, wait for `Your reel has been shared.`, record
the live Reel URL, reopen it, and verify both the caption/source and the live
video dimensions before moving to the next file. Do not mark a batch uploaded
from a share spinner, a square preview, or a selected file alone.
