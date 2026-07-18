import { forwardRef } from "react";
import type { ReactNode, HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { nodeHeightPx, portY, HEADER, ROW, FOOTER, GRID } from "./grid";
import { Port } from "../port";

const ROW_PORT_Y_OFFSET = HEADER * GRID;

const graphNodeVariants = cva(
  // `bg-canvas-surface` (never `bg-surface`): nodes render an opaque,
  // blur-free surface regardless of theme — see the "Canvas surface
  // boundary" token set in tokens.css / AGENTS.md §7. `contain-[layout_paint]`
  // scopes each node's layout/paint work so one node's content changes never
  // force a reflow/repaint of its siblings while panning/zooming.
  "absolute flex flex-col rounded-node border bg-canvas-surface shadow-card min-w-[160px] overflow-hidden contain-[layout_paint]",
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
        {header && (
          <div className={cn("flex flex-col shrink-0", accent && "border-t-2 border-primary")} style={{ height: HEADER * GRID }}>
            <div className="flex items-center px-3 border-b border-border flex-1 min-h-0">
              <div className="flex items-center gap-inline flex-1 min-w-0">
                <div className="flex gap-0.5">
                  <span className="size-1.5 rounded-full bg-danger" />
                  <span className="size-1.5 rounded-full bg-warning" />
                  <span className="size-1.5 rounded-full bg-success" />
                </div>
                <span className="text-xs font-semibold truncate">{header}</span>
              </div>
            </div>
          </div>
        )}
        {hasRows ? (
          <div className="flex-1 overflow-hidden relative">
            {rows!.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 px-3 text-xs items-center border-b border-border/50 last:border-b-0 hover:bg-muted/10 transition-colors"
                style={{ height: ROW * GRID }}
              >
                <span className="text-muted truncate">{row.label}</span>
                <span className="text-fg text-right">{row.value}</span>
              </div>
            ))}
            <div className="absolute inset-0 pointer-events-none">
              {rows!.map((row, i) => (
                <div key={`ports-${i}`}>
                  {row.portLeft && (
                    <div
                      className="absolute pointer-events-auto"
                      style={{ left: "0px", top: portY(i) - ROW_PORT_Y_OFFSET, transform: "translate(-50%, -50%)" }}
                    >
                      <Port state={row.portLeft.state} side="in" />
                    </div>
                  )}
                  {row.portRight && (
                    <div
                      className="absolute pointer-events-auto"
                      style={{ right: "0px", top: portY(i) - ROW_PORT_Y_OFFSET, transform: "translate(50%, -50%)" }}
                    >
                      <Port state={row.portRight.state} side="out" />
                    </div>
                  )}
                </div>
              ))}
            </div>
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
              const yPos = ((HEADER * GRID) + GRID) / (total + 1) * (idx + 1);
              return (
                <div
                  key={i}
                  className={cn(
                    "absolute flex items-center gap-1.5 pointer-events-auto whitespace-nowrap",
                    isLeft ? "right-full flex-row-reverse mr-1.5" : "left-full flex-row ml-1.5",
                  )}
                  style={{ top: yPos, transform: "translateY(-50%)" }}
                >
                  <Port state={p.state} side={p.side === "left" ? "in" : "out"} />
                  {p.label && <span className="text-xs text-muted">{p.label}</span>}
                </div>
              );
            })}
          </div>
        )}
        {footer && (
          <div
            className="px-3 border-t border-border text-xs text-muted flex items-center gap-1.5 shrink-0 bg-muted/5"
            style={{ height: FOOTER * GRID }}
          >
            {footer}
          </div>
        )}
      </div>
    );
  },
);
GraphNode.displayName = "GraphNode";

export { GraphNode, graphNodeVariants };
