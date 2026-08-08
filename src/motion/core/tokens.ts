// Shared design constants for motion primitives, mirroring tokens.css the
// same way src/ui/graph-node/grid.ts mirrors --grid-unit (AGENTS.md §7
// precedent). Primitives use these instead of each picking their own px.

/** Grid-unit multiples for entrance offsets (Reveal `distance`, etc.). */
export type DistanceToken = "sm" | "md" | "lg";

const DISTANCE_MULTIPLIER: Record<DistanceToken, number> = { sm: 1, md: 2, lg: 3 };

/** CSS calc() expression for a distance token, in px — usable directly inside a `transform`. */
export function distanceExpr(token: DistanceToken): string {
  return `calc(var(--grid-unit) * ${DISTANCE_MULTIPLIER[token]})`;
}

/** Blur-radius tokens (Reveal `from="blur"`, Spotlight dim layer, etc.). */
export type BlurToken = "sm" | "md" | "lg";

const BLUR_MULTIPLIER: Record<BlurToken, number> = { sm: 0.25, md: 0.5, lg: 1 };

export function blurExpr(token: BlurToken): string {
  return `calc(var(--grid-unit) * ${BLUR_MULTIPLIER[token]})`;
}

/**
 * Shared closed color union for primitives that paint (Draw, Trace,
 * Spotlight, Pulse, Shake, Ripple, Caption, ...) — every primitive picks
 * from this instead of accepting a raw color string, and reads it through
 * `colorVar`/`colorBgClass` instead of re-declaring its own token map.
 */
export type MotionColor = "primary" | "success" | "warning" | "danger" | "fg" | "muted";

const COLOR_VAR: Record<MotionColor, string> = {
  primary: "var(--color-primary)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
  fg: "var(--color-fg)",
  muted: "var(--color-muted)",
};

/** CSS `var(...)` reference for a MotionColor — usable in computed inline styles (stroke, boxShadow, ...). */
export function colorVar(color: MotionColor): string {
  return COLOR_VAR[color];
}

const COLOR_BG_CLASS: Record<MotionColor, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  fg: "bg-fg",
  muted: "bg-muted",
};

/** Tailwind background-color utility class for a MotionColor. */
export function colorBgClass(color: MotionColor): string {
  return COLOR_BG_CLASS[color];
}
