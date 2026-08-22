import type { EasingName } from "./types";

// Mirrors the cubic-bezier control points defined in src/styles/tokens.css
// (--ease-standard / --ease-in / --ease-out). Motion primitives can't use a
// CSS transition to apply them (AGENTS.md §9c rule 1), so the curve has to
// be evaluated in JS on every frame — this is a TS-side mirror of the CSS
// constant, the same pattern AGENTS.md §7 sanctions for GRID in grid.ts.
// Update both places together if tokens.css ever changes these curves.
const CONTROL_POINTS: Record<Exclude<EasingName, "linear">, [number, number, number, number]> = {
  standard: [0.4, 0, 0.2, 1],
  in: [0.4, 0, 1, 1],
  out: [0, 0, 0.2, 1],
};

function makeBezier(x1: number, y1: number, x2: number, y2: number): (x: number) => number {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDerivX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  // Newton-Raphson with a bisection fallback — the standard bezier-easing
  // solve, deterministic and side-effect free.
  function solveT(x: number): number {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const derivative = sampleDerivX(t);
      if (Math.abs(derivative) < 1e-6) break;
      t -= (sampleX(t) - x) / derivative;
    }
    if (t >= 0 && t <= 1 && Math.abs(sampleX(t) - x) < 1e-4) return t;

    let lo = 0;
    let hi = 1;
    t = x;
    for (let i = 0; i < 24 && hi - lo > 1e-7; i++) {
      const current = sampleX(t);
      if (Math.abs(current - x) < 1e-7) break;
      if (current < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return t;
  }

  return (x: number): number => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return sampleY(solveT(x));
  };
}

const EASE_FNS: Record<EasingName, (x: number) => number> = {
  linear: (x: number) => x,
  standard: makeBezier(...CONTROL_POINTS.standard),
  in: makeBezier(...CONTROL_POINTS.in),
  out: makeBezier(...CONTROL_POINTS.out),
};

/** Evaluate a named ease at t (clamped to [0,1] first — this function never overshoots, unlike springs.ts). */
export function applyEasing(t: number, name: EasingName): number {
  return EASE_FNS[name](Math.min(1, Math.max(0, t)));
}
