import { forwardRef } from "react";
import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "../../../lib/cn";

export interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  search?: ReactNode;
  filters?: ReactNode;
  actions?: ReactNode;
}

const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(
  ({ search, filters, actions, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}
      {...props}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        {search && <div className="w-full sm:w-auto">{search}</div>}
        {filters && <div className="flex items-center gap-2">{filters}</div>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  ),
);
Toolbar.displayName = "Toolbar";

export { Toolbar };
