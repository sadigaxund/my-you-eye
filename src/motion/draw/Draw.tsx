import { useProgress } from "../core/useProgress";
import { colorVar } from "../core/tokens";
import type { Timing, MotionColor } from "../core";

export type DrawStrokeWidth = "sm" | "md" | "lg";

// SVG stroke-width is a user-space unit relative to the caller's own
// viewBox, not a CSS px value — there's no tokens.css concept that maps
// onto it (unlike distanceExpr/blurExpr, which are real CSS px). These are
// small, deliberately-scaled integers, documented the same way Reveal
// documents SCALE_START.
const STROKE_WIDTH: Record<DrawStrokeWidth, number> = { sm: 1.5, md: 2.5, lg: 4 };

export type DrawProps = Timing & {
  /** SVG path data to draw. */
  d: string;
  /** viewBox for the wrapping <svg>. Default "0 0 100 100". */
  viewBox?: string;
  color?: MotionColor;
  strokeWidth?: DrawStrokeWidth;
  className?: string;
};

/**
 * `stroke-dashoffset` reveal on an arbitrary SVG path, a pure function of
 * `useProgress()` (TODO.md C1). Pairs conceptually with `ConnectionLine`/
 * `ConnectionLayer` (src/ui/) for animating diagram edges, but Draw itself
 * only ever sees a `d` string — it never imports `src/ui/` (AGENTS.md §9c
 * rule 3).
 *
 * Normalised via the SVG `pathLength` attribute: setting `pathLength={1}`
 * on the `<path>` makes the browser rescale `stroke-dasharray`/
 * `stroke-dashoffset` into a 0–1 space regardless of the path's actual
 * rendered length in px, so the same `1 - progress` dashoffset draws
 * correctly at any size or viewBox — resolution-independent by
 * construction, not by measuring anything.
 */
export function Draw({ d, viewBox = "0 0 100 100", color = "primary", strokeWidth = "md", className, ...timing }: DrawProps) {
  const progress = useProgress(timing);

  return (
    <svg viewBox={viewBox} className={className} style={{ overflow: "visible" }}>
      <path
        d={d}
        pathLength={1}
        fill="none"
        stroke={colorVar(color)}
        strokeWidth={STROKE_WIDTH[strokeWidth]}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ strokeDasharray: 1, strokeDashoffset: 1 - progress }}
      />
    </svg>
  );
}
