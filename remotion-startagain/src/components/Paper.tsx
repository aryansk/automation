import React from "react";
import { AbsoluteFill } from "remotion";
import { THEME } from "../theme";

/** Clean white background with a very faint grid — QAE thumbnail look. */
export const Paper: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: THEME.paper }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(#0000000a 1px, transparent 1px), linear-gradient(90deg, #0000000a 1px, transparent 1px)",
          backgroundSize: "120px 120px",
          opacity: 0.6,
        }}
      />
    </AbsoluteFill>
  );
};
