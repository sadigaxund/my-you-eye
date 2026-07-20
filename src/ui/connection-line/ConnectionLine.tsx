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
    { className, variant = "bezier", state = "connected", from, to, arrowhead, label },
    ref,
  ) {
    const d = useMemo(() => generatePath(from, to, variant ?? "bezier"), [from, to, variant]);
    const arrowAngle = useMemo(() => getArrowAngle(from, to, variant ?? "bezier"), [from, to, variant]);
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;

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
            x={midX - label.length * 3.5 - 6}
            y={midY - 10}
            width={label.length * 7 + 12}
            height={20}
            className="overflow-visible pointer-events-none"
          >
            <span
              className="inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs text-fg font-mono bg-canvas-surface border border-border/60 shadow-sm whitespace-nowrap leading-none"
              style={{ backdropFilter: "blur(2px)" }}
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
