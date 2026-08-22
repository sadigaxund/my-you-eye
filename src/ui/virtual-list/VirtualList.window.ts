// Pure windowing math for VirtualList (#16) — DOM-free by design so
// consumers can unit-test their own virtualization decisions without a
// renderer. `start`/`end` are row indexes into the full item list: rows in
// [start, end) are mounted, everything else exists only as spacer height.

export const DEFAULT_OVERSCAN = 8;

export interface VirtualWindow {
  /** Index of the first mounted row (>= 0). */
  start: number;
  /** Index one past the last mounted row (<= itemCount). */
  end: number;
}

export function computeVirtualWindow(
  scrollTop: number,
  viewportHeight: number,
  rowHeight: number,
  itemCount: number,
  overscan: number = DEFAULT_OVERSCAN,
): VirtualWindow {
  if (itemCount <= 0 || rowHeight <= 0) return { start: 0, end: 0 };
  const first = Math.floor(Math.max(0, scrollTop) / rowHeight);
  const start = Math.max(0, first - overscan);
  // +1: ceil alone can drop the partially-visible bottom row.
  const visible = Math.ceil(viewportHeight / rowHeight) + 1;
  const end = Math.min(itemCount, first + visible + overscan);
  return { start, end };
}
