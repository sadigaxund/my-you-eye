import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Tooltip } from "../tooltip";

export interface ActivityBarItem {
  id: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  /** Count pill pinned to the icon's corner; rendered only when defined. */
  badge?: number;
}

export interface ActivityBarProps extends Omit<HTMLAttributes<HTMLElement>, "onSelect"> {
  items: ActivityBarItem[];
  onSelect?: (id: string) => void;
  /** Bottom-pinned item (Settings-class), same shape, its own handler. */
  footer?: ActivityBarItem;
  onFooterSelect?: (id: string) => void;
}

const ActivityBarButton = ({
  item,
  onSelect,
}: {
  item: ActivityBarItem;
  onSelect?: (id: string) => void;
}) => (
  // aria-pressed carries the active state; the accent itself is a left-edge
  // bar on the RAIL edge (the button spans the full rail width), not a fill.
  <Tooltip content={item.label} side="right">
    <button
      type="button"
      aria-pressed={item.active ? true : undefined}
      aria-label={item.label}
      onClick={() => onSelect?.(item.id)}
      className={cn(
        "relative flex h-8 w-full shrink-0 cursor-pointer items-center justify-center outline-none",
        "hover:bg-sidebar-item-hover focus-visible:bg-sidebar-item-hover",
        item.active ? "text-primary" : "text-muted",
      )}
    >
      {item.active && <span aria-hidden="true" className="absolute inset-y-1 left-0 w-0.5 bg-primary" />}
      <span aria-hidden="true" className="[&>svg]:size-5">
        {item.icon}
      </span>
      {typeof item.badge === "number" && (
        <span className="absolute right-1.5 bottom-0.5 min-w-4 rounded-full bg-primary px-0.5 text-center font-mono text-xs leading-4 text-primary-fg">
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      )}
    </button>
  </Tooltip>
);

// Vertical icon rail — the activity-bar pattern (#6). Persistent chrome:
// paints only from the --color-sidebar-* family (#27), never generic surface
// tokens. Active state is an accent EDGE BAR, deliberately not a background
// fill. Labels live in right-side tooltips; requires <TooltipProvider>.
const ActivityBar = forwardRef<HTMLElement, ActivityBarProps>(
  ({ className, items, onSelect, footer, onFooterSelect, "aria-label": ariaLabel, ...props }, ref) => (
    <nav
      ref={ref}
      aria-label={ariaLabel ?? "Activity bar"}
      className={cn("flex w-12 flex-col items-stretch gap-1 border-r border-sidebar-border bg-sidebar py-2", className)}
      {...props}
    >
      {items.map((item) => (
        <ActivityBarButton key={item.id} item={item} onSelect={onSelect} />
      ))}
      {footer && (
        <div className="mt-auto pt-1">
          <ActivityBarButton item={footer} onSelect={onFooterSelect} />
        </div>
      )}
    </nav>
  ),
);
ActivityBar.displayName = "ActivityBar";

export { ActivityBar };
