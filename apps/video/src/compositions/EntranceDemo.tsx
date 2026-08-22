import React from "react";
import { MotionRoot, Wipe, Unmask, Camera, Draw } from "my-you-eye/motion";
import { RemotionDriver } from "my-you-eye/motion/remotion";

const PATH = "M10,80 C 60,10 140,10 190,80";

const panel: React.CSSProperties = {
  width: 380,
  height: 200,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#4361ee",
  borderRadius: 16,
  fontSize: 36,
  fontWeight: 700,
  color: "#fff",
};

export const EntranceDemo: React.FC = () => (
  <MotionRoot mode="video" driver={RemotionDriver}>
    <div
      style={{
        width: 1920,
        height: 1080,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        backgroundColor: "#1a1a2e",
        color: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      <Wipe direction="left" duration={40}>
        <div style={panel}>Wipe left</div>
      </Wipe>
      <Wipe variant="radial" direction="up" duration={40} delay={20}>
        <div style={panel}>Wipe radial</div>
      </Wipe>
      <Unmask direction="up" duration={40} delay={40}>
        <h1 style={{ fontSize: 56, margin: 0 }}>Unmask heading</h1>
      </Unmask>
      <svg width={380} height={160} viewBox="0 0 200 90">
        <Draw d={PATH} viewBox="0 0 200 90" duration={60} delay={60} color="success" />
      </svg>
      <div style={{ width: 500, height: 200 }}>
        <Camera keyframes={[{ at: 90, focus: { x: 0, y: 0, width: 500, height: 200 } }, { at: 150, focus: { x: 100, y: 50, width: 200, height: 100 } }]}>
          <div style={{ ...panel, width: 500, height: 200 }}>Camera focus</div>
        </Camera>
      </div>
    </div>
  </MotionRoot>
);
