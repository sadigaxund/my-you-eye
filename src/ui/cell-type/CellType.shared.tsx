import { useLayoutEffect, useRef, useState } from "react";
import type { DependencyList, RefObject } from "react";

/**
 * Detects whether an element's content is being clipped
 * (`scrollWidth > clientWidth`), re-checking on resize. Every CellType
 * display that shows a truncated preview (TruncatedCellValue, JsonDisplay,
 * TreeDisplay, ArrayDisplay) needs this exact check — shared here instead
 * of each re-implementing its own ResizeObserver.
 */
export function useTruncated<T extends HTMLElement>(deps: DependencyList): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setIsTruncated(el.scrollWidth > el.clientWidth);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
    // deps is caller-supplied on purpose — each call site passes exactly
    // the value(s) whose change should re-run the truncation check.
  }, deps);

  return [ref, isTruncated];
}

/**
 * The "there is more, open it" affordance shown next to any cell preview
 * that opens a popover with the full value — long text, JSON, tree, list,
 * markdown. A chevron rather than the three-dots this replaced: three dots
 * conventionally reads as "more actions" (an overflow *menu*), which is the
 * wrong promise for a click that just expands a popover. One shared
 * component so every expandable cell type gets the identical, deliberately
 * quiet affordance instead of each display inventing (or omitting) its own —
 * see AGENTS.md §1 Step A. Kept low-contrast/small on purpose: it should
 * read as a hint, not compete with the cell's actual content on every row.
 */
export function ExpandIndicator() {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden
      className="ml-0.5 size-icon-sm shrink-0 text-muted opacity-60"
    >
      <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Shared popover sizing for every "click to expand" cell preview
 * (TruncatedCellValue, JsonDisplay, TreeDisplay, ArrayDisplay, CodeDisplay,
 * MarkdownDisplay). `minWidth` pins the popover to at least the trigger's
 * own rendered width via Radix's own CSS custom property — Radix measures
 * the trigger itself (ResizeObserver inside its own portal-positioned
 * overlay, not our component code), so this doesn't run afoul of AGENTS.md
 * §7's "measure with offsetWidth, never getBoundingClientRect" rule, which
 * scopes to DOM measurement *we* perform inside Canvas's zoomed layer.
 * `maxWidth` keeps a very wide cell's popover from ballooning past a
 * reasonable reading width. Anchored to the cell (Popover, not Dialog) on
 * purpose — see Comparison's `progress` prop comment elsewhere in this repo
 * for the same "don't recenter something with a reading order" reasoning.
 */
export const EXPAND_POPOVER_STYLE = {
  minWidth: "var(--radix-popover-trigger-width)",
  maxWidth: "min(32rem, 90vw)",
} as const;
