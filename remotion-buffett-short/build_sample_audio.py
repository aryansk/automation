#!/usr/bin/env python3
"""Generate narration + timing.json for the SAMPLE short (copy of Video-332 style).

For each scene we have narration text and the spoken word list. We render each
segment with macOS `say`, measure its real duration, then distribute the words
evenly across that segment so the karaoke captions stay in sync.
"""
import json
import subprocess
import os

FPS = 30
LEAD = 0.5          # silence before first segment
GAP = 0.28          # silence between segments
TAIL = 0.7          # silence after last segment
VOICE = "Daniel"    # crisp British narrator; falls back to default if missing
RATE = 180          # words per minute

AUD = "audio-sample"
PUB = "public/audio"
os.makedirs(AUD, exist_ok=True)
os.makedirs(PUB, exist_ok=True)

# (narration text, [words shown as karaoke])
SCENES = [
    ("Saving three hundred dollars a month, starting at twenty five.",
     ["Saving", "$300", "a", "month", "starting", "at", "25."]),
    ("But most people wait until thirty five to even begin.",
     ["But", "most", "people", "wait", "until", "35", "to", "begin."]),
    ("That ten year delay can cost you four hundred thousand dollars.",
     ["That", "10-year", "delay", "costs", "you", "$400,000."]),
    ("Not from saving less, but from losing a decade of compounding.",
     ["Not", "from", "saving", "less.", "From", "losing", "compounding."]),
    ("So the best time to start was yesterday. The next best is today.",
     ["The", "best", "time", "was", "yesterday.", "The", "next", "is", "today."]),
]


def dur(path):
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", path])
    return float(out.strip())


def silence(path, seconds):
    subprocess.check_call(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i",
         "anullsrc=channel_layout=mono:sample_rate=44100", "-t", f"{seconds}",
         path])


# 1. render + measure each segment
seg_durs = []
for i, (text, _) in enumerate(SCENES, 1):
    aiff = f"{AUD}/sseg_{i}.aiff"
    wav = f"{AUD}/sseg_{i}.wav"
    try:
        subprocess.check_call(["say", "-v", VOICE, "-r", str(RATE), "-o", aiff, text])
    except subprocess.CalledProcessError:
        subprocess.check_call(["say", "-r", str(RATE), "-o", aiff, text])
    subprocess.check_call(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", aiff, "-ar", "44100",
         "-ac", "1", wav])
    seg_durs.append(dur(wav))
    print(f"seg {i}: {seg_durs[-1]:.2f}s  '{text}'")

# 2. silence beds
silence(f"{AUD}/sil_lead.wav", LEAD)
silence(f"{AUD}/sil_gap.wav", GAP)
silence(f"{AUD}/sil_tail.wav", TAIL)

# 3. concat list
concat = f"{AUD}/sconcat.txt"
with open(concat, "w") as f:
    f.write("file 'sil_lead.wav'\n")
    for i in range(1, len(SCENES) + 1):
        f.write(f"file 'sseg_{i}.wav'\n")
        f.write("file 'sil_gap.wav'\n" if i < len(SCENES) else "file 'sil_tail.wav'\n")

final = f"{PUB}/sample_audio.wav"
subprocess.check_call(
    ["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0",
     "-i", concat, "-c", "copy", final])
print("final audio:", dur(final), "s ->", final)

# 4. build timing.json with per-word frames distributed over each segment
scenes_json = []
cursor = LEAD
for i, (text, words) in enumerate(SCENES, 1):
    seg_start = cursor
    seg_len = seg_durs[i - 1]
    # leave ~12% padding at the start of speech so first word lands on the beat
    speak_start = seg_start + seg_len * 0.06
    speak_len = seg_len * 0.9
    per = speak_len / len(words)
    wlist = []
    for wi, w in enumerate(words):
        s = speak_start + wi * per
        e = s + per
        wlist.append({
            "text": w,
            "startF": round(s * FPS),
            "endF": round(e * FPS),
        })
    # scene window: from a touch before the lead-in, to just past last word
    frm = round((seg_start - (LEAD if i == 1 else GAP) * 0.6) * FPS)
    frm = max(frm, 0)
    end = round((seg_start + seg_len + GAP * 0.6) * FPS)
    scenes_json.append({"n": i, "from": frm, "dur": end - frm, "words": wlist})
    cursor = seg_start + seg_len + (GAP if i < len(SCENES) else TAIL)

total = round((cursor + 0.2) * FPS)
out = {"fps": FPS, "total": total, "scenes": scenes_json}
with open("src/sample/timing.json", "w") as f:
    json.dump(out, f, indent=2)
print("timing.json total frames:", total, f"({total/FPS:.1f}s)")
