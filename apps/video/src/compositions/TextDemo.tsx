import React from "react";
import { MotionRoot, CountUp, TextSwap, Caption } from "my-you-eye/motion";
import { RemotionDriver } from "my-you-eye/motion/remotion";

export const TextDemo: React.FC = () => (
  <MotionRoot mode="video" driver={RemotionDriver}>
    <div
      style={{
        width: 1920,
        height: 1080,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 48,
        backgroundColor: "#1a1a2e",
        color: "#fff",
        fontFamily: "sans-serif",
        fontSize: 56,
      }}
    >
      <CountUp to={128492} format="number" duration={80} formatOptions={{ compact: true }} />
      <TextSwap from="Draft" to="Published" mode="roll" duration={40} delay={20} />
      <Caption text="Rendered from my-you-eye/motion" subtitle="RemotionDriver + MotionRoot" position="bottom-center" duration={40} delay={60} />
    </div>
  </MotionRoot>
);
