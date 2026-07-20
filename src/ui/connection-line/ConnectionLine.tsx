import { forwardRef, useMemo } from "react";
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
  /** Position along the path (0–100), default 50 (midpoint). */
  labelPosition?: number;
  /** Enable elevated effect (shadow + blur) on label badge. Default true. */
  labelElevated?: boolean;
  className?: string;
}

function generatePath(from: { x: number; y: number }, to: { x: number; y: number }, variant: string) {
  switch (variant) {
    case "stepped": {
      const midX = (from.x + to.x) / 2;
      return `M ${from.x} ${from.y} L ${midX} ${from.y} L ${midX} ${to.y} L ${to.x} ${to.y}`;
    }
    case "straight":
      return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
    default: {
      const dx = Math.abs(to.x - from.x);
      const cp = Math.max(dx * 0.5, 30);
      return `M ${from.x} ${from.y} C ${from.x + cp} ${from.y}, ${to.x - cp} ${to.y}, ${to.x} ${to.y}`;
    }
  }
}

function getArrowAngle(from: { x: number; y: number }, to: { x: number; y: number }, variant: string): number {
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

const ARROWHEAD_COLOR: Record<string, string> = {
  connected: "text-primary",
  highlighted: "text-primary",
  default: "text-muted",
  pending: "text-muted",
};

const ConnectionLine = forwardRef<SVGSVGElement, ConnectionLineProps>(
  function ConnectionLine(
    { className, variant = "bezier", state = "connected", from, to, arrowhead, label, labelPosition = 50, labelElevated = true },
    ref,
  ) {
    const d = useMemo(() => generatePath(from, to, variant ?? "bezier"), [from, to, variant]);
    const arrowAngle = useMemo(() => getArrowAngle(from, to, variant ?? "bezier"), [from, to, variant]);
    const pct = useMemo(() => Math.max(0, Math.min(100, labelPosition ?? 50)) / 100, [labelPosition]);
    const lx = from.x + (to.x - from.x) * pct;
    const ly = from.y + (to.y - from.y) * pct;
    const minX = Math.min(from.x, to.x);
    const maxX = Math.max(from.x, to.x);
    const halfW = label ? label.length * 3.5 + 6 : 0;
    const badgeX = Math.max(minX, Math.min(maxX - halfW * 2, lx - halfW));

    return (
      <svg
        ref={ref}
        className={cn(
          lineVariants({ variant, state }),
          "absolute inset-0 w-full h-full pointer-events-none overflow-visible",
          className,
        )}
      >
        <path d={d} />
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
            y={ly - 10}
            width={halfW * 2}
            height={20}
            className="overflow-visible pointer-events-none"
          >
            <span
              className={cn(
                "inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs text-fg font-mono bg-canvas-surface border border-border/60 whitespace-nowrap leading-none",
                labelElevated && "shadow-sm",
              )}
              style={labelElevated ? { backdropFilter: "blur(2px)" } : undefined}
            >
              {label}
            </span>
          </foreignObject>
        )}
      </svg>
    );
  },
);
ConnectionLine.displayName = "ConnectionLine";

export { ConnectionLine, lineVariants, generatePath };
