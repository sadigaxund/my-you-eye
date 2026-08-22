import React from "react";
import { MotionRoot, Highlight } from "my-you-eye/motion";
import { RemotionDriver } from "my-you-eye/motion/remotion";

const layerStyle: React.CSSProperties = {
  padding: "24px 48px",
  margin: "12px 0",
  fontSize: 42,
  fontFamily: "monospace",
  fontWeight: 600,
  display: "inline-block",
};

const arrowStyle: React.CSSProperties = {
  fontSize: 48,
  margin: "0 auto",
  color: "#888",
  fontFamily: "monospace",
  lineHeight: 1,
};

export const HighlightDemo: React.FC = () => (
  <MotionRoot mode="video" driver={RemotionDriver}>
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
      <h1 style={{ fontSize: 56, margin: "0 0 48px 0" }}>Architecture Overview</h1>
      <Highlight mode="fill" color="primary" delay={0} duration={30}>
        <div style={layerStyle}>Frontend</div>
      </Highlight>
      <div style={arrowStyle}>&darr;</div>
      <Highlight mode="fill" color="success" delay={40} duration={30}>
        <div style={layerStyle}>API Gateway</div>
      </Highlight>
      <div style={arrowStyle}>&darr;</div>
      <Highlight mode="fill" color="warning" delay={80} duration={30}>
        <div style={layerStyle}>Microservices</div>
      </Highlight>
      <div style={arrowStyle}>&darr;</div>
      <Highlight mode="fill" color="danger" delay={120} duration={30}>
        <div style={layerStyle}>Database</div>
      </Highlight>
    </div>
  </MotionRoot>
);
