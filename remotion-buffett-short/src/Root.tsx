import React from "react";
import { Composition } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { Short, SHORT_DURATION } from "./Short";
import { SampleShort, SAMPLE_DURATION } from "./sample/SampleShort";
import { NewsShort, NEWS_DURATION } from "./news/NewsShort";

loadAnton();
loadPlayfair();
loadInter();

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Short"
        component={Short}
        durationInFrames={SHORT_DURATION}
        fps={30}
        width={720}
        height={1280}
      />
      <Composition
        id="Sample"
        component={SampleShort}
        durationInFrames={SAMPLE_DURATION}
        fps={30}
        width={720}
        height={1280}
      />
      <Composition
        id="News"
        component={NewsShort}
        durationInFrames={NEWS_DURATION}
        fps={30}
        width={720}
        height={1280}
      />
    </>
  );
};
