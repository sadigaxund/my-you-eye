import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { StatCard } from "../stat-card";
import type { StatCardDelta, StatCardSparklineProps } from "../stat-card";

export interface StatGridItem {
  label: string;
  /** Widened from `string` to `ReactNode` alongside StatCard's own `value`
   * — lets a caller (e.g. `StatScene`) drop in a live `CountUp` per tile. */
  value: ReactNode;
  delta?: StatCardDelta;
  icon?: ReactNode;
  sparkline?: StatCardSparklineProps;
  /**
   * Forwarded to the tile's own `StatCard` root. The one intentional escape
   * hatch on an otherwise data-only item shape — for a caller driving a
   * genuinely dynamic, computed value (a per-tile stagger's entrance
   * opacity/transform while it's mid-reveal), not for design values (those
   * still belong in tokens.css, never here).
   */
  style?: CSSProperties;
}

export interface StatGridProps extends HTMLAttributes<HTMLDivElement> {
  items: StatGridItem[];
  /** Column count at the widest breakpoint. Fewer columns at narrower widths. Default 4. */
  columns?: 2 | 3 | 4 | 5 | 6;
  /** Forwarded to every StatCard. Default "md". */
  size?: "sm" | "md" | "lg";
}

// Literal per-column class strings (never interpolated — the Tailwind
// scanner can't see a templated class name), same pattern as
// connection-line's KIND_STYLES / graph-node's ACCENT_BORDER. Exported so a
// caller that needs the identical grid wrapper around hand-rendered tiles
// (StatScene, when a tile needs its own hook-driven progress that can't
// flow through a plain data prop) never re-derives this literal map.
export const STAT_GRID_COLUMNS_CLASS: Record<NonNullable<StatGridProps["columns"]>, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
  6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-6",
};

const StatGrid = forwardRef<HTMLDivElement, StatGridProps>(
  ({ className, items, columns = 4, size = "md", ...props }, ref) => (
    <div ref={ref} className={cn("grid gap-panel", STAT_GRID_COLUMNS_CLASS[columns], className)} {...props}>
      {items.map((item, i) => (
        <StatCard
          key={i}
          label={item.label}
          value={item.value}
          delta={item.delta}
          icon={item.icon}
          sparkline={item.sparkline}
          size={size}
          style={item.style}
        />
      ))}
    </div>
  ),
);
StatGrid.displayName = "StatGrid";

export { StatGrid };
