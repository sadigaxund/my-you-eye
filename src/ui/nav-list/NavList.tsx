import { createContext, forwardRef, useContext, useEffect, useRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { createRovingKeyDownHandler, ensureRovingTabStop } from "./NavList.useRoving";

export type NavListOrientation = "vertical" | "horizontal";

interface NavListContextValue {
  orientation: NavListOrientation;
}

const NavListContext = createContext<NavListContextValue>({ orientation: "vertical" });

export function useNavListContext() {
  return useContext(NavListContext);
}

export interface NavListProps extends HTMLAttributes<HTMLElement> {
  /** Vertical (default) or horizontal row of items. Drives layout, the
   * roving-tabindex arrow-key axis, and the accent-bar edge on items. */
  orientation?: NavListOrientation;
  /** Encouraged: identifies the landmark, e.g. "Settings" or "Table of
   * contents", since a bare `<nav>` is otherwise indistinguishable to
   * assistive tech from any other nav region on the page. */
  "aria-label"?: string;
}

/**
 * Unfilled navigation list (#41) — `role="navigation"` + list markup and
 * `aria-current`, not `Tabs`' `role="tablist"`/`aria-selected`. For a
 * sidebar, settings rail, or scroll-spy table of contents where activating
 * an item does not switch between mutually exclusive panels.
 *
 * Roving tabindex (see `NavList.useRoving.ts`) lives on the root: one
 * `onKeyDown` here handles ArrowUp/Down (vertical) or ArrowLeft/Right
 * (horizontal), Home and End, walking `[data-nav-list-item]` in document
 * order so items nested inside `NavListGroup`s participate too. There is no
 * per-item registration — an item's own `tabIndex` is `0` when `current`,
 * `-1` otherwise; a mount-time effect (no dependency array, matching
 * EditorTabBar's ref-based approach — there is no shared hook for this in
 * the repo) promotes the first enabled item to `tabIndex=0` if nothing is
 * already current, so the list always has exactly one tab stop.
 */
const NavList = forwardRef<HTMLElement, NavListProps>(
  ({ orientation = "vertical", children, onKeyDown, ...props }, ref) => {
    const listRef = useRef<HTMLUListElement>(null);
    const handleKeyDown = createRovingKeyDownHandler(orientation);

    useEffect(() => {
      ensureRovingTabStop(listRef.current);
    });

    return (
      <nav ref={ref} data-orientation={orientation} {...props}>
        <NavListContext.Provider value={{ orientation }}>
          <ul
            ref={listRef}
            role="list"
            onKeyDown={(event) => {
              handleKeyDown(event);
              onKeyDown?.(event);
            }}
            className={cn(
              "m-0 list-none p-0",
              orientation === "vertical"
                ? "flex flex-col gap-px"
                : "flex flex-row items-center gap-inline",
            )}
          >
            {children}
          </ul>
        </NavListContext.Provider>
      </nav>
    );
  },
);
NavList.displayName = "NavList";

export { NavList };
