import { forwardRef } from "react";
import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "../../../lib/cn";

export interface PageShellProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: ReactNode;
}

const PageShell = forwardRef<HTMLDivElement, PageShellProps>(
  ({ title, description, actions, children, className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-tight sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && <p className="text-sm text-muted mt-1">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-inline mt-2 sm:mt-0">{actions}</div>}
      </div>
      <div>{children}</div>
    </div>
  ),
);
PageShell.displayName = "PageShell";

export { PageShell };
