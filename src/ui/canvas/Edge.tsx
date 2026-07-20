import { useMemo } from "react";
import type { SVGAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { generatePath } from "../connection-line";

const edgeVariants = cva("fill-none", {
  variants: {
    state: {
      default: "stroke-border stroke-[2px]",
      connected: "stroke-primary stroke-[2px]",
      highlighted: "stroke-primary stroke-[3px] drop-shadow-[0_0_4px_var(--color-primary)]",
      pending: "stroke-muted stroke-[2px] opacity-60 [stroke-dasharray:6_3]",
    },
  },
  defaultVariants: {
    state: "default",
  },
});

export interface EdgeProps extends VariantProps<typeof edgeVariants>, Omit<SVGAttributes<SVGPathElement>, "d" | "stroke" | "fill" | "from" | "to"> {
  from: { x: number; y: number };
  to: { x: number; y: number };
  hitStrokeWidth?: number;
}

const HIT_STROKE = 12;

function Edge({ from, to, state, className, hitStrokeWidth = HIT_STROKE, onClick, onContextMenu, ...props }: EdgeProps) {
  const d = useMemo(() => generatePath(from, to, "bezier"), [from, to]);

  return (
    <g onMouseDown={(e) => e.stopPropagation()}>
      {onClick || onContextMenu ? (
        <path d={d} fill="none" stroke="transparent" strokeWidth={hitStrokeWidth}
          className="cursor-pointer pointer-events-auto"
          onClick={onClick} onContextMenu={onContextMenu} />
      ) : null}
      <path d={d} className={cn(edgeVariants({ state }), "pointer-events-none", className)} {...props} />
    </g>
  );
}

export { Edge, edgeVariants };
