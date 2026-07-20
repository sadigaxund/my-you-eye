import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

export interface HighlightProps {
  children: React.ReactNode;
  activeFrame?: number;
  duration?: number;
  color?: string;
  opacity?: number;
  className?: string;
}

export function Highlight({
  children,
  activeFrame = 0,
  duration = 15,
  color = "var(--color-primary)",
  opacity = 0.15,
  className,
}: HighlightProps) {
  const frame = useCurrentFrame();
  const progress = interpolate(frame - activeFrame, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      className={className}
      style={{ position: "relative", display: "inline-block" }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: color,
          opacity: progress * opacity,
          borderRadius: "inherit",
          zIndex: -1,
        }}
      />
      {children}
    </div>
  );
}
