import React from "react";
import { spring, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../theme";

/** The QAE red asterisk ✱ — slams in and slowly rotates. */
export const Asterisk: React.FC<{
  x: number; // %
  y: number; // %
  size: number;
  delay?: number;
  color?: string;
  spin?: number; // deg per 100 frames
}> = ({ x, y, size, delay = 0, color = THEME.accent, spin = 8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - delay;
  const enter = spring({ frame: t, fps, config: { damping: 11, mass: 0.6, stiffness: 140 } });
  const scale = interpolate(enter, [0, 1], [0, 1]);
  const rot = (t * spin) / 100;
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%,-50%) scale(${scale}) rotate(${rot}deg)`,
        color,
        fontFamily: THEME.sans,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        opacity: enter,
      }}
    >
      ✱
    </div>
  );
};
