import type { Beat } from "./types";

// Motion-tier semantic durations, in seconds. Deliberately independent of
// the CSS --duration-fast/normal/slow tokens in src/styles/tokens.css: those
// govern short CSS hover/press microinteractions (100-300ms) for src/ui/, a
// different register from content-reveal timing in recorded video (which
// reads comfortably from ~150ms up past 900ms). Motion primitives are
// frame-driven, never CSS-driven (AGENTS.md §9c rule 1, strengthened by
// TODO.md D2), so there is no clean way to read a CSS custom property into
// this pure frame math without a synchronous DOM read on every primitive —
// this is a TS-side mirror of a design constant, the same pattern AGENTS.md
// §7 sanctions for `GRID` in `src/ui/graph-node/grid.ts`.
const BEAT_SECONDS: Record<Exclude<Beat, number>, number> = {
  instant: 0.15,
  quick: 0.3,
  normal: 0.5,
  slow: 0.9,
};

/** Resolve a Beat (semantic name or raw frame count) to a whole frame count. */
export function resolveBeatFrames(beat: Beat, fps: number): number {
  if (typeof beat === "number") return Math.max(0, Math.round(beat));
  return Math.max(0, Math.round(BEAT_SECONDS[beat] * fps));
}
