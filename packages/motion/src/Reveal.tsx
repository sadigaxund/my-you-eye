import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

export interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right";
}

const DIRECTION_MAP: Record<NonNullable<RevealProps["direction"]>, "translateY" | "translateX"> = {
  up: "translateY",
  down: "translateY",
  left: "translateX",
  right: "translateX",
};

const DIRECTION_SIGN: Record<NonNullable<RevealProps["direction"]>, number> = {
  up: 1,
  down: -1,
  left: 1,
  right: -1,
};

export const Reveal: React.FC<RevealProps> = ({
  children,
  delay = 0,
  duration = 15,
  direction = "up",
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const offset = interpolate(progress, [0, 1], [16, 0]);
  const transform = `${DIRECTION_MAP[direction]}(${DIRECTION_SIGN[direction] * offset}px)`;

  return (
    <div style={{ opacity: progress, transform }}>
      {children}
    </div>
  );
};
