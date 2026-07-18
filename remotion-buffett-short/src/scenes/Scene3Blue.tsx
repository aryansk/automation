import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from "remotion";
import { Grain } from "../components/Grain";
import { KaraokeCaptions } from "../components/Captions";
import { SceneWrap, SceneProps } from "../components/Stage";

const SerifLine: React.FC<{ pre: string; num: string; startFrame: number }> = ({
  pre,
  num,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - startFrame, fps, config: { damping: 13 } });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        opacity: s,
        transform: `translateX(${(1 - s) * -40}px)`,
      }}
    >
      <span
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 130,
          fontWeight: 700,
          color: "#eef0e8",
        }}
      >
        {pre}
      </span>
      <span
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 120,
          fontWeight: 800,
          color: "#f6a8e0",
          background: "#1f5e2a",
          border: "5px solid #103a18",
          padding: "2px 26px",
          transform: `rotate(-1deg) scale(${0.8 + s * 0.2})`,
          boxShadow: "0 10px 0 rgba(0,0,0,0.25)",
        }}
      >
        {num}
      </span>
    </div>
  );
};

/** Blue serif "1999 / 2007" highlight-box scene. */
export const Scene3Blue: React.FC<SceneProps> = ({ from, dur, words }) => {
  return (
    <SceneWrap from={from} dur={dur} bg="#2f49c6">
      <AbsoluteFill
        style={{
          background: "radial-gradient(circle at 50% 40%, #4159d6 0%, #263da8 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 18,
          flexDirection: "column",
        }}
      >
        <SerifLine pre="In" num="1999" startFrame={from + 8} />
        <SerifLine pre="And" num="2007" startFrame={from + 22} />
      </AbsoluteFill>
      <KaraokeCaptions words={words} highlightColor="#f6a8e0" bottom={260} />
      <Grain opacity={0.18} />
    </SceneWrap>
  );
};
