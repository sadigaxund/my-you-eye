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
      className={cn("flex flex-col gap-stack sm:flex-row sm:items-center sm:justify-between", className)}
      {...props}
    >
      <div className="flex flex-col gap-inline sm:flex-row sm:items-center sm:gap-stack">
        {search && <div className="w-full sm:w-auto">{search}</div>}
        {filters && <div className="flex items-center gap-inline">{filters}</div>}
      </div>
      {actions && <div className="flex items-center gap-inline">{actions}</div>}
    </div>
  ),
);
Toolbar.displayName = "Toolbar";

export { Toolbar };
