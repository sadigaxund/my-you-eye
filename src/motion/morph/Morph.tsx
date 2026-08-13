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
  /**
   * A second node cross-faded in as `children` cross-fades out, both sharing
   * the same interpolated position/size (e.g. a list row's summary
   * cross-fading into its own detail panel while the box resizes). Omit for
   * the plain single-node reposition/resize case. When set, `children` is
   * read as the "from" content and `toChildren` as the "to" content —
   * `from.opacity`/`to.opacity` still apply on top of the cross-fade, so a
   * snapshot can fade past its counterpart instead of only swapping at 1:1.
   */
  toChildren?: ReactNode;
  className?: string;
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Interpolates position/size/opacity between two caller-supplied snapshots
 * (TODO.md C5) — this is a deliberately simplified lerp, **not** shape
 * morphing: it cannot turn one object into a visually different one, and it
 * never diffs or measures the DOM. Real FLIP normally diffs
 * `getBoundingClientRect()` before/after a layout change happens, but that
 * requires two wall-clock-timed renders, which a frame-driven primitive
 * can't do (AGENTS.md §9c rule 1: no side effects in render, no
 * `useEffect`-driven measurement loop). Instead the caller — typically a
 * future `src/scenes/` component that already knows both layout states —
 * measures both and hands Morph two plain snapshots to interpolate
 * between. Morph stays a generic, child-agnostic wrapper: it never
 * measures anything itself. Renders `position: absolute` — needs a
 * `position: relative` ancestor.
 *
 * What it's for: a card sliding + resizing between two layout slots, a
 * cross-fade between two different elements sharing one box (`toChildren`),
 * a list row expanding into a detail panel. What it is NOT for: turning one
 * shape into an unrelated one, animating SVG path data, or morphing images
 * pixel-by-pixel — none of that is implemented here.
 */
export function Morph({ children, toChildren, from, to, className, ...timing }: MorphProps) {
  const progress = useProgress(timing);

  const x = lerp(from.x, to.x, progress);
  const y = lerp(from.y, to.y, progress);
  const fromOpacity = lerp(from.opacity ?? 1, 0, toChildren != null ? progress : 0);
  const toOpacity = toChildren != null ? lerp(0, to.opacity ?? 1, progress) : lerp(from.opacity ?? 1, to.opacity ?? 1, progress);

  const style: CSSProperties = {
    position: "absolute",
    transform: `translate(${x}px, ${y}px)`,
  };
  if (from.width != null && to.width != null) style.width = lerp(from.width, to.width, progress);
  if (from.height != null && to.height != null) style.height = lerp(from.height, to.height, progress);

  if (toChildren == null) {
    return (
      <div className={className} style={{ ...style, opacity: toOpacity }}>
        {children}
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <div style={{ position: "absolute", inset: 0, opacity: fromOpacity }}>{children}</div>
      <div style={{ position: "absolute", inset: 0, opacity: toOpacity }}>{toChildren}</div>
    </div>
  );
}
