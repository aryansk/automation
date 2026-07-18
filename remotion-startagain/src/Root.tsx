import React from "react";
import { Composition } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { Video, VIDEO_DURATION } from "./Video";

loadAnton();
loadPlayfair();
loadInter();

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="StartAgain"
      component={Video}
      durationInFrames={VIDEO_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
