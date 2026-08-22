// Pure fraction math for SplitPane (#8) — DOM-free, unit-testable. Sizes are
// fractions of the container along the branch direction and always sum to 1.

export const MIN_FRACTION = 0.12;

/**
 * Resize children[i] by `delta` (a fraction of the container, positive grows
 * children[i]) taken from / given to children[i + 1]. Both sides clamp to
 * `minFraction`; returns null when the move was entirely absorbed by the
 * clamps, so the caller can skip state churn at the end of travel.
 */
export function resizePair(
  sizes: readonly number[],
  i: number,
  delta: number,
  minFraction: number = MIN_FRACTION,
): number[] | null {
  if (i < 0 || i + 1 >= sizes.length) return null;
  const a = sizes[i];
  const b = sizes[i + 1];
  // a' = a + d >= min   →   d >= min - a
  // b' = b - d >= min   →   d <= b - min
  const lo = minFraction - a;
  const hi = b - minFraction;
  if (hi < lo) return null;
  const clamped = Math.max(lo, Math.min(hi, delta));
  const next = [...sizes];
  next[i] = a + clamped;
  next[i + 1] = b - clamped;
  return next;
}
