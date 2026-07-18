import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { Paper } from "./components/Paper";
import { Scene, SceneDef } from "./components/Scene";
import { Brand } from "./components/Brand";
import { ArticleOverlay, ArticleDef } from "./components/ArticleCard";
import { THEME } from "./theme";
import timeline from "./timeline.json";

export const VIDEO_DURATION = timeline.total;
const SCENES = timeline.scenes as SceneDef[];
const AT = timeline.articles as { mark: number; leroy: number; apa: number };

// Real research that backs the essay — synced to where the narration says each.
const ARTICLES: ArticleDef[] = [
  {
    s: AT.mark + 0.3,
    dur: 5.4,
    label: "RESEARCH · UC IRVINE",
    source: "Gloria Mark — “The Cost of Interrupted Work” (2008)",
    parts: [{ t: "It takes " }, { t: "23 minutes", hl: true }, { t: " to refocus after an interruption." }],
    logo: "uci.png",
  },
  {
    s: AT.leroy + 0.3,
    dur: 5.4,
    label: "STUDY · U. MINNESOTA",
    source: "Sophie Leroy — Organizational Behavior & Human Decision Processes (2009)",
    parts: [{ t: "Task-switching leaves " }, { t: "attention residue", hl: true }, { t: " that drags down focus." }],
    logo: "umn.png",
  },
  {
    s: AT.apa + 0.2,
    dur: 5.2,
    label: "RESEARCH · APA",
    source: "American Psychological Association — “Multitasking: Switching Costs”",
    parts: [{ t: "Switching tasks can cost up to " }, { t: "40%", hl: true }, { t: " of productive time." }],
    logo: "apa.png",
  },
];

export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: THEME.paper }}>
      <Paper />
      {SCENES.map((sc, i) => (
        <Scene key={i} scene={sc} index={i} />
      ))}
      <ArticleOverlay articles={ARTICLES} />
      <Brand />
      <Audio src={staticFile("audio/final_audio.wav")} />
      <Audio src={staticFile("audio/bgm.wav")} volume={0.13} />
    </AbsoluteFill>
  );
};
