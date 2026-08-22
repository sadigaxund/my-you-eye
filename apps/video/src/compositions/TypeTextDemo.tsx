import React from "react";
import { MotionRoot, TypeText } from "my-you-eye/motion";
import { RemotionDriver } from "my-you-eye/motion/remotion";

const lineStyle: React.CSSProperties = { height: 52, display: "flex", alignItems: "center", fontSize: 32, whiteSpace: "pre" };

export const TypeTextDemo: React.FC = () => (
  <MotionRoot mode="video" driver={RemotionDriver}>
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: 1920,
        height: 1080,
        backgroundColor: "#0d1117",
        color: "#c9d1d9",
        fontFamily: "monospace",
        padding: "80px 120px",
      }}
    >
      <div style={lineStyle}>
        <TypeText text="const fetchUsers = async (): Promise<User[]> => {" delay={0} duration={60} />
      </div>
      <div style={lineStyle}>
        <TypeText text="  const res = await fetch('/api/users');" delay={60} duration={45} />
      </div>
      <div style={lineStyle}>
        <TypeText text="  return res.json();" delay={120} duration={30} />
      </div>
    </div>
  </MotionRoot>
);
