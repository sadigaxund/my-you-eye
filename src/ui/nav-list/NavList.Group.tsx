import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useNavListContext } from "./NavList";

export interface NavListGroupProps extends HTMLAttributes<HTMLLIElement> {
  /** Heading text for this group of items. */
  label: string;
  children?: ReactNode;
}

/**
 * A labeled cluster of `NavListItem`s inside a `NavList` (#41) — e.g.
 * "Workspace" / "Account" sections in a settings rail. Renders as
 * `role="presentation"` so it never adds an extra level to the outer
 * `role="list"`; its own inner `<ul role="list">` is what the roving
 * keyboard handler and screen readers actually see, labelled by the
 * heading via `aria-labelledby`.
 */
const NavListGroup = forwardRef<HTMLLIElement, NavListGroupProps>(
  ({ className, label, children, ...props }, ref) => {
    const { orientation } = useNavListContext();
    const headingId = useId();

    return (
      <li ref={ref} role="presentation" className={className} {...props}>
        <div
          id={headingId}
          className="px-3 pb-1 pt-3 text-xs font-medium uppercase tracking-wide text-muted"
        >
          {label}
        </div>
        <ul
          role="list"
          aria-labelledby={headingId}
          className={cn(
            "m-0 list-none p-0",
            orientation === "vertical"
              ? "flex flex-col gap-px"
              : "flex flex-row items-center gap-inline",
          )}
        >
          {children}
        </ul>
      </li>
    );
  },
);
NavListGroup.displayName = "NavListGroup";

export { NavListGroup };
