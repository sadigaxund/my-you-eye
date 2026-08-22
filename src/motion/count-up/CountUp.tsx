import { useProgress } from "../core/useProgress";
import {
  formatNumberParts,
  formatPercentageParts,
  formatBytesParts,
  formatDurationParts,
  formatCurrencyParts,
  formatSignedParts,
} from "../../lib/format";
import type { Timing } from "../core";

export type CountUpFormat = "number" | "percentage" | "bytes" | "duration" | "currency" | "signed";

export interface CountUpFormatOptions {
  fractionDigits?: number;
  compact?: boolean;
  currency?: string;
  /** "bytes" only — force a display unit (e.g. "MB") instead of auto-scaling. */
  displayUnit?: string;
}

export type CountUpProps = Timing & {
  /** Starting value. Default 0. */
  from?: number;
  /** Ending value. */
  to: number;
  /** Default "number". */
  format?: CountUpFormat;
  formatOptions?: CountUpFormatOptions;
  className?: string;
};

function renderParts(parts: Intl.NumberFormatPart[]): string {
  return parts.map((p) => p.value).join("");
}

/**
 * Reuses `src/lib/format.ts` for every formatting mode — that file was
 * extracted from `CellType`'s numeric displays precisely so this primitive
 * (and any future one) never reimplements `Intl` formatting logic
 * (TODO.md C4). `src/lib/` is explicitly allowed from `src/motion/**` (only
 * `src/ui/**` is off-limits — AGENTS.md §9b).
 */
function display(value: number, format: CountUpFormat, options?: CountUpFormatOptions): string {
  switch (format) {
    case "number": {
      const r = formatNumberParts(value, options);
      return r ? renderParts(r.parts) : "";
    }
    case "percentage": {
      const r = formatPercentageParts(value, options?.fractionDigits ?? 1);
      return r ? renderParts(r.parts) : "";
    }
    case "bytes": {
      const r = formatBytesParts(value, options);
      return r ? `${renderParts(r.parts)} ${r.unitLabel}` : "";
    }
    case "duration": {
      const segs = formatDurationParts(value);
      return segs ? segs.map((s) => `${s.v}${s.u}`).join(" ") : "";
    }
    case "currency": {
      const r = formatCurrencyParts(value, options);
      return r ? renderParts(r.parts) : "";
    }
    case "signed": {
      const r = formatSignedParts(value);
      if (!r) return "";
      const prefix = r.sign === "positive" ? "+" : r.sign === "negative" ? "-" : "";
      return `${prefix}${renderParts(r.parts)}`;
    }
    default:
      return "";
  }
}

/** Numeric tween, a pure function of `useProgress()` (TODO.md C4). */
export function CountUp({ from = 0, to, format = "number", formatOptions, className, ...timing }: CountUpProps) {
  const progress = useProgress(timing);
  const value = from + (to - from) * progress;

  return <span className={className}>{display(value, format, formatOptions)}</span>;
}
