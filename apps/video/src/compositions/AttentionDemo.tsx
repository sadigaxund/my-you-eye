import React from "react";
import { MotionRoot, Spotlight, Pulse, Shake, Ripple, Trace, Draw } from "my-you-eye/motion";
import { RemotionDriver } from "my-you-eye/motion/remotion";

const PATH = "M5,40 C 50,5 150,5 195,40";

export const AttentionDemo: React.FC = () => (
  <MotionRoot mode="video" driver={RemotionDriver}>
    <div
      style={{
        width: 1920,
        height: 1080,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: 48,
        backgroundColor: "#0f172a",
        color: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      <Spotlight focus={{ x: 40, y: 20, width: 120, height: 60 }} duration={60}>
        <div style={{ display: "flex", gap: 16, padding: 16 }}>
          <div style={{ width: 120, height: 60, background: "#334155", borderRadius: 8 }} />
          <div style={{ width: 120, height: 60, background: "#38bdf8", borderRadius: 8 }} />
        </div>
      </Spotlight>
      <Pulse duration={30}>
        <div style={{ width: 100, height: 100, borderRadius: 16, background: "#38bdf8" }} />
      </Pulse>
      <Shake axis="x" duration={45}>
        <div style={{ padding: "16px 32px", background: "#ef4444", borderRadius: 8, fontSize: 28 }}>Error!</div>
      </Shake>
      <div style={{ position: "relative", width: 160, height: 160 }}>
        <Ripple x={80} y={80} duration={45} />
      </div>
      <svg width={380} height={140} viewBox="0 0 200 80">
        <Draw d={PATH} viewBox="0 0 200 80" color="muted" duration={1} />
        <Trace d={PATH} viewBox="0 0 200 80" count={2} duration={60} />
      </svg>
    </div>
  </MotionRoot>
);
