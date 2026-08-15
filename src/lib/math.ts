// Numeric helpers shared across components. These are the single definition of
// clamping in the repo — components must never re-declare a local `clamp` /
// `clamp01` (AGENTS.md §0.3: no per-folder copies of shared logic).

/** Constrain `value` to the inclusive `[min, max]` range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Constrain `value` to the inclusive `[0, 1]` range — the animation-progress case. */
export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}
