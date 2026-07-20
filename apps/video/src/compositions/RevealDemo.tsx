import React from "react";
import { Reveal } from "@lib/motion";

export const RevealDemo: React.FC = () => (
  <div
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: 1920,
      height: 1080,
      backgroundColor: "#1a1a2e",
      color: "#e0e0e0",
      fontFamily: "sans-serif",
    }}
  >
    <Reveal direction="up" delay={0}>
      <h1 style={{ fontSize: 72, margin: 0 }}>Reveal Animation</h1>
    </Reveal>
    <Reveal direction="left" delay={10}>
      <h2 style={{ fontSize: 48, margin: "20px 0 0 0", fontWeight: 400 }}>
        Staggered Entrance
      </h2>
    </Reveal>
    <Reveal direction="right" delay={20}>
      <p style={{ fontSize: 28, margin: "30px 0 0 0", opacity: 0.7 }}>
        Each element animates in with a configurable delay, direction, and duration.
      </p>
    </Reveal>
    <Reveal direction="up" delay={30}>
      <div
        style={{
          marginTop: 40,
          padding: "20px 40px",
          border: "2px solid #e94560",
          borderRadius: 8,
          fontSize: 24,
        }}
      >
        Frame-driven animation with Remotion
      </div>
    </Reveal>
  </div>
);
