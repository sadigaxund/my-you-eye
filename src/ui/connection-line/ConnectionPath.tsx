import { createContext, useContext, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { getArrowAngle, getPointAtT } from "./geometry";
import type { ConnectionKind, ConnectionVariant, ObstacleRect, Point } from "./geometry";
import { generateGappedPath, getRouteLength } from "./gapped-path";

export type { Point, ObstacleRect, ConnectionKind, ConnectionVariant };

const lineVariants = cva("fill-none", {
  variants: {
    variant: {
      bezier: "",
      stepped: "",
      straight: "",
      orthogonal: "",
    },
    state: {
      default: "stroke-muted stroke-[2px]",
      connected: "stroke-primary stroke-[2px]",
      highlighted: "stroke-primary stroke-[2px] drop-shadow-[0_0_4px_var(--color-primary)]",
      pending: "stroke-muted stroke-[2px] opacity-60 [stroke-dasharray:6_3]",
    },
  },
  defaultVariants: {
    variant: "bezier",
    state: "connected",
  },
});

// `kind` is an orthogonal styling axis from `state`: it names what an edge
// *is* (a sync call, a fire-and-forget async call, a data flow, an error
// path) rather than its current interaction state. When set, it replaces
// state's color/dash-pattern entirely (state still layers dim/glow — see
// below) so the two axes never fight over which utility class wins the
// Tailwind cascade. Literal class names (not template interpolation) so
// Tailwind's build-time scanner picks them up — same rule as chart-tokens.ts.
const KIND_STYLES: Record<ConnectionKind, string> = {
  sync: "stroke-primary stroke-[2px]",
  async: "stroke-chart-2 stroke-[2px] [stroke-dasharray:6_3]",
  data: "stroke-chart-4 stroke-[2px] [stroke-dasharray:1_4] [stroke-linecap:round]",
  error: "stroke-danger stroke-[2px] [stroke-dasharray:4_3]",
};

const KIND_TEXT_COLOR: Record<ConnectionKind, string> = {
  sync: "text-primary",
  async: "text-chart-2",
  data: "text-chart-4",
  error: "text-danger",
};

export interface ConnectionLineProps extends VariantProps<typeof lineVariants> {
  from: Point;
  to: Point;
  arrowhead?: boolean;
  label?: string;
  /** Position along the actual rendered path (0–100), default 50 (midpoint).
   * Evaluated in closed form on the cubic for `bezier`, walked by cumulative
   * segment length for the piecewise-linear variants (`stepped`,
   * `straight`, `orthogonal`). */
  labelPosition?: number;
  /** Toggles a subtle drop shadow on the label badge (default true). The
   * badge background is always opaque (`bg-canvas-surface`) AND the edge's
   * own stroke is interrupted (gapped) underneath it — see
   * `generateGappedPath` — so the label reads cleanly regardless of theme
   * or path curvature. ConnectionLine renders inside Canvas's transforming
   * layer, so it must never use `backdrop-filter` (AGENTS.md §0.12). */
  labelElevated?: boolean;
  /** Points the route must pass through, in order, between `from` and `to`.
   * Works with every variant; pins an explicit route instead of the
   * variant's default shape. */
  waypoints?: Point[];
  /** Rects an `orthogonal` route detours around. Ignored by other variants. */
  obstacles?: ObstacleRect[];
  /** Semantic edge type — see `KIND_STYLES`. Independent of `state`. */
  kind?: ConnectionKind;
  /** Perpendicular offset (px) applied to the whole route. Set by
   * `ConnectionLayer` automatically for edges that share an endpoint pair
   * (parallel-edge bundling); can also be set directly for manual control. */
  offset?: number;
  className?: string;
}

const ARROWHEAD_COLOR: Record<string, string> = {
  connected: "text-primary",
  highlighted: "text-primary",
  default: "text-muted",
  pending: "text-muted",
};

const LABEL_GAP_PADDING = 6;

/**
 * When set (by `ConnectionLayer`), every edge's label `<foreignObject>` is
 * portaled into this shared `<g>` instead of rendering inline where the
 * edge's own `<path>` sits. The `<g>` is the last child of the layer's
 * `<svg>`, so — regardless of edge order — every label paints after every
 * edge's stroke. That's what makes "a label must never be occluded by
 * ANOTHER edge's line" a structural guarantee instead of a z-order
 * coincidence. Standalone `ConnectionLine` never provides this context, so
 * it renders its own label inline exactly as before (nothing to guarantee
 * against — there's only one edge in that svg).
 */
export const ConnectionLabelPortalContext = createContext<SVGGElement | null>(null);

/**
 * Renders one edge's path, arrowhead and label — everything a `<svg>` needs
 * as children, but not the `<svg>` itself. `ConnectionLine` wraps this in
 * its own full-size svg for standalone use; `ConnectionLayer` (a sibling
 * component in `src/ui/connection-layer/`) renders many of these inside a
 * single shared svg so an N-edge diagram costs one stacking context instead
 * of N. This is the single place the path/arrow/label math lives (via
 * `./geometry`) — nothing about an edge is ever duplicated between the two
 * consumers.
 */
function ConnectionPath({
  variant = "bezier",
  state = "connected",
  from,
  to,
  arrowhead,
  label,
  labelPosition = 50,
  labelElevated = true,
  waypoints,
  obstacles,
  kind,
  offset,
  className,
}: ConnectionLineProps) {
  const v = (variant ?? "bezier") as ConnectionVariant;
  const opts = useMemo(() => ({ waypoints, obstacles, offset }), [waypoints, obstacles, offset]);

  const arrowAngle = useMemo(() => getArrowAngle(from, to, v, opts), [from, to, v, opts]);
  const t = useMemo(() => Math.max(0, Math.min(100, labelPosition ?? 50)) / 100, [labelPosition]);
  const point = useMemo(() => getPointAtT(from, to, v, t, opts), [from, to, v, t, opts]);
  const routeLength = useMemo(() => getRouteLength(from, to, v, opts), [from, to, v, opts]);

  // Label badge size comes from measuring the actual rendered text (real
  // DOM, real font), not a guessed `label.length * charWidth` — that guess
  // is wrong for any non-monospace or wide-glyph (non-ASCII) label. The
  // foreignObject itself stays overflow-visible and generously sized, so
  // there's nothing to clip before the first measurement lands; the
  // ResizeObserver keeps it correct across a runtime font change too.
  const labelRef = useRef<HTMLSpanElement>(null);
  const [labelSize, setLabelSize] = useState({ width: 0, height: 20 });

  useLayoutEffect(() => {
    const el = labelRef.current;
    if (!el) return;
    // offsetWidth/Height, never getBoundingClientRect(): the latter reports
    // post-transform viewport pixels, and ConnectionLine renders inside
    // Canvas's `scale(zoom)` layer (AGENTS.md §7). The measured value is fed
    // back as SVG user units, so a rect-based measurement would be off by
    // exactly the zoom factor — the badge would drift sideways as you zoom.
    // offset* is layout-space and therefore zoom-invariant.
    const measure = () => {
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      setLabelSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [label]);

  // The edge's own stroke is interrupted underneath its own label — the
  // conventional diagramming fix, rather than trusting the badge's opacity
  // (and z-order relative to every OTHER edge sharing the svg) to hide it.
  // This is what actually fixes "the label reads as translucent and the
  // line shows through" on a curved path: there is no line there anymore.
  const sLabel = label ? t * routeLength : null;
  const gapHalfLen = label && labelSize.width > 0 ? labelSize.width / 2 + LABEL_GAP_PADDING : 0;
  // Empty when a label's gap swallows the entire (very short) route — a
  // no-op path, not a bug: there's nothing to draw once the badge covers
  // the whole edge.
  const d = useMemo(
    () => generateGappedPath(from, to, v, sLabel, gapHalfLen, opts),
    [from, to, v, sLabel, gapHalfLen, opts],
  );

  // Bounding box of the actual route (not just from/to) so the badge stays
  // clamped to the drawn path even when it detours (orthogonal obstacle
  // avoidance, waypoints) well outside the straight-line span of the
  // endpoints.
  const allX = [from.x, to.x, ...(waypoints ?? []).map((p) => p.x)];
  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);

  const halfW = labelSize.width / 2;
  const badgeX = label ? Math.max(minX, Math.min(maxX - labelSize.width, point.x - halfW)) : 0;

  const strokeClassName = kind ? KIND_STYLES[kind] : lineVariants({ variant: v, state });
  const stateDecoration = kind
    ? cn(state === "highlighted" && "drop-shadow-[0_0_4px_var(--color-primary)]", state === "pending" && "opacity-60")
    : undefined;
  const arrowColor = kind ? KIND_TEXT_COLOR[kind] : ARROWHEAD_COLOR[state ?? "connected"];

  const portalTarget = useContext(ConnectionLabelPortalContext);
  const labelNode = label && (
    <foreignObject
      x={badgeX}
      y={point.y - labelSize.height / 2}
      width={Math.max(labelSize.width, 1)}
      height={Math.max(labelSize.height, 1)}
      className="overflow-visible pointer-events-none"
    >
      <span
        ref={labelRef}
        className={cn(
          "inline-flex items-center rounded-ui-sm px-1.5 py-0.5 text-xs text-fg font-mono bg-canvas-surface border border-border/60 whitespace-nowrap leading-none",
          labelElevated && "shadow-subtle",
        )}
      >
        {label}
      </span>
    </foreignObject>
  );

  return (
    <>
      <path d={d} className={cn("fill-none", strokeClassName, stateDecoration, className)} />
      {arrowhead && (
        <polygon
          points="0,-4 8,0 0,4"
          fill="currentColor"
          className={arrowColor}
          transform={`translate(${to.x},${to.y}) rotate(${arrowAngle})`}
        />
      )}
      {label && (portalTarget ? createPortal(labelNode, portalTarget) : labelNode)}
    </>
  );
}

export { ConnectionPath, lineVariants };
