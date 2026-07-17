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
      className={cn("[&_tr]:border-b", sticky && "sticky top-0 z-10 bg-bg", className)}
      {...props}
    />
  ),
);
TableHeader.displayName = "TableHeader";

export { TableHeader };
