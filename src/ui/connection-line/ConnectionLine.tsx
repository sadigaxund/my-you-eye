import { forwardRef, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const lineVariants = cva("fill-none", {
  variants: {
    variant: {
      bezier: "",
      stepped: "",
      straight: "",
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

export interface ConnectionLineProps extends VariantProps<typeof lineVariants> {
  from: { x: number; y: number };
  to: { x: number; y: number };
  arrowhead?: boolean;
  label?: string;
  /** Position along the actual rendered path (0–100), default 50 (midpoint).
   * Evaluated in closed form on the cubic for `bezier`, walked by cumulative
   * segment length for `stepped`, and linear for `straight`. */
  labelPosition?: number;
  /** Toggles a subtle drop shadow on the label badge (default true). The
   * badge itself is always opaque (`bg-canvas-surface`) — see AGENTS.md
   * §0.12, ConnectionLine renders inside Canvas's transforming layer, so it
   * must never use `backdrop-filter`. */
  labelElevated?: boolean;
  className?: string;
}

type Point = { x: number; y: number };

/** Shared control-point rule for the default "bezier" variant — the single
 * source of truth consumed by both path generation and the label's
 * point-at-t evaluation, so they can never drift apart. */
function bezierControlPoints(from: Point, to: Point) {
  const dx = Math.abs(to.x - from.x);
  const cp = Math.max(dx * 0.5, 30);
  return {
    p0: from,
    p1: { x: from.x + cp, y: from.y },
    p2: { x: to.x - cp, y: to.y },
    p3: to,
  };
}

function generatePath(from: Point, to: Point, variant: string) {
  switch (variant) {
    case "stepped": {
      const midX = (from.x + to.x) / 2;
      return `M ${from.x} ${from.y} L ${midX} ${from.y} L ${midX} ${to.y} L ${to.x} ${to.y}`;
    }
    case "straight":
      return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
    default: {
      const { p1, p2, p3 } = bezierControlPoints(from, to);
      return `M ${from.x} ${from.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;
    }
  }
}

function getArrowAngle(from: Point, to: Point, variant: string): number {
  switch (variant) {
    case "stepped": {
      const midX = (from.x + to.x) / 2;
      return to.x >= midX ? 0 : 180;
    }
    case "straight":
      return Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);
    default:
      return 0;
  }
}

/** Point at fraction `t` (0–1) along a polyline, walked by cumulative
 * segment length rather than by segment index — so `t` is proportional to
 * actual drawn distance, not vertex count. */
function pointOnPolyline(points: Point[], t: number): Point {
  if (points.length === 1) return points[0];
  const segLens: number[] = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const len = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
    segLens.push(len);
    total += len;
  }
  if (total === 0) return points[0];
  let target = t * total;
  for (let i = 0; i < segLens.length; i++) {
    if (target <= segLens[i] || i === segLens.length - 1) {
      const frac = segLens[i] === 0 ? 0 : target / segLens[i];
      const p0 = points[i], p1 = points[i + 1];
      return { x: p0.x + (p1.x - p0.x) * frac, y: p0.y + (p1.y - p0.y) * frac };
    }
    target -= segLens[i];
  }
  return points[points.length - 1];
}

/** Point at fraction `t` (0–1) along the actual rendered edge path — the
 * closed-form cubic for "bezier", the walked polyline for "stepped", linear
 * for "straight". This is what makes `labelPosition` true to its JSDoc
 * ("position along the path"), instead of a straight-line lerp between the
 * endpoints that ignores the curve entirely. */
function getPointAtT(from: Point, to: Point, variant: string, t: number): Point {
  const ct = Math.max(0, Math.min(1, t));
  switch (variant) {
    case "stepped": {
      const midX = (from.x + to.x) / 2;
      return pointOnPolyline([from, { x: midX, y: from.y }, { x: midX, y: to.y }, to], ct);
    }
    case "straight":
      return { x: from.x + (to.x - from.x) * ct, y: from.y + (to.y - from.y) * ct };
    default: {
      const { p0, p1, p2, p3 } = bezierControlPoints(from, to);
      const u = 1 - ct;
      return {
        x: u * u * u * p0.x + 3 * u * u * ct * p1.x + 3 * u * ct * ct * p2.x + ct * ct * ct * p3.x,
        y: u * u * u * p0.y + 3 * u * u * ct * p1.y + 3 * u * ct * ct * p2.y + ct * ct * ct * p3.y,
      };
    }
  }
}

const ARROWHEAD_COLOR: Record<string, string> = {
  connected: "text-primary",
  highlighted: "text-primary",
  default: "text-muted",
  pending: "text-muted",
};

/**
 * Renders one edge's path, arrowhead and label — everything a `<svg>` needs
 * as children, but not the `<svg>` itself. `ConnectionLine` wraps this in
 * its own full-size svg for standalone use; `ConnectionLayer` (a sibling
 * component in `src/ui/connection-layer/`) renders many of these inside a
 * single shared svg so an N-edge diagram costs one stacking context instead
 * of N. This is the single place the path/arrow/label math lives — nothing
 * about an edge is ever duplicated between the two consumers.
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
  className,
}: ConnectionLineProps) {
  const d = useMemo(() => generatePath(from, to, variant ?? "bezier"), [from, to, variant]);
  const arrowAngle = useMemo(() => getArrowAngle(from, to, variant ?? "bezier"), [from, to, variant]);
  const t = useMemo(() => Math.max(0, Math.min(100, labelPosition ?? 50)) / 100, [labelPosition]);
  const point = useMemo(() => getPointAtT(from, to, variant ?? "bezier", t), [from, to, variant, t]);
  const minX = Math.min(from.x, to.x);
  const maxX = Math.max(from.x, to.x);

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

  const halfW = labelSize.width / 2;
  const badgeX = label ? Math.max(minX, Math.min(maxX - labelSize.width, point.x - halfW)) : 0;

  return (
    <>
      <path d={d} className={cn(lineVariants({ variant, state }), className)} />
      {arrowhead && (
        <polygon
          points="0,-4 8,0 0,4"
          fill="currentColor"
          className={ARROWHEAD_COLOR[state ?? "connected"]}
          transform={`translate(${to.x},${to.y}) rotate(${arrowAngle})`}
        />
      )}
      {label && (
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
      )}
    </>
  );
}

const ConnectionLine = forwardRef<SVGSVGElement, ConnectionLineProps>(
  function ConnectionLine(props, ref) {
    return (
      <svg
        ref={ref}
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
      >
        <ConnectionPath {...props} />
      </svg>
    );
  },
);
ConnectionLine.displayName = "ConnectionLine";

export { ConnectionLine, ConnectionPath, lineVariants, generatePath, getArrowAngle, getPointAtT };
