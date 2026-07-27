# Daily News agent production guide

This is the operating contract for every agent that creates a story with this
template. Read it before changing a story, downloading media, generating
narration, or rendering.

## What to produce

Each story is an 18-second, vertical 9:16 YouTube Short by default. The sequence
is fixed:

1. The textured 3D Earth rotates while the 3D sun and moon cross the background.
2. The globe locks onto the country or requested city with an accurate outline and target pulse.
3. Two relevant photographs enter.
4. The story selector adds a content-appropriate visual, then the category, headline, summary, source, and edition appear.
5. A text-to-speech narration tells the story.

The multi-country sweep is optional. Use it only when the story itself affects
several countries and the affected list is verified. Copy
`stories/templates/global-affected-sweep.example.json`, populate
`affectedCountryCodes`, `affectedCount`, and `sweepLabel`, and the template will
insert the fast global sweep before the target lock. Leave those fields out for
ordinary single-country or single-city stories.

Do not change the composition or animation timing for routine daily stories.
Create a new JSON file in `stories/`, add local media in `assets/stories/`, then
render with variables.

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

If rights cannot be verified, do not download the image. Use an official,
licensed, public-domain, or generated contextual alternative and label it
accurately.

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
2. City and country codes are correct.
3. Both images are relevant, local, high-resolution, and licensed.
4. Image provenance is recorded.
5. The story passes `npm run validate:story`.
6. TTS audio is no longer than 18 seconds and has been listened to once.
7. `narrationAudio` points to the generated local file.
8. `npm run check` passes.
9. `npm test` and `npm run validate:examples` pass after changing shared components.
10. Render with strict variables:

```bash
npm run render -- \
  --variables-file stories/your-story.json \
  --strict-variables \
  --output renders/your-story.mp4
```

Watch the complete MP4 before delivery. Check pronunciation, cropping, target
location, text wrapping, attribution, and audio/video timing.
