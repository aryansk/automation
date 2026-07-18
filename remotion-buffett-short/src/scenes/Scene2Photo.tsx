import React from "react";
import { AbsoluteFill } from "remotion";
import { Grain, Vignette } from "../components/Grain";
import { BoldWords } from "../components/BoldText";
import { KaraokeCaptions } from "../components/Captions";
import { SceneWrap, KenBurns, SceneProps } from "../components/Stage";

/** Buffett portrait: "but he won't spend it". */
export const Scene2Photo: React.FC<SceneProps> = ({ from, dur, words }) => {
  return (
    <SceneWrap from={from} dur={dur} bg="#120c05">
      <KenBurns src="img/buffett1.jpg" from={from} dur={dur} focusY="20%" fromScale={1.04} toScale={1.16} />
      <Vignette strength={0.85} />
      <AbsoluteFill
        style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 300 }}
      >
        <BoldWords
          lines={["BUT HE WON'T", "SPEND IT"]}
          color="#ffce1f"
          fontSize={104}
          startFrame={from + 6}
          stagger={6}
        />
      </AbsoluteFill>
      <KaraokeCaptions words={words} highlightColor="#ffce1f" bottom={170} />
      <Grain opacity={0.16} />
    </SceneWrap>
  );
};
