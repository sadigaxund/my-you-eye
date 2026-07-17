import { useMemo } from "react";
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

function ConnectionLine({
  className,
  variant = "bezier",
  state = "connected",
  from,
  to,
}: ConnectionLineProps) {
  const d = useMemo(() => generatePath(from, to, variant ?? "bezier"), [from, to, variant]);
  const minX = Math.min(from.x, to.x) - 20;
  const minY = Math.min(from.y, to.y) - 20;
  const maxX = Math.max(from.x, to.x) + 20;
  const maxY = Math.max(from.y, to.y) + 20;

  return (
    <svg
      className={cn(lineVariants({ variant, state }), className)}
      style={{
        position: "absolute",
        left: minX,
        top: minY,
        width: maxX - minX,
        height: maxY - minY,
        pointerEvents: "none",
      }}
    >
      <path d={d} />
    </svg>
  );
}

export { ConnectionLine, lineVariants, generatePath };
