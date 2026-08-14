import { applyEasing } from "./easing";
import { applySpring } from "./springs";
import type { EasingName, SpringName } from "./types";

/**
 * The subset of `Timing` that shapes a movement *curve* — no `delay`/
 * `duration`, since some primitives (Camera, Cursor) derive their timing
 * from explicit per-keyframe/per-event frame numbers instead of one
 * delay+duration span, so `Timing` itself doesn't fit. `easing`/`spring`
 * are exactly the two knobs those primitives still need, and are the same
 * two knobs `useProgress` reads off a full `Timing` — this is the shared
 * subset both shapes agree on.
 */
export type MovementTiming =
  | { easing?: EasingName; spring?: never }
  | { spring?: SpringName; easing?: never };

/**
 * Builds a `t -> t'` easing function from `easing`/`spring`, the same
 * curve-selection logic `useProgress` applies to a delay+duration span —
 * factored out here so every primitive that interpolates *between explicit
 * keyframes/events* (Camera between camera keyframes, Cursor between
 * pointer events) shares one definition instead of re-deriving it (owner
 * feedback: "standardize the definitions of those movements so they don't
 * scatter all around codebase"). Defaults to `easing: "standard"` when
 * neither is supplied — movement is eased by default everywhere, never
 * silently linear.
 */
export function legEase(timing: MovementTiming): (t: number) => number {
  if (timing.spring) {
    const spring = timing.spring;
    // Pin the two ends and nothing in between, exactly as `useProgress`
    // does. Clamping the middle to [0,1] would delete the overshoot that
    // is the entire visual point of `snappy`/`bouncy` (see springs.ts) and
    // make every spring preset land on the same critically-damped curve —
    // which would defeat the purpose of sharing this definition at all.
    return (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : applySpring(t, spring));
  }
  const easing = timing.easing ?? "standard";
  return (t: number) => applyEasing(t, easing);
}
