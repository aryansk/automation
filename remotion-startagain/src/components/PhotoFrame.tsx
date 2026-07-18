import React from "react";
import { Img, staticFile, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../theme";

export type PhotoDef = {
  src: string; // file under photos/
  ar: number; // width/height
  x: number; // centre %
  y: number;
  h: number; // frame box height px
  rot?: number;
};

/** A full photo shown as a taped print: white border, drop shadow, slight tilt. */
export const PhotoFrame: React.FC<PhotoDef> = ({ src, ar, x, y, h, rot = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 15, mass: 0.8, stiffness: 130 } });
  const sc = interpolate(enter, [0, 1], [0.86, 1]);
  const yo = interpolate(enter, [0, 1], [36, 0]);
  const rEnter = interpolate(enter, [0, 1], [rot - 4, rot]);
  const float = Math.sin((frame / 150) * Math.PI * 2) * 5;

  const boxW = h * Math.min(1.35, Math.max(0.72, ar));
  const border = 16;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%,-50%) translateY(${yo + float}px) rotate(${rEnter}deg) scale(${sc})`,
        opacity: enter,
        background: "#fff",
        padding: `${border}px ${border}px ${border + 6}px`,
        boxShadow: "0 24px 34px rgba(20,20,20,0.22)",
        willChange: "transform",
      }}
    >
      <div style={{ width: boxW, height: h, overflow: "hidden", background: THEME.paper2 }}>
        <Img
          src={staticFile(`photos/${src}`)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
      {/* a strip of red 'tape' at the top */}
      <div
        style={{
          position: "absolute",
          top: -14,
          left: "50%",
          width: 116,
          height: 30,
          background: "rgba(237,28,36,0.78)",
          transform: "translateX(-50%) rotate(-3deg)",
        }}
      />
    </div>
  );
};
