import { forwardRef } from "react";
import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "../../../lib/cn";
import { Button } from "../../button";
import { Badge } from "../../badge";

export interface ToolbarFilterChip {
  key: string;
  label: string;
  onRemove?: () => void;
}

export interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  leading?: ReactNode;
  search?: ReactNode;
  filters?: ReactNode;
  actions?: ReactNode;
  resultCount?: ReactNode;
  chips?: ToolbarFilterChip[];
  onClearAll?: () => void;
}

function FilterChip({ label, onRemove }: Omit<ToolbarFilterChip, "key">) {
  return (
    <Badge variant="neutral" style="soft" className="gap-1 pr-1">
      <span>{label}</span>
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          aria-label={`Remove ${label} filter`}
          className="h-4 w-4 min-h-0 p-0"
        >
          <svg viewBox="0 0 8 8" className="size-2 shrink-0 fill-none stroke-current">
            <path d="M1 1l6 6M7 1L1 7" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </Button>
      )}
    </Badge>
  );
}

const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(
  ({ leading, search, filters, actions, resultCount, chips, onClearAll, className, ...props }, ref) => {
    const hasMeta = (chips && chips.length > 0) || resultCount != null;

    return (
      <div ref={ref} className={cn("flex flex-col gap-inline", className)} {...props}>
        <div className="flex flex-col gap-inline sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-inline sm:flex-row sm:flex-wrap sm:items-center sm:gap-stack">
            {leading && <div className="flex shrink-0 items-center gap-inline">{leading}</div>}
            {search && <div className="w-full sm:w-auto sm:min-w-56">{search}</div>}
            {filters && <div className="flex flex-wrap items-center gap-inline">{filters}</div>}
          </div>
          {actions && <div className="flex w-full sm:w-auto shrink-0 items-center gap-inline">{actions}</div>}
        </div>
        {hasMeta && (
          <div className="flex flex-wrap items-center gap-inline border-t border-border pt-inline">
            {resultCount != null && <span className="text-xs text-muted">{resultCount}</span>}
            {chips?.map(({ key, ...chip }) => (
              <FilterChip key={key} {...chip} />
            ))}
            {chips && chips.length > 0 && onClearAll && (
              <Button type="button" variant="ghost" size="sm" onClick={onClearAll} className="h-6 px-2 text-xs">
                Clear all
              </Button>
            )}
          </div>
        )}
      </div>
    );
  },
);
Toolbar.displayName = "Toolbar";

export { Toolbar };
