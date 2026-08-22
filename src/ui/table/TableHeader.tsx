import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  sticky?: boolean;
}

const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, sticky, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn(
        "[&_tr]:border-b",
        // Sticky headers must be opaque regardless of theme — bg-surface is
        // translucent in glass/frosted, which lets scrolled-under rows show
        // through the header. bg-surface-opaque is the guaranteed-solid
        // companion token (same mechanism as --color-canvas-surface, see
        // AGENTS.md §0.12).
        sticky && "sticky top-0 z-[var(--z-dropdown)] bg-surface-opaque",
        className,
      )}
      {...props}
    />
  ),
);
TableHeader.displayName = "TableHeader";

export { TableHeader };
