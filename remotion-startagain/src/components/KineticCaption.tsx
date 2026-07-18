import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../theme";

export type CWord = { t: string; s: number; e: number };
export type Phrase = { s: number; e: number; words: CWord[]; emph?: boolean };

/** Big kinetic lower-third caption: one phrase at a time, words pop in as spoken,
 *  the live word snaps red. */
export const KineticCaption: React.FC<{ phrases: Phrase[] }> = ({ phrases }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tSec = frame / fps;

  // active phrase = last one whose start has passed
  let idx = -1;
  for (let i = 0; i < phrases.length; i++) {
    if (tSec >= phrases[i].s - 0.18) idx = i;
  }
  if (idx < 0) return null;
  const ph = phrases[idx];

  // phrase enter/exit envelope
  const inP = interpolate(tSec, [ph.s - 0.18, ph.s + 0.12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const next = phrases[idx + 1];
  const outAt = next ? next.s : ph.e + 0.5;
  const outP = interpolate(tSec, [outAt - 0.14, outAt], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const vis = Math.min(inP, outP);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 110,
        left: "50%",
        transform: `translateX(-50%) translateY(${(1 - inP) * 26}px)`,
        width: 1500,
        textAlign: "center",
        opacity: vis,
      }}
    >
      <div style={{ display: "inline-flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 30px" }}>
        {ph.words.map((w, i) => {
          const appear = spring({
            frame: (tSec - (w.s - 0.06)) * fps,
            fps,
            config: { damping: 14, mass: 0.5, stiffness: 170 },
          });
          const live = tSec >= w.s - 0.02 && tSec < w.e + 0.06;
          const spoken = tSec >= w.s - 0.02;
          const yoff = interpolate(appear, [0, 1], [22, 0]);
          const sc = live ? 1.12 : 1;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                transform: `translateY(${yoff}px) scale(${sc})`,
                opacity: appear,
                fontFamily: THEME.punch,
                fontSize: 74,
                letterSpacing: 0.5,
                lineHeight: 1.04,
                color: live ? THEME.accent : spoken ? THEME.ink : THEME.inkSoft,
                textTransform: "uppercase",
                WebkitTextStroke: live ? "0px" : undefined,
              }}
            >
              {w.t}
            </span>
          );
        })}
      </div>
    </div>
  );
};
