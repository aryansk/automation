#!/usr/bin/env python3
"""
generate-timeline.py — build src/timeline.json for the white-cutout long-form template.

Reads:
  audio/transcript.json   word-level transcript: [{text,start,end}, ...]
  public/img/*.png        transparent CUTOUTS (objects)
  public/photos/*.jpg     full PHOTOS (people / scenes), shown as framed prints

Writes:
  src/timeline.json       { fps, total, scenes:[...], articles:{...} }

Each ~SCENE_LEN-second scene gets ONE subject (a framed photo for human/action beats,
a cutout for object beats) chosen by keyword, plus a designed caption line (straight,
lower third, red on the main word only).

The GROUPS below are TOPIC-SPECIFIC. For a new video, edit the keyword lists (and the
ARTICLE_ANCHORS detection) to match your script's vocabulary.
"""
import json, re, glob, os, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30
SCENE_LEN = 4.2  # seconds per scene/cut

words = json.load(open(os.path.join(ROOT, "audio/transcript.json")))
total_s = words[-1]["end"]
CUT = [os.path.basename(f)[:-4] for f in glob.glob(os.path.join(ROOT, "public/img/*.png"))]
PHOTO = {}
for f in glob.glob(os.path.join(ROOT, "public/photos/*.jpg")):
    im = Image.open(f); PHOTO[os.path.basename(f)[:-4]] = round(im.width / im.height, 3)

STOP = set("the a an and or but of to in on at for was is are be it its i you he she we they that this with as my me your our so if not just what how when then than into over up out off down you're i'd i'm it's".split())
KEY = set("nothing rang phone alive never one line two minutes state focus settle uphill leaving solutions fix feeling work day residue attention twenty-three forty percent interruption".split())

def hv(d, *n): return [x for x in n if x in d]

# --- human/action beats -> framed PHOTO (edit per topic) ---
PHOTO_GROUPS = [
    (("writing","wrote","write","script","words","session","typing","laptop"), hv(PHOTO,"write_person","write_hands","typing","laptop_coffee","writing_close")),
    (("phone","rang","ring","notification","call"), hv(PHOTO,"phone_desk","phone_dark")),
    (("pretending","waiting","rereading","reread","staring","wall","overwhelmed","frustrating","stuck","tiny"), hv(PHOTO,"stress_man","stress_woman")),
    (("door","doorway","standing","someone"), hv(PHOTO,"doorway","door_sun")),
    (("place","familiar","inaccessible","live","lived"), hv(PHOTO,"door_sun","doorway")),
    (("feeling","state","mind","attention","residue","present"), hv(PHOTO,"head_hands","residue_heads")),
    (("coffee","room","sitting","sit","settle","desk","morning"), hv(PHOTO,"coffee_steam","desk_window","laptop_coffee")),
    (("line","thought","brain"), hv(PHOTO,"handwrite","writing_close")),
    (("hours","produce","nothing","uphill","climb","pushing"), hv(PHOTO,"stress_man","desk_window")),
]
# --- object beats -> CUTOUT (edit per topic) ---
CUT_GROUPS = [
    (("minute","minutes","hour","hours","day","days","time","twenty-three"), hv(CUT,"clock","clock2","pocketwatch","pocketwatch2")),
    (("second","seconds","finish","wait"), hv(CUT,"hourglass","hourglass2")),
    (("music","song","sheet","sounded"), hv(CUT,"sheetmusic","vinyl")),
    (("fix","found","idea","simple","loop","open","solution","solutions"), hv(CUT,"lightbulb","key")),
    (("pen","sentence","edits"), hv(CUT,"pen","penfountain","marker","typewriter")),
    (("percent","forty","cost","costs"), hv(CUT,"clock2","hourglass2","pocketwatch")),
    (("book","books","read","reading","page","pages"), hv(CUT,"books","books2")),
    (("scrapping","scrapped","fresh","start","starting"), hv(CUT,"paperball","paperball2")),
]

def clean(t): return re.sub(r"[^a-z]", "", t.lower())
def match(groups, text):
    for keys, c in groups:
        if c and any(re.search(r"\b" + re.escape(k) + r"\b", text) for k in keys):
            return c
    return None

scenes = []; t = 0.0; ri = 0; recent = []; rr = 0; nphoto = 0
MARKS = ["circle","box","underline","none","arrow","box","circle","underline"]
allcut = CUT[:]
while t < total_s:
    a, b = t, min(t + SCENE_LEN, total_s + 0.3)
    ww = [w for w in words if w["start"] >= a - 0.05 and w["start"] < b]
    if not ww:
        if scenes: break
        t = b; continue
    text = " ".join(w["text"].lower() for w in ww)
    kind, name = "cutout", None
    pc = match(PHOTO_GROUPS, text)
    if pc:
        name = next((c for c in pc if c not in recent), pc[ri % len(pc)]); kind = "photo"
    if name is None:
        cc = match(CUT_GROUPS, text)
        if cc:
            name = next((c for c in cc if c not in recent), cc[ri % len(cc)])
    if name is None and allcut:
        for k in range(len(allcut)):
            c = allcut[(rr + k) % len(allcut)]
            if c not in recent[-3:]:
                name = c; rr += k + 1; break
        kind = "cutout"
    recent.append(name); recent = recent[-5:]
    nphoto += kind == "photo"
    # caption word design: red on KEY word or the longest content word; rest black
    content = [(i, w) for i, w in enumerate(ww) if clean(w["text"]) not in STOP and len(clean(w["text"])) >= 4]
    longest_i = max(content, key=lambda iw: len(clean(iw[1]["text"])))[0] if content else -1
    dwords = []
    for i, w in enumerate(ww):
        c = clean(w["text"]); short = (c in STOP or len(c) <= 3)
        d = {"t": w["text"], "s": round(w["start"], 3), "e": round(w["end"], 3)}
        if (c in KEY) or (i == longest_i): d.update(size=78, font="punch", color="accent", up=True)
        elif short: d.update(size=44, font="sans", color="ink", up=False)
        else: d.update(size=58, font="punch", color="ink", up=True)
        dwords.append(d)
    sc = {"s": round(a, 3), "e": round(b, 3), "kind": kind, "aster": (ri % 2 == 1), "words": dwords}
    if kind == "photo":
        sc["photo"] = {"src": f"{name}.jpg", "ar": PHOTO[name], "rot": [-3,3,-2,2][ri%4], "x": 50, "y": 34, "h": 440}
    else:
        sc["cut"] = {"src": f"img/{name}.png", "mark": MARKS[ri%len(MARKS)],
                     "shake": 5 if (name or "").startswith("telephone") else 0,
                     "rot": [-5,4,-3,6][ri%4], "x": 50, "y": 36, "h": 380}
    scenes.append(sc); t = b; ri += 1

# --- ARTICLE ANCHORS: timestamp of each cited claim (edit detectors per topic) ---
def first(pred):
    for w in words:
        if pred(w["text"].lower().strip(".,%")): return round(w["start"], 2)
    return None
articles = {
    "mark":  first(lambda x: x == "23" or "twenty-three" in x),
    "leroy": first(lambda x: "residue" in x),
    "apa":   first(lambda x: x == "40"),   # Whisper emits "40%"; verify with the print-context check
}

total = round(total_s * FPS) + 18
json.dump({"fps": FPS, "total": total, "scenes": scenes, "articles": articles},
          open(os.path.join(ROOT, "src/timeline.json"), "w"))
print(f"scenes={len(scenes)} photos={nphoto} cutouts={len(scenes)-nphoto} "
      f"dur={round(total/FPS,1)}s articles={articles}")
