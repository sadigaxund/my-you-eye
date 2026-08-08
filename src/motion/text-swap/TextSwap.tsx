import type { CSSProperties } from "react";
import { useProgress } from "../core/useProgress";
import { distanceExpr } from "../core/tokens";
import type { Timing } from "../core";

export type TextSwapMode = "fade" | "roll";

export type TextSwapProps = Timing & {
  from: string;
  to: string;
  /** "fade" cross-fades; "roll" translates old text out / new text in (an odometer look). Default "fade". */
  mode?: TextSwapMode;
  className?: string;
};

/**
 * Cross-fade or roll between two strings, a pure function of
 * `useProgress()` (TODO.md C4) — for changing labels/counters without a
 * layout jump. Reuses `TypeText`'s reflow-avoidance trick: a hidden sizer
 * spans the longer of the two strings so the box never resizes mid-swap.
 */
export function TextSwap({ from, to, mode = "fade", className, ...timing }: TextSwapProps) {
  const progress = useProgress(timing);
  const travel = `calc(${distanceExpr("sm")} * ${progress})`;
  const travelBack = `calc(${distanceExpr("sm")} * -1 * ${progress})`;

  const oldStyle: CSSProperties = { opacity: 1 - progress, transform: mode === "roll" ? `translateY(${travelBack})` : undefined };
  const newStyle: CSSProperties = { opacity: progress, transform: mode === "roll" ? `translateY(${travel})` : undefined };

  const sizerText = to.length >= from.length ? to : from;

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span aria-hidden className={className} style={{ visibility: "hidden" }}>
        {sizerText}
      </span>
      <span style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <span className={className} style={{ position: "absolute", inset: 0, ...oldStyle }}>
          {from}
        </span>
        <span className={className} style={{ position: "absolute", inset: 0, ...newStyle }}>
          {to}
        </span>
      </span>
    </span>
  );
}
