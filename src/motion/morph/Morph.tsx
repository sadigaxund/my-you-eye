import type { CSSProperties, ReactNode } from "react";
import { useProgress } from "../core/useProgress";
import type { Timing } from "../core";

export interface MorphSnapshot {
  x: number;
  y: number;
  width?: number;
  height?: number;
  opacity?: number;
}

export type MorphProps = Timing & {
  children: ReactNode;
  from: MorphSnapshot;
  to: MorphSnapshot;
  className?: string;
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * FLIP-style reposition/cross-fade between two caller-supplied snapshots
 * (TODO.md C5) — a deliberately simplified interpolator, not a full
 * property-diffing FLIP engine. Real FLIP normally diffs
 * `getBoundingClientRect()` before/after a layout change happens, but that
 * requires two wall-clock-timed renders, which a frame-driven primitive
 * can't do (AGENTS.md §9c rule 1: no side effects in render, no
 * `useEffect`-driven measurement loop). Instead the caller — typically a
 * future `src/scenes/` component that already knows both layout states —
 * measures both and hands Morph two plain snapshots to interpolate
 * between. Morph stays a generic, child-agnostic wrapper: it never
 * measures anything itself. Renders `position: absolute` — needs a
 * `position: relative` ancestor.
 */
export function Morph({ children, from, to, className, ...timing }: MorphProps) {
  const progress = useProgress(timing);

  const x = lerp(from.x, to.x, progress);
  const y = lerp(from.y, to.y, progress);
  const opacity = lerp(from.opacity ?? 1, to.opacity ?? 1, progress);

  const style: CSSProperties = {
    position: "absolute",
    transform: `translate(${x}px, ${y}px)`,
    opacity,
  };
  if (from.width != null && to.width != null) style.width = lerp(from.width, to.width, progress);
  if (from.height != null && to.height != null) style.height = lerp(from.height, to.height, progress);

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}
