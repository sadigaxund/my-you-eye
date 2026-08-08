import { useLayoutEffect, useRef, useState } from "react";
import { useTimeline } from "../core/TimelineContext";
import { useProgress } from "../core/useProgress";
import { resolveBeatFrames } from "../core/beats";
import { colorVar } from "../core/tokens";
import type { Timing, MotionColor } from "../core";

export type TraceShape = "dot" | "square";

export type TraceProps = Timing & {
  /** SVG path data the tokens travel along. */
  d: string;
  /** viewBox for the wrapping <svg>. Default "0 0 100 100". */
  viewBox?: string;
  /** How many tokens travel at once, evenly spaced. Default 1. */
  count?: number;
  /** Spacing between tokens, as a 0-1 fraction of the path. Default 0.15. */
  spacing?: number;
  /** Loop continuously (each token cycles start-to-end every `duration`) instead of running once and stopping. Default true. */
  loop?: boolean;
  shape?: TraceShape;
  color?: MotionColor;
  /** Token size, in the path's own SVG user-space units. Default 3. */
  size?: number;
  className?: string;
};

/**
 * The data-flow primitive (TODO.md C2): one or more tokens travelling along
 * an arbitrary SVG path, for showing packets moving through an architecture
 * diagram. Position is read via `SVGGeometryElement.getPointAtLength()` off
 * a hidden reference `<path>` — deterministic given `d` (the path's own
 * geometry never changes frame to frame), so the same frame always yields
 * the same point. Like `Draw`, Trace only ever sees a `d` string — it does
 * not import `ConnectionLine`/`src/ui/` (AGENTS.md §9c rule 3).
 */
export function Trace({
  d,
  viewBox = "0 0 100 100",
  count = 1,
  spacing = 0.15,
  loop = true,
  shape = "dot",
  color = "primary",
  size = 3,
  className,
  ...timing
}: TraceProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const { frame, fps } = useTimeline();
  const onceProgress = useProgress(timing);

  useLayoutEffect(() => {
    if (pathRef.current) setPathLength(pathRef.current.getTotalLength());
  }, [d]);

  const cycleFrames = Math.max(1, resolveBeatFrames(timing.duration ?? "slow", fps));
  const delayFrames = timing.delay != null ? resolveBeatFrames(timing.delay, fps) : 0;
  const cycleProgress = loop ? (((frame - delayFrames) % cycleFrames) + cycleFrames) % cycleFrames / cycleFrames : onceProgress;

  const tokens = Array.from({ length: Math.max(1, count) }, (_, i) => {
    const phase = ((cycleProgress + i * spacing) % 1 + 1) % 1;
    const point = pathRef.current && pathLength > 0 ? pathRef.current.getPointAtLength(phase * pathLength) : { x: 0, y: 0 };
    return { key: i, x: point.x, y: point.y };
  });

  return (
    <svg viewBox={viewBox} className={className} style={{ overflow: "visible" }}>
      <path ref={pathRef} d={d} fill="none" stroke="none" aria-hidden />
      {tokens.map((t) =>
        shape === "dot" ? (
          <circle key={t.key} cx={t.x} cy={t.y} r={size / 2} fill={colorVar(color)} />
        ) : (
          <rect key={t.key} x={t.x - size / 2} y={t.y - size / 2} width={size} height={size} fill={colorVar(color)} />
        ),
      )}
    </svg>
  );
}
