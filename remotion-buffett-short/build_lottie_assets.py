#!/usr/bin/env python3
"""Procedurally generate looping Lottie animations with python-lottie.

Outputs JSON into src/sample/lottie/ for the Remotion <Lottie> overlays.
Everything is built to loop seamlessly over LOOP frames at 30fps.
"""
import os
import math
import random
from lottie import objects, Point, Color
from lottie.objects import easing
from lottie.objects.bezier import Bezier
from lottie.exporters.core import export_lottie

random.seed(7)
OUT = "src/sample/lottie"
os.makedirs(OUT, exist_ok=True)
W, H = 720, 1280
FPS = 30


def new_anim(loop):
    an = objects.Animation(loop)
    an.frame_rate = FPS
    an.width = W
    an.height = H
    an.in_point = 0
    an.out_point = loop
    return an


def disc(layer, r, color, pos=(0, 0)):
    e = objects.Ellipse()
    e.size.value = Point(r * 2, r * 2)
    e.position.value = Point(pos[0], pos[1])
    layer.add_shape(e)
    layer.add_shape(objects.Fill(Color(*color)))


def ring(layer, r, color, width, pos=(0, 0)):
    e = objects.Ellipse()
    e.size.value = Point(r * 2, r * 2)
    e.position.value = Point(pos[0], pos[1])
    layer.add_shape(e)
    st = objects.Stroke(Color(*color), width)
    layer.add_shape(st)


# ----------------------------------------------------------------------------
# 1. COINS — gold coins raining down, tumbling. Seamless vertical loop.
# ----------------------------------------------------------------------------
def build_coins():
    LOOP = 90
    an = new_anim(LOOP)
    N = 16
    span = H + 240
    for i in range(N):
        sl = objects.ShapeLayer()
        an.add_layer(sl)
        # coin body + inner ring + glyph dot
        disc(sl, 34, (0.97, 0.78, 0.18))
        ring(sl, 26, (0.55, 0.36, 0.03), 6)
        disc(sl, 6, (0.55, 0.36, 0.03))
        x = random.uniform(40, W - 40)
        y0 = -120 + (span / N) * i
        sway = random.uniform(20, 55)
        phase = random.uniform(0, math.tau)
        # vertical fall (wraps over the loop)
        sl.transform.position.add_keyframe(0, Point(x + math.sin(phase) * sway, y0))
        sl.transform.position.add_keyframe(
            LOOP, Point(x + math.sin(phase + math.tau) * sway, y0 + span))
        # tumble
        spin = random.choice([-1, 1]) * 360
        sl.transform.rotation.add_keyframe(0, 0)
        sl.transform.rotation.add_keyframe(LOOP, spin)
        s = random.uniform(55, 100)
        sl.transform.scale.value = Point(s, s)
    export_lottie(an, f"{OUT}/coins.json")
    print("coins.json")


# ----------------------------------------------------------------------------
# 2. CONFETTI — multicolor rectangles bursting/falling. Seamless loop.
# ----------------------------------------------------------------------------
def build_confetti():
    LOOP = 75
    an = new_anim(LOOP)
    palette = [(0.95, 0.27, 0.36), (0.18, 0.78, 0.55), (0.99, 0.82, 0.20),
               (0.36, 0.55, 0.98), (0.96, 0.45, 0.82), (1, 1, 1)]
    N = 28
    span = H + 200
    for i in range(N):
        sl = objects.ShapeLayer()
        an.add_layer(sl)
        r = objects.Rect()
        r.size.value = Point(random.uniform(14, 26), random.uniform(22, 40))
        r.position.value = Point(0, 0)
        sl.add_shape(r)
        sl.add_shape(objects.Fill(Color(*random.choice(palette))))
        x = random.uniform(20, W - 20)
        y0 = -100 + (span / N) * i
        sway = random.uniform(30, 80)
        ph = random.uniform(0, math.tau)
        sl.transform.position.add_keyframe(0, Point(x + math.sin(ph) * sway, y0))
        sl.transform.position.add_keyframe(
            LOOP, Point(x + math.sin(ph + math.tau) * sway, y0 + span))
        spin = random.choice([-1, 1]) * random.choice([360, 720])
        sl.transform.rotation.add_keyframe(0, random.uniform(0, 360))
        sl.transform.rotation.add_keyframe(LOOP, random.uniform(0, 360) + spin)
    export_lottie(an, f"{OUT}/confetti.json")
    print("confetti.json")


