import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../theme";

export type HeadPart = { t: string; hl?: boolean };
export type ArticleDef = {
  s: number;
  dur: number; // seconds
  label: string;
  source: string;
  parts: HeadPart[];
  logo?: string; // file under logos/
};

const MARK = "#ffe14d"; // highlighter yellow

const Highlight: React.FC<{ children: React.ReactNode; on: boolean; p: number }> = ({ children, on, p }) => (
  <span style={{ position: "relative", display: "inline-block", padding: "0 6px" }}>
    {on && (
      <span
        style={{
          position: "absolute",
          left: 0,
          bottom: 4,
          width: "100%",
          height: "0.74em",
          background: MARK,
          transformOrigin: "left center",
          transform: `scaleX(${p})`,
          zIndex: 0,
          borderRadius: 2,
        }}
      />
    )}
    <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
  </span>
);

const Card: React.FC<{ a: ArticleDef }> = ({ a }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = Math.round(a.dur * fps);
  const enter = spring({ frame, fps, config: { damping: 16, mass: 0.7, stiffness: 130 } });
  const out = interpolate(frame, [dur - 8, dur - 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const vis = Math.min(enter, out);
  const y = interpolate(enter, [0, 1], [40, 0]);
  // highlighter wipe begins ~0.7s in
  const hp = interpolate(frame, [20, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: vis, zIndex: 100 }}>
      {/* scrim to focus on the citation */}
      <AbsoluteFill style={{ background: "rgba(255,255,255,0.94)" }} />
      <div
        style={{
          position: "relative",
          width: 1180,
          background: "#fff",
          border: `2px solid ${THEME.ink}`,
          boxShadow: "14px 16px 0 rgba(17,17,17,0.12)",
          padding: "44px 56px 40px",
          transform: `translateY(${y}px) rotate(-1.3deg)`,
        }}
      >
        {/* top tag row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: THEME.accent, fontFamily: THEME.sans, fontWeight: 900, fontSize: 26 }}>✱</span>
            <span style={{ fontFamily: THEME.sans, fontWeight: 800, fontSize: 19, letterSpacing: 3, color: THEME.accent }}>
              {a.label}
            </span>
          </span>
          {a.logo ? (
            <Img src={staticFile(`logos/${a.logo}`)} style={{ height: 78, width: "auto", display: "block" }} />
          ) : (
            <span style={{ fontFamily: THEME.sans, fontWeight: 700, fontSize: 15, letterSpacing: 1, color: THEME.inkSoft }}>
              PEER-REVIEWED
            </span>
          )}
        </div>
        {/* headline */}
        <div style={{ fontFamily: THEME.serif, fontWeight: 800, fontSize: 60, lineHeight: 1.16, color: THEME.ink }}>
          {a.parts.map((pt, i) =>
            pt.hl ? (
              <Highlight key={i} on p={hp}>
                {pt.t}
              </Highlight>
            ) : (
              <span key={i}>{pt.t}</span>
            )
          )}
        </div>
        {/* source */}
        <div
          style={{
            marginTop: 26,
            paddingTop: 18,
            borderTop: `1.5px solid ${THEME.paper2}`,
            fontFamily: THEME.sans,
            fontSize: 21,
            fontStyle: "italic",
            color: THEME.inkSoft,
          }}
        >
          {a.source}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ArticleOverlay: React.FC<{ articles: ArticleDef[] }> = ({ articles }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {articles.map((a, i) => (
        <Sequence key={i} from={Math.round(a.s * fps)} durationInFrames={Math.round(a.dur * fps)} layout="none">
          <Card a={a} />
        </Sequence>
      ))}
    </>
  );
};
