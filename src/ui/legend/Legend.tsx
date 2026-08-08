import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { chartBg } from "../patterns/chart-frame/chart-tokens";
import type { ChartColorToken } from "../patterns/chart-frame/chart-tokens";

export interface LegendItem {
  label: string;
  token: ChartColorToken;
}

export interface LegendProps extends Omit<HTMLAttributes<HTMLUListElement>, "children"> {
  items: LegendItem[];
  /** Swatch shape — "rect" for bar/area fills, "line" for line series, "dot"
   * for point/scatter series. Purely visual; never changes what the swatch
   * colors. Default "rect". */
  swatch?: "rect" | "line" | "dot";
  orientation?: "horizontal" | "vertical";
}

// Text never wears the series color (dataviz skill, marks-and-anatomy.md):
// the swatch carries identity, the label stays in text-secondary ink.
const Legend = forwardRef<HTMLUListElement, LegendProps>(
  ({ items, swatch = "rect", orientation = "horizontal", className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn(
        "flex flex-wrap items-center gap-stack text-xs text-secondary-fg",
        orientation === "vertical" && "flex-col items-start",
        className,
      )}
      {...props}
    >
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-tight">
          <span
            aria-hidden
            className={cn(
              chartBg(item.token),
              swatch === "dot" && "size-2 rounded-full",
              swatch === "rect" && "size-2.5 rounded-ui-sm",
              swatch === "line" && "h-0.5 w-3 rounded-full",
            )}
          />
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  ),
);
Legend.displayName = "Legend";

export { Legend };
