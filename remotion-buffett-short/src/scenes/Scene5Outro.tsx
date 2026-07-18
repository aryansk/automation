import React from "react";
import { AbsoluteFill } from "remotion";
import { Grain, Vignette } from "../components/Grain";
import { BoldWords } from "../components/BoldText";
import { KaraokeCaptions } from "../components/Captions";
import { SceneWrap, KenBurns, SceneProps } from "../components/Stage";

/** Outro question over a Buffett portrait. */
export const Scene5Outro: React.FC<SceneProps> = ({ from, dur, words }) => {
  return (
    <SceneWrap from={from} dur={dur} bg="#0c0c0e">
      <KenBurns src="img/buffett2.jpg" from={from} dur={dur} focusY="25%" fromScale={1.1} toScale={1.24} />
      <Vignette strength={0.8} />
      <AbsoluteFill
        style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 150 }}
      >
        <BoldWords
          lines={["WHAT DOES", "HE KNOW?"]}
          color="#ffffff"
          fontSize={112}
          startFrame={from + 6}
          stagger={6}
        />
      </AbsoluteFill>
      <KaraokeCaptions words={words} highlightColor="#ffe04d" bottom={180} />
      <Grain opacity={0.15} />
    </SceneWrap>
  );
};
