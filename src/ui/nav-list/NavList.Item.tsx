import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { Link } from "../link";
import { useNavListContext } from "./NavList";

const navListItemVariants = cva(
  "relative flex w-full items-center gap-inline rounded-ui-sm px-3 py-1.5 text-sm text-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring focus-visible:ring-inset data-[current]:text-fg data-[current]:font-medium aria-disabled:pointer-events-none aria-disabled:opacity-50 no-underline",
  {
    variants: {
      orientation: {
        vertical: "justify-start text-left",
        horizontal: "w-auto justify-center",
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  },
);

// `orientation` is deliberately NOT a prop here — the item reads it from the
// enclosing `NavList` so a row can never disagree with its list.
export interface NavListItemProps extends Omit<HTMLAttributes<HTMLElement>, "onSelect"> {
  /** Marks this row as the active one — `aria-current` instead of `Tabs`'
   * `aria-selected`, since selecting a nav-list row does not switch between
   * mutually exclusive panels. */
  current?: boolean;
  /** `aria-current` value when `current` is true. `"page"` (default) suits
   * a settings rail / sidebar destination; `"true"` suits a scroll-spy
   * table of contents where no full navigation occurs. */
  currentType?: "page" | "true";
  /** Leading icon, `size-4`, wrapped in an `aria-hidden` span. */
  icon?: ReactNode;
  /** Renders a `Link` instead of a button, for a row that is a real
   * navigable destination. */
  href?: string;
  /** Fires on click when there is no `href`. */
  onSelect?: () => void;
  /** Dims the row, removes it from the roving tab order and ignores activation. */
  disabled?: boolean;
  children?: ReactNode;
}

/**
 * One row of `NavList` (#41). Unfilled — `current` gets a leading/underline
 * accent bar (drawn by the parent variant + this component's own `<span>`),
 * never a background fill; hover is the only surface fill, so the "current"
 * treatment never competes with hover for the same visual language `Tabs`'
 * `pills`/`filing` variants use.
 */
const NavListItem = forwardRef<HTMLElement, NavListItemProps>(
  (
    {
      className,
      current,
      currentType = "page",
      icon,
      href,
      onSelect,
      disabled,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const { orientation } = useNavListContext();

    const accentBar = current && (
      <span
        aria-hidden="true"
        className={cn(
          "absolute rounded-full bg-primary",
          orientation === "vertical"
            ? "inset-y-1 left-0 w-0.5"
            : "inset-x-2 bottom-0 h-0.5",
        )}
      />
    );

    const iconSpan = icon && (
      <span aria-hidden="true" className="size-4 shrink-0">
        {icon}
      </span>
    );

    const itemClassName = cn(navListItemVariants({ orientation }), className);

    if (href !== undefined) {
      return (
        <li>
          <Link
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            variant="muted"
            underline={false}
            data-nav-list-item=""
            data-current={current ? "" : undefined}
            aria-current={current ? currentType : undefined}
            aria-disabled={disabled ? "true" : undefined}
            tabIndex={disabled ? -1 : current ? 0 : -1}
            className={itemClassName}
            onClick={(event) => {
              if (disabled) {
                event.preventDefault();
                return;
              }
              onClick?.(event);
            }}
            {...(props as HTMLAttributes<HTMLAnchorElement>)}
          >
            {accentBar}
            {iconSpan}
            {children}
          </Link>
        </li>
      );
    }

    return (
      <li>
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          disabled={disabled}
          aria-disabled={disabled ? "true" : undefined}
          data-nav-list-item=""
          data-current={current ? "" : undefined}
          aria-current={current ? currentType : undefined}
          tabIndex={current ? 0 : -1}
          className={itemClassName}
          onClick={(event) => {
            onClick?.(event);
            onSelect?.();
          }}
          {...(props as HTMLAttributes<HTMLButtonElement>)}
        >
          {accentBar}
          {iconSpan}
          {children}
        </button>
      </li>
    );
  },
);
NavListItem.displayName = "NavListItem";

export { NavListItem, navListItemVariants };
