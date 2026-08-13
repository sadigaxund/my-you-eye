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
    // scale3d (not scale) forces the browser onto its GPU compositing path
    // rather than the ambiguous 2D path some engines still rasterize on the
    // main thread; willChange pre-promotes the element to its own layer
    // BEFORE the animation starts instead of lazily on first frame, and
    // backfaceVisibility keeps that layer's own rasterization from being
    // resampled against its (invisible) back face. Owner feedback: text
    // inside a scaled element looks soft mid-animation on a high-refresh
    // display — a well-documented Chromium/WebKit effect where a scaled
    // layer's glyphs are resampled from an already-rasterized bitmap rather
    // than re-hinted at the new size. This is the standard mitigation for
    // it; it does not re-rasterize glyphs at every scale step (no browser
    // API does that for a compositor-driven transform), so it reduces but
    // does not eliminate the softening — see the Pulse showcase note.
    transform: `scale3d(${1 + wave * SCALE_AMPLITUDE}, ${1 + wave * SCALE_AMPLITUDE}, 1)`,
    opacity: 1 - wave * OPACITY_AMPLITUDE,
    willChange: "transform",
    backfaceVisibility: "hidden" as const,
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