# ----------------------------------------------------------------------------
# 3. CRASH ARROW — big red down-arrow bobbing + red candlesticks dropping.
# ----------------------------------------------------------------------------
def build_crash():
    LOOP = 60
    an = new_anim(LOOP)
    cx = W / 2
    # red candlesticks stepping down (static layout, looping opacity flash)
    bars = [(-220, 760, 60), (-110, 830, 75), (0, 910, 95),
            (110, 1010, 120), (220, 1120, 150)]
    for k, (dx, y, hgt) in enumerate(bars):
        sl = objects.ShapeLayer()
        an.add_layer(sl)
        r = objects.Rect()
        r.size.value = Point(46, hgt)
        r.position.value = Point(cx + dx, y - hgt / 2)
        r.rounded.value = 6
        sl.add_shape(r)
        sl.add_shape(objects.Fill(Color(0.85, 0.10, 0.10)))
        # wick
        w = objects.Rect()
        w.size.value = Point(8, hgt + 40)
        w.position.value = Point(cx + dx, y - hgt / 2)
        sl.add_shape(w)
        sl.add_shape(objects.Fill(Color(1, 0.55, 0.55)))
        # flashing pop, staggered
        d = k * 4
        sl.transform.opacity.add_keyframe(0, 35)
        sl.transform.opacity.add_keyframe((d + 8) % LOOP, 100)
        sl.transform.opacity.add_keyframe(LOOP, 35)

    # big down arrow (shaft + head) bobbing
    arrow = objects.ShapeLayer()
    an.add_layer(arrow)
    shaft = objects.Rect()
    shaft.size.value = Point(60, 320)
    shaft.position.value = Point(0, -60)
    arrow.add_shape(shaft)
    arrow.add_shape(objects.Fill(Color(1, 0.88, 0.30)))
    # downward triangle arrowhead as an explicit bezier path (widely supported)
    bez = Bezier()
    bez.add_point(Point(-150, 70))
    bez.add_point(Point(150, 70))
    bez.add_point(Point(0, 250))
    bez.close()
    head = objects.Path()
    head.shape.value = bez
    arrow.add_shape(head)
    arrow.add_shape(objects.Fill(Color(1, 0.88, 0.30)))
    arrow.transform.position.add_keyframe(0, Point(cx, 430), easing.Sigmoid())
    arrow.transform.position.add_keyframe(LOOP // 2, Point(cx, 470), easing.Sigmoid())
    arrow.transform.position.add_keyframe(LOOP, Point(cx, 430))
    arrow.transform.scale.value = Point(85, 85)
    export_lottie(an, f"{OUT}/crash.json")
    print("crash.json")


# ----------------------------------------------------------------------------
# 4. RINGS — radar pulse: expanding fading rings. Seamless loop.
# ----------------------------------------------------------------------------
def build_rings(name="rings.json", color=(1, 1, 1)):
    """Concentric pulse: 3 rings expand + fade together. Faded (opacity 0) at
    the loop boundary so the wrap is invisible. Clean monotonic keyframes."""
    LOOP = 60
    an = new_anim(LOOP)
    cx, cy = W / 2, H / 2
    for i in range(3):
        sl = objects.ShapeLayer()
        an.add_layer(sl)
        ring(sl, 100, color, 10, pos=(cx, cy))
        sl.transform.anchor_point.value = Point(cx, cy)
        sl.transform.position.value = Point(cx, cy)
        s_lo = 12 + i * 16
        s_hi = 150 + i * 22
        sl.transform.scale.add_keyframe(0, Point(s_lo, s_lo))
        sl.transform.scale.add_keyframe(LOOP, Point(s_hi, s_hi))
        sl.transform.opacity.add_keyframe(0, 95 - i * 18)
        sl.transform.opacity.add_keyframe(LOOP, 0)
    export_lottie(an, f"{OUT}/{name}")
    print(name)


# ----------------------------------------------------------------------------
# 5. SPARKLES — twinkling 4-point stars. Seamless loop.
# ----------------------------------------------------------------------------
def build_sparkles():
    LOOP = 60
    an = new_anim(LOOP)
    spots = [(150, 300), (590, 380), (360, 250), (120, 900),
             (610, 980), (380, 1050), (520, 640), (200, 620)]
    for i, (x, y) in enumerate(spots):
        sl = objects.ShapeLayer()
        an.add_layer(sl)
        star = objects.Star()
        star.points.value = 4
        star.outer_radius.value = 46
        star.inner_radius.value = 12
        star.position.value = Point(0, 0)
        star.star_type = objects.shapes.StarType.Star
        sl.add_shape(star)
        sl.add_shape(objects.Fill(Color(1, 1, 1)))
        sl.transform.position.value = Point(x, y)
        sl.transform.anchor_point.value = Point(0, 0)
        d = (i * 7) % LOOP
        sl.transform.scale.add_keyframe(0, Point(0, 0))
        sl.transform.scale.add_keyframe((d + 15) % LOOP if (d + 15) < LOOP else LOOP - 1,
                                        Point(100, 100))
        sl.transform.scale.add_keyframe(LOOP, Point(0, 0))
        sl.transform.rotation.add_keyframe(0, 0)
        sl.transform.rotation.add_keyframe(LOOP, 90)
    export_lottie(an, f"{OUT}/sparkles.json")
    print("sparkles.json")


if __name__ == "__main__":
    build_coins()
    build_confetti()
    build_crash()
    build_rings("rings.json", (1, 1, 1))
    build_rings("rings-pink.json", (0.96, 0.66, 0.88))
    build_sparkles()
    print("done ->", OUT)
