// Shared `NumberFormat` resolution for ChartScene and StatScene — the
// schema's `NumberFormat` union (steps.ts: "number" | "percent" | "bytes" |
// "currency" | "duration" | "compact") is a closed set of *names*, never a
// format string or a function (scenes.data.ts's own top comment: a function
// isn't serializable). Both resolvers below bottom out in
// `src/lib/format.ts` — the same formatter `CellType` and `CountUp` already
// share — so this file adds no new formatting logic of its own, only the
// NumberFormat -> (whichever shape the caller needs) mapping.

import {
  formatNumberParts,
  formatPercentageParts,
  formatBytesParts,
  formatDurationParts,
  formatCurrencyParts,
} from "../lib/format";
import type { CountUpFormat, CountUpFormatOptions } from "../motion";
import type { NumberFormat } from "./schema";

function renderParts(parts: Intl.NumberFormatPart[]): string {
  return parts.map((p) => p.value).join("");
}

/**
 * `NumberFormat` -> a `(value: number) => string` function, for the chart
 * components' own `valueFormat` prop (BarChart/LineChart/Gauge/Heatmap/
 * ScatterPlot/Funnel all take one). Never a new formatter — every branch is
 * a direct call into `src/lib/format.ts`.
 */
export function resolveValueFormat(format: NumberFormat | undefined): (value: number) => string {
  switch (format) {
    case "percent":
      return (v) => { const r = formatPercentageParts(v); return r ? renderParts(r.parts) : ""; };
    case "bytes":
      return (v) => { const r = formatBytesParts(v); return r ? `${renderParts(r.parts)} ${r.unitLabel}` : ""; };
    case "currency":
      return (v) => { const r = formatCurrencyParts(v); return r ? renderParts(r.parts) : ""; };
    case "duration":
      return (v) => { const segs = formatDurationParts(v); return segs ? segs.map((s) => `${s.v}${s.u}`).join(" ") : ""; };
    case "compact":
      return (v) => { const r = formatNumberParts(v, { compact: true }); return r ? renderParts(r.parts) : ""; };
    case "number":
    default:
      return (v) => { const r = formatNumberParts(v); return r ? renderParts(r.parts) : ""; };
  }
}

/**
 * `NumberFormat` -> `CountUp`'s own `format`/`formatOptions` shape. Distinct
 * from `resolveValueFormat` because `CountUp`'s format union spells
 * "percentage" where the schema spells "percent", and treats "compact" as a
 * `formatOptions` flag on top of "number" rather than a format of its own —
 * `CountUp` reuses `src/lib/format.ts` too, just through a different prop
 * shape than the chart components.
 */
export function resolveCountUpFormat(format: NumberFormat | undefined): { format: CountUpFormat; formatOptions?: CountUpFormatOptions } {
  switch (format) {
    case "percent": return { format: "percentage" };
    case "bytes": return { format: "bytes" };
    case "currency": return { format: "currency" };
    case "duration": return { format: "duration" };
    case "compact": return { format: "number", formatOptions: { compact: true } };
    case "number":
    default:
      return { format: "number" };
  }
}
