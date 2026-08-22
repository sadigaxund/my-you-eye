import { forwardRef } from "react";
import type { HTMLAttributes, MouseEvent, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { Tooltip } from "../tooltip";

const statusBarItemVariants = cva(
  // A status strip is chrome: compact, mono, quiet. Interactive segments
  // hover on the sidebar family; non-interactive ones omit onClick and
  // render as plain text.
  "inline-flex h-full items-center gap-1.5 whitespace-nowrap rounded-ui-sm px-2 font-mono",
  {
    variants: {
      tone: {
        default: "text-muted",
        success: "text-success",
        danger: "text-danger",
        warning: "text-warning",
        primary: "text-primary",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  },
);

export interface StatusBarItemProps extends VariantProps<typeof statusBarItemVariants> {
  icon?: ReactNode;
  label: ReactNode;
  /** Hover explanation — segments that have something to say carry one. */
  tooltip?: string;
  onClick?: () => void;
}

export const StatusBarItem = ({ icon, label, tooltip, tone, onClick }: StatusBarItemProps) => {
  const segment = onClick ? (
    <button
      type="button"
      onClick={onClick as (e: MouseEvent) => void}
      className={cn(statusBarItemVariants({ tone }), "cursor-pointer hover:bg-sidebar-item-hover focus-visible:bg-sidebar-item-hover focus-visible:outline-none")}
    >
      {icon && <span aria-hidden="true" className="[&>svg]:size-3.5">{icon}</span>}
      {label}
    </button>
  ) : (
    <span className={cn(statusBarItemVariants({ tone }))}>
      {icon && <span aria-hidden="true" className="[&>svg]:size-3.5">{icon}</span>}
      {label}
    </span>
  );
  return tooltip ? (
    <Tooltip content={tooltip} side="top">
      {segment}
    </Tooltip>
  ) : (
    segment
  );
};

StatusBarItem.displayName = "StatusBarItem";

export interface StatusBarProps extends HTMLAttributes<HTMLElement> {
  left?: ReactNode;
  right?: ReactNode;
}

// Two-sided app-wide status strip (#7) — the light counterpart to Toolbar.
// Persistent chrome: paints only from the --color-sidebar-* family (#27).
const StatusBar = forwardRef<HTMLElement, StatusBarProps>(
  ({ className, left, right, "aria-label": ariaLabel, ...props }, ref) => (
    <footer
      ref={ref}
      aria-label={ariaLabel ?? "Status bar"}
      className={cn("flex h-6 shrink-0 items-center justify-between gap-4 border-t border-sidebar-border bg-sidebar px-2 text-xs", className)}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-1">{left}</div>
      <div className="flex shrink-0 items-center gap-1">{right}</div>
    </footer>
  ),
);
StatusBar.displayName = "StatusBar";

export { StatusBar };
