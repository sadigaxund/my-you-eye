import { forwardRef, useCallback, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode, HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { nodeHeightPx, portY, snap, HEADER, ROW, FOOTER, GRID } from "./grid";
import { Port } from "../port";
import { Progress } from "../progress";

// Accent bar color, literal class names (not template interpolation) so
// Tailwind's build-time scanner picks them up — same rule as
// connection-line's KIND_STYLES / chart-tokens.ts.
const ACCENT_BORDER: Record<NonNullable<GraphNodeProps["accentColor"]>, string> = {
  primary: "border-primary",
  success: "border-success",
  warning: "border-warning",
  danger: "border-danger",
  muted: "border-muted",
};

const graphNodeVariants = cva(
  // `bg-canvas-surface` (never `bg-surface`): nodes render an opaque,
  // blur-free surface regardless of theme — see the "Canvas surface
  // boundary" token set in tokens.css / AGENTS.md §7. `contain-[layout_paint]`
  // scopes each node's layout/paint work so one node's content changes never
  // force a reflow/repaint of its siblings while panning/zooming.
  "absolute flex flex-col rounded-node border bg-canvas-surface shadow-card min-w-40 overflow-hidden contain-[layout_paint]",
  {
    variants: {
      variant: {
        default: "border-border",
        selected: "border-primary ring-2 ring-primary/20",
        muted: "border-border opacity-dim",
        simple: "border-border",
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
  /** Icon shown at the start of the header, before the title (after the
   * traffic-light dots, when shown). */
  headerIcon?: ReactNode;
  /** Status/badge slot shown at the end of the header, after the title —
   * e.g. a `StatusDot` or `Badge`. */
  headerStatus?: ReactNode;
  /** Second, muted line under the header title. Adds one grid cell to the
   * header's height (still a whole number of cells, so rows and ports stay
   * grid-aligned — AGENTS.md §7). */
  subtitle?: ReactNode;
  /** Hides the traffic-light dots without switching to `variant="simple"`
   * (which also disables ports/footer/accent). Default true whenever
   * `header` is set and `variant` isn't "simple". */
  headerDots?: boolean;
  /** Accent bar color, only visible when `accent` is true. Default
   * "primary" — matches the original look exactly when omitted. */
  accentColor?: "primary" | "success" | "warning" | "danger" | "muted";
  /** Metric/count shown at the end of the footer row (e.g. "42 items"). */
  footerMetric?: ReactNode;
  /** Small action slot (e.g. a `Button`) at the end of the footer row,
   * after `footerMetric` if both are given. */
  footerAction?: ReactNode;
  /** 0–100 progress value rendered as a compact inline bar in the footer,
   * alongside `footer`'s text. Reuses `Progress` (without its own label —
   * the footer row IS the label). */
  footerProgress?: number;
}

const GraphNode = forwardRef<HTMLDivElement, GraphNodeProps>(
  (
    {
      className, variant, x, y, header, accent, ports, footer, rows, children, style,
      headerIcon, headerStatus, subtitle, headerDots, accentColor,
      footerMetric, footerAction, footerProgress,
      ...props
    },
    ref,
  ) => {
    const isSimple = variant === "simple";
    const hasRows = rows && rows.length > 0;
    // A subtitle needs a taller header band — still a whole number of grid
    // cells (HEADER + 1), so rows/ports stay grid-aligned regardless of
    // which header variant a node uses (AGENTS.md §7).
    const headerCells = subtitle && !isSimple ? HEADER + 1 : HEADER;
    const height = hasRows ? nodeHeightPx(rows!.length, !!footer && !isSimple, headerCells) : undefined;
    const hasLegacyPorts = Boolean(ports && ports.length > 0 && !hasRows && !isSimple);
    const showDots = !isSimple && (headerDots ?? true);

    // Legacy `ports` (no `rows`) sit on a node whose height is intrinsic —
    // driven by header/children/footer, not the grid formula in grid.ts.
    // Distributing them across "the node's real height" therefore means
    // measuring that real, rendered height (ResizeObserver, same pattern
    // as CodeBlock's substring-highlight geometry), then snapping each
    // port's y to a grid line via `snap()` from grid.ts — never a second
    // copy of the GRID/HEADER constants (see `npm run audit`).
    const nodeRef = useRef<HTMLDivElement>(null);
    const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);

    useLayoutEffect(() => {
      if (!hasLegacyPorts) return;
      const el = nodeRef.current;
      if (!el) return;
      // offsetHeight, never getBoundingClientRect().height: the latter is
      // post-transform viewport space, and GraphNode lives inside Canvas's
      // `scale(zoom)` layer (AGENTS.md §7). measuredHeight is fed back as a
      // CSS `top` inside that same scaled layer, so a rect-based measurement
      // would spread the ports across zoom× the node's real height.
      const update = () => setMeasuredHeight(el.offsetHeight);
      update();
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }, [hasLegacyPorts]);

    const setRefs = useCallback((node: HTMLDivElement | null) => {
      (nodeRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }, [ref]);

    // Fallback (used only before the first measurement lands) reproduces
    // the old header+one-cell span so there's no NaN/negative flash — it's
    // replaced by the real measured span on the very next layout pass.
    const legacyPortTop = headerCells * GRID;
    const legacyPortBottom = measuredHeight != null
      ? Math.max(legacyPortTop + GRID, measuredHeight - (footer && !isSimple ? FOOTER * GRID : 0))
      : legacyPortTop + GRID;

    return (
      <div
        ref={setRefs}
        className={cn(graphNodeVariants({ variant }), className)}
        style={{ left: x, top: y, height, ...style }}
        {...props}
      >
        {header && (
          <div
            className={cn("flex flex-col shrink-0", accent && !isSimple && cn("border-t-2", ACCENT_BORDER[accentColor ?? "primary"]))}
            style={{ height: headerCells * GRID }}
          >
            <div
              className={cn(
                "flex items-center gap-inline px-3 border-b border-border flex-1 min-h-0",
                subtitle && !isSimple && "flex-col items-stretch justify-center gap-0",
              )}
            >
              <div className={cn("flex items-center gap-inline min-w-0 w-full", isSimple && "justify-center")}>
                {showDots && (
                  <div className="flex gap-0.5 shrink-0">
                    <span className="size-1.5 rounded-full bg-danger" />
                    <span className="size-1.5 rounded-full bg-warning" />
                    <span className="size-1.5 rounded-full bg-success" />
                  </div>
                )}
                {headerIcon && !isSimple && (
                  <span className="shrink-0 flex items-center justify-center text-muted [&_svg]:size-icon-sm">{headerIcon}</span>
                )}
                <span className="text-xs font-semibold truncate flex-1 min-w-0">{header}</span>
                {headerStatus && !isSimple && <span className="shrink-0 flex items-center">{headerStatus}</span>}
              </div>
              {subtitle && !isSimple && (
                <span className="text-xs text-muted truncate w-full leading-none">{subtitle}</span>
              )}
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
            {!isSimple && (
              <div className="absolute inset-0 pointer-events-none">
                {rows!.map((row, i) => (
                  <div key={`ports-${i}`}>
                    {row.portLeft && (
                      <div
                        className="absolute pointer-events-auto"
                        style={{ left: "0px", top: portY(i, headerCells) - headerCells * GRID, transform: "translate(-50%, -50%)" }}
                      >
                        {/* shape="socket": a real half-disc (SVG geometry),
                            not a full circle relying on this node's
                            `overflow-hidden` to clip away the inner half —
                            see Port.tsx and AGENTS.md TODO A6. */}
                        <Port state={row.portLeft.state} side="in" shape="socket" />
                      </div>
                    )}
                    {row.portRight && (
                      <div
                        className="absolute pointer-events-auto"
                        style={{ right: "0px", top: portY(i, headerCells) - headerCells * GRID, transform: "translate(50%, -50%)" }}
                      >
                        <Port state={row.portRight.state} side="out" shape="socket" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          children && <div className="px-3 py-2 text-xs flex-1">{children}</div>
        )}
        {ports && ports.length > 0 && !hasRows && !isSimple && (
          <div className="absolute inset-0 pointer-events-none">
            {ports.map((p, i) => {
              const leftPorts = ports.filter((x) => x.side === "left");
              const rightPorts = ports.filter((x) => x.side === "right");
              const isLeft = p.side === "left";
              const idx = isLeft ? leftPorts.indexOf(p) : rightPorts.indexOf(p);
              const total = isLeft ? leftPorts.length : rightPorts.length;
              const span = legacyPortBottom - legacyPortTop;
              const yPos = snap(legacyPortTop + (span / (total + 1)) * (idx + 1));
              return (
                <div
                  key={i}
                  className={cn(
                    "absolute flex items-center gap-1.5 pointer-events-auto whitespace-nowrap",
                    isLeft ? "right-full flex-row-reverse mr-1.5" : "left-full flex-row ml-1.5",
                  )}
                  style={{ top: yPos, transform: "translateY(-50%)" }}
                >
                  {/* shape="circle" explicitly: legacy ports float entirely
                      outside the node (left-full/right-full) next to their
                      own label, not mounted on the border — a full circle
                      is the correct shape here, unlike row ports. Written
                      out even though it's Port's default, so the choice
                      reads as deliberate rather than "whatever's default". */}
                  <Port state={p.state} side={p.side === "left" ? "in" : "out"} shape="circle" />
                  {p.label && <span className="text-xs text-muted">{p.label}</span>}
                </div>
              );
            })}
          </div>
        )}
        {footer && !isSimple && (
          <div
            className="px-3 border-t border-border text-xs text-muted flex items-center gap-1.5 shrink-0 bg-muted/5"
            style={{ height: FOOTER * GRID }}
          >
            <span className="truncate min-w-0 flex-1">{footer}</span>
            {/* Reuses Progress rather than a hand-rolled bar — no `label`
                prop, since the footer row itself is already the label. */}
            {footerProgress != null && <Progress value={footerProgress} className="w-10 shrink-0" />}
            {footerMetric && <span className="shrink-0 text-fg font-medium tabular-nums">{footerMetric}</span>}
            {footerAction && <span className="shrink-0 flex items-center">{footerAction}</span>}
          </div>
        )}
      </div>
    );
  },
);
GraphNode.displayName = "GraphNode";

export { GraphNode, graphNodeVariants };
