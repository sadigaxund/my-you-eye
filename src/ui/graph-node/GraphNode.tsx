import { forwardRef } from "react";
import type { ReactNode, HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const graphNodeVariants = cva(
  "absolute flex flex-col rounded-ui border bg-bg shadow-sm min-w-[160px]",
  {
    variants: {
      variant: {
        default: "border-border",
        selected: "border-primary ring-2 ring-primary/20",
        muted: "border-border opacity-60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface PortDef {
  side: "left" | "right";
  label?: string;
  state?: "default" | "connected" | "highlighted";
}

export interface GraphNodeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof graphNodeVariants> {
  x: number;
  y: number;
  header?: ReactNode;
  accent?: boolean;
  ports?: PortDef[];
  footer?: ReactNode;
}

const GraphNode = forwardRef<HTMLDivElement, GraphNodeProps>(
  ({ className, variant, x, y, header, accent, ports, footer, children, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(graphNodeVariants({ variant }), className)}
      style={{ left: x, top: y, ...style }}
      {...props}
    >
      {accent && <div className="h-1 shrink-0 rounded-t-ui bg-primary" />}
      {header && (
        <div className="flex items-center px-3 py-2 border-b border-border">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex gap-0.5">
              <span className="size-1.5 rounded-full bg-muted" />
              <span className="size-1.5 rounded-full bg-muted" />
              <span className="size-1.5 rounded-full bg-muted" />
            </div>
            <span className="text-xs font-semibold truncate">{header}</span>
          </div>
        </div>
      )}
      {ports && ports.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {ports.map((p, i) => (
            <div
              key={i}
              className={cn(
                "absolute flex items-center gap-1 pointer-events-auto",
                p.side === "left" ? "-left-3" : "-right-3",
                "top-1/2 -translate-y-1/2",
              )}
            >
              <div
                className={cn(
                  "size-3 rounded-full border-2 bg-bg transition-colors",
                  p.state === "connected" ? "border-primary bg-primary" : "border-muted",
                  p.state === "highlighted" && "border-primary ring-2 ring-primary/30",
                )}
              />
            </div>
          ))}
        </div>
      )}
      {children && <div className="px-3 py-2 text-xs">{children}</div>}
      {footer && <div className="px-3 py-1.5 border-t border-border text-xs text-muted">{footer}</div>}
    </div>
  ),
);
GraphNode.displayName = "GraphNode";

export { GraphNode, graphNodeVariants };
