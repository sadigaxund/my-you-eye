import type { KeyboardEvent } from "react";

/**
 * Roving-tabindex keyboard handling for `NavList` (#41). Deliberately
 * stateless from React's point of view — no per-item registration, no
 * `focusedId` state on the root. Items compute `tabIndex={current ? 0 : -1}`
 * from their own `current` prop; this hook only moves focus and flips the
 * `tabIndex` attribute on the DOM nodes directly (mirrors EditorTabBar's
 * ref-based approach) so Shift+Tab out and back returns to the last item
 * the user actually focused, not back to whichever item is `current`.
 */
const ITEM_SELECTOR = '[data-nav-list-item]:not([aria-disabled="true"])';

function getItems(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(ITEM_SELECTOR));
}

function focusItem(items: HTMLElement[], index: number, current: HTMLElement) {
  const next = items[index];
  if (!next) return;
  current.tabIndex = -1;
  next.tabIndex = 0;
  next.focus();
}

/**
 * Ensures exactly one enabled item is a tab stop. Called on mount and
 * whenever the list of items could have changed (no dependency array — the
 * DOM query is cheap and this only ever flips a `tabIndex` attribute, never
 * triggers a render), since there is no per-item registration to hook a
 * more targeted effect off of.
 */
export function ensureRovingTabStop(container: HTMLElement | null) {
  if (!container) return;
  const items = getItems(container);
  if (items.length === 0) return;
  if (items.some((item) => item.tabIndex === 0)) return;
  items[0].tabIndex = 0;
}

export function createRovingKeyDownHandler(orientation: "vertical" | "horizontal") {
  const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
  const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";

  return function handleRovingKeyDown(event: KeyboardEvent<HTMLElement>) {
    const { key } = event;
    if (key !== nextKey && key !== prevKey && key !== "Home" && key !== "End") return;

    const container = event.currentTarget;
    const items = getItems(container);
    if (items.length === 0) return;

    const active = document.activeElement;
    const activeIndex = items.findIndex((item) => item === active);
    const from = activeIndex === -1 ? 0 : activeIndex;
    const current = items[from];

    let targetIndex: number;
    if (key === "Home") {
      targetIndex = 0;
    } else if (key === "End") {
      targetIndex = items.length - 1;
    } else if (key === nextKey) {
      targetIndex = (from + 1) % items.length;
    } else {
      targetIndex = (from - 1 + items.length) % items.length;
    }

    event.preventDefault();
    focusItem(items, targetIndex, current);
  };
}
