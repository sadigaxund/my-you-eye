import type { ReactNode } from "react";
import { useProgress } from "../core/useProgress";
import type { Timing } from "../core";

export type SlideDirection = "left" | "right" | "up" | "down";
export type SlideMode = "in" | "out";

export type SlideProps = Timing & {
  children: ReactNode;
  /** Default "left". */
  direction?: SlideDirection;
  /** "in" slides content from offscreen to its resting place; "out" slides it from resting place offscreen. Default "in". */
  mode?: SlideMode;
  className?: string;
};

const AXIS: Record<SlideDirection, "X" | "Y"> = { left: "X", right: "X", up: "Y", down: "Y" };
// Which screen edge each direction travels from, for mode="in" (mode="out" travels the same edge, reversed).
const SIGN: Record<SlideDirection, 1 | -1> = { left: 1, right: -1, up: 1, down: -1 };

/**
 * `overflow: hidden` on the element that is itself translating does
 * nothing — that was the bug. The fix: a real, static clipping parent
 * (`overflow: hidden`, never transformed) wrapping an inner element that
 * does the translating (TODO.md B2).
 */
export function Slide({ children, direction = "left", mode = "in", className, ...timing }: SlideProps) {
  const progress = useProgress(timing);
  const axis = AXIS[direction];
  const sign = SIGN[direction];
  const offsetPercent = mode === "in" ? (1 - progress) * 100 : progress * 100;

  return (
    <div className={className} style={{ position: "relative", overflow: "hidden" }}>
      <div style={{ transform: `translate${axis}(${sign * offsetPercent}%)` }}>{children}</div>
    </div>
  );
}

/** @deprecated Use `Slide` instead — kept only so existing call sites keep compiling. Always behaves like `Slide` with `mode="in"`. */
export interface SlideTransitionProps {
  children: ReactNode;
  direction?: SlideDirection;
  duration?: number;
  delay?: number;
  className?: string;
}

/** @deprecated Use `Slide` instead (`mode="in"` by default, which is all this ever did). */
export function SlideTransition({ children, direction = "left", duration = 15, delay = 0, className }: SlideTransitionProps) {
  return (
    <Slide direction={direction} mode="in" duration={duration} delay={delay} className={className}>
      {children}
    </Slide>
  );
}
