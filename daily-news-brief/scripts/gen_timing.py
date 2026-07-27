#!/usr/bin/env python3
"""
Generate timing.json for the daily news brief video.
Produces word-by-word caption timing for karaoke captions.

The script uses the known script text and distributes words across scenes
based on natural pacing (150 wpm = 0.4s per word = 12 frames at 30fps).
Scene boundaries align with narration pauses.
"""

import json

FPS = 30
WORDS_PER_MINUTE = 150
SECONDS_PER_WORD = 60.0 / WORDS_PER_MINUTE  # 0.4s
FRAMES_PER_WORD = SECONDS_PER_WORD * FPS     # 12 frames

# The full narration script (must match what was sent to TTS)
SCRIPT = """Top 3 World News Today. It's July 24th, 2026. Here are the top stories.

Story 1: Wildfires rage across Spain and southern France. Over 65,000 people have been evacuated as fires tear through tourist areas near Madrid. Spain has declared a national emergency, and France has deployed boats to evacuate the Cap Ferret peninsula. The fires are fueled by an intense heat wave sweeping the Mediterranean.

Story 2: The United States and Iran are exchanging strikes across the Gulf. The conflict has spread to the Red Sea and the strategic Strait of Hormuz. President Trump has threatened a massive attack, while Iran warns it will target US bases across the Middle East. Oil prices have surged past 100 dollars a barrel.

Story 3: Ukraine's President Zelenskyy has replaced the country's top military commander. The move comes after days of protests and growing pressure over the war effort. General Syrskyi is out, replaced by General Drapatyi, as Kyiv faces intensified Russian offensives.

That's all for today's brief."""

def split_into_scenes(text):
    """Split the script into scenes based on paragraph breaks."""
    paragraphs = [p.strip() for p in text.strip().split('\n\n') if p.strip()]
    scenes = []
    for i, para in enumerate(paragraphs):
        # Each paragraph is a scene
        words = para.split()
        scenes.append({
            'n': i + 1,
            'text': para,
            'words': words,
        })
    return scenes

def build_timing(scenes):
    """Build the timing JSON with frame-accurate word timings."""
    all_words = []
    scene_entries = []
    current_frame = 0

    for scene in scenes:
        scene_words = []
        for word in scene['words']:
            start_f = current_frame
            end_f = current_frame + int(FRAMES_PER_WORD)
            # Add a small gap between words for readability
            end_f = min(end_f, start_f + int(FRAMES_PER_WORD))
            scene_words.append({
                'text': word,
                'startF': start_f,
                'endF': end_f,
            })
            all_words.append(word)
            current_frame = end_f

        scene_entry = {
            'n': scene['n'],
            'from': scene_words[0]['startF'] if scene_words else current_frame,
            'dur': (scene_words[-1]['endF'] - scene_words[0]['startF']) if scene_words else 0,
            'words': scene_words,
        }
        scene_entries.append(scene_entry)

    total_frames = current_frame

    timing = {
        'fps': FPS,
        'total': total_frames,
        'scenes': scene_entries,
    }
    return timing

def main():
    scenes = split_into_scenes(SCRIPT)
    timing = build_timing(scenes)

    output_path = 'timing.json'
    with open(output_path, 'w') as f:
        json.dump(timing, f, indent=2)

    print(f"Generated {output_path}")
    print(f"  FPS: {timing['fps']}")
    print(f"  Total frames: {timing['total']} ({timing['total']/FPS:.1f}s)")
    print(f"  Scenes: {len(timing['scenes'])}")
    for s in timing['scenes']:
        print(f"    Scene {s['n']}: frames {s['from']}-{s['from']+s['dur']} ({s['dur']/FPS:.1f}s), {len(s['words'])} words")

if __name__ == '__main__':
    main()
