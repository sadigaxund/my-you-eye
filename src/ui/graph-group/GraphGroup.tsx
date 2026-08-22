import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { snap } from "../graph-node/grid";

// Literal class names (not template interpolation) so Tailwind's build-time
// scanner picks them up — same rule as GraphNode's ACCENT_BORDER and
// connection-line's KIND_STYLES.
const GROUP_FILL: Record<NonNullable<GraphGroupProps["accentColor"]>, string> = {
  primary: "bg-primary/5",
  success: "bg-success/5",
  warning: "bg-warning/5",
  danger: "bg-danger/5",
  muted: "bg-muted/5",
};
const GROUP_BORDER: Record<NonNullable<GraphGroupProps["accentColor"]>, string> = {
  primary: "border-primary/40",
  success: "border-success/40",
  warning: "border-warning/40",
  danger: "border-danger/40",
  muted: "border-muted/40",
};
const GROUP_TEXT: Record<NonNullable<GraphGroupProps["accentColor"]>, string> = {
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  muted: "text-muted",
};

const graphGroupVariants = cva(
  // `pointer-events-none`: a boundary region is decorative, never an
  // interaction target — clicks/hover must pass straight through to
  // whatever GraphNode/ConnectionLayer content sits above it (or the
  // Canvas background below it). No backdrop-filter anywhere here — the
  // tint is plain alpha compositing (cheap, ordinary GPU paint), which is
  // what "opaque-safe" means for AGENTS.md §0.12: that rule specifically
  // forbids `backdrop-filter`/`background-attachment:fixed` inside
  // Canvas's transforming layer (expensive to resample every frame), not
  // alpha-blended fills, which composite for free.
  "absolute rounded-ui pointer-events-none",
  {
    variants: {
      border: {
        dashed: "border border-dashed",
        solid: "border",
      },
    },
    defaultVariants: { border: "dashed" },
  },
);

export interface GraphGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof graphGroupVariants> {
  /** Canvas-space position/size, same coordinate space as `GraphNode`'s
   * `x`/`y`. Snapped to `GRID` (from `graph-node/grid.ts`) so a group's
   * edges land on the same grid lines as the nodes it encloses. */
  x: number;
  y: number;
  width: number;
  height: number;
  label?: ReactNode;
  /** Icon shown before the label text. */
  icon?: ReactNode;
  /** Where the label chip sits relative to the region. "top-left" (default)
   * is the usual choice for architecture diagrams ("VPC", "Cluster", …).
   * "outside-top" floats the chip entirely above the box instead of inset,
   * for when the group's own top-left corner needs to stay clear (e.g. a
   * node is positioned flush against it). */
  labelPlacement?: "top-left" | "top-center" | "top-right" | "outside-top";
  accentColor?: "primary" | "success" | "warning" | "danger" | "muted";
}

const LABEL_PLACEMENT_CLASS: Record<NonNullable<GraphGroupProps["labelPlacement"]>, string> = {
  "top-left": "top-2 left-2",
  "top-center": "top-2 left-1/2 -translate-x-1/2",
  "top-right": "top-2 right-2",
  "outside-top": "-top-2 left-2 -translate-y-full",
};

/**
 * A labelled boundary region for architecture diagrams — "VPC", "Cluster",
 * "Service boundary" — drawn behind the nodes/edges it encloses.
 *
 * **Stacking is DOM order, not z-index.** `GraphGroup` renders no explicit
 * z-index (matching `GraphNode`/`ConnectionLayer`, which don't either — see
 * `Canvas.tsx`'s own grid layer for the same convention). Elements without
 * an explicit z-index share one painting level and are ordered by document
 * position, so **render every `GraphGroup` before the `GraphNode`s and
 * `ConnectionLayer`/`ConnectionLine`s it should sit beneath**, in your JSX,
 * within the same `Canvas`. There is no numeric z-index that could make
 * ordering not matter here: any value that beats a `z-index:auto` node from
 * *below* would also sit below Canvas's own grid layer (see AGENTS.md §7
 * "Canvas drag performance contract"), so document order is the one
 * mechanism that actually places a group behind nodes while staying above
 * the grid.
 *
 * **Nesting a group inside a group** is just two `GraphGroup`s with one
 * rect contained in the other's — there's no parent/child DOM nesting
 * between them. Put the outer (larger) group first in JSX, the inner
 * (smaller) group after, so the inner one paints on top by the same DOM-
 * order rule above. Fills never compound into mud because each fill is a
 * single flat, low, fixed alpha (`/5`, i.e. 5%) — even the innermost
 * region of a 3-deep nest sums to well under 20% overall tint, still
 * clearly lighter than a single `/20` wash.
 */
const GraphGroup = forwardRef<HTMLDivElement, GraphGroupProps>(
  (
    { className, border, x, y, width, height, label, icon, labelPlacement = "top-left", accentColor = "muted", style, ...props },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(graphGroupVariants({ border }), GROUP_FILL[accentColor], GROUP_BORDER[accentColor], className)}
      style={{ left: snap(x), top: snap(y), width: snap(width), height: snap(height), ...style }}
      {...props}
    >
      {label != null && (
        <div
          className={cn(
            "absolute inline-flex items-center gap-1.5 max-w-[calc(100%-1rem)] rounded-ui-sm border border-border/60 bg-canvas-surface px-1.5 py-0.5 text-xs font-medium shadow-subtle",
            GROUP_TEXT[accentColor],
            LABEL_PLACEMENT_CLASS[labelPlacement],
          )}
        >
          {icon && <span className="shrink-0 flex items-center justify-center [&_svg]:size-icon-sm">{icon}</span>}
          <span className="truncate">{label}</span>
        </div>
      )}
    </div>
  ),
);
GraphGroup.displayName = "GraphGroup";

export { GraphGroup, graphGroupVariants };
