import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export type Word = { text: string; startF: number; endF: number };

/**
 * Word-by-word "karaoke" captions on a dark rounded pill. Timings are absolute
 * composition frames (matched to the narration audio).
 */
export const KaraokeCaptions: React.FC<{
  words: Word[];
  highlightColor?: string;
  bottom?: number;
}> = ({ words, highlightColor = "#ffd400", bottom = 170 }) => {
  const frame = useCurrentFrame();
  const visible = words.filter((w) => frame >= w.startF - 2);
  if (visible.length === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom,
        display: "flex",
        justifyContent: "center",
        padding: "0 40px",
      }}
    >
      <div
        style={{
          background: "rgba(15,15,18,0.92)",
          borderRadius: 18,
          padding: "14px 26px",
          display: "flex",
          flexWrap: "wrap",
          gap: "0 14px",
          justifyContent: "center",
          maxWidth: 620,
          boxShadow: "0 8px 30px rgba(0,0,0,0.45)",
        }}
      >
        {visible.map((w, i) => {
          const active = frame >= w.startF && frame <= w.endF + 4;
          return (
            <span
              key={i}
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 800,
                fontSize: 44,
                lineHeight: 1.05,
                letterSpacing: -0.5,
                color: active ? highlightColor : "#ffffff",
                transform: active ? "scale(1.05)" : "scale(1)",
                display: "inline-block",
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Spring pop-in keyed to an absolute start frame. */
export const usePop = (startFrame: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 120 },
  });
  return {
    scale: interpolate(s, [0, 1], [0.6, 1]),
    opacity: interpolate(s, [0, 1], [0, 1]),
    s,
  };
};
