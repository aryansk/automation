import React from "react";
import { Img, staticFile, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export type AccentDef = {
  src: string; // file under collage/
  x: number; // %
  y: number; // %
  size: number; // px (max dim)
  rot?: number;
  delay?: number;
  spin?: number; // deg per 100 frames
  floatA?: number;
};

/** Scrapbook collage element on the white canvas via multiply blend (white drops out). */
export const CollageAccent: React.FC<AccentDef> = ({
  src,
  x,
  y,
  size,
  rot = 0,
  delay = 0,
  spin = 0,
  floatA = 8,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - delay;
  const enter = spring({ frame: t, fps, config: { damping: 12, mass: 0.6, stiffness: 150 } });
  const sc = interpolate(enter, [0, 1], [0.2, 1]);
  const r = rot + (t * spin) / 100;
  const fy = Math.sin((t / 110) * Math.PI * 2) * floatA;
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%,-50%) translateY(${fy}px) rotate(${r}deg) scale(${sc})`,
        opacity: enter,
        mixBlendMode: "multiply",
        willChange: "transform",
      }}
    >
      <Img src={staticFile(`collage/${src}`)} style={{ width: size, height: "auto", display: "block" }} />
    </div>
  );
};
