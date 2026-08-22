import { useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";

export interface CanvasSize {
  width: number;
  height: number;
}

/**
 * Measures a `Canvas`'s rendered pixel size via `offsetWidth`/`offsetHeight`
 * (never `getBoundingClientRect()` — AGENTS.md §7: the latter is
 * post-transform viewport pixels, and this ref sits on `Canvas`'s own root,
 * outside its pan/zoom layer, but the value feeds `Trace`'s `viewBox`, which
 * must match the UNSCALED coordinate space every node/edge already uses).
 * `Trace` (src/motion/trace) renders its own `<svg viewBox=…>` rather than
 * sharing `ConnectionLayer`'s (which needs no viewBox at all — its plain
 * `w-full h-full` svg is already 1:1 with that same space), so this is the
 * one place DiagramScene needs a real measurement instead of analytic
 * layout math. Falls back to `fallback` (the analytically-known content
 * bounding box) until the first measurement lands, so a flow token never
 * computes against a zero-size viewBox on the first frame.
 */
export function useCanvasSize(fallback: CanvasSize): { ref: RefObject<HTMLDivElement | null>; size: CanvasSize } {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<CanvasSize>(fallback);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => {
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      if (width > 0 && height > 0) setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
}
