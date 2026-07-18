import React from "react";
import { THEME } from "../theme";

/** Persistent channel brand mark: red asterisk + handle, top-left. */
export const Brand: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: 50,
        left: 60,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span style={{ color: THEME.accent, fontFamily: THEME.sans, fontWeight: 900, fontSize: 38, lineHeight: 1 }}>
        ✱
      </span>
      <span
        style={{
          fontFamily: THEME.sans,
          fontWeight: 700,
          fontSize: 19,
          letterSpacing: 1,
          color: THEME.ink,
        }}
      >
        QuietArgumentError
      </span>
    </div>
  );
};
