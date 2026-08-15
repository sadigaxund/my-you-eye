// Pure spotlight scheduling for WalkthroughScene — no React, no DOM, percent
// space only (the caller converts to pixels against the measured frame).
//
// `Spotlight` itself is, and stays, a pure function of one `useProgress()`:
// `opacity = dim * progress`. That's the right primitive — but it means the
// scene, not the primitive, owns what `dim` and `focus` are on a given frame.
// Feeding it the current step's raw values makes both quantities STEP
// functions: on the last frame of a spotlighted step the scrim is at full
// strength, and on the very next frame — when the step index flips to a step
// with no spotlight — it is zero. One frame, 0.6 → 0. In a video that is a
// visible pop, not a transition.
//
// So the two discontinuities are resolved here, both as continuous functions
// of `frame`:
//
//   exit  — when the NEXT step has no spotlight, the dim ramps to 0 over the
//           tail of this step's window, reaching zero BEFORE the index flips.
//           There is nothing left to snap off.
//   entry — when the PREVIOUS step had one, the rect is interpolated from it
//           to this one over the head of the window (and the fade-in stays
//           anchored to the run's first step, so `progress` doesn't restart
//           and dip the scrim between two adjacent spotlights). The light
//           travels to the next thing instead of teleporting.

import { clamp01 } from "../../lib/math";
import { stepName } from "../timing";
import type { SequenceRange } from "../../motion/core";
import type { PercentRect, WalkthroughStep } from "../schema";

/** Scrim strength for a spotlighted step, matching `Spotlight`'s own default. */
export const SPOTLIGHT_DIM = 0.6;

/** Share of a step's window spent ramping the spotlight out (or moving it in
 * from the previous step's rect). */
const FADE_SHARE = 0.2;

/** Hard ceiling on that ramp. A slow, wordy step can run for hundreds of
 * frames; 20% of it would spend four seconds dimming out, which reads as a
 * fault rather than as an exit. */
const FADE_CAP_FRAMES = 12;

export interface SpotlightPlan {
  /** Rect to light, in percent of the frame — `null` when this frame has no
   * spotlight at all (the caller renders an inert, fully transparent scrim). */
  focus: PercentRect | null;
  /** Scrim strength for this frame, already faded. */
  dim: number;
  /** Frame `Spotlight`'s own fade-in is anchored to: the START of the current
   * unbroken run of spotlighted steps, not of the current step, so a run of
   * two or three doesn't restart (and visibly dip) its progress at each
   * boundary. */
  delay: number;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpRect(from: PercentRect, to: PercentRect, t: number): PercentRect {
  return {
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
    width: lerp(from.width, to.width, t),
    height: lerp(from.height, to.height, t),
  };
}

/** Number of frames the entry/exit ramp lasts for a step of `span` frames. */
export function fadeFrames(span: number): number {
  return Math.min(FADE_CAP_FRAMES, Math.max(1, Math.round(span * FADE_SHARE)));
}

/** What the spotlight should be doing on `frame`, given which step is
 * current. See this module's header for the two rules. */
export function spotlightPlan(
  steps: WalkthroughStep[],
  ranges: Record<string, SequenceRange>,
  index: number,
  frame: number,
): SpotlightPlan {
  const step = steps[index];
  const range = step ? ranges[stepName(step.id, index)] : undefined;
  const fallbackDelay = range?.startFrame ?? 0;
  if (!step?.spotlight || !range) return { focus: null, dim: 0, delay: fallbackDelay };

  let runStart = index;
  while (runStart > 0 && steps[runStart - 1].spotlight) runStart -= 1;
  const delay = ranges[stepName(steps[runStart].id, runStart)]?.startFrame ?? fallbackDelay;

  const span = Math.max(1, range.endFrame - range.startFrame);
  const ramp = fadeFrames(span);

  const previous = index > runStart ? steps[index - 1].spotlight : undefined;
  const entry = previous ? clamp01((frame - range.startFrame) / ramp) : 1;
  const focus = previous ? lerpRect(previous, step.spotlight, entry) : step.spotlight;

  // A following spotlight means there is nothing to fade out FOR — the next
  // step picks the light straight up (and interpolates the rect on its own
  // entry). Only a step that hands over to darkness ramps down.
  const handsOverToDark = !steps[index + 1]?.spotlight;
  const exit = handsOverToDark ? clamp01((range.endFrame - frame) / ramp) : 1;

  return { focus, dim: SPOTLIGHT_DIM * exit, delay };
}
