import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { StatCard } from "../stat-card";
import type { StatCardDelta, StatCardSparklineProps } from "../stat-card";

export interface StatGridItem {
  label: string;
  value: string;
  delta?: StatCardDelta;
  icon?: ReactNode;
  sparkline?: StatCardSparklineProps;
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
// connection-line's KIND_STYLES / graph-node's ACCENT_BORDER.
const COLUMNS_CLASS: Record<NonNullable<StatGridProps["columns"]>, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
  6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-6",
};

const StatGrid = forwardRef<HTMLDivElement, StatGridProps>(
  ({ className, items, columns = 4, size = "md", ...props }, ref) => (
    <div ref={ref} className={cn("grid gap-panel", COLUMNS_CLASS[columns], className)} {...props}>
      {items.map((item, i) => (
        <StatCard
          key={i}
          label={item.label}
          value={item.value}
          delta={item.delta}
          icon={item.icon}
          sparkline={item.sparkline}
          size={size}
        />
      ))}
    </div>
  ),
);
StatGrid.displayName = "StatGrid";

export { StatGrid };
