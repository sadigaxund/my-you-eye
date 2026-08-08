import { useProgress } from "../core/useProgress";
import { distanceExpr, colorVar } from "../core/tokens";
import type { Timing, DistanceToken, MotionColor } from "../core";

export type RippleProps = Timing & {
  /** Position within a `position: relative` ancestor — Ripple renders `position: absolute; left: x; top: y`. */
  x: number;
  y: number;
  color?: MotionColor;
  /** Ring size at full expansion, as a grid-unit multiple. Default "lg". */
  size?: DistanceToken;
  className?: string;
};

/**
 * An expanding, fading ring at a point — marks clicks and events (TODO.md
 * C2), a pure function of `useProgress()`. Used by `Cursor` to render a
 * ripple on simulated clicks; also useful standalone for annotating a
 * diagram interaction.
 */
export function Ripple({ x, y, color = "primary", size = "lg", className, ...timing }: RippleProps) {
  const progress = useProgress(timing);
  const maxSize = distanceExpr(size);
  const currentSize = `calc(${maxSize} * ${progress})`;
  const opacity = 1 - progress;

  return (
    <span
      aria-hidden
      className={["absolute rounded-full pointer-events-none", className].filter(Boolean).join(" ")}
      style={{
        left: x,
        top: y,
        width: currentSize,
        height: currentSize,
        marginLeft: `calc(${currentSize} / -2)`,
        marginTop: `calc(${currentSize} / -2)`,
        border: `calc(var(--border-width) * 2) solid ${colorVar(color)}`,
        opacity,
      }}
    />
  );
}
