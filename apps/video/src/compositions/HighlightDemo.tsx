import React from "react";
import { Highlight } from "@lib/motion";

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
    <h1 style={{ fontSize: 56, margin: "0 0 48px 0" }}>
      Architecture Overview
    </h1>
    <Highlight activeFrame={0} duration={30} color="#7f77dd" opacity={0.3}>
      <div style={layerStyle}>Frontend</div>
    </Highlight>
    <div style={arrowStyle}>&darr;</div>
    <Highlight activeFrame={40} duration={30} color="#50d890" opacity={0.3}>
      <div style={layerStyle}>API Gateway</div>
    </Highlight>
    <div style={arrowStyle}>&darr;</div>
    <Highlight activeFrame={80} duration={30} color="#f5a623" opacity={0.3}>
      <div style={layerStyle}>Microservices</div>
    </Highlight>
    <div style={arrowStyle}>&darr;</div>
    <Highlight activeFrame={120} duration={30} color="#e04f5f" opacity={0.3}>
      <div style={layerStyle}>Database</div>
    </Highlight>
  </div>
);
