import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { THEME } from "../theme";

export type MarkKind = "circle" | "box" | "underline" | "arrow" | "none";

/** Hand-drawn red annotation that draws itself on. Sized to a box (w x h). */
export const Marker: React.FC<{
  kind: MarkKind;
  w: number;
  h: number;
  delay?: number;
  dur?: number;
  color?: string;
  stroke?: number;
}> = ({ kind, w, h, delay = 0, dur = 16, color = THEME.accent, stroke = 9 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (kind === "none") return null;

  const pad = 26;
  const W = w + pad * 2;
  const H = h + pad * 2;

  // rough, slightly irregular paths
  let d = "";
  if (kind === "circle") {
    const cx = W / 2,
      cy = H / 2,
      rx = W / 2 - 4,
      ry = H / 2 - 4;
    // an ellipse drawn as a path that overshoots ~1.08 turns for a sketchy look
    d = `M ${cx + rx} ${cy}
      C ${cx + rx} ${cy + ry * 0.6}, ${cx + rx * 0.5} ${cy + ry}, ${cx} ${cy + ry}
      C ${cx - rx * 0.55} ${cy + ry}, ${cx - rx} ${cy + ry * 0.5}, ${cx - rx} ${cy}
      C ${cx - rx} ${cy - ry * 0.6}, ${cx - rx * 0.5} ${cy - ry}, ${cx + 6} ${cy - ry}
      C ${cx + rx * 0.6} ${cy - ry}, ${cx + rx} ${cy - ry * 0.45}, ${cx + rx} ${cy - 2}`;
  } else if (kind === "box") {
    d = `M ${pad - 8} ${pad}
      L ${W - pad + 6} ${pad - 6}
      L ${W - pad} ${H - pad + 6}
      L ${pad - 6} ${H - pad}
      L ${pad - 10} ${pad - 2}`;
  } else if (kind === "underline") {
    const y = H - pad;
    d = `M ${pad - 6} ${y} C ${W * 0.3} ${y + 12}, ${W * 0.6} ${y - 10}, ${W - pad + 6} ${y + 4}`;
  } else if (kind === "arrow") {
    d = `M ${pad} ${H - pad} C ${W * 0.35} ${H * 0.5}, ${W * 0.6} ${pad + 10}, ${W - pad} ${pad}
       M ${W - pad} ${pad} L ${W - pad - 34} ${pad + 8}
       M ${W - pad} ${pad} L ${W - pad - 10} ${pad + 38}`;
  }

  const len = 2 * (W + H);
  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ position: "absolute", left: -pad, top: -pad, overflow: "visible", pointerEvents: "none" }}
    >
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: len,
          strokeDashoffset: len * (1 - p),
        }}
      />
    </svg>
  );
};
