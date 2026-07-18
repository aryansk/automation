import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Word } from "./Captions";

export type SceneProps = { from: number; dur: number; words: Word[] };

/** Fades a scene in/out at the edges of its absolute frame window. */
export const SceneWrap: React.FC<
  React.PropsWithChildren<{ from: number; dur: number; bg?: string }>
> = ({ from, dur, bg = "#000", children }) => {
  const frame = useCurrentFrame();
  const local = frame - from;
  const opacity = interpolate(
    local,
    [0, 6, dur - 6, dur],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  if (local < -2 || local > dur + 2) return null;
  return (
    <AbsoluteFill style={{ opacity, backgroundColor: bg }}>{children}</AbsoluteFill>
  );
};

/** Full-bleed photo with a slow ken-burns zoom keyed to the scene window. */
export const KenBurns: React.FC<{
  src: string;
  from: number;
  dur: number;
  fromScale?: number;
  toScale?: number;
  focusY?: string;
}> = ({ src, from, dur, fromScale = 1.06, toScale = 1.2, focusY = "center" }) => {
  const frame = useCurrentFrame();
  const local = frame - from;
  const scale = interpolate(local, [0, dur], [fromScale, toScale], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `center ${focusY}`,
          transform: `scale(${scale})`,
        }}
      />
    </AbsoluteFill>
  );
};
