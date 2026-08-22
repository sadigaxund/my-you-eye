// Step-level vocabulary shared by every scene kind.
//
// A "step" is one beat of narration and whatever happens on screen while it
// is spoken. Steps are the unit both output modes agree on: in a video each
// step becomes a frame range (`buildSequence`), in the presenter each step
// is one click. That equivalence is why no step carries a frame count.

// From `motion/core`, not `motion` — the `motion` barrel also exports a
// *component* named `Beat` (the no-op hold), which would shadow the timing
// type of the same name. See the note in src/motion/index.ts.
import type { Beat, Pace } from "../../motion/core";

/** Re-exported so a consumer only ever imports from `my-you-eye/scenes`. */
export type { Beat, Pace };

/** Transition INTO a scene from the one before it. */
export type SceneTransition = "none" | "fade" | "slide" | "wipe";

/** Semantic accent shared by diagram nodes, activation bars and callouts.
 * Not a color: each theme decides what "danger" looks like. */
export type AccentColor = "primary" | "success" | "warning" | "danger" | "muted";

/** Status pip vocabulary, matching `StatusDot`'s variants. */
export type StatusKind = "neutral" | "success" | "warning" | "danger" | "info";

/** How a raw number is rendered. Maps onto `src/lib/format.ts`, which
 * `CellType` and `CountUp` already share — never a format string. */
export type NumberFormat = "number" | "percent" | "bytes" | "currency" | "duration" | "compact";

/** 1-based, inclusive line range: `[4, 9]` is lines 4 through 9. */
export type LineRange = [start: number, end: number];

/**
 * Fields every scene accepts, whatever its `kind`. Lives here rather than
 * in `scenes.ts` so that `scenes.diagram.ts` and `scenes.data.ts` can extend
 * it without importing the file that imports them.
 */
export interface SceneBase {
  /** Stable id — used for chapter markers, presenter deep-links, and to
   * name the scene in validation errors. Derived from the index when omitted. */
  id?: string;
  /** Coarse pacing for every step in this scene. Default "normal". This is
   * the only timing dial: everything else is derived from how much you
   * wrote in `say`. */
  pace?: Pace;
  /** Transition into this scene from the previous one. Default "fade". */
  transition?: SceneTransition;
  /** Speaker-view note for the scene as a whole. Never rendered on screen. */
  notes?: string;
}

/**
 * Fields every step of every scene kind accepts.
 */
export interface StepBase {
  /** Stable id. Auto-derived from the step's index when omitted; only worth
   * setting for a step you want to deep-link to from the presenter. */
  id?: string;
  /**
   * The narration line for this step. It does three jobs at once:
   * speaker-view script, the content-length input that derives this step's
   * duration (longer line → longer step), and the reserved anchor for
   * narration/TTS timing later (TODO.md Phase G). Writing it is how you
   * control pacing — there is no duration field.
   */
  say?: string;
  /** Extra hold after the step's animation finishes, before the next step
   * begins. For letting a reveal land. */
  hold?: Beat;
  /** Lower-third caption rendered on screen for this step's duration. Use
   * for a key term, not for a transcript of `say`. */
  caption?: string;
}

/** A callout pinned to a source line. */
export interface CodeAnnotation {
  /** 1-based line number the leader line points at. */
  line: number;
  text: string;
  /** Which side the label sits on. Default: whichever has more room. */
  side?: "left" | "right";
}

/** A callout pinned to a diagram node. */
export interface DiagramAnnotation {
  /** Node id (or group id) the leader line points at. */
  target: string;
  text: string;
  side?: "top" | "right" | "bottom" | "left";
}

/** A rectangle in percent-of-frame units (0–100). Percentages rather than
 * pixels so a step keeps pointing at the right thing when `meta.size`
 * changes. */
export interface PercentRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A point in percent-of-frame units (0–100). */
export interface PercentPoint {
  x: number;
  y: number;
}
