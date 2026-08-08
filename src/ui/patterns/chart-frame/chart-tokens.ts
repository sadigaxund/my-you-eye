// Shared chart color vocabulary — imported by ChartFrame, Legend and every
// chart in src/ui/. Pure data/types, no JSX (matches the graph-node/grid.ts
// precedent: a non-component helper file living inside one component's
// folder, imported across the codebase).
//
// AGENTS.md §0.2 forbids arbitrary color values in component code. Charts
// satisfy that by taking a closed union of these 8 token names (never a raw
// string/hex) and mapping each to a fixed Tailwind utility class — the
// mapping below is the ONLY place a chart-* token turns into a className.

/** The 8 categorical chart color slots, in fixed order. See
 * src/styles/tokens.css for the derivation (TODO.md D3). Never cycled past
 * 8 — a 9th series folds into "Other" or the chart facets (dataviz skill,
 * "series-count ladder"). */
export const CHART_COLOR_TOKENS = [
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "chart-6",
  "chart-7",
  "chart-8",
] as const;

export type ChartColorToken = (typeof CHART_COLOR_TOKENS)[number];

/** The 5-step sequential ramp (magnitude: heatmaps, choropleth-style
 * fills). Step 1 = lightest / near-zero, step 5 = darkest / highest. */
export const CHART_SEQUENTIAL_TOKENS = [
  "chart-seq-1",
  "chart-seq-2",
  "chart-seq-3",
  "chart-seq-4",
  "chart-seq-5",
] as const;

export type ChartSequentialToken = (typeof CHART_SEQUENTIAL_TOKENS)[number];

/** Assigns categorical slots in fixed order, index-stable — the same entity
 * always gets the same slot as long as its position in the input array
 * doesn't change (the dataviz skill's "color follows the entity, never its
 * rank" rule; callers that filter/reorder series are responsible for
 * keeping each series' own explicit `color` stable — see chart props). */
export function chartColorToken(index: number): ChartColorToken {
  return CHART_COLOR_TOKENS[index % CHART_COLOR_TOKENS.length];
}

// Explicit literal-string lookup tables, NOT template-literal construction
// (`` `fill-${token}` ``). Tailwind's build-time scanner greps source files
// for complete, unbroken class-name substrings — a runtime-interpolated
// string never appears as such in the source text, so the utility would
// never be generated and the mark would render unstyled. Every literal
// below appears verbatim so the scanner (and a human grepping for
// "fill-chart-6") can find it.
const FILL: Record<ChartColorToken | ChartSequentialToken, string> = {
  "chart-1": "fill-chart-1",
  "chart-2": "fill-chart-2",
  "chart-3": "fill-chart-3",
  "chart-4": "fill-chart-4",
  "chart-5": "fill-chart-5",
  "chart-6": "fill-chart-6",
  "chart-7": "fill-chart-7",
  "chart-8": "fill-chart-8",
  "chart-seq-1": "fill-chart-seq-1",
  "chart-seq-2": "fill-chart-seq-2",
  "chart-seq-3": "fill-chart-seq-3",
  "chart-seq-4": "fill-chart-seq-4",
  "chart-seq-5": "fill-chart-seq-5",
};

const STROKE: Record<ChartColorToken | ChartSequentialToken, string> = {
  "chart-1": "stroke-chart-1",
  "chart-2": "stroke-chart-2",
  "chart-3": "stroke-chart-3",
  "chart-4": "stroke-chart-4",
  "chart-5": "stroke-chart-5",
  "chart-6": "stroke-chart-6",
  "chart-7": "stroke-chart-7",
  "chart-8": "stroke-chart-8",
  "chart-seq-1": "stroke-chart-seq-1",
  "chart-seq-2": "stroke-chart-seq-2",
  "chart-seq-3": "stroke-chart-seq-3",
  "chart-seq-4": "stroke-chart-seq-4",
  "chart-seq-5": "stroke-chart-seq-5",
};

const BG: Record<ChartColorToken | ChartSequentialToken, string> = {
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
  "chart-6": "bg-chart-6",
  "chart-7": "bg-chart-7",
  "chart-8": "bg-chart-8",
  "chart-seq-1": "bg-chart-seq-1",
  "chart-seq-2": "bg-chart-seq-2",
  "chart-seq-3": "bg-chart-seq-3",
  "chart-seq-4": "bg-chart-seq-4",
  "chart-seq-5": "bg-chart-seq-5",
};

export function chartFill(token: ChartColorToken | ChartSequentialToken): string {
  return FILL[token];
}

export function chartStroke(token: ChartColorToken | ChartSequentialToken): string {
  return STROKE[token];
}

export function chartBg(token: ChartColorToken | ChartSequentialToken): string {
  return BG[token];
}
