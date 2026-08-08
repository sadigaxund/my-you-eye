import type { SpringName } from "./types";

interface SpringPreset {
  /** Damping ratio. >=1 is critically/over-damped (no overshoot); <1 rings before settling. */
  zeta: number;
  /** Angular frequency, normalized so t (progress through the primitive's own `duration`) runs 0..1. */
  wn: number;
}

// Hand-tuned so every preset settles to within ~2% of rest by t=1.
// useProgress hard-clamps to exactly 1 once `duration` elapses (see
// useProgress.ts), so that small asymptotic residual never causes a visible
// pop — only the shape *before* t=1 is what makes "bouncy" look bouncy.
const SPRING_PRESETS: Record<SpringName, SpringPreset> = {
  gentle: { zeta: 1, wn: 6 },
  snappy: { zeta: 0.8, wn: 8 },
  bouncy: { zeta: 0.45, wn: 9 },
};

/**
 * Deterministic damped-harmonic-oscillator ease. t is normalized progress
 * (0..1); the return value MAY overshoot past 1 or dip below 0 for
 * "snappy"/"bouncy" — that overshoot is the entire visual point of a
 * spring, so unlike easing.ts this function is intentionally not clamped to
 * [0,1] internally. useProgress is the one place clamping happens, and only
 * at the two frame extremes.
 */
export function applySpring(t: number, name: SpringName): number {
  if (t <= 0) return 0;
  const { zeta, wn } = SPRING_PRESETS[name];
  if (zeta >= 1) {
    // Critically damped closed form.
    return 1 - Math.exp(-wn * t) * (1 + wn * t);
  }
  const wd = wn * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * wn * t) * (Math.cos(wd * t) + ((zeta * wn) / wd) * Math.sin(wd * t));
}
