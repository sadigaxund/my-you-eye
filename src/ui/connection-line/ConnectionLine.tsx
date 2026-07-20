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

const ConnectionLine = forwardRef<SVGSVGElement, ConnectionLineProps>(
  function ConnectionLine(
    { className, variant = "bezier", state = "connected", from, to },
    ref,
  ) {
    const d = useMemo(() => generatePath(from, to, variant ?? "bezier"), [from, to, variant]);

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
      </svg>
    );
  },
);
ConnectionLine.displayName = "ConnectionLine";

export { ConnectionLine, lineVariants, generatePath };
