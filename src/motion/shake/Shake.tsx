import type { CSSProperties, ReactNode } from "react";
import { useProgress } from "../core/useProgress";
import { useTimeline } from "../core/TimelineContext";
import { seededValueAt } from "../core/prng";
import { distanceExpr } from "../core/tokens";
import { Slot } from "../core/Slot";
import type { Timing } from "../core";

export type ShakeAxis = "x" | "y" | "rotate";

export type ShakeProps = Timing & {
  children: ReactNode;
  /** Default "x". */
  axis?: ShakeAxis;
  /** Oscillations across the full `duration`. Default 6. */
  cycles?: number;
  /** Deterministic jitter seed — same seed always produces the same shake. Default "shake". */
  seed?: string | number;
  asChild?: boolean;
  as?: "div" | "span";
  className?: string;
};

// Rotation amplitude isn't a px/color design token — a small hand-tuned
// constant for this one effect, the same convention as Reveal's SCALE_START.
const ROTATE_MAX_DEG = 4;

/**
 * Oscillating error/attention indicator with decaying amplitude — strong at
 * the start of `duration`, settling to exactly 0 once `useProgress()`
 * clamps to 1 (TODO.md C2). The base oscillation is a deterministic `sin()`
 * wave; a touch of extra jitter is layered on top via the seeded PRNG in
 * `core/prng.ts` — never the browser's unseeded random source (AGENTS.md
 * §9c determinism rule: identical `seed`+frame must always produce the
 * identical shake).
 */
export function Shake({ children, axis = "x", cycles = 6, seed = "shake", asChild, as: As = "div", className, ...timing }: ShakeProps) {
  const progress = useProgress(timing);
  const { frame } = useTimeline();

  const decay = 1 - progress;
  const oscillation = Math.sin(progress * cycles * Math.PI * 2);
  const jitter = seededValueAt(seed, frame) * 2 - 1;
  const value = (oscillation * 0.7 + jitter * 0.3) * decay;

  const style: CSSProperties =
    axis === "rotate"
      ? { transform: `rotate(${value * ROTATE_MAX_DEG}deg)` }
      : { transform: `translate${axis === "x" ? "X" : "Y"}(calc(${distanceExpr("sm")} * ${value}))` };

  if (asChild) {
    return (
      <Slot style={style} className={className}>
        {children}
      </Slot>
    );
  }
  return (
    <As style={style} className={className}>
      {children}
    </As>
  );
}
