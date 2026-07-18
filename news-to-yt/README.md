# News → YouTube video automation

Pulls world news by topic, builds narrated videos with stock footage via
HyperFrames, and uploads them to YouTube (long-form 16:9 + auto-cut Shorts).

## Pipeline

```
fetch-news  →  write script  →  fetch-footage  →  build video (HyperFrames)  →  render  →  upload to YouTube
 (RSS)         (LLM/Claude)      (Pexels)          (general-video skill)        (FFmpeg)    (insta-to-youtube-style)
```

Each run lands in `runs/<date>/<topic>/`:
- `news.json` — top stories pulled from RSS
- `footage/` + `footage.json` — downloaded Pexels clips
- `video/` — HyperFrames project (HTML composition)
- `renders/` — final `.mp4` (long-form + shorts)

## Credentials (one-time)

| Var | Used for | Where |
|---|---|---|
| HeyGen | Voiceover TTS (word-timed captions) | `npx hyperframes auth login --api-key <KEY>` |
| `PEXELS_API_KEY` | Stock footage | https://www.pexels.com/api/ (free) |
| YouTube OAuth | Upload | reused from the insta-to-youtube skill |

## Commands

```bash
# 1. Pull the top 5 tech stories for today
node scripts/fetch-news.mjs technology 5

# 2. (Claude writes the narration script + footage keywords from news.json)

# 3. Download matching stock footage (landscape for long-form, portrait for shorts)
PEXELS_API_KEY=xxx node scripts/fetch-footage.mjs runs/<date>/technology landscape "smart glasses" "ai servers" ...

# 4. Build + render via the general-video HyperFrames skill (Claude drives)
# 5. Upload long-form + Shorts to YouTube
```

Topics & RSS feeds are configured in `config.json` (world, technology,
business, science, health — all BBC feeds by default; add your own).
