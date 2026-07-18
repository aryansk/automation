import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { Scene1Collage } from "./scenes/Scene1Collage";
import { Scene2Photo } from "./scenes/Scene2Photo";
import { Scene3Blue } from "./scenes/Scene3Blue";
import { Scene4Red } from "./scenes/Scene4Red";
import { Scene5Outro } from "./scenes/Scene5Outro";
import timing from "./timing.json";

const COMPONENTS = [
  Scene1Collage,
  Scene2Photo,
  Scene3Blue,
  Scene4Red,
  Scene5Outro,
];

export const SHORT_DURATION = timing.total;

export const Short: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {timing.scenes.map((sc, i) => {
        const Cmp = COMPONENTS[i];
        return (
          <Cmp key={sc.n} from={sc.from} dur={sc.dur} words={sc.words} />
        );
      })}
      <Audio src={staticFile("audio/final_audio.wav")} />
    </AbsoluteFill>
  );
};
