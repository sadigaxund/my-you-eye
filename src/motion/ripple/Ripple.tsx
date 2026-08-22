import type { CSSProperties } from "react";
import { useProgress } from "../core/useProgress";
import { distanceExpr, colorVar } from "../core/tokens";
import type { Timing, DistanceToken, MotionColor } from "../core";

export type RippleVariant = "ring" | "solid" | "double";

export type RippleProps = Timing & {
  /** Position within a `position: relative` ancestor — Ripple renders `position: absolute; left: x; top: y`. */
  x: number;
  y: number;
  color?: MotionColor;
  /** Ring size at full expansion, as a grid-unit multiple. Default "lg". */
  size?: DistanceToken;
  /**
   * Visual treatment (TODO.md C2 / Cursor's click feedback, extended rather
   * than duplicated — Cursor forwards its own `clickEffect` prop straight
   * through to this). "ring" (default, unchanged) is a single expanding,
   * fading outline. "solid" is a filled disc fading out — reads as a
   * firmer tap than an outline. "double" layers a second, phase-delayed
   * ring behind the first for a richer click pulse.
   */
  variant?: RippleVariant;
  className?: string;
};

function ringStyle(progress: number, size: DistanceToken, color: MotionColor, filled: boolean): CSSProperties {
  const maxSize = distanceExpr(size);
  const currentSize = `calc(${maxSize} * ${progress})`;
  return {
    width: currentSize,
    height: currentSize,
    marginLeft: `calc(${currentSize} / -2)`,
    marginTop: `calc(${currentSize} / -2)`,
    opacity: 1 - progress,
    ...(filled
      ? { background: colorVar(color) }
      : { border: `calc(var(--border-width) * 2) solid ${colorVar(color)}` }),
  };
}

/**
 * An expanding, fading ring at a point — marks clicks and events (TODO.md
 * C2), a pure function of `useProgress()`. Used by `Cursor` to render click
 * feedback (never a second, hand-rolled ripple — Cursor's `clickEffect`
 * prop just forwards to this `variant`); also useful standalone for
 * annotating a diagram interaction.
 */
export function Ripple({ x, y, color = "primary", size = "lg", variant = "ring", className, ...timing }: RippleProps) {
  const progress = useProgress(timing);
  // "double"'s trailing ring starts its own expansion partway through the
  // same `progress` instead of reading a second useProgress/frame — stays a
  // pure function of the one progress value, no extra Timing to configure.
  const trailProgress = Math.max(0, (progress - 0.35) / 0.65);
  const sharedClassName = ["absolute rounded-full pointer-events-none", className].filter(Boolean).join(" ");

  return (
    <>
      {variant === "double" && (
        <span aria-hidden className={sharedClassName} style={{ left: x, top: y, ...ringStyle(trailProgress, size, color, false) }} />
      )}
      <span
        aria-hidden
        className={sharedClassName}
        style={{ left: x, top: y, ...ringStyle(progress, size, color, variant === "solid") }}
      />
    </>
  );
}
