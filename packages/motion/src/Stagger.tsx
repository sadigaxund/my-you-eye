import React, { Children } from "react";
import { useCurrentFrame } from "remotion";

export interface StaggerProps {
  children: React.ReactNode;
  delay?: number;
  staggerDelay?: number;
}

export function Stagger({
  children,
  delay = 0,
  staggerDelay = 5,
}: StaggerProps) {
  const frame = useCurrentFrame();

  return Children.map(children, (child, i) => {
    const childDelay = delay + i * staggerDelay;
    const visible = frame >= childDelay;

    return (
      <div
        style={{
          opacity: visible ? undefined : 0,
          pointerEvents: visible ? undefined : "none",
        }}
      >
        {child}
      </div>
    );
  });
}
