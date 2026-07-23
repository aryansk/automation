import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, interpolate, spring } from "remotion";
import { Grain, Vignette } from "../components/Grain";
import { KaraokeCaptions, Word } from "../components/Captions";
import { SceneWrap, SceneProps } from "../components/Stage";
import timing from "./timing.json";

// Country coordinates on the globe image (as percentages from top-left)
// [x, y] where x is horizontal (0-100) and y is vertical (0-100)
const COUNTRY_COORDS: { [key: string]: [number, number] } = {
  "UK": [58, 38],
  "China": [78, 45],
  "US": [25, 40],
  "Qatar": [68, 58],
};

// Story images for side cards
const STORY_IMAGES: { [key: number]: string } = {
  1: "img/story_uk.png",
  2: "img/story_streaming.png",
  3: "img/story_uk.png",
  4: "img/story_datacenter.png",
  5: "img/story_ai.png",
  6: "img/story_datacenter.png",
};

const STORY_TITLES: { [key: number]: string } = {
  1: "AI MINISTER / BOOSTED BUT AXED",
  2: "WEBSITES / SHUT DOWN",
  3: "OFCOM / STUCK",
  4: "ALIEXPRESS / FINED €550M",
  5: "MOONSHOT AI / KIMI K3",
  6: "TRUMP MEDIA / PAID FEED",
};

const STORY_COLORS: { [key: number]: string } = {
  1: "#ffe04d",
  2: "#ff6b6b",
  3: "#4fc3f7",
  4: "#ffce1f",
  5: "#f6a8e0",
  6: "#54e08a",
};

const STORY_COUNTRIES: { [key: number]: string } = {
  1: "UK",
  2: "Qatar",
  3: "UK",
  4: "China",
  5: "China",
  6: "US",
};

