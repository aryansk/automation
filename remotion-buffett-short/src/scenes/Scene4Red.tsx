import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from "remotion";
import { Grain } from "../components/Grain";
import { BoldWords } from "../components/BoldText";
import { KaraokeCaptions } from "../components/Captions";
import { SceneWrap, SceneProps } from "../components/Stage";

/** Market-crash chart on alarm-red: "the market crashed". */
export const Scene4Red: React.FC<SceneProps> = ({ from, dur, words }) => {
  const frame = useCurrentFrame();
  const local = frame - from;
  const chartShift = interpolate(local, [0, dur], [10, -20], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <SceneWrap from={from} dur={dur} bg="#9c1010">
      <AbsoluteFill
        style={{
          background: "radial-gradient(circle at 50% 45%, #d62121 0%, #7c0c0c 100%)",
        }}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <Img
          src={staticFile("img/crash.png")}
          style={{
            width: "94%",
            transform: `translateY(${chartShift}px)`,
            opacity: 0.92,
            filter: "drop-shadow(0 14px 30px rgba(0,0,0,0.5)) saturate(0.2) brightness(1.3)",
            mixBlendMode: "screen",
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 180 }}
      >
        <BoldWords
          lines={["THE MARKET", "CRASHED"]}
          color="#ffe14d"
          fontSize={108}
          startFrame={from + 6}
          stagger={6}
        />
      </AbsoluteFill>
      <KaraokeCaptions words={words} highlightColor="#ffe14d" bottom={190} />
      <Grain opacity={0.16} />
    </SceneWrap>
  );
};
