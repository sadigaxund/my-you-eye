import React from "react";
import { TypeText } from "@lib/motion";

const LINE_STYLE: React.CSSProperties = {
  fontSize: 32,
  lineHeight: 1.6,
  whiteSpace: "pre",
};

export const TypeTextDemo: React.FC = () => (
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
    <TypeText
      text="const fetchUsers = async (): Promise<User[]> => {"
      delay={0}
      speed={3}
      cursor={true}
      style={LINE_STYLE}
    />
    <TypeText
      text="  const res = await fetch('/api/users');"
      delay={60}
      speed={2}
      cursor={true}
      style={LINE_STYLE}
    />
    <TypeText
      text="  return res.json();"
      delay={120}
      speed={2}
      cursor={true}
      style={LINE_STYLE}
    />
  </div>
);
