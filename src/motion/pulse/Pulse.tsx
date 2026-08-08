import type { ReactNode } from "react";
import { useTimeline } from "../core/TimelineContext";
import { resolveBeatFrames } from "../core/beats";
import { Slot } from "../core/Slot";
import type { Timing } from "../core";

export type PulseProps = Timing & {
  children: ReactNode;
  /** Finite number of breaths. Omit for an infinite loop (the default). */
  loop?: number;
  asChild?: boolean;
  as?: "div" | "span";
  className?: string;
};

// Subtle breathing amounts — small, commented constants, the same pattern
// Reveal documents for SCALE_START: not a color/px design token, just a
// hand-tuned unitless amount for this one visual effect.
const SCALE_AMPLITUDE = 0.04;
const OPACITY_AMPLITUDE = 0.15;

/**
 * Looping scale/opacity "breathing", a pure function of `frame % period`
 * (TODO.md C2) — never `setInterval`/CSS `animation`. `duration` (from
 * `Timing`) is the length of ONE breath cycle; `loop` caps the number of
 * cycles before it settles to rest (omit for infinite).
 */
export function Pulse({ children, loop, asChild, as: As = "div", className, ...timing }: PulseProps) {
  const { frame, fps } = useTimeline();
  const periodFrames = Math.max(1, resolveBeatFrames(timing.duration ?? "slow", fps));
  const delayFrames = timing.delay != null ? resolveBeatFrames(timing.delay, fps) : 0;
  const local = Math.max(0, frame - delayFrames);
  const totalFrames = loop != null ? periodFrames * loop : Infinity;
  const active = local < totalFrames;

  const wave = active ? Math.sin(((local % periodFrames) / periodFrames) * Math.PI * 2) * 0.5 + 0.5 : 0;
  const style = {
    transform: `scale(${1 + wave * SCALE_AMPLITUDE})`,
    opacity: 1 - wave * OPACITY_AMPLITUDE,
  };

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
