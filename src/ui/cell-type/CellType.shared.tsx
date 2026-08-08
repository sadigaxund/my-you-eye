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
 * The small "…" affordance shown next to a truncated preview (opens a
 * popover with the full value elsewhere in each display). Shared so every
 * truncation point renders identically.
 */
export function EllipsisBadge() {
  return (
    <span className="ml-0.5 inline-flex size-icon shrink-0 items-center justify-center rounded-ui-sm bg-muted/10 text-xs font-bold leading-none text-muted">
      …
    </span>
  );
}
