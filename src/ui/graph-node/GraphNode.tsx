import { forwardRef } from "react";
import type { ReactNode, HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { nodeHeightPx, HEADER, ROW, GRID } from "./grid";

const graphNodeVariants = cva(
  "absolute flex flex-col rounded-ui border bg-bg shadow-card min-w-[160px] overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-border",
        selected: "border-primary ring-2 ring-primary/20",
        muted: "border-border opacity-dim",
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

export interface GraphNodeRow {
  label: string;
  value: ReactNode;
  portLeft?: PortDef;
  portRight?: PortDef;
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
  rows?: GraphNodeRow[];
}

function PortDot({ state }: { state?: "default" | "connected" | "highlighted" }) {
  return (
    <div
      className={cn(
        "size-3 rounded-full border-2 bg-bg transition-colors shrink-0",
        state === "connected" ? "border-primary bg-primary" : "border-muted",
        state === "highlighted" && "border-primary ring-2 ring-primary/30",
      )}
    />
  );
}

const GraphNode = forwardRef<HTMLDivElement, GraphNodeProps>(
  ({ className, variant, x, y, header, accent, ports, footer, rows, children, style, ...props }, ref) => {
    const hasRows = rows && rows.length > 0;
    const height = hasRows ? nodeHeightPx(rows!.length, !!footer) : undefined;

    return (
      <div
        ref={ref}
        className={cn(graphNodeVariants({ variant }), className)}
        style={{ left: x, top: y, height, ...style }}
        {...props}
      >
        {accent && <div className="h-1 shrink-0 rounded-t-ui bg-primary" />}
        {header && (
          <div className="flex items-center px-3 border-b border-border shrink-0" style={{ height: HEADER * GRID - 1 }}>
            <div className="flex items-center gap-inline flex-1 min-w-0">
              <div className="flex gap-0.5">
                <span className="size-1.5 rounded-full bg-muted" />
                <span className="size-1.5 rounded-full bg-muted" />
                <span className="size-1.5 rounded-full bg-muted" />
              </div>
              <span className="text-xs font-semibold truncate">{header}</span>
            </div>
          </div>
        )}
        {hasRows ? (
          <div className="flex-1 divide-y divide-border/50 relative">
            {rows!.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 px-3 text-xs items-center relative"
                style={{ height: ROW * GRID }}
              >
                <span className="text-muted truncate">{row.label}</span>
                <span className="text-fg text-right">{row.value}</span>
                {row.portLeft && (
                  <div
                    className="absolute left-0 -translate-x-1/2 pointer-events-auto"
                    style={{ top: "50%" }}
                  >
                    <PortDot state={row.portLeft.state} />
                  </div>
                )}
                {row.portRight && (
                  <div
                    className="absolute right-0 translate-x-1/2 pointer-events-auto"
                    style={{ top: "50%" }}
                  >
                    <PortDot state={row.portRight.state} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          children && <div className="px-3 py-2 text-xs flex-1">{children}</div>
        )}
        {ports && ports.length > 0 && !hasRows && (
          <div className="absolute inset-0 pointer-events-none">
            {ports.map((p, i) => {
              const leftPorts = ports.filter((x) => x.side === "left");
              const rightPorts = ports.filter((x) => x.side === "right");
              const isLeft = p.side === "left";
              const idx = isLeft ? leftPorts.indexOf(p) : rightPorts.indexOf(p);
              const total = isLeft ? leftPorts.length : rightPorts.length;
              const totalCells = 2;
              const yPos = (totalCells * GRID) / (total + 1) * (idx + 1);
              return (
                <div
                  key={i}
                  className={cn(
                    "absolute flex items-center gap-1.5 pointer-events-auto whitespace-nowrap",
                    isLeft ? "right-full flex-row-reverse mr-1.5" : "left-full flex-row ml-1.5",
                  )}
                  style={{ top: yPos, transform: "translateY(-50%)" }}
                >
                  <PortDot state={p.state} />
                  {p.label && <span className="text-xs text-muted">{p.label}</span>}
                </div>
              );
            })}
          </div>
        )}
        {footer && (
          <div className="px-3 border-t border-border text-xs text-muted flex items-center shrink-0" style={{ height: GRID }}>
            {footer}
          </div>
        )}
      </div>
    );
  },
);
GraphNode.displayName = "GraphNode";

export { GraphNode, graphNodeVariants };
