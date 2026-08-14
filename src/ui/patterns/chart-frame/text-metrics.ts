// Canvas-based text width measurement for SVG label sizing/truncation.
//
// SVG <text> has no cheap synchronous width query before the node is
// mounted (getComputedTextLength needs a live element), and this repo's
// offsetWidth/getBoundingClientRect rule (AGENTS.md §7) is about measuring
// *already-rendered* elements inside Canvas/Camera's transform stack — it
// doesn't apply here. The canvas 2D context's measureText is the standard,
// layout-independent way to size a label gutter or decide where to
// truncate before the SVG ever paints.
let ctx: CanvasRenderingContext2D | null | undefined;

function getCtx(): CanvasRenderingContext2D | null {
  if (ctx === undefined) {
    ctx = typeof document === "undefined" ? null : document.createElement("canvas").getContext("2d");
  }
  return ctx;
}

// Matches the `text-xs` Tailwind utility (0.75rem = 12px) on the default
// `--font-sans` stack (see tokens.css). Callers drawing labels at a
// different size/font should pass their own `font` string.
const DEFAULT_LABEL_FONT = "12px Inter, system-ui, sans-serif";

export function measureTextWidth(text: string, font: string = DEFAULT_LABEL_FONT): number {
  const c = getCtx();
  if (!c) return text.length * 6.2; // pre-canvas/SSR fallback — rough monospace-ish estimate
  c.font = font;
  return c.measureText(text).width;
}

/** Truncates `text` with a trailing ellipsis so it fits within `maxWidth`
 * px. Binary-searches the cut point rather than measuring char-by-char —
 * cheap even for long labels, and exact for proportional fonts. */
export function truncateToWidth(text: string, maxWidth: number, font: string = DEFAULT_LABEL_FONT): string {
  if (maxWidth <= 0) return "";
  if (measureTextWidth(text, font) <= maxWidth) return text;
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    const candidate = text.slice(0, mid) + "…";
    if (measureTextWidth(candidate, font) <= maxWidth) lo = mid;
    else hi = mid - 1;
  }
  return lo > 0 ? text.slice(0, lo) + "…" : "…";
}
