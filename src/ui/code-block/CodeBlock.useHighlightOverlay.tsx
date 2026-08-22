import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { MergedHighlight } from "./CodeBlock.merged-highlight";
import type { Rect } from "./CodeBlock.merged-outline";
import type { HighlightRangeDef } from "./CodeBlock";

/** Sample length (character count) for the hidden monospace ruler used to
 * measure the current font's per-character width. Not a design value —
 * just a sampling size chosen for measurement precision. */
const RULER_LEN = 40;

/**
 * Turns a `HighlightRangeDef` into concrete `[start, end)` char offsets on
 * its own line. `start`/`end` pass through; `match` is searched for in the
 * line text — a string literally, a RegExp by execution — and the requested
 * occurrence is taken. Returns null when the text simply isn't there.
 */
function resolveRange(r: HighlightRangeDef, lineText: string): { start: number; end: number } | null {
  if (r.match == null) {
    return r.start == null || r.end == null ? null : { start: r.start, end: r.end };
  }
  const wanted = Math.max(1, r.occurrence ?? 1);
  if (typeof r.match === "string") {
    if (r.match.length === 0) return null;
    let from = 0;
    for (let n = 0; n < wanted; n++) {
      const at = lineText.indexOf(r.match, from);
      if (at === -1) return null;
      if (n === wanted - 1) return { start: at, end: at + r.match.length };
      from = at + 1; // +1, not +length: overlapping occurrences still count.
    }
    return null;
  }
  // Force `g` so `exec` advances; the caller's own flags are preserved.
  const re = new RegExp(r.match.source, r.match.flags.includes("g") ? r.match.flags : r.match.flags + "g");
  let m: RegExpExecArray | null;
  let n = 0;
  while ((m = re.exec(lineText)) !== null) {
    n++;
    if (n === wanted) return { start: m.index, end: m.index + m[0].length };
    if (m[0].length === 0) re.lastIndex++; // never spin on a zero-width match
  }
  return null;
}

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
    const codeLines = code.split("\n");
    const map = new Map<string, Rect[]>();
    for (const r of highlightRanges) {
      const lineEl = lineRefs.current[r.line - 1];
      if (!lineEl) continue;
      const span = resolveRange(r, codeLines[r.line - 1] ?? "");
      // A `match` that isn't on the line resolves to nothing, and nothing is
      // drawn — failing silent rather than highlighting the wrong span, which
      // is the entire advantage of naming the text over counting to it.
      if (!span) continue;
      const color = r.color ?? "primary";
      if (!map.has(color)) map.set(color, []);
      // `offsetLeft` is the line div's BORDER-box left, and that div carries
      // `px-panel` — so the first character actually starts one padding-left
      // (16px ≈ 2.2 monospace chars) further in. Leaving it out shifted every
      // highlight two characters to the left of the text it was naming, which
      // is what made them look like they landed on arbitrary spans (owner:
      // "the 'highlight substrings' examples are highlighting random
      // incomprehensible parts of the code"). Read from computed style rather
      // than hardcoding the token's value: the padding is a theme variable and
      // this hook's whole premise is measuring real geometry (AGENTS.md A1).
      const padLeft = parseFloat(getComputedStyle(lineEl).paddingLeft) || 0;
      map.get(color)!.push({
        x: lineEl.offsetLeft + lineEl.clientLeft + padLeft + span.start * charW,
        y: lineEl.offsetTop,
        width: Math.max(0, span.end - span.start) * charW,
        height: lineEl.offsetHeight,
      });
    }
    setOverlayRectsByColor(map);
  }, [highlightRanges, code]);

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
