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
