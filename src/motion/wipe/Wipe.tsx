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
 * soft-edged mask sweep.
 *
 * `variant="radial"` needs `RADIAL_FULL` (142%), not 100%. A `circle()`
 * percentage radius resolves against `sqrt((w²+h²)/2)` per the CSS Shapes
 * spec, and an earlier version of this comment compared that against the
 * box's *half*-diagonal and concluded 100% was enough. That comparison only
 * holds for an origin at the box's centre — but every `RADIAL_ORIGIN` here
 * is an edge midpoint. From the left edge the farthest corner is
 * `sqrt(w² + (h/2)²)` away, so on a wide, short box (400×100) a 100% radius
 * reaches ~291px against the ~403px needed and the far side never gets
 * revealed. The worst-case ratio is
 * `sqrt((w² + h²/4) · 2/(w² + h²))`, which approaches `sqrt(2)` as the box
 * flattens, so 142% covers every aspect ratio from any edge origin.
 */
// sqrt(2), as a percentage, rounded up — see the note above.
const RADIAL_FULL = 142;
export function Wipe({ children, direction = "left", variant = "linear", className, ...timing }: WipeProps) {
  const progress = useProgress(timing);
  const clipPath = variant === "linear"
    ? linearClip(progress, direction)
    : `circle(${progress * RADIAL_FULL}% at ${RADIAL_ORIGIN[direction]})`;

  return (
    <div className={className} style={{ clipPath, WebkitClipPath: clipPath }}>
      {children}
    </div>
  );
}
