// The shared vocabulary every motion primitive is built from. Nothing in
// this file imports React or remotion — it is pure data shape.

/**
 * Semantic timing unit. Consumers pick from the closed set of named beats;
 * the numeric form is an escape hatch and should stay the exception, not
 * the documented path (TODO.md §0 "Stability over customizability" — all
 * taste lives in this library, never a call-site frame count).
 */
export type Beat = "instant" | "quick" | "normal" | "slow" | number;

/** Closed union of eases, each mapped to a `--ease-*` token in tokens.css (see src/motion/core/easing.ts). */
export type EasingName = "linear" | "standard" | "in" | "out";

/** Closed union of spring feels (see src/motion/core/springs.ts for the damping/frequency presets). */
export type SpringName = "gentle" | "snappy" | "bouncy";

interface TimingBase {
  /** Frames (or a Beat) to wait before the animation starts. Default: 0. */
  delay?: Beat;
  /** Length of the animation itself. Default: "normal". */
  duration?: Beat;
}

/**
 * The one prop shape every primitive accepts for timing. `easing` and
 * `spring` are mutually exclusive — supplying both is a type error (the
 * unused branch's key is typed `never`), not just a documented precedence
 * rule.
 */
export type Timing =
  | (TimingBase & { easing?: EasingName; spring?: never })
  | (TimingBase & { spring?: SpringName; easing?: never });

/** What every driver (RemotionDriver, DomDriver) provides through TimelineContext. */
export interface TimelineValue {
  /** Current integer frame, 0-based. */
  frame: number;
  /** Frames per second of the active timeline. */
  fps: number;
  /** Total length of the active timeline, in frames. */
  durationInFrames: number;
}
