import React from "react";
import { MotionRoot, Morph, Cursor, Beat, Reveal } from "my-you-eye/motion";
import { RemotionDriver } from "my-you-eye/motion/remotion";

export const StructuralDemo: React.FC = () => (
  <MotionRoot mode="video" driver={RemotionDriver}>
    <div
      style={{
        width: 1920,
        height: 1080,
        position: "relative",
        backgroundColor: "#0f172a",
        color: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ position: "relative", width: 600, height: 300, margin: "0 auto" }}>
        <Morph from={{ x: 0, y: 0, width: 120, height: 60 }} to={{ x: 300, y: 150, width: 220, height: 100 }} duration={60}>
          <div style={{ width: "100%", height: "100%", background: "#4361ee", borderRadius: 12 }} />
        </Morph>
      </div>
      <Beat hold={20}>
        <Reveal from="fade" delay={70}>
          <div style={{ textAlign: "center", fontSize: 32 }}>Beat holds the pause before this reveals</div>
        </Reveal>
      </Beat>
      <Cursor
        color="primary"
        events={[
          { at: 0, x: 200, y: 500 },
          { at: 40, x: 500, y: 600, action: "click" },
          { at: 50, x: 500, y: 600, action: "type", text: "hello" },
          { at: 110, x: 900, y: 550, action: "click" },
        ]}
      />
    </div>
  </MotionRoot>
);
