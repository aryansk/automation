import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Big bold "paper-cut" word reveal. Words pop in one at a time, slightly
 * rotated, with a hard drop-shadow — the chunky meme-caption look from the
 * red "THAT'S VERY HIGH" and dark "BUT HE IS NOT SPENDING IT" scenes.
 */
export const BoldWords: React.FC<{
  lines: string[];
  color?: string;
  outline?: string;
  fontSize?: number;
  stagger?: number;
  startFrame?: number;
}> = ({
  lines,
  color = "#ffd400",
  outline = "rgba(0,0,0,0.35)",
  fontSize = 120,
  stagger = 5,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        textAlign: "center",
      }}
    >
      {lines.map((line, li) => {
        const delay = startFrame + li * stagger;
        const s = spring({
          frame: frame - delay,
          fps,
          config: { damping: 11, mass: 0.5, stiffness: 140 },
        });
        const tilt = (li % 2 === 0 ? -1 : 1) * 2.2 * (1 - s);
        return (
          <span
            key={li}
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize,
              lineHeight: 0.92,
              color,
              transform: `scale(${0.7 + s * 0.3}) rotate(${tilt}deg)`,
              opacity: s,
              textShadow: `4px 6px 0 ${outline}`,
              WebkitTextStroke: `2px rgba(0,0,0,0.25)`,
              letterSpacing: 1,
            }}
          >
            {line}
          </span>
        );
      })}
    </div>
  );
};
