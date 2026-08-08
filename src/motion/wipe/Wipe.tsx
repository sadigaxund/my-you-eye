import type { ReactNode } from "react";
import { useProgress } from "../core/useProgress";
import type { Timing } from "../core";

export type WipeDirection = "left" | "right" | "up" | "down";
export type WipeVariant = "linear" | "radial";

export type WipeProps = Timing & {
  children: ReactNode;
  /** Which edge the reveal grows from. Default "left". */
  direction?: WipeDirection;
  /** "linear" is a hard-edged sweep; "radial" grows a circle from the direction's edge. Default "linear". */
  variant?: WipeVariant;
  className?: string;
};

function linearClip(progress: number, direction: WipeDirection): string {
  const hide = (1 - progress) * 100;
  switch (direction) {
    case "left":
      return `inset(0 ${hide}% 0 0)`;
    case "right":
      return `inset(0 0 0 ${hide}%)`;
    case "up":
      return `inset(${hide}% 0 0 0)`;
    case "down":
    default:
      return `inset(0 0 ${hide}% 0)`;
  }
}

const RADIAL_ORIGIN: Record<WipeDirection, string> = {
  left: "0% 50%",
  right: "100% 50%",
  up: "50% 100%",
  down: "50% 0%",
};

/**
 * `clip-path` reveal, a pure function of `useProgress()` (TODO.md C1). For
 * images, diagrams and panels — a hard-edged alternative to `Unmask`'s
 * soft-edged mask sweep. `variant="radial"`'s 100% circle radius is
 * guaranteed to cover the whole box by progress=1: per the CSS Shapes spec,
 * a `circle()` percentage radius resolves against
 * `sqrt((w²+h²)/2)`, which already exceeds the box's half-diagonal
 * (`sqrt(w²+h²)/2`), so no larger multiplier is needed.
 */
export function Wipe({ children, direction = "left", variant = "linear", className, ...timing }: WipeProps) {
  const progress = useProgress(timing);
  const clipPath = variant === "linear" ? linearClip(progress, direction) : `circle(${progress * 100}% at ${RADIAL_ORIGIN[direction]})`;

  return (
    <div className={className} style={{ clipPath, WebkitClipPath: clipPath }}>
      {children}
    </div>
  );
}
