// Runtime foreground-color picker for text drawn over a token-colored fill
// (Funnel stages today; any future filled-shape-with-label chart can reuse
// it). Chart backgrounds — the sequential ramp especially — are derived
// from the theme's primary hue at a fixed lightness per slot (tokens.css:
// `oklch(from var(--color-primary) L C H)`), so no single foreground token
// stays legible across the whole ramp: the darkest stage and the lightest
// stage need opposite text colors, and the light/dark crossover point moves
// with every theme's primary hue. Hardcoding a lightness threshold would
// drift out of sync the moment a theme changes; instead this resolves the
// *actual painted* color via the canvas 2D API (which normalizes any CSS
// color, oklch included, to sRGB) and runs the same relative-luminance /
// contrast-ratio math as scripts/check-contrast.mjs to pick whichever of
// `text-fg` / `text-primary-fg` clears WCAG AA against that background.
import { useEffect, useState } from "react";
import { chartBg } from "./chart-tokens";
import type { ChartColorToken, ChartSequentialToken } from "./chart-tokens";

type FgCandidate = "text-fg" | "text-primary-fg";
const CANDIDATES: FgCandidate[] = ["text-fg", "text-primary-fg"];

let measureCtx: CanvasRenderingContext2D | null | undefined;
let probeBg: HTMLDivElement | null = null;
let probeFg: Partial<Record<FgCandidate, HTMLDivElement>> | null = null;

function ensureProbes(): boolean {
  if (probeBg && probeFg) return true;
  if (typeof document === "undefined") return false;
  probeBg = document.createElement("div");
  probeBg.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;width:0;height:0;overflow:hidden;";
  document.body.appendChild(probeBg);
  probeFg = {};
  for (const candidate of CANDIDATES) {
    const el = document.createElement("div");
    el.className = candidate;
    el.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;width:0;height:0;overflow:hidden;";
    document.body.appendChild(el);
    probeFg[candidate] = el;
  }
  return true;
}

// Canvas fillStyle round-tripping is the one reliable cross-browser way to
// normalize an arbitrary CSS color string (oklch(), color-mix(), currentColor
// once resolved…) to sRGB without shipping a color-space parser.
function toSrgb(cssColor: string): [number, number, number] | null {
  if (measureCtx === undefined) {
    measureCtx = typeof document === "undefined" ? null : document.createElement("canvas").getContext("2d");
  }
  if (!measureCtx) return null;
  measureCtx.fillStyle = "#000000";
  measureCtx.fillStyle = cssColor;
  const normalized = measureCtx.fillStyle;
  const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(normalized);
  if (hex) return [parseInt(hex[1], 16), parseInt(hex[2], 16), parseInt(hex[3], 16)];
  const rgb = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/.exec(normalized);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  return null;
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const chan = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
}

function contrastRatio(l1: number, l2: number): number {
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

function pickReadableForeground(bgClass: string): FgCandidate {
  if (!ensureProbes() || !probeBg || !probeFg) return "text-fg";
  probeBg.className = bgClass;
  const bgSrgb = toSrgb(getComputedStyle(probeBg).backgroundColor);
  if (!bgSrgb) return "text-fg";
  const bgLum = relativeLuminance(bgSrgb);
  let best: FgCandidate = "text-fg";
  let bestRatio = -1;
  for (const candidate of CANDIDATES) {
    const el = probeFg[candidate];
    if (!el) continue;
    const fgSrgb = toSrgb(getComputedStyle(el).color);
    if (!fgSrgb) continue;
    const ratio = contrastRatio(relativeLuminance(fgSrgb), bgLum);
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = candidate;
    }
  }
  return best;
}

/** Resolves the readable-foreground className for each of `tokens`,
 * re-measuring whenever the active theme changes (the showcase toggles
 * `class="dark"` / `data-theme` on `<html>`). Returns `text-fg` for every
 * slot until the first client-side measurement lands (SSR / pre-mount),
 * which matches the base theme's actual choice for the lightest ramp step
 * so there's no visible flash in the common case. */
export function useReadableForeground(
  tokens: readonly (ChartColorToken | ChartSequentialToken)[],
): Record<string, FgCandidate> {
  const key = tokens.join(",");
  const [result, setResult] = useState<Record<string, FgCandidate>>({});

  useEffect(() => {
    function recompute() {
      const next: Record<string, FgCandidate> = {};
      for (const token of key.split(",") as (ChartColorToken | ChartSequentialToken)[]) {
        if (token) next[token] = pickReadableForeground(chartBg(token));
      }
      setResult(next);
    }
    recompute();
    const mo = new MutationObserver(recompute);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => mo.disconnect();
  }, [key]);

  return result;
}
