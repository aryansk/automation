import React from "react";
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { Lottie, LottieAnimationData } from "@remotion/lottie";
import { Grain, Vignette } from "../components/Grain";
import { KaraokeCaptions, Word } from "../components/Captions";
import { BoldWords } from "../components/BoldText";
import { SceneWrap } from "../components/Stage";
import timing from "./timing.json";

import coins from "./lottie/coins.json";
import confetti from "./lottie/confetti.json";
import crash from "./lottie/crash.json";
import rings from "./lottie/rings.json";
import ringsPink from "./lottie/rings-pink.json";
import sparkles from "./lottie/sparkles.json";

export const SAMPLE_DURATION = timing.total;

type SP = { from: number; dur: number; words: Word[] };

/** Full-bleed Lottie overlay (procedurally generated with python-lottie). */
const Fx: React.FC<{
  data: unknown;
  opacity?: number;
  blend?: React.CSSProperties["mixBlendMode"];
}> = ({ data, opacity = 1, blend }) => (
  <AbsoluteFill style={{ opacity, mixBlendMode: blend, pointerEvents: "none" }}>
    <Lottie animationData={data as LottieAnimationData} loop />
  </AbsoluteFill>
);

/** Scene 1 — gold "money" gradient, big dollar headline. */
const S1: React.FC<SP> = ({ from, dur, words }) => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame - from, [0, dur], [0, -30], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <SceneWrap from={from} dur={dur} bg="#2a1d04">
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 38%, #f6b41a 0%, #c8830d 45%, #5e3c05 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0 14px, transparent 14px 40px)",
          transform: `translateY(${drift}px)`,
        }}
      />
      <Vignette strength={0.6} />
      <Fx data={coins} opacity={0.95} />
      <Fx data={sparkles} opacity={0.5} blend="screen" />
      <AbsoluteFill
        style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 170 }}
      >
        <BoldWords
          lines={["$300", "EVERY MONTH"]}
          color="#fff7e0"
          outline="rgba(60,30,0,0.5)"
          fontSize={108}
          startFrame={from + 8}
          stagger={6}
        />
      </AbsoluteFill>
      <KaraokeCaptions words={words} highlightColor="#ffe04d" bottom={210} />
      <Grain opacity={0.16} />
    </SceneWrap>
  );
};

/** Scene 2 — dark, "most people wait too long". */
const S2: React.FC<SP> = ({ from, dur, words }) => (
  <SceneWrap from={from} dur={dur} bg="#0d0b07">
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 55%, #241a0c 0%, #07060a 100%)",
      }}
    />
    <Vignette strength={0.85} />
    <Fx data={sparkles} opacity={0.35} blend="screen" />
    <AbsoluteFill
      style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 300 }}
    >
      <BoldWords
        lines={["MOST WAIT", "TOO LONG"]}
        color="#ffce1f"
        fontSize={106}
        startFrame={from + 6}
        stagger={6}
      />
    </AbsoluteFill>
    <KaraokeCaptions words={words} highlightColor="#ffce1f" bottom={170} />
    <Grain opacity={0.17} />
  </SceneWrap>
);

/** Reused blue-serif highlight-box line (from the original Scene3Blue). */
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
          fontSize: 96,
          fontWeight: 700,
          color: "#eef0e8",
        }}
      >
        {pre}
      </span>
      <span
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 104,
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

/** Scene 3 — blue serif "10 yrs / $400K". */
const S3: React.FC<SP> = ({ from, dur, words }) => (
  <SceneWrap from={from} dur={dur} bg="#2f49c6">
    <AbsoluteFill
      style={{ background: "radial-gradient(circle at 50% 40%, #4159d6 0%, #263da8 100%)" }}
    />
    <Fx data={ringsPink} opacity={0.6} blend="screen" />
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        gap: 18,
        flexDirection: "column",
      }}
    >
      <SerifLine pre="Just" num="10 YRS" startFrame={from + 8} />
      <SerifLine pre="Costs" num="$400K" startFrame={from + 22} />
    </AbsoluteFill>
    <KaraokeCaptions words={words} highlightColor="#f6a8e0" bottom={260} />
    <Grain opacity={0.18} />
  </SceneWrap>
);

/** Scene 4 — alarm red, "blame compounding". */
const S4: React.FC<SP> = ({ from, dur, words }) => (
  <SceneWrap from={from} dur={dur} bg="#9c1010">
    <AbsoluteFill
      style={{ background: "radial-gradient(circle at 50% 45%, #d62121 0%, #7c0c0c 100%)" }}
    />
    <Fx data={crash} opacity={0.9} />
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", paddingBottom: 60 }}
    >
      <BoldWords
        lines={["NOT SAVING.", "COMPOUNDING."]}
        color="#ffe14d"
        fontSize={100}
        startFrame={from + 6}
        stagger={6}
      />
    </AbsoluteFill>
    <KaraokeCaptions words={words} highlightColor="#ffe14d" bottom={190} />
    <Grain opacity={0.16} />
  </SceneWrap>
);

/** Scene 5 — outro, "start today". */
const S5: React.FC<SP> = ({ from, dur, words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulse = spring({ frame: frame - from - 6, fps, config: { damping: 9 } });
  return (
    <SceneWrap from={from} dur={dur} bg="#07140d">
      <AbsoluteFill
        style={{ background: "radial-gradient(circle at 50% 42%, #12613a 0%, #04140c 100%)" }}
      />
      <Vignette strength={0.75} />
      <Fx data={confetti} opacity={0.95} />
      <Fx data={sparkles} opacity={0.5} blend="screen" />
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <div style={{ transform: `scale(${0.96 + pulse * 0.04})` }}>
          <BoldWords
            lines={["START", "TODAY"]}
            color="#ffffff"
            fontSize={128}
            startFrame={from + 6}
            stagger={6}
          />
        </div>
      </AbsoluteFill>
      <KaraokeCaptions words={words} highlightColor="#54e08a" bottom={180} />
      <Grain opacity={0.15} />
    </SceneWrap>
  );
};

const COMPONENTS = [S1, S2, S3, S4, S5];

export const SampleShort: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {timing.scenes.map((sc, i) => {
        const Cmp = COMPONENTS[i];
        return <Cmp key={sc.n} from={sc.from} dur={sc.dur} words={sc.words as Word[]} />;
      })}
      <Audio src={staticFile("audio/sample_audio.wav")} />
    </AbsoluteFill>
  );
};
