import React from "react";
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Cutout } from "./Cutout";
import { PhotoFrame } from "./PhotoFrame";
import { Asterisk } from "./Asterisk";
import { CollageAccent, AccentDef } from "./CollageAccent";
import { MarkKind } from "./Marker";
import { THEME } from "../theme";

export type DWord = {
  t: string;
  s: number;
  e: number;
  size: number;
  font: "punch" | "sans" | "serifI";
  color: "ink" | "accent" | "inkSoft";
  up: boolean;
};
export type SceneDef = {
  s: number;
  e: number;
  kind?: "cutout" | "photo";
  cut?: { src: string; mark: MarkKind; shake: number; rot: number; x: number; y: number; h: number };
  photo?: { src: string; ar: number; rot: number; x: number; y: number; h: number };
  aster: boolean;
  words: DWord[];
};

const FONT = { punch: THEME.punch, sans: THEME.sans, serifI: THEME.serif };
const COLOR = { ink: THEME.ink, accent: THEME.accent, inkSoft: THEME.inkSoft };
const WFACTOR = { punch: 0.46, sans: 0.54, serifI: 0.52 };

// scrapbook accents (edges only, behind everything)
const ACC = ["sparkle", "starburst", "star_outline", "scribble", "sparkles", "brush"];
const ACC_SLOTS = [
  { x: 12, y: 20 },
  { x: 90, y: 24 },
  { x: 9, y: 50 },
  { x: 92, y: 52 },
];
function pickAccents(index: number): AccentDef[] {
  const out: AccentDef[] = [];
  const n = 2 + (index % 2);
  for (let k = 0; k < n; k++) {
    out.push({
      src: `${ACC[(index * 2 + k) % ACC.length]}.jpg`,
      x: ACC_SLOTS[(index + k) % ACC_SLOTS.length].x,
      y: ACC_SLOTS[(index + k) % ACC_SLOTS.length].y,
      size: 100 + ((index + k * 3) % 5) * 30,
      rot: ((index * 17 + k * 53) % 36) - 18,
      delay: 4 + k * 5,
      spin: k % 2 ? 6 : -5,
    });
  }
  return out;
}

type Placed = DWord & { cx: number; cy: number; w: number };

/** greedy wrap, lines centred on CX=960, block centred on CY (lower third). Straight, no rotation. */
function layout(words: DWord[], maxW = 1620, CX = 960, CY = 838): Placed[] {
  const gap = 22;
  const est = (w: DWord) => w.t.length * w.size * WFACTOR[w.font] + 6;
  const lines: DWord[][] = [];
  let line: DWord[] = [];
  let lw = 0;
  for (const w of words) {
    const ww = est(w);
    if (line.length && lw + gap + ww > maxW) {
      lines.push(line);
      line = [];
      lw = 0;
    }
    line.push(w);
    lw += (line.length > 1 ? gap : 0) + ww;
  }
  if (line.length) lines.push(line);
  const lineH = lines.map((ln) => Math.max(...ln.map((w) => w.size)) * 1.06);
  const totalH = lineH.reduce((a, b) => a + b, 0) + (lines.length - 1) * 8;
  let y = CY - totalH / 2;
  const placed: Placed[] = [];
  lines.forEach((ln, li) => {
    const widths = ln.map(est);
    const tw = widths.reduce((a, b) => a + b, 0) + (ln.length - 1) * gap;
    let x = CX - tw / 2;
    ln.forEach((w, k) => {
      placed.push({ ...w, w: widths[k], cx: x + widths[k] / 2, cy: y + lineH[li] / 2 });
      x += widths[k] + gap;
    });
    y += lineH[li] + 8;
  });
  return placed;
}

const WordSpan: React.FC<{ p: Placed; startSec: number }> = ({ p, startSec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tSec = startSec + frame / fps;
  const appear = spring({
    frame: (tSec - (p.s - 0.05)) * fps,
    fps,
    config: { damping: 18, mass: 0.5, stiffness: 150 },
  });
  const yoff = interpolate(appear, [0, 1], [p.up ? 22 : 14, 0]);
  return (
    <span
      style={{
        position: "absolute",
        left: p.cx,
        top: p.cy,
        transform: `translate(-50%,-50%) translateY(${yoff}px)`,
        opacity: appear,
        fontFamily: FONT[p.font],
        fontStyle: p.font === "serifI" ? "italic" : "normal",
        fontWeight: p.font === "serifI" ? 700 : 400,
        fontSize: p.size,
        lineHeight: 1,
        color: COLOR[p.color],
        textTransform: p.font === "punch" ? "uppercase" : "none",
        whiteSpace: "nowrap",
      }}
    >
      {p.t}
    </span>
  );
};

export const Scene: React.FC<{ scene: SceneDef; index: number }> = ({ scene, index }) => {
  const { fps } = useVideoConfig();
  const from = Math.round(scene.s * fps);
  const dur = Math.max(1, Math.round((scene.e - scene.s) * fps));
  const placed = layout(scene.words);
  const apos = [
    { x: 84, y: 24 },
    { x: 16, y: 26 },
    { x: 82, y: 56 },
    { x: 18, y: 54 },
  ][index % 4];

  return (
    <Sequence from={from} durationInFrames={dur} layout="none">
      <FadeWrap dur={dur}>
        {/* scrapbook accents — edges, behind everything */}
        <AbsoluteFill style={{ zIndex: 0 }}>
          {pickAccents(index).map((a, i) => (
            <CollageAccent key={i} {...a} />
          ))}
        </AbsoluteFill>
        {/* subject — upper area: framed photo or cutout */}
        <AbsoluteFill style={{ zIndex: 1 }}>
          {scene.kind === "photo" && scene.photo ? (
            <PhotoFrame {...scene.photo} />
          ) : scene.cut ? (
            <Cutout src={scene.cut.src} x={scene.cut.x} y={scene.cut.y} h={scene.cut.h} rot={scene.cut.rot} delay={2} mark={scene.cut.mark} shake={scene.cut.shake} />
          ) : null}
          {scene.aster && <Asterisk x={apos.x} y={apos.y} size={56} delay={6} spin={index % 2 ? 8 : -7} />}
        </AbsoluteFill>
        {/* captions — straight, lower third */}
        <AbsoluteFill style={{ zIndex: 2 }}>
          {placed.map((p, i) => (
            <WordSpan key={i} p={p} startSec={scene.s} />
          ))}
        </AbsoluteFill>
      </FadeWrap>
    </Sequence>
  );
};

const FadeWrap: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 4, dur - 6, dur - 1], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ opacity: op }}>{children}</AbsoluteFill>;
};
