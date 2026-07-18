import React from "react";
import {
  Img,
  staticFile,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Marker, MarkKind } from "./Marker";

export type CutoutDef = {
  src: string;
  x: number; // centre %
  y: number; // centre %
  h: number; // px
  rot?: number;
  delay?: number;
  floatA?: number;
  floatT?: number;
  shake?: number;
  mark?: MarkKind;
  flip?: boolean;
};

export const Cutout: React.FC<CutoutDef> = ({
  src,
  x,
  y,
  h,
  rot = 0,
  delay = 0,
  floatA = 10,
  floatT = 130,
  shake = 0,
  mark = "none",
  flip = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - delay;

  // snappy entrance
  const enter = spring({ frame: t, fps, config: { damping: 13, mass: 0.7, stiffness: 150 } });
  const scale = interpolate(enter, [0, 1], [0.7, 1]);
  const appearY = interpolate(enter, [0, 1], [40, 0]);
  const rotEnter = interpolate(enter, [0, 1], [rot - 7, rot]);

  const floatY = Math.sin((t / floatT) * Math.PI * 2) * floatA;
  let shakeR = 0;
  if (shake > 0) {
    const burst = (Math.sin((t / 40) * Math.PI * 2) + 1) / 2;
    shakeR = Math.sin(t * 1.5) * shake * burst;
  }

  // approximate rendered width to size the marker box
  const w = h * 0.9;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) translateY(${appearY + floatY}px) rotate(${
          rotEnter + shakeR
        }deg) scale(${scale})`,
        opacity: enter,
        filter: "drop-shadow(0 22px 26px rgba(20,20,20,0.18))",
        willChange: "transform",
      }}
    >
      <div style={{ position: "relative", width: w, height: h }}>
        <Img
          src={staticFile(src)}
          style={{
            height: h,
            width: "auto",
            display: "block",
            margin: "0 auto",
            transform: flip ? "scaleX(-1)" : undefined,
          }}
        />
        <Marker kind={mark} w={w} h={h} delay={delay + 8} />
      </div>
    </div>
  );
};
