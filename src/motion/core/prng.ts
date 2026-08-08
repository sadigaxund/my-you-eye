// Deterministic seeded PRNG utilities. AGENTS.md §9c's determinism rule
// (identical input -> identical frame, every render) means a primitive that
// needs jitter (Shake, etc.) can never call Math.random() — it must derive
// randomness from a `seed` prop and the current frame instead.

/** mulberry32 — small, fast, good-enough statistical quality for visual jitter. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash an arbitrary string/number seed down to a 32-bit int for mulberry32. */
export function hashSeed(seed: string | number): number {
  if (typeof seed === "number") return seed >>> 0;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * A single deterministic pseudo-random value for (seed, frame). Every frame
 * N always produces the same value regardless of render order — required
 * because Remotion may render frames out of order (parallel workers), and
 * scrubbing in DomDriver can jump to any frame directly.
 */
export function seededValueAt(seed: string | number, frame: number): number {
  const rand = mulberry32(hashSeed(seed) ^ Math.imul(frame + 1, 0x9e3779b1));
  return rand();
}
