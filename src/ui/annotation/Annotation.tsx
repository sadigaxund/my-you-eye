import { forwardRef, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { generatePath, getArrowAngle, getRouteLength } from "../connection-line";
import type { ConnectionVariant, Point } from "../connection-line";

// Literal class names (not template interpolation) — same rule as
// GraphGroup's GROUP_BORDER / connection-line's KIND_STYLES.
const STROKE: Record<NonNullable<AnnotationProps["accentColor"]>, string> = {
  primary: "stroke-primary", success: "stroke-success", warning: "stroke-warning",
  danger: "stroke-danger", muted: "stroke-muted",
};
const FILL: Record<NonNullable<AnnotationProps["accentColor"]>, string> = {
  primary: "fill-primary", success: "fill-success", warning: "fill-warning",
  danger: "fill-danger", muted: "fill-muted",
};
const TEXT: Record<NonNullable<AnnotationProps["accentColor"]>, string> = {
  primary: "text-primary", success: "text-success", warning: "text-warning",
  danger: "text-danger", muted: "text-muted",
};

export interface AnnotationProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Point being annotated, in the same coordinate space as the nearest
   * `position: relative` ancestor (e.g. a `Canvas`'s canvas-space, or a
   * screenshot `Image`'s own pixel space). */
  target: Point;
  label: ReactNode;
  /** Preferred side the label sits on. "left"/"right" (default "right") are
   * auto-flipped near a container edge when `containerWidth` is given;
   * "top"/"bottom" anchor the label directly above/below `target` instead
   * (no auto-flip — there's no `containerHeight` prop to flip against, so a
   * vertical leader always renders on the side you asked for). */
  side?: "left" | "right" | "top" | "bottom";
  /** Distance (px) from `target` to the label's near edge, before flip. Default 64. */
  distance?: number;
  /** Pointer-end decoration at `target`. Default "arrow". */
  marker?: "none" | "arrow" | "pin";
  /** Leader-line shape — reuses `connection-line/geometry.ts`'s own variant
   * names (a subset: a callout leader is either direct or right-angled,
   * never a curve). Default "straight". */
  leaderVariant?: Extract<ConnectionVariant, "straight" | "stepped">;
  /** Width (px) of the space Annotation overlays — used only to flip the
   * label to the opposite side of `target` before it would run past this
   * edge. Omit to disable flipping (label always renders on `side`). */
  containerWidth?: number;
  /** 0→1 reveal progress, default 1. The leader line strokes on first
   * (`stroke-dashoffset`, computed directly from `progress` — no CSS
   * transition/keyframes), then the label and marker fade in over the back
   * half. A pure function of this prop, per AGENTS.md §0 rule 6. */
  progress?: number;
  accentColor?: "primary" | "success" | "warning" | "danger" | "muted";
}

// Leader line draws over the first 60% of `progress`; label + marker fade
// over the remaining 40%. Not configurable — a fixed split keeps every
// Annotation in a diagram reveal in visual lockstep regardless of leader
// length (a longer line wouldn't otherwise finish later than a short one
// under a shared `progress` driver, since length only affects dash length,
// not the fraction of `progress` consumed).
const LINE_PHASE = 0.6;

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/**
 * A callout/leader-line pointing at a target point — highlighting part of a
 * diagram or screenshot in a video. The leader line's path math (straight or
 * right-angled) and its arrowhead angle both come straight from
 * `connection-line/geometry.ts` (`generatePath`, `getRouteLength`,
 * `getArrowAngle`) — nothing here re-derives path geometry.
 *
 * The label is a plain absolutely-positioned box (not an SVG
 * `foreignObject`) measured with `offsetWidth` (never
 * `getBoundingClientRect`, per AGENTS.md §7 — this can render inside a
 * zoomed `Canvas`) via a `ResizeObserver`, the same pattern
 * `ConnectionPath`'s own label badge uses.
 */
const Annotation = forwardRef<HTMLDivElement, AnnotationProps>(
  (
    {
      className, target, label, side = "right", distance = 64, marker = "arrow",
      leaderVariant = "straight", containerWidth, progress = 1, accentColor = "primary",
      style, ...props
    },
    ref,
  ) => {
    const p = clamp01(progress);
    const lineT = clamp01(p / LINE_PHASE);
    const labelT = clamp01((p - LINE_PHASE) / (1 - LINE_PHASE));

    const labelRef = useRef<HTMLDivElement>(null);
    const [labelWidth, setLabelWidth] = useState(0);

    useLayoutEffect(() => {
      const el = labelRef.current;
      if (!el) return;
      // offsetWidth, never getBoundingClientRect() — see AGENTS.md §7.
      const measure = () => setLabelWidth((w) => (w === el.offsetWidth ? w : el.offsetWidth));
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }, [label]);

    const isVertical = side === "top" || side === "bottom";

    const resolvedSide = useMemo(() => {
      // Auto-flip is a left/right-only affordance (it's evaluated against
      // `containerWidth`, a horizontal extent) — "top"/"bottom" always
      // render on the side asked for.
      if (isVertical || containerWidth == null) return side;
      const wouldOverflowRight = side === "right" && target.x + distance + labelWidth > containerWidth;
      const wouldOverflowLeft = side === "left" && target.x - distance - labelWidth < 0;
      if (wouldOverflowRight) return "left";
      if (wouldOverflowLeft) return "right";
      return side;
    }, [side, isVertical, containerWidth, target.x, distance, labelWidth]);

    const anchor: Point = useMemo(() => {
      if (resolvedSide === "top") return { x: target.x, y: target.y - distance };
      if (resolvedSide === "bottom") return { x: target.x, y: target.y + distance };
      return { x: resolvedSide === "right" ? target.x + distance : target.x - distance, y: target.y };
    }, [resolvedSide, target.x, target.y, distance]);

    const d = useMemo(() => generatePath(anchor, target, leaderVariant), [anchor, target, leaderVariant]);
    const length = useMemo(() => getRouteLength(anchor, target, leaderVariant), [anchor, target, leaderVariant]);
    const angle = useMemo(() => getArrowAngle(anchor, target, leaderVariant), [anchor, target, leaderVariant]);

    // Horizontal sides position the label's near edge at the anchor and
    // center it vertically (translateY(-50%), unchanged from before "top"/
    // "bottom" existed); vertical sides center it horizontally on the
    // anchor and stack it above/below via the label's own transform.
    const labelLeft = isVertical ? anchor.x - labelWidth / 2 : resolvedSide === "right" ? anchor.x : anchor.x - labelWidth;
    const labelTransform =
      resolvedSide === "top" ? "translate(-50%, -100%)" : resolvedSide === "bottom" ? "translateX(-50%)" : "translateY(-50%)";

    return (
      <div ref={ref} className={cn("absolute inset-0 pointer-events-none", className)} style={style} {...props}>
        <svg className="absolute inset-0 w-full h-full overflow-visible">
          <path
            d={d}
            className={cn("fill-none stroke-[1.5px]", STROKE[accentColor])}
            strokeDasharray={length}
            strokeDashoffset={length * (1 - lineT)}
          />
          {marker === "arrow" && lineT >= 1 && (
            <polygon
              points="0,-4 8,0 0,4"
              className={FILL[accentColor]}
              transform={`translate(${target.x},${target.y}) rotate(${angle})`}
            />
          )}
          {marker === "pin" && lineT >= 1 && (
            <g className={STROKE[accentColor]}>
              <circle cx={target.x} cy={target.y} r={7} className="fill-none stroke-[1.5px]" />
              <circle cx={target.x} cy={target.y} r={2} className={FILL[accentColor]} />
            </g>
          )}
        </svg>
        <div
          ref={labelRef}
          className={cn(
            "absolute inline-flex max-w-64 items-center rounded-ui-sm border border-border/60 bg-canvas-surface px-2 py-1 text-xs shadow-subtle",
            TEXT[accentColor],
          )}
          style={{ left: labelLeft, top: anchor.y, transform: labelTransform, opacity: labelT }}
        >
          {label}
        </div>
      </div>
    );
  },
);
Annotation.displayName = "Annotation";

export { Annotation };
