import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { MergedHighlight } from "./CodeBlock.merged-highlight";
import type { Rect } from "./CodeBlock.merged-outline";
import type { HighlightRangeDef } from "./CodeBlock";

/** Sample length (character count) for the hidden monospace ruler used to
 * measure the current font's per-character width. Not a design value —
 * just a sampling size chosen for measurement precision. */
const RULER_LEN = 40;

const COLOR_VARS: Record<string, string> = {
  primary: "var(--color-primary)",
  warning: "var(--color-warning)",
  success: "var(--color-success)",
  danger: "var(--color-danger)",
};

/**
 * Positions the substring-highlight overlay (`highlightRanges`) from real
 * rendered geometry instead of the old hardcoded CHAR_W/LINE_H/PAD
 * constants: a hidden monospace ruler (`scrollWidth`) gives the current
 * font's per-character width, and each highlighted line's own row element
 * gives its y/height/left-padding directly via offsetTop/offsetHeight/
 * offsetLeft. A ResizeObserver on the ruler recomputes on any font or
 * container change (theme swap, runtime font picker, resize) — see
 * AGENTS.md TODO A1.
 */
export function useHighlightOverlay(
  highlightRanges: HighlightRangeDef[] | undefined,
  code: string,
  renderVersion: unknown,
) {
  const rulerRef = useRef<HTMLSpanElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [overlayRectsByColor, setOverlayRectsByColor] = useState<Map<string, Rect[]>>(new Map());
  const hasRanges = Boolean(highlightRanges && highlightRanges.length > 0);

  const recomputeRects = useCallback(() => {
    if (!highlightRanges || highlightRanges.length === 0) {
      setOverlayRectsByColor((prev) => (prev.size === 0 ? prev : new Map()));
      return;
    }
    const ruler = rulerRef.current;
    if (!ruler) return;
    const charW = ruler.scrollWidth / RULER_LEN;
    if (!charW) return;
    const map = new Map<string, Rect[]>();
    for (const r of highlightRanges) {
      const lineEl = lineRefs.current[r.line - 1];
      if (!lineEl) continue;
      const color = r.color ?? "primary";
      if (!map.has(color)) map.set(color, []);
      map.get(color)!.push({
        x: lineEl.offsetLeft + r.start * charW,
        y: lineEl.offsetTop,
        width: Math.max(0, r.end - r.start) * charW,
        height: lineEl.offsetHeight,
      });
    }
    setOverlayRectsByColor(map);
  }, [highlightRanges]);

  useLayoutEffect(() => {
    recomputeRects();
  }, [recomputeRects, code, renderVersion]);

  useEffect(() => {
    if (!hasRanges) return;
    const ruler = rulerRef.current;
    if (!ruler) return;
    const ro = new ResizeObserver(() => recomputeRects());
    ro.observe(ruler);
    return () => ro.disconnect();
  }, [hasRanges, recomputeRects]);

  const setLineRef = useCallback((i: number) => (el: HTMLDivElement | null) => {
    lineRefs.current[i] = el;
  }, []);

  const overlays = overlayRectsByColor.size > 0 && Array.from(overlayRectsByColor.entries()).map(([color, rects]) => (
    <MergedHighlight
      key={color}
      rects={rects}
      color={COLOR_VARS[color] ?? COLOR_VARS.primary}
      strokeColor={COLOR_VARS[color] ?? COLOR_VARS.primary}
    />
  ));

  return { rulerRef, setLineRef, hasRanges, overlays, RULER_LEN };
}
