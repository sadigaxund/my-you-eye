import React from "react";
import { MotionRoot, Slide } from "my-you-eye/motion";
import { RemotionDriver } from "my-you-eye/motion/remotion";

const PANELS = [
  { label: "Panel A", direction: "left" as const, delay: 0, color: "#e94560" },
  { label: "Panel B", direction: "right" as const, delay: 35, color: "#0f3460" },
  { label: "Panel C", direction: "up" as const, delay: 70, color: "#16c79a" },
  { label: "Panel D", direction: "down" as const, delay: 105, color: "#f5a623" },
];

export const SlideDemo: React.FC = () => (
  <MotionRoot mode="video" driver={RemotionDriver}>
    <div
      style={{
        flex: 1,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        width: 1920,
        height: 1080,
        backgroundColor: "#1a1a2e",
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      {PANELS.map((panel) => (
        <Slide key={panel.label} direction={panel.direction} mode="in" delay={panel.delay}>
          <div
            style={{
              width: 400,
              height: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: panel.color,
              borderRadius: 16,
              fontSize: 48,
              fontWeight: 700,
            }}
          >
            {panel.label}
          </div>
        </Slide>
      ))}
    </div>
  </MotionRoot>
);