/** Globe scene: zooms into a specific country, shows side card with image. */
const GlobeScene: React.FC<SceneProps & { storyN: number }> = ({ from, dur, words, storyN }) => {
  const frame = useCurrentFrame();
  const local = frame - from;
  const country = STORY_COUNTRIES[storyN];
  const coords = COUNTRY_COORDS[country] || [50, 50];
  const color = STORY_COLORS[storyN] || "#4fc3f7";
  const headline = STORY_TITLES[storyN] || "";
  const storyImg = STORY_IMAGES[storyN] || "img/story_uk.png";

  // Zoom animation: start wide, zoom into country
  // Phase 1 (0-30 frames): zoom in
  // Phase 2 (30-dur-30): hold on country
  // Phase 3 (dur-30 to dur): zoom out
  const zoomProgress = interpolate(local, [0, 30, dur - 30, dur], [1, 2.2, 2.2, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pan to country center
  const targetX = coords[0];
  const targetY = coords[1];
  const panX = interpolate(local, [0, 30, dur - 30, dur], [50, targetX, targetX, 50], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const panY = interpolate(local, [0, 30, dur - 30, dur], [50, targetY, targetY, 50], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Side card slide-in animation
  const cardSlideProgress = spring({
    frame: frame - (from + 20),
    fps: 30,
    config: { damping: 15, mass: 0.8, stiffness: 100 },
  });
  const cardTranslateX = interpolate(cardSlideProgress, [0, 1], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Marker pulse
  const markerPulse = Math.abs(Math.sin((local * 0.1) % Math.PI)) * 0.3 + 0.7;

  return (
    <SceneWrap from={from} dur={dur} bg="#000">
      {/* Globe background */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            transform: `scale(${zoomProgress}) translate(${panX - 50}%, ${panY - 50}%)`,
            transformOrigin: "center",
          }}
        >
          <img
            src={staticFile("img/globe.png")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "brightness(0.8) contrast(1.1)",
            }}
          />
        </div>

        {/* Country marker */}
        {local > 25 && local < dur - 10 && (
          <div
            style={{
              position: "absolute",
              left: `${targetX}%`,
              top: `${targetY}%`,
              transform: "translate(-50%, -50%)",
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${color}, transparent)`,
              boxShadow: `0 0 20px 8px ${color}40`,
              opacity: markerPulse,
              zIndex: 10,
            }}
          />
        )}
      </AbsoluteFill>

      {/* Side card with image */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "flex-start",
          padding: "60px 30px",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "280px",
            transform: `translateX(${cardTranslateX}%)`,
            opacity: cardSlideProgress,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "200px",
              borderRadius: "12px",
              overflow: "hidden",
              marginBottom: "12px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
            }}
          >
            <img
              src={staticFile(storyImg)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
          <div
            style={{
              background: "rgba(15,15,18,0.92)",
              borderRadius: "12px",
              padding: "16px 20px",
              backdropFilter: "blur(10px)",
            }}
          >
            <div
              style={{
                fontFamily: "'Anton', sans-serif",
                fontSize: "28px",
                lineHeight: 1.2,
                color: color,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: "6px",
              }}
            >
              {headline.split(" / ")[0]}
            </div>
            <div
              style={{
                fontFamily: "'Anton', sans-serif",
                fontSize: "22px",
                lineHeight: 1.2,
                color: "#ffffff",
                textTransform: "uppercase",
              }}
            >
              {headline.split(" / ")[1]}
            </div>
            <div
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                color: "#aaa",
                marginTop: "8px",
              }}
            >
              {country}
            </div>
          </div>
        </div>
      </AbsoluteFill>

      {/* Captions */}
      <KaraokeCaptions words={words} highlightColor={color} bottom={180} />
      <Grain opacity={0.12} />
    </SceneWrap>
  );
};

/** Intro scene with the globe and title. */
const GlobeIntro: React.FC<SceneProps> = ({ from, dur, words }) => {
  const frame = useCurrentFrame();
  const local = frame - from;

  const zoomProgress = interpolate(local, [0, 30, dur - 30, dur], [3, 1, 1, 3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneWrap from={from} dur={dur} bg="#000">
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            transform: `scale(${zoomProgress})`,
            transformOrigin: "center",
          }}
        >
          <img
            src={staticFile("img/globe.png")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "brightness(0.7) contrast(1.2)",
            }}
          />
        </div>
        <AbsoluteFill
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.9) 100%)",
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <div
          style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: "72px",
            color: "#4fc3f7",
            textTransform: "uppercase",
            textAlign: "center",
            textShadow: "0 0 30px rgba(79,195,247,0.5)",
            letterSpacing: 3,
          }}
        >
          TECH NEWS BRIEF
        </div>
      </AbsoluteFill>

      <KaraokeCaptions words={words} highlightColor="#4fc3f7" bottom={260} />
      <Grain opacity={0.14} />
    </SceneWrap>
  );
};

/** Outro scene. */
const GlobeOutro: React.FC<SceneProps> = ({ from, dur, words }) => {
  return (
    <SceneWrap from={from} dur={dur} bg="#000">
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            transform: "scale(1.5)",
            opacity: 0.5,
          }}
        >
          <img
            src={staticFile("img/globe.png")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "brightness(0.5) contrast(1.3)",
            }}
          />
        </div>
        <AbsoluteFill
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.95) 100%)",
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <div
          style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: "64px",
            color: "#4fc3f7",
            textTransform: "uppercase",
            textAlign: "center",
            textShadow: "0 0 30px rgba(79,195,247,0.5)",
            letterSpacing: 3,
          }}
        >
          THANK YOU FOR WATCHING
        </div>
      </AbsoluteFill>

      <KaraokeCaptions words={words} highlightColor="#4fc3f7" bottom={240} />
      <Grain opacity={0.13} />
    </SceneWrap>
  );
};

// Build the component list from timing scenes
const sceneComponents: { [key: number]: React.FC<SceneProps> } = {};

// Scene 1: Intro
sceneComponents[1] = (p: SceneProps) => <GlobeIntro {...p} />;

// Scenes 2-12: Story scenes (6 stories x 2 scenes each = headline + detail)
// Scene 2,3 = story 1; Scene 4,5 = story 2; etc.
for (let sceneN = 2; sceneN <= 12; sceneN++) {
  const storyN = Math.floor((sceneN - 2) / 2) + 1;
  sceneComponents[sceneN] = (p: SceneProps) => <GlobeScene {...p} storyN={storyN} />;
}

// Scene 13: Outro
sceneComponents[13] = (p: SceneProps) => <GlobeOutro {...p} />;

export const NEWS_DURATION = timing.total;

export const NewsShort: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {timing.scenes.map((sc) => {
        const Cmp = sceneComponents[sc.n] || GlobeIntro;
        return <Cmp key={sc.n} from={sc.from} dur={sc.dur} words={sc.words as Word[]} />;
      })}
      <Audio src={staticFile("audio/news_audio.wav")} />
    </AbsoluteFill>
  );
};
