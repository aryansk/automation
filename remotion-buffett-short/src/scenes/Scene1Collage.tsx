import React from "react";
import { AbsoluteFill } from "remotion";
import { Grain } from "../components/Grain";
import { KaraokeCaptions } from "../components/Captions";
import { BoldWords } from "../components/BoldText";
import { SceneWrap, KenBurns, SceneProps } from "../components/Stage";

/** Intro: pile of cash, headline reveal. */
export const Scene1Collage: React.FC<SceneProps> = ({ from, dur, words }) => {
  return (
    <SceneWrap from={from} dur={dur} bg="#0a0a08">
      <KenBurns src="img/cash2.jpg" from={from} dur={dur} focusY="60%" />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.75) 100%)",
        }}
      />
      <AbsoluteFill
        style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 150 }}
      >
        <BoldWords
          lines={["A RECORD", "PILE OF CASH"]}
          color="#ffe04d"
          fontSize={104}
          startFrame={from + 8}
          stagger={6}
        />
      </AbsoluteFill>
      <KaraokeCaptions words={words} highlightColor="#ffe04d" bottom={210} />
      <Grain opacity={0.14} />
    </SceneWrap>
  );
};
