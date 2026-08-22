import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { ScrollArea } from "../scroll-area";
import { computeVirtualWindow, DEFAULT_OVERSCAN } from "./VirtualList.window";

export interface VirtualListProps<T>
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  items: readonly T[];
  /** Required, never inferred: fixed-height virtualization needs no
   *  measurement pass, and the caller reads the value off its own layout
   *  tokens so it cannot drift from the real row height. */
  rowHeight: number;
  overscan?: number;
  renderRow: (item: T, index: number) => ReactNode;
  getKey: (item: T, index: number) => string;
  className?: string;
  style?: CSSProperties;
}

// Fixed-row-height windowed list (#16). Composes the library's ScrollArea —
// never a hand-rolled scrollable div — and mounts only the rows inside the
// current window plus overscan; everything else exists as the spacer's
// height, so scrollbar thumb and track always reflect the full row count.
// No tree/list a11y semantics of its own: a consumer virtualizing a tree
// adds role/aria-level/aria-setsize/aria-posinset per row inside renderRow,
// since nested role=group DOM nesting is no longer available.
function VirtualListInner<T>(
  {
    items,
    rowHeight,
    overscan = DEFAULT_OVERSCAN,
    renderRow,
    getKey,
    className,
    style,
    onScroll,
    ...props
  }: VirtualListProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setViewportHeight(el.clientHeight);
    const observer = new ResizeObserver(() => setViewportHeight(el.clientHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
      onScroll?.(e);
    },
    [onScroll],
  );

  const window_ = computeVirtualWindow(scrollTop, viewportHeight, rowHeight, items.length, overscan);
  const visible = items.slice(window_.start, window_.end);

  const setRefs = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  return (
    <ScrollArea ref={setRefs} orientation="vertical" className={cn(className)} style={style} onScroll={handleScroll} {...props}>
      <div style={{ height: items.length * rowHeight, position: "relative" }}>
        {visible.map((item, i) => (
          <div
            key={getKey(item, window_.start + i)}
            style={{ position: "absolute", top: (window_.start + i) * rowHeight, height: rowHeight, left: 0, right: 0 }}
          >
            {renderRow(item, window_.start + i)}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

// Generic forwardRef: TS can't carry a component's own generic through
// forwardRef's fixed type parameters (see SegmentedControl). Type-only cast;
// the runtime value stays forwardRef's own object.
type VirtualListComponent = <T>(
  props: VirtualListProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> },
) => React.JSX.Element;

export const VirtualList = Object.assign(
  forwardRef(VirtualListInner) as unknown as VirtualListComponent,
  { displayName: "VirtualList" },
);

export { computeVirtualWindow, DEFAULT_OVERSCAN };
