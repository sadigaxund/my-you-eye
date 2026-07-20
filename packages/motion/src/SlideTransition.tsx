import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

export interface SlideTransitionProps {
  children: React.ReactNode;
  direction?: "left" | "right" | "up" | "down";
  duration?: number;
  delay?: number;
}

const DIRECTIONS: Record<NonNullable<SlideTransitionProps["direction"]>, (p: number) => string> = {
  left: (p: number) => `translateX(${(1 - p) * 100}%)`,
  right: (p: number) => `translateX(${-(1 - p) * 100}%)`,
  up: (p: number) => `translateY(${(1 - p) * 100}%)`,
  down: (p: number) => `translateY(${-(1 - p) * 100}%)`,
};

export const SlideTransition: React.FC<SlideTransitionProps> = ({
  children,
  direction = "left",
  duration = 15,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ transform: DIRECTIONS[direction](progress), overflow: "hidden" }}>
      {children}
    </div>
  );
};
