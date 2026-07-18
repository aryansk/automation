import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

/**
 * Film-grain / paper-texture overlay using an SVG turbulence filter.
 * The seed shifts every couple of frames so the grain "boils" like real film.
 */
export const Grain: React.FC<{ opacity?: number; speed?: number }> = ({
  opacity = 0.12,
  speed = 2,
}) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / speed) % 50;
  return (
    <AbsoluteFill
      style={{
        opacity,
        mixBlendMode: "overlay",
        pointerEvents: "none",
      }}
    >
      <svg width="100%" height="100%">
        <filter id={`grain-${seed}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={2}
            seed={seed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Soft dark vignette for the photo scenes. */
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.7 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);
