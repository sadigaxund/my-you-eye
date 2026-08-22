import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface TitleBarProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  subtitle?: ReactNode;
  /** App glyph rendered before the title (logo mark). */
  glyph?: ReactNode;
  /** Breadcrumb trail folded INLINE into the left identity cluster — the
   *  bar's fixed height never grows to fit it (#12). */
  breadcrumb?: ReactNode;
  /** Right-aligned action cluster. */
  actions?: ReactNode;
}

// Window chrome / app bar: an explicit left(identity + breadcrumb) /
// right(actions) two-zone layout, distinct from Toolbar's heavier
// leading/search/filters/actions composite (#12). Persistent chrome: paints
// only from the --color-sidebar-* family (#27).
const TitleBar = forwardRef<HTMLElement, TitleBarProps>(
  ({ className, title, subtitle, glyph, breadcrumb, actions, "aria-label": ariaLabel, ...props }, ref) => (
    <header
      ref={ref}
      aria-label={ariaLabel ?? "Title bar"}
      className={cn("flex h-9 shrink-0 items-center gap-3 border-b border-sidebar-border bg-sidebar pr-2 pl-3 text-sm", className)}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-2">
        {glyph && <span aria-hidden="true" className="[&>svg]:size-4 shrink-0">{glyph}</span>}
        <span className="truncate font-mono font-medium">{title}</span>
        {subtitle && (
          <span className="hidden truncate text-muted sm:flex sm:items-center sm:gap-2">
            <span aria-hidden="true">·</span>
            {subtitle}
          </span>
        )}
        {breadcrumb && (
          <>
            <span aria-hidden="true" className="mx-1 h-4 w-px shrink-0 bg-sidebar-border" />
            <span className="truncate text-xs text-muted">{breadcrumb}</span>
          </>
        )}
      </div>
      {actions && <div className="ml-auto flex shrink-0 items-center gap-1">{actions}</div>}
    </header>
  ),
);
TitleBar.displayName = "TitleBar";

export { TitleBar };
